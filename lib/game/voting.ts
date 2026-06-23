import { seededPick } from "@/lib/game/random";
import type { Game, Player, PlayerId, Vote } from "@/lib/game/types";

export class GameRuleError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "GameRuleError";
  }
}

export function validateVote(
  game: Game,
  voterId: PlayerId,
  targetId: PlayerId,
): void {
  if (game.status !== "active") {
    throw new GameRuleError("GAME_OVER", "This game is already over.");
  }

  if (game.phase !== "VOTING") {
    throw new GameRuleError("INVALID_PHASE", "Voting is not available now.");
  }

  const voter = game.players.find((player) => player.id === voterId);
  const target = game.players.find((player) => player.id === targetId);

  if (!voter || !voter.isAlive) {
    throw new GameRuleError("INVALID_VOTER", "Only alive players can vote.");
  }

  if (!target || !target.isAlive) {
    throw new GameRuleError("INVALID_TARGET", "Votes can only target alive players.");
  }
}

export function chooseAIVotes(
  game: Game,
  humanVote: Vote,
): Vote[] {
  const alivePlayers = game.players.filter((player) => player.isAlive);

  return alivePlayers
    .filter((player) => !player.isHuman)
    .map((voter) => {
      const target = chooseAITarget(game, voter, alivePlayers, humanVote);

      return {
        voterId: voter.id,
        targetId: target.id,
        dayNumber: game.dayNumber,
        reason: "deterministic-ai-vote",
      };
    });
}

function chooseAITarget(
  game: Game,
  voter: Player,
  alivePlayers: Player[],
  humanVote: Vote,
): Player {
  const candidates = alivePlayers.filter((player) => player.id !== voter.id);
  const mafiaTarget = candidates.find((player) => player.role === "Mafia");

  if (voter.team === "village" && mafiaTarget) {
    const shouldFindMafia =
      seededPick([true, false, false], `${game.seed}:day:${game.dayNumber}:${voter.id}:truth`) ??
      false;

    if (shouldFindMafia) {
      return mafiaTarget;
    }
  }

  if (voter.team === "mafia") {
    const humanTarget = candidates.find((player) => player.id === game.humanPlayerId);

    if (humanTarget && humanTarget.id !== humanVote.targetId) {
      return humanTarget;
    }
  }

  const nonSelfCandidates = candidates.filter(
    (player) => player.id !== humanVote.voterId,
  );

  return (
    seededPick(nonSelfCandidates, `${game.seed}:day:${game.dayNumber}:${voter.id}:vote`) ??
    candidates[0]
  );
}

export function collectDayVotes(game: Game, humanVote: Vote): Vote[] {
  validateVote(game, humanVote.voterId, humanVote.targetId);

  const aiVotes = chooseAIVotes(game, humanVote);
  return [humanVote, ...aiVotes];
}

export function resolveVotes(votes: Vote[]): PlayerId | null {
  const counts = new Map<PlayerId, number>();

  for (const vote of votes) {
    counts.set(vote.targetId, (counts.get(vote.targetId) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((first, second) => second[1] - first[1]);
  const [winner, runnerUp] = ranked;

  if (!winner) {
    return null;
  }

  if (runnerUp && runnerUp[1] === winner[1]) {
    return null;
  }

  return winner[0];
}

export function eliminatePlayer(players: Player[], targetId: PlayerId | null): Player[] {
  if (!targetId) {
    return players;
  }

  const target = players.find((player) => player.id === targetId);

  if (!target || !target.isAlive) {
    throw new GameRuleError(
      "INVALID_ELIMINATION",
      "Cannot eliminate a dead or missing player.",
    );
  }

  return players.map((player) =>
    player.id === targetId ? { ...player, isAlive: false } : player,
  );
}
