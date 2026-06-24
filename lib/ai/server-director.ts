import "server-only";

import { GameDirector } from "@/lib/ai/game-director";
import { MockAIProvider } from "@/lib/ai/mock-provider";
import { OpenAIProvider } from "@/lib/ai/openai-provider";
import { getOptionalServerEnvironmentVariable } from "@/lib/env/server";

let gameDirector: GameDirector | undefined;

export function getServerGameDirector(): GameDirector {
  if (!gameDirector) {
    const openAiApiKey = getOptionalServerEnvironmentVariable("OPENAI_API_KEY");

    if (!openAiApiKey) {
      console.warn(
        "OPENAI_API_KEY is not configured; using deterministic mocked Game Director dialogue.",
      );
    }

    const provider = openAiApiKey
      ? new OpenAIProvider({ apiKey: openAiApiKey })
      : new MockAIProvider();
    gameDirector = new GameDirector(provider);
  }

  return gameDirector;
}
