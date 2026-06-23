import type { ZodType } from "zod";

export type AIProviderRequest = {
  schemaName: string;
  instructions: string;
  input: unknown;
  outputSchema: ZodType;
};

export interface AIProvider {
  generateStructured(request: AIProviderRequest): Promise<unknown>;
}
