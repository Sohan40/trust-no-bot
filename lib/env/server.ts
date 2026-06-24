import "server-only";

import {
  assertEnvironmentVariables,
  readOptionalEnvironmentVariable,
  readRequiredEnvironmentVariable,
} from "@/lib/env/config";

export function getOptionalServerEnvironmentVariable(
  name: string,
): string | undefined {
  return readOptionalEnvironmentVariable(process.env, name);
}

export function getRequiredServerEnvironmentVariable(name: string): string {
  return readRequiredEnvironmentVariable(process.env, name);
}

export function assertServerEnvironmentVariables(
  names: readonly string[],
): void {
  assertEnvironmentVariables(process.env, names);
}
