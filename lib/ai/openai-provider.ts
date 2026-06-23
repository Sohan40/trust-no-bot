import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { AIProvider, AIProviderRequest } from "@/lib/ai/provider";

type OpenAIProviderOptions = {
  apiKey?: string;
  model?: string;
};

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIProviderOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required for OpenAIProvider.");
    }

    this.client = new OpenAI({
      apiKey,
      maxRetries: 1,
      timeout: 20_000,
    });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  }

  async generateStructured(request: AIProviderRequest): Promise<unknown> {
    const response = await this.client.responses.parse({
      model: this.model,
      instructions: request.instructions,
      input: JSON.stringify(request.input),
      max_output_tokens: 1200,
      store: false,
      text: {
        format: zodTextFormat(request.outputSchema, request.schemaName),
      },
    });

    if (response.output_parsed === null) {
      throw new Error("OpenAI returned no structured Game Director output.");
    }

    return response.output_parsed;
  }
}
