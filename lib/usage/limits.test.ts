import { describe, expect, it } from "vitest";
import {
  assertUsageClaimAllowed,
  DEFAULT_USAGE_LIMITS,
  getAIUsagePurpose,
  normalizeDailyUsage,
  resolveUsageLimits,
  serializeUsageLimitError,
  UsageLimitError,
  type UsageClaim,
  type UsageLimitReason,
} from "@/lib/usage/limits";

function createClaim(
  allowed: boolean,
  limitReason: string | null = null,
): UsageClaim {
  return {
    allowed,
    limit_reason: limitReason,
    usage_date: "2026-06-24",
    games_started_today: allowed ? 1 : 3,
    ai_actions_today: 0,
    questions_submitted_for_game: 0,
  };
}

describe("anonymous usage limits", () => {
  it("resets daily counters when the usage date changes", () => {
    expect(
      normalizeDailyUsage(
        {
          usageDate: "2026-06-23",
          gamesStartedToday: 3,
          aiActionsToday: 30,
        },
        "2026-06-24",
      ),
    ).toEqual({
      usageDate: "2026-06-24",
      gamesStartedToday: 0,
      aiActionsToday: 0,
    });
  });

  it("rejects a game start after the daily limit", () => {
    expect(() =>
      assertUsageClaimAllowed(createClaim(false, "game_start_limit")),
    ).toThrowError(
      expect.objectContaining({
        code: "DAILY_GAME_LIMIT_EXCEEDED",
      }),
    );
  });

  it.each([
    ["ai_action_limit", "DAILY_AI_ACTION_LIMIT_EXCEEDED"],
    ["question_limit", "GAME_QUESTION_LIMIT_EXCEEDED"],
  ] satisfies Array<[UsageLimitReason, string]>) (
    "rejects an exceeded %s claim",
    (reason, code) => {
      expect(() =>
        assertUsageClaimAllowed(createClaim(false, reason)),
      ).toThrowError(expect.objectContaining({ code }));
    },
  );

  it("serializes limit failures as a safe 429 response", () => {
    const response = serializeUsageLimitError(
      new UsageLimitError("question_limit"),
    );

    expect(response).toEqual({
      status: 429,
      body: {
        error: {
          code: "GAME_QUESTION_LIMIT_EXCEEDED",
          message: "You have reached the question limit for this game.",
        },
      },
    });
  });

  it("allows normal gameplay under the limit", () => {
    expect(() => assertUsageClaimAllowed(createClaim(true))).not.toThrow();
    expect(
      getAIUsagePurpose({
        actionType: "ADVANCE_PHASE",
        phase: "DAY_DISCUSSION",
        question: "",
      }),
    ).toBe("day_discussion");
    expect(
      getAIUsagePurpose({
        actionType: "ASK_QUESTION",
        phase: "PLAYER_QUESTION",
        question: "Why did you change your vote?",
      }),
    ).toBe("question_response");
    expect(
      getAIUsagePurpose({
        actionType: "ASK_QUESTION",
        phase: "PLAYER_QUESTION",
        question: "   ",
      }),
    ).toBeNull();
  });

  it("uses safe defaults and accepts positive environment overrides", () => {
    expect(resolveUsageLimits({})).toEqual(DEFAULT_USAGE_LIMITS);
    expect(
      resolveUsageLimits({
        MAX_GAMES_PER_DAY: "4",
        MAX_AI_ACTIONS_PER_DAY: "40",
        MAX_QUESTIONS_PER_GAME: "6",
      }),
    ).toEqual({
      gamesPerDay: 4,
      aiActionsPerDay: 40,
      questionsPerGame: 6,
    });
  });
});
