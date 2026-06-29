import "server-only";

import { GameDirector } from "@/lib/ai/game-director";
import { MockAIProvider, MOCK_AI_MODEL } from "@/lib/ai/mock-provider";
import {
  DEFAULT_OPENAI_MODEL,
  OpenAIProvider,
} from "@/lib/ai/openai-provider";
import { getOptionalServerEnvironmentVariable } from "@/lib/env/server";

type ServerGameDirectorState = {
  director: GameDirector;
  provider: "openai" | "mock";
  model: string;
};

let state: ServerGameDirectorState | undefined;

export function getServerGameDirector(): GameDirector {
  return getServerGameDirectorState().director;
}

export function getServerGameDirectorUsageMetadata(): {
  provider: string;
  model: string;
} {
  const current = getServerGameDirectorState();
  return { provider: current.provider, model: current.model };
}

function getServerGameDirectorState(): ServerGameDirectorState {
  if (!state) {
    const openAiApiKey = getOptionalServerEnvironmentVariable("OPENAI_API_KEY");
    const openAiModel =
      getOptionalServerEnvironmentVariable("OPENAI_MODEL") ||
      DEFAULT_OPENAI_MODEL;

    if (!openAiApiKey) {
      console.warn(
        "OPENAI_API_KEY is not configured; using deterministic mocked Game Director dialogue.",
      );
    }

    const provider = openAiApiKey
      ? new OpenAIProvider({ apiKey: openAiApiKey, model: openAiModel })
      : new MockAIProvider();
    state = {
      director: new GameDirector(provider),
      provider: openAiApiKey ? "openai" : "mock",
      model: openAiApiKey ? openAiModel : MOCK_AI_MODEL,
    };
  }

  return state;
}
