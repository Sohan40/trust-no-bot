import { getPhaseLabel } from "@/lib/game/state-machine";
import type {
  AgentTraits,
  Game,
  Message,
  NightAction,
  Phase,
  Player,
  Vote,
} from "@/lib/game/types";
import type {
  Database,
  GameMessageRow,
  GamePlayerRow,
  Json,
  PersistedGameState,
} from "@/lib/db/types";

const fallbackTraits: AgentTraits = {
  aggression: 0.5,
  caution: 0.5,
  humor: 0.5,
  logic: 0.5,
  empathy: 0.5,
  defensiveness: 0.5,
  riskTolerance: 0.5,
  talkativeness: 0.5,
};

export function persistedStateToGame(state: PersistedGameState): Game {
  const players = state.players.map(playerRowToPlayer);
  const messages = state.messages.map((message) =>
    messageRowToMessage(message, state.players),
  );

  return {
    id: state.game.id,
    mode: state.game.mode,
    status: state.game.status,
    phase: state.game.current_phase as Phase,
    phaseLabel: getPhaseLabel(state.game.current_phase as Phase, state.game.day_number),
    dayNumber: state.game.day_number,
    seed: state.game.seed,
    winner: state.game.winner,
    humanPlayerId: players.find((player) => player.isHuman)?.id ?? "",
    players,
    messages,
    votes: state.votes.map((vote) => ({
      voterId: vote.voter_player_id,
      targetId: vote.target_player_id,
      dayNumber: vote.day_number,
      reason: vote.reason ?? undefined,
    })),
    nightActions: state.nightActions.map((action) => ({
      actorId: action.actor_player_id,
      targetId: action.target_player_id,
      nightNumber: action.night_number,
      actionType: action.action_type,
      result: asRecord(action.result_json),
    })),
  };
}

export function playersToInserts(
  gameId: string,
  players: Player[],
): Database["public"]["Tables"]["game_players"]["Insert"][] {
  return players.map((player) => ({
    id: player.id,
    game_id: gameId,
    display_name: player.displayName,
    is_human: player.isHuman,
    role: player.role,
    team: player.team,
    is_alive: player.isAlive,
    public_style: player.publicStyle,
    personality_json: player.traits,
    memory_json: { summary: player.memorySummary },
    suspicion_json: { score: player.suspicion },
  }));
}

export function messagesToInserts(
  gameId: string,
  messages: Message[],
  fallbackDayNumber: number,
): Database["public"]["Tables"]["game_messages"]["Insert"][] {
  return messages.map((message) => ({
    id: message.id,
    game_id: gameId,
    phase: message.phase,
    day_number: message.dayNumber ?? fallbackDayNumber,
    speaker_player_id: message.speakerId === "system" ? null : message.speakerId,
    visibility: message.visibility,
    message: message.text,
    intent: message.intent,
    metadata: {
      ...(message.metadata ?? {}),
      speakerName: message.speakerName,
      phaseLabel: message.phaseLabel,
    } as Json,
  }));
}

export function votesToInserts(
  gameId: string,
  votes: Vote[],
): Database["public"]["Tables"]["game_votes"]["Insert"][] {
  return votes.map((vote) => ({
    game_id: gameId,
    day_number: vote.dayNumber,
    voter_player_id: vote.voterId,
    target_player_id: vote.targetId,
    reason: vote.reason,
  }));
}

export function nightActionsToInserts(
  gameId: string,
  actions: NightAction[],
): Database["public"]["Tables"]["night_actions"]["Insert"][] {
  return actions.map((action) => ({
    game_id: gameId,
    night_number: action.nightNumber,
    actor_player_id: action.actorId,
    target_player_id: action.targetId,
    action_type: action.actionType,
    result_json: (action.result ?? {}) as Json,
  }));
}

export function resultToInsert(
  gameId: string,
  game: Game,
  result: {
    winner: "villagers" | "mafia";
    summary: string;
    shareText: string;
  },
): Database["public"]["Tables"]["game_results"]["Insert"] {
  return {
    game_id: gameId,
    winner: result.winner,
    result_summary: result.summary,
    share_text: result.shareText,
    reveal_json: {
      players: game.players.map((player) => ({
        id: player.id,
        displayName: player.displayName,
        role: player.role,
        team: player.team,
        isAlive: player.isAlive,
      })),
    },
    stats_json: {
      days: game.dayNumber,
      winner: result.winner,
    },
  };
}

function playerRowToPlayer(row: GamePlayerRow): Player {
  const memory = asRecord(row.memory_json);
  const suspicion = asRecord(row.suspicion_json);

  return {
    id: row.id,
    displayName: row.display_name,
    isHuman: row.is_human,
    role: row.role,
    team: row.team,
    isAlive: row.is_alive,
    publicStyle: row.public_style,
    traits: {
      ...fallbackTraits,
      ...asRecord(row.personality_json),
    } as AgentTraits,
    memorySummary:
      typeof memory.summary === "string" ? memory.summary : "No memory yet.",
    suspicion:
      typeof suspicion.score === "number" ? suspicion.score : 0.25,
  };
}

function messageRowToMessage(row: GameMessageRow, players: GamePlayerRow[]): Message {
  const metadata = asRecord(row.metadata);
  const speaker = players.find((player) => player.id === row.speaker_player_id);
  const phase = row.phase as Phase;

  return {
    id: row.id,
    speakerId: row.speaker_player_id ?? "system",
    speakerName:
      typeof metadata.speakerName === "string"
        ? metadata.speakerName
        : speaker?.display_name ?? "Room",
    phase,
    phaseLabel:
      typeof metadata.phaseLabel === "string"
        ? metadata.phaseLabel
        : getPhaseLabel(phase, row.day_number),
    dayNumber: row.day_number,
    visibility: row.visibility,
    text: row.message,
    intent: row.intent ?? undefined,
    metadata,
  };
}

function asRecord(value: Json): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}
