import {
  applyNightKill,
  chooseNightActions,
  resolveNightActions,
} from "@/lib/game/actions";
import { assignClassicRoles, clonePlayersWithIds } from "@/lib/game/roles";
import { collectDayVotes, eliminatePlayer, resolveVotes } from "@/lib/game/voting";
import { checkWinCondition } from "@/lib/game/win-conditions";
import type {
  Game,
  Message,
  NightAction,
  Phase,
  Player,
  PlayerId,
  Vote,
  Winner,
} from "@/lib/game/types";

export type GameTransition = {
  game: Game;
  newMessages: Message[];
  newNightActions?: NightAction[];
  newVotes?: Vote[];
  changedPlayers?: Player[];
  result?: {
    winner: Winner;
    summary: string;
    shareText: string;
  };
};

type CreateClassicGameInput = {
  gameId: string;
  seed: string;
  playerIdsByOriginalId?: Record<string, string>;
};

export function createClassicGame(input: CreateClassicGameInput): GameTransition {
  const assignedPlayers = assignClassicRoles(input.seed);
  const players = input.playerIdsByOriginalId
    ? clonePlayersWithIds(assignedPlayers, input.playerIdsByOriginalId)
    : assignedPlayers;
  const human = getHumanPlayer(players);
  const game: Game = {
    id: input.gameId,
    mode: "classic",
    status: "active",
    phase: "ROLE_REVEAL",
    phaseLabel: getPhaseLabel("ROLE_REVEAL", 1),
    dayNumber: 1,
    seed: input.seed,
    winner: null,
    humanPlayerId: human.id,
    players,
    messages: [],
    votes: [],
    nightActions: [],
  };
  const newMessages = [
    createMessage(game, {
      visibility: "private",
      text: "Your role is Villager. Find the hidden opponent before the room votes wrong.",
      metadata: { recipientPlayerId: human.id },
      intent: "role_reveal",
    }),
    createMessage(game, {
      visibility: "system",
      text: "A Classic Mode room has opened. Six AI players are watching each other closely.",
      intent: "game_started",
    }),
  ];

  return {
    game: { ...game, messages: newMessages },
    newMessages,
  };
}

export function advanceGamePhase(game: Game): GameTransition {
  assertActive(game);

  switch (game.phase) {
    case "ROLE_REVEAL":
      return updatePhase(game, "NIGHT_ACTIONS", [
        createMessage(game, {
          visibility: "system",
          text: "Night falls. The room goes quiet while hidden roles act.",
          intent: "phase_advance",
        }),
      ]);
    case "NIGHT_ACTIONS":
      return resolveNight(game);
    case "DAY_DISCUSSION":
      return updatePhase(game, "PLAYER_QUESTION", createMockDiscussion(game));
    case "PLAYER_QUESTION":
      return submitPlayerQuestion(game, null);
    default:
      throw new Error(`Cannot advance from phase ${game.phase}.`);
  }
}

export function submitPlayerQuestion(
  game: Game,
  question: string | null,
  targetPlayerId?: PlayerId,
): GameTransition {
  assertActive(game);

  if (game.phase !== "PLAYER_QUESTION") {
    throw new Error("Questions are only available during PLAYER_QUESTION.");
  }

  const human = getHumanPlayer(game.players);
  const target = targetPlayerId
    ? game.players.find((player) => player.id === targetPlayerId && player.isAlive)
    : null;
  const promptMessage = question
    ? createMessage(game, {
        speakerId: human.id,
        speakerName: human.displayName,
        visibility: "public",
        text: target
          ? `${target.displayName}, ${question}`
          : question,
        intent: "human_question",
      })
    : createMessage(game, {
        visibility: "system",
        text: "No direct question was asked. The room moves to a vote.",
        intent: "question_skipped",
      });
  const aiResponses = createMockQuestionResponses(game, targetPlayerId);
  return updatePhase(game, "VOTING", [promptMessage, ...aiResponses]);
}

