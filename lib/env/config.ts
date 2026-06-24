export type Environment = Readonly<Record<string, string | undefined>>;

export const SERVER_ONLY_ENV_NAMES = [
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "MAX_AI_ACTIONS_PER_DAY",
  "MAX_GAMES_PER_DAY",
  "MAX_QUESTIONS_PER_GAME",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const PUBLIC_ENV_NAMES = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

export const REQUIRED_GAMEPLAY_ENV_NAMES = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export class EnvironmentConfigurationError extends Error {
  readonly missingNames: readonly string[];

  constructor(missingNames: readonly string[]) {
    super(
      `Missing required server environment variable${missingNames.length === 1 ? "" : "s"}: ${missingNames.join(", ")}. ` +
        "Configure them in .env.local for local development or in Vercel Project Settings.",
    );
    this.name = "EnvironmentConfigurationError";
    this.missingNames = missingNames;
  }
}

export function readOptionalEnvironmentVariable(
  environment: Environment,
  name: string,
): string | undefined {
  const value = environment[name]?.trim();
  return value || undefined;
}

export function findMissingEnvironmentVariables(
  environment: Environment,
  names: readonly string[],
): string[] {
  return names.filter(
    (name) => readOptionalEnvironmentVariable(environment, name) === undefined,
  );
}

export function assertEnvironmentVariables(
  environment: Environment,
  names: readonly string[],
): void {
  const missingNames = findMissingEnvironmentVariables(environment, names);

  if (missingNames.length > 0) {
    throw new EnvironmentConfigurationError(missingNames);
  }
}

export function readRequiredEnvironmentVariable(
  environment: Environment,
  name: string,
): string {
  const value = readOptionalEnvironmentVariable(environment, name);

  if (!value) {
    throw new EnvironmentConfigurationError([name]);
  }

  return value;
}
