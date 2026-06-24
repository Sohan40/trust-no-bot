import { describe, expect, it } from "vitest";
import {
  assertEnvironmentVariables,
  EnvironmentConfigurationError,
  findMissingEnvironmentVariables,
  PUBLIC_ENV_NAMES,
  readRequiredEnvironmentVariable,
  SERVER_ONLY_ENV_NAMES,
} from "@/lib/env/config";

describe("environment configuration", () => {
  it("reports all missing required variables without exposing values", () => {
    const environment = {
      NEXT_PUBLIC_SUPABASE_URL: "   ",
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      UNRELATED_SECRET: "do-not-print-this",
    };

    expect(() =>
      assertEnvironmentVariables(environment, [
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
      ]),
    ).toThrowError(EnvironmentConfigurationError);

    try {
      assertEnvironmentVariables(environment, [
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
      ]);
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentConfigurationError);
      expect((error as Error).message).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect((error as Error).message).toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect((error as Error).message).not.toContain("do-not-print-this");
    }
  });

  it("treats blank values as missing", () => {
    expect(findMissingEnvironmentVariables({ EXAMPLE: "  " }, ["EXAMPLE"]))
      .toEqual(["EXAMPLE"]);
  });

  it("returns trimmed required values", () => {
    expect(readRequiredEnvironmentVariable({ EXAMPLE: " value " }, "EXAMPLE"))
      .toBe("value");
  });

  it("keeps server-only variables outside the public namespace", () => {
    expect(SERVER_ONLY_ENV_NAMES.every((name) => !name.startsWith("NEXT_PUBLIC_")))
      .toBe(true);
  });

  it("marks every browser-visible variable explicitly", () => {
    expect(PUBLIC_ENV_NAMES.every((name) => name.startsWith("NEXT_PUBLIC_")))
      .toBe(true);
  });
});
