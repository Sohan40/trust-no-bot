import type { AIProvider, AIProviderRequest } from "@/lib/ai/provider";

export type MockDirectorOutput = {
  publicMessages: Array<{
    speakerId: string;
    text: string;
    intent: "accuse" | "defend" | "question" | "observe" | "deflect" | "summarize";
  }>;
  memoryUpdates: Array<{
    playerId: string;
    publicNote?: string;
    privateNote?: string;
  }>;
  suspicionDeltas: Array<{
    observerId: string;
    targetId: string;
    delta: number;
    reason: string;
  }>;
};

export class MockAIProvider implements AIProvider {
  async generateStructured<TInput, TOutput>(
    _request: AIProviderRequest<TInput>,
  ): Promise<TOutput> {
    const output: MockDirectorOutput = {
      publicMessages: [
        {
          speakerId: "riya",
          text: "I want everyone to answer the same question before we vote.",
          intent: "question",
        },
        {
          speakerId: "dev",
          text: "That sounds fair, which somehow makes me nervous.",
          intent: "observe",
        },
      ],
      memoryUpdates: [],
      suspicionDeltas: [],
    };

    return output as TOutput;
  }
}
