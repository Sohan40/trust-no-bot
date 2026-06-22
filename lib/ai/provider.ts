export type AIProviderRequest<TInput> = {
  schemaName: string;
  input: TInput;
};

export interface AIProvider {
  generateStructured<TInput, TOutput>(
    request: AIProviderRequest<TInput>,
  ): Promise<TOutput>;
}
