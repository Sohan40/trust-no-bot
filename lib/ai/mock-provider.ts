import type { AIProvider, AIProviderRequest } from "@/lib/ai/provider";
import {
  gameDirectorInputSchema,
  gameDirectorOutputSchema,
  type GameDirectorInput,
  type GameDirectorOutput,
} from "@/lib/ai/schemas";

export const MOCK_AI_MODEL = "deterministic-mock-v1";

export class MockAIProvider implements AIProvider {
  async generateStructured(request: AIProviderRequest): Promise<unknown> {
    if (request.schemaName !== "game_director_output") {
      throw new Error(
        "MockAIProvider does not support " + request.schemaName + ".",
      );
    }

    const input = gameDirectorInputSchema.parse(request.input);
    return request.outputSchema.parse(createMockDirectorOutput(input));
  }
}

export function createMockDirectorOutput(
  input: GameDirectorInput,
): GameDirectorOutput {
  const aliveAi = input.alivePlayers.filter((player) => !player.isHuman);

  if (aliveAi.length === 0) {
    throw new Error("Game Director fallback requires a living AI player.");
  }

  const target = input.userAction?.targetPlayerId
    ? aliveAi.find((player) => player.id === input.userAction?.targetPlayerId)
    : undefined;
  const speakers =
    input.purpose === "question_response"
      ? [target, ...aliveAi.filter((player) => player.id !== target?.id)]
          .filter(
            (player): player is (typeof aliveAi)[number] => Boolean(player),
          )
          .slice(0, 2)
      : aliveAi.slice(0, 3);
  const dayLines = [
    "The quiet reactions matter more than the loud accusations right now.",
    "I want everyone to explain what changed their mind before we vote.",
    "Someone is steering suspicion without offering enough evidence.",
  ];
  const questionLines = [
    "I am judging the timeline, not just confident claims. The vote pattern matters most.",
    "That is fair to ask. I need one more concrete signal before I trust anyone.",
  ];

  return gameDirectorOutputSchema.parse({
    publicMessages: speakers.map((speaker, index) => ({
      speakerId: speaker.id,
      text:
        input.purpose === "question_response"
          ? questionLines[index] ?? questionLines[0]
          : dayLines[index] ?? dayLines[0],
      intent: input.purpose === "question_response" ? "defend" : "observe",
    })),
    memoryUpdates: [],
    suspicionDeltas: [],
    suggestedVotes: [],
  });
}
