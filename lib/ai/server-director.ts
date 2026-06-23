import "server-only";

import { GameDirector } from "@/lib/ai/game-director";
import { MockAIProvider } from "@/lib/ai/mock-provider";
import { OpenAIProvider } from "@/lib/ai/openai-provider";

let gameDirector: GameDirector | undefined;

export function getServerGameDirector(): GameDirector {
  if (!gameDirector) {
    const provider = process.env.OPENAI_API_KEY
      ? new OpenAIProvider()
      : new MockAIProvider();
    gameDirector = new GameDirector(provider);
  }

  return gameDirector;
}
