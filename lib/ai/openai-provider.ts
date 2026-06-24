import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { AIProvider, AIProviderRequest } from "@/lib/ai/provider";
import {
  getOptionalServerEnvironmentVariable,
  getRequiredServerEnvironmentVariable,
} from "@/lib/env/server";

type OpenAIProviderOptions = {
  apiKey?: string;
  model?: string;
};

export class OpenAIProvider implements AIProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIProviderOptions = {}) {
    const apiKey =
      options.apiKey?.trim() ||
      getRequiredServerEnvironmentVariable("OPENAI_API_KEY");

    this.client = new OpenAI({
      apiKey,
      maxRetries: 1,
      timeout: 20_000,
    });
    this.model =
      options.model?.trim() ||
      getOptionalServerEnvironmentVariable("OPENAI_MODEL") ||
      "gpt-4.1-mini";
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
