import { createMockDirectorOutput, MockAIProvider } from "@/lib/ai/mock-provider";
import { buildGameDirectorInstructions, GAME_DIRECTOR_CONSTRAINTS } from "@/lib/ai/prompts";
import type { AIProvider } from "@/lib/ai/provider";
import {
  gameDirectorInputSchema,
  gameDirectorOutputSchema,
  type GameDirectorInput,
  type GameDirectorOutput,
} from "@/lib/ai/schemas";
import { isSafeDirectorMessage, isSafeUserQuestion } from "@/lib/ai/safety";
import type { Game, PlayerId } from "@/lib/game/types";

const RECENT_MESSAGE_LIMIT = 12;

type ErrorReporter = (message: string, error: unknown) => void;

export class GameDirector {
  constructor(
    private readonly provider: AIProvider,
    private readonly fallbackProvider: AIProvider = new MockAIProvider(),
    private readonly reportError: ErrorReporter = (message, error) =>
      console.error(message, error),
  ) {}

  async generateDayDiscussion(game: Game): Promise<GameDirectorOutput> {
    if (game.phase !== "DAY_DISCUSSION") {
      throw new Error("Day discussion generation requires DAY_DISCUSSION.");
    }

    return this.generate(buildGameDirectorInput(game, "day_discussion"));
  }

  async generateQuestionResponses(
    game: Game,
    question: string,
    targetPlayerId?: PlayerId,
  ): Promise<GameDirectorOutput> {
    if (game.phase !== "PLAYER_QUESTION") {
      throw new Error("Question generation requires PLAYER_QUESTION.");
    }

    const trimmedQuestion = question.trim();
    const input = buildGameDirectorInput(
      game,
      "question_response",
      trimmedQuestion,
      targetPlayerId,
    );

    if (!isSafeUserQuestion(trimmedQuestion)) {
      return createMockDirectorOutput(input);
    }

    return this.generate(input);
  }

  private async generate(input: GameDirectorInput): Promise<GameDirectorOutput> {
    try {
      return await this.requestAndValidate(this.provider, input);
    } catch (error) {
      this.reportError("Game Director generation failed; using fallback.", error);
    }

    try {
      return await this.requestAndValidate(this.fallbackProvider, input);
    } catch (error) {
      this.reportError("Game Director fallback provider failed.", error);
      return validateDirectorOutput(createMockDirectorOutput(input), input);
    }
  }

  private async requestAndValidate(
    provider: AIProvider,
    input: GameDirectorInput,
  ): Promise<GameDirectorOutput> {
    const rawOutput = await provider.generateStructured({
      schemaName: "game_director_output",
      instructions: buildGameDirectorInstructions(input.purpose),
      input,
      outputSchema: gameDirectorOutputSchema,
    });

    return validateDirectorOutput(rawOutput, input);
  }
}

export function buildGameDirectorInput(
  game: Game,
  purpose: GameDirectorInput["purpose"],
  question?: string,
  targetPlayerId?: PlayerId,
): GameDirectorInput {
  const publicMessages = game.messages.filter(
    (message) =>
      message.visibility === "public" || message.visibility === "system",
  );
  const recentMessages = publicMessages.slice(-RECENT_MESSAGE_LIMIT);
  const olderMessages = publicMessages
    .slice(0, -RECENT_MESSAGE_LIMIT)
    .slice(-8);
  const summary = olderMessages.length > 0
    ? olderMessages
        .map((message) => message.speakerName + ": " + message.text)
        .join(" ")
        .slice(0, 1500)
    : "No earlier public transcript summary is available.";

  return gameDirectorInputSchema.parse({
    purpose,
    phase: game.phase,
    dayNumber: game.dayNumber,
    alivePlayers: game.players
      .filter((player) => player.isAlive)
      .map((player) => ({
        id: player.id,
        displayName: player.displayName,
        isHuman: player.isHuman,
        publicStyle: player.publicStyle,
        traits: player.traits,
        suspicion: player.suspicion,
      })),
    hiddenRoles: game.players.map((player) => ({
      playerId: player.id,
      displayName: player.displayName,
      role: player.role,
      team: player.team,
      isAlive: player.isAlive,
    })),
    recentPublicMessages: recentMessages.map((message) => ({
      speakerId: message.speakerId,
      speakerName: message.speakerName,
      text: message.text.slice(0, 500),
      phase: message.phase,
      dayNumber: message.dayNumber ?? game.dayNumber,
    })),
    publicTranscriptSummary: summary,
    memorySummaries: game.players
      .filter((player) => player.isAlive && !player.isHuman)
      .map((player) => ({
        playerId: player.id,
        summary: player.memorySummary.slice(0, 300),
      })),
    userAction:
      purpose === "question_response" && question
        ? {
            question,
            targetPlayerId: targetPlayerId ?? null,
          }
        : null,
    constraints: [...GAME_DIRECTOR_CONSTRAINTS],
  });
}

export function validateDirectorOutput(
  output: unknown,
  input: GameDirectorInput,
): GameDirectorOutput {
  const parsed = gameDirectorOutputSchema.parse(output);
  const alivePlayers = new Map(
    input.alivePlayers.map((player) => [player.id, player]),
  );
  const aliveAiIds = new Set(
    input.alivePlayers
      .filter((player) => !player.isHuman)
      .map((player) => player.id),
  );

  for (const message of parsed.publicMessages) {
    if (!aliveAiIds.has(message.speakerId)) {
      throw new Error("Game Director output contains an invalid speaker.");
    }

    if (message.text.trim().split(/\s+/).length > 35) {
      throw new Error("Game Director output contains an overlong message.");
    }

    if (!isSafeDirectorMessage(message.text, input.hiddenRoles)) {
      throw new Error("Game Director output failed the safety filter.");
    }
  }

  for (const update of parsed.memoryUpdates) {
    if (!aliveAiIds.has(update.playerId)) {
      throw new Error("Game Director output contains an invalid memory update.");
    }
  }

  for (const delta of parsed.suspicionDeltas) {
    if (
      !aliveAiIds.has(delta.observerId) ||
      !alivePlayers.has(delta.targetId) ||
      delta.observerId === delta.targetId
    ) {
      throw new Error("Game Director output contains an invalid suspicion delta.");
    }
  }

  for (const vote of parsed.suggestedVotes) {
    if (
      !aliveAiIds.has(vote.voterId) ||
      !alivePlayers.has(vote.targetId) ||
      vote.voterId === vote.targetId
    ) {
      throw new Error("Game Director output contains an invalid vote suggestion.");
    }
  }

  return parsed;
}
