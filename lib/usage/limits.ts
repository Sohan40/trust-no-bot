import type { Environment } from "@/lib/env/config";
import { readOptionalEnvironmentVariable } from "@/lib/env/config";

export const DEFAULT_USAGE_LIMITS = {
  gamesPerDay: 3,
  aiActionsPerDay: 30,
  questionsPerGame: 5,
} as const;

export type UsageLimits = {
  gamesPerDay: number;
  aiActionsPerDay: number;
  questionsPerGame: number;
};

export type AIUsagePurpose = "day_discussion" | "question_response";

export type UsageLimitReason =
  | "game_start_limit"
  | "ai_action_limit"
  | "question_limit";

export type UsageClaim = {
  allowed: boolean;
  limit_reason: string | null;
  usage_date: string;
  games_started_today: number;
  ai_actions_today: number;
  questions_submitted_for_game: number;
};

export type DailyUsage = {
  usageDate: string;
  gamesStartedToday: number;
  aiActionsToday: number;
};

const limitErrors: Record<
  UsageLimitReason,
  { code: string; message: string }
> = {
  game_start_limit: {
    code: "DAILY_GAME_LIMIT_EXCEEDED",
    message: "You have reached today's game limit. Try again tomorrow.",
  },
  ai_action_limit: {
    code: "DAILY_AI_ACTION_LIMIT_EXCEEDED",
    message: "You have reached today's AI action limit. Try again tomorrow.",
  },
  question_limit: {
    code: "GAME_QUESTION_LIMIT_EXCEEDED",
    message: "You have reached the question limit for this game.",
  },
};

export class UsageLimitError extends Error {
  readonly code: string;

  constructor(reason: UsageLimitReason) {
    const definition = limitErrors[reason];
    super(definition.message);
    this.name = "UsageLimitError";
    this.code = definition.code;
  }
}

export function resolveUsageLimits(environment: Environment): UsageLimits {
  return {
    gamesPerDay: readPositiveInteger(
      environment,
      "MAX_GAMES_PER_DAY",
      DEFAULT_USAGE_LIMITS.gamesPerDay,
    ),
    aiActionsPerDay: readPositiveInteger(
      environment,
      "MAX_AI_ACTIONS_PER_DAY",
      DEFAULT_USAGE_LIMITS.aiActionsPerDay,
    ),
    questionsPerGame: readPositiveInteger(
      environment,
      "MAX_QUESTIONS_PER_GAME",
      DEFAULT_USAGE_LIMITS.questionsPerGame,
    ),
  };
}

export function normalizeDailyUsage(
  usage: DailyUsage,
  currentDate: string,
): DailyUsage {
  if (usage.usageDate === currentDate) {
    return usage;
  }

  return {
    usageDate: currentDate,
    gamesStartedToday: 0,
    aiActionsToday: 0,
  };
}

export function assertUsageClaimAllowed(claim: UsageClaim): void {
  if (claim.allowed) {
    return;
  }

  if (isUsageLimitReason(claim.limit_reason)) {
    throw new UsageLimitError(claim.limit_reason);
  }

  throw new Error("Usage claim failed without a recognized limit reason.");
}

export function serializeUsageLimitError(error: UsageLimitError): {
  status: 429;
  body: { error: { code: string; message: string } };
} {
  return {
    status: 429,
    body: {
      error: {
        code: error.code,
        message: error.message,
      },
    },
  };
}

export function getAIUsagePurpose(input: {
  actionType: "ADVANCE_PHASE" | "ASK_QUESTION";
  phase: string;
  question: string;
}): AIUsagePurpose | null {
  if (
    input.actionType === "ADVANCE_PHASE" &&
    input.phase === "DAY_DISCUSSION"
  ) {
    return "day_discussion";
  }

  if (
    input.actionType === "ASK_QUESTION" &&
    input.phase === "PLAYER_QUESTION" &&
    input.question.trim()
  ) {
    return "question_response";
  }

  return null;
}

function readPositiveInteger(
  environment: Environment,
  name: string,
  fallback: number,
): number {
  const value = readOptionalEnvironmentVariable(environment, name);

  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return parsed;
}

function isUsageLimitReason(value: string | null): value is UsageLimitReason {
  return value !== null && Object.hasOwn(limitErrors, value);
}