export function submitHumanVote(
  game: Game,
  targetPlayerId: PlayerId,
): GameTransition {
  assertActive(game);

  const human = getHumanPlayer(game.players);
  const humanVote: Vote = {
    voterId: human.id,
    targetId: targetPlayerId,
    dayNumber: game.dayNumber,
    reason: "human_vote",
  };
  const newVotes = collectDayVotes(game, humanVote);
  const eliminatedPlayerId = resolveVotes(newVotes);
  const playersAfterVote = eliminatePlayer(game.players, eliminatedPlayerId);
  const rulesWinner = checkWinCondition(playersAfterVote);
  const humanAfterVote = getHumanPlayer(playersAfterVote);
  const winner = rulesWinner ?? (humanAfterVote.isAlive ? null : "mafia");
  const voteMessages = createVoteMessages(game, newVotes, eliminatedPlayerId);

  if (winner) {
    const completedGame = completeGame(
      {
        ...game,
        players: playersAfterVote,
        votes: [...game.votes, ...newVotes],
      },
      winner,
    );
    const result = createResult(winner);
    const newMessages = [
      ...voteMessages,
      createMessage(completedGame, {
        visibility: "system",
        text: result.summary,
        intent: "game_over",
      }),
    ];

    return {
      game: {
        ...completedGame,
        messages: [...game.messages, ...newMessages],
      },
      newVotes,
      changedPlayers: changedAlivePlayers(game.players, playersAfterVote),
      newMessages,
      result,
    };
  }

  const nextGame = {
    ...game,
    phase: "NIGHT_ACTIONS" as const,
    phaseLabel: getPhaseLabel("NIGHT_ACTIONS", game.dayNumber + 1),
    dayNumber: game.dayNumber + 1,
    players: playersAfterVote,
    votes: [...game.votes, ...newVotes],
  };
  const newMessages = [
    ...voteMessages,
    createMessage(nextGame, {
      visibility: "system",
      text: "The vote is settled. Night returns to the room.",
      intent: "phase_advance",
    }),
  ];

  return {
    game: {
      ...nextGame,
      messages: [...game.messages, ...newMessages],
    },
    newVotes,
    changedPlayers: changedAlivePlayers(game.players, playersAfterVote),
    newMessages,
  };
}

export function getPhaseLabel(phase: Phase, dayNumber: number): string {
  switch (phase) {
    case "ROLE_REVEAL":
      return "Role Reveal";
    case "NIGHT_ACTIONS":
      return `Night ${dayNumber}`;
    case "NIGHT_RESOLUTION":
      return `Night ${dayNumber} Resolution`;
    case "DAY_DISCUSSION":
      return `Day ${dayNumber} Discussion`;
    case "PLAYER_QUESTION":
      return `Day ${dayNumber} Question`;
    case "AI_RESPONSES":
      return `Day ${dayNumber} Responses`;
    case "VOTING":
      return `Day ${dayNumber} Vote`;
    case "ELIMINATION":
      return `Day ${dayNumber} Elimination`;
    case "WIN_CHECK":
      return "Win Check";
    case "GAME_OVER":
      return "Game Over";
    default:
      return "Lobby";
  }
}

function resolveNight(game: Game): GameTransition {
  const chosenActions = chooseNightActions(game.players, game.seed, game.dayNumber);
  const resolution = resolveNightActions(game.players, chosenActions);
  const playersAfterNight = applyNightKill(game.players, resolution.killedPlayerId);
  const rulesWinner = checkWinCondition(playersAfterNight);
  const human = getHumanPlayer(playersAfterNight);
  const winner = rulesWinner ?? (human.isAlive ? null : "mafia");
  const nightMessages = createNightMessages(game, playersAfterNight, resolution.killedPlayerId);
  const detectiveMessage = createDetectiveMessage(game, resolution.detectiveResult);

  if (winner) {
    const completedGame = completeGame(
      {
        ...game,
        players: playersAfterNight,
        nightActions: [...game.nightActions, ...resolution.actions],
      },
      winner,
    );
    const result = createResult(winner);
    const newMessages = [
      ...nightMessages,
      ...(detectiveMessage ? [detectiveMessage] : []),
      createMessage(completedGame, {
        visibility: "system",
        text: result.summary,
        intent: "game_over",
      }),
    ];

    return {
      game: {
        ...completedGame,
        messages: [...game.messages, ...newMessages],
      },
      newNightActions: resolution.actions,
      changedPlayers: changedAlivePlayers(game.players, playersAfterNight),
      newMessages,
      result,
    };
  }

  const nextGame = {
    ...game,
    phase: "DAY_DISCUSSION" as const,
    phaseLabel: getPhaseLabel("DAY_DISCUSSION", game.dayNumber),
    players: playersAfterNight,
    nightActions: [...game.nightActions, ...resolution.actions],
  };
  const newMessages = [
    ...nightMessages,
    ...(detectiveMessage ? [detectiveMessage] : []),
  ];

  return {
    game: {
      ...nextGame,
      messages: [...game.messages, ...newMessages],
    },
    newNightActions: resolution.actions,
    changedPlayers: changedAlivePlayers(game.players, playersAfterNight),
    newMessages,
  };
}

function updatePhase(
  game: Game,
  phase: Phase,
  newMessages: Message[],
): GameTransition {
  const nextGame = {
    ...game,
    phase,
    phaseLabel: getPhaseLabel(phase, game.dayNumber),
    messages: [...game.messages, ...newMessages],
  };

  return {
    game: nextGame,
    newMessages,
  };
}

function createMockDiscussion(game: Game): Message[] {
  const aliveAi = game.players.filter((player) => player.isAlive && !player.isHuman);

  return aliveAi.slice(0, 3).map((player, index) =>
    createMessage(game, {
      speakerId: player.id,
      speakerName: player.displayName,
      visibility: "public",
      text: [
        "The quiet people are making me nervous.",
        "I want a clean explanation before we vote.",
        "Someone is steering this room without saying much.",
      ][index],
      intent: "mock_day_discussion",
    }),
  );
}

