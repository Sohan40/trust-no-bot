import type {
  AvailableAction,
  Game,
  Message,
  Player,
  PlayerId,
  PublicPlayer,
  VisibleGameState,
} from "@/lib/game/types";

export function toVisibleGameState(game: Game, viewerId: PlayerId): VisibleGameState {
  const viewer = getViewer(game.players, viewerId);
  const gameOver = game.status === "completed" || game.phase === "GAME_OVER";

  return {
    game: {
      id: game.id,
      mode: game.mode,
      status: game.status,
      phase: game.phase,
      phaseLabel: game.phaseLabel,
      dayNumber: game.dayNumber,
      winner: game.winner,
    },
    humanPlayerId: game.humanPlayerId,
    publicPlayers: game.players.map((player) => toPublicPlayer(player, gameOver)),
    messages: game.messages.filter((message) =>
      isMessageVisibleToViewer(message, viewerId),
    ),
    availableActions: getAvailableActions(game),
    privateInfo: {
      role: viewer.role,
      team: viewer.team,
    },
    result:
      gameOver && game.winner
        ? {
            winner: game.winner,
            summary:
              game.winner === "villagers"
                ? "The village found the hidden opponent."
                : "The hidden opponent outlasted the village.",
            shareText:
              game.winner === "villagers"
                ? "I caught the hidden bot in Trust No Bot."
                : "I trusted the wrong bot in Trust No Bot.",
          }
        : undefined,
  };
}

function getViewer(players: Player[], viewerId: PlayerId): Player {
  const viewer = players.find((player) => player.id === viewerId);

  if (!viewer) {
    throw new Error("Visible state requires a known viewer.");
  }

  return viewer;
}

function toPublicPlayer(player: Player, revealRoles: boolean): PublicPlayer {
  const publicPlayer: PublicPlayer = {
    id: player.id,
    displayName: player.displayName,
    isHuman: player.isHuman,
    isAlive: player.isAlive,
    publicStyle: player.publicStyle,
    traits: player.traits,
    suspicion: player.suspicion,
  };

  if (revealRoles) {
    publicPlayer.role = player.role;
    publicPlayer.team = player.team;
  }

  return publicPlayer;
}

function isMessageVisibleToViewer(message: Message, viewerId: PlayerId): boolean {
  if (message.visibility === "public" || message.visibility === "system") {
    return true;
  }

  return message.metadata?.recipientPlayerId === viewerId;
}

function getAvailableActions(game: Game): AvailableAction[] {
  if (game.status !== "active") {
    return [];
  }

  switch (game.phase) {
    case "ROLE_REVEAL":
    case "NIGHT_ACTIONS":
    case "DAY_DISCUSSION":
      return ["ADVANCE_PHASE"];
    case "PLAYER_QUESTION":
      return ["ASK_QUESTION", "ADVANCE_PHASE"];
    case "VOTING":
      return ["VOTE"];
    default:
      return [];
  }
}