function createMockQuestionResponses(
  game: Game,
  targetPlayerId?: PlayerId,
): Message[] {
  const aliveAi = game.players.filter((player) => player.isAlive && !player.isHuman);
  const responders = targetPlayerId
    ? aliveAi.filter((player) => player.id === targetPlayerId).slice(0, 1)
    : aliveAi.slice(0, 2);
  const fallbackResponders = responders.length > 0 ? responders : aliveAi.slice(0, 2);

  return fallbackResponders.map((player, index) =>
    createMessage(game, {
      speakerId: player.id,
      speakerName: player.displayName,
      visibility: "public",
      text:
        index === 0
          ? "I am judging behavior, not claims. The vote pattern matters most."
          : "That answer sounds rehearsed, but I need one more signal.",
      intent: "mock_ai_response",
    }),
  );
}

function createVoteMessages(
  game: Game,
  votes: Vote[],
  eliminatedPlayerId: PlayerId | null,
): Message[] {
  const eliminated = game.players.find((player) => player.id === eliminatedPlayerId);
  const summary = votes
    .map((vote) => {
      const voter = game.players.find((player) => player.id === vote.voterId);
      const target = game.players.find((player) => player.id === vote.targetId);
      return `${voter?.displayName ?? "Unknown"} -> ${target?.displayName ?? "Unknown"}`;
    })
    .join(", ");

  return [
    createMessage(game, {
      visibility: "system",
      text: `Votes locked: ${summary}.`,
      intent: "vote_summary",
    }),
    createMessage(game, {
      visibility: "system",
      text: eliminated
        ? `${eliminated.displayName} is eliminated. Their role stays hidden until game over.`
        : "The vote is tied. Nobody is eliminated.",
      intent: "elimination",
    }),
  ];
}

function createNightMessages(
  game: Game,
  playersAfterNight: Player[],
  killedPlayerId: PlayerId | null,
): Message[] {
  const killed = playersAfterNight.find((player) => player.id === killedPlayerId);

  return [
    createMessage(game, {
      visibility: "system",
      text: killed
        ? `${killed.displayName} was found eliminated after the night. Their role remains hidden.`
        : "Morning arrives with everyone still alive.",
      intent: "night_resolution",
    }),
  ];
}

function createDetectiveMessage(
  game: Game,
  detectiveResult: {
    detectiveId: PlayerId;
    targetId: PlayerId;
    isMafia: boolean;
  } | null,
): Message | null {
  if (!detectiveResult) {
    return null;
  }

  const target = game.players.find((player) => player.id === detectiveResult.targetId);

  if (!target) {
    return null;
  }

  return createMessage(game, {
    visibility: "private",
    text: `${target.displayName} checked as ${
      detectiveResult.isMafia ? "Mafia" : "Not Mafia"
    }.`,
    intent: "detective_result",
    metadata: { recipientPlayerId: detectiveResult.detectiveId },
  });
}

function createMessage(
  game: Pick<Game, "phase" | "phaseLabel" | "dayNumber">,
  input: {
    speakerId?: PlayerId | "system";
    speakerName?: string;
    visibility: "public" | "private" | "system";
    text: string;
    intent?: string;
    metadata?: Record<string, unknown>;
  },
): Message {
  return {
    id: crypto.randomUUID(),
    speakerId: input.speakerId ?? "system",
    speakerName: input.speakerName ?? "Room",
    phase: game.phase,
    phaseLabel: game.phaseLabel,
    dayNumber: game.dayNumber,
    visibility: input.visibility,
    text: input.text,
    intent: input.intent,
    metadata: input.metadata,
  };
}

function completeGame(game: Game, winner: Winner): Game {
  return {
    ...game,
    status: "completed",
    phase: "GAME_OVER",
    phaseLabel: getPhaseLabel("GAME_OVER", game.dayNumber),
    winner,
  };
}

function createResult(winner: Winner): {
  winner: Winner;
  summary: string;
  shareText: string;
} {
  return winner === "villagers"
    ? {
        winner,
        summary: "The village wins. The hidden opponent has been eliminated.",
        shareText: "I caught the hidden bot in Trust No Bot.",
      }
    : {
        winner,
        summary: "The Mafia wins. The hidden opponent controlled the final room.",
        shareText: "I trusted the wrong bot in Trust No Bot.",
      };
}

function assertActive(game: Game): void {
  if (game.status !== "active" || game.phase === "GAME_OVER") {
    throw new Error("This game is already over.");
  }
}

function getHumanPlayer(players: Player[]): Player {
  const human = players.find((player) => player.isHuman);

  if (!human) {
    throw new Error("Classic Mode requires one human player.");
  }

  return human;
}

function changedAlivePlayers(previous: Player[], next: Player[]): Player[] {
  return next.filter((nextPlayer) => {
    const previousPlayer = previous.find((player) => player.id === nextPlayer.id);
    return previousPlayer?.isAlive !== nextPlayer.isAlive;
  });
}
