import type { GameDirectorInput } from "@/lib/ai/schemas";

const unsafeTextPatterns = [
  /\bkill yourself\b/i,
  /\bself[- ]?harm\b/i,
  /\bdoxx(?:ing)?\b/i,
  /\b(?:home|street) address\b/i,
  /\bphone number\b/i,
  /\bsexual\s+(?:content|activity).{0,30}\bminor/i,
  /\breal[- ]world\s+(?:attack|crime|harm)\b/i,
];

const promptLeakPatterns = [
  /\b(?:hidden|secret) roles?\b/i,
  /\bsystem prompt\b/i,
  /\bdeveloper message\b/i,
  /\bignore (?:all |the )?(?:previous|system) instructions\b/i,
];

export function isSafeUserQuestion(question: string): boolean {
  return !matchesAny(question, [...unsafeTextPatterns, ...promptLeakPatterns]);
}

export function isSafeDirectorMessage(
  text: string,
  hiddenRoles: GameDirectorInput["hiddenRoles"],
): boolean {
  if (matchesAny(text, [...unsafeTextPatterns, ...promptLeakPatterns])) {
    return false;
  }

  return !hiddenRoles.some((player) => {
    const name = escapeRegExp(player.displayName);
    const role = escapeRegExp(player.role);
    const confirmedRole = new RegExp(
      "\\b" + name +
        "\\b.{0,24}\\b(?:confirmed|definitely|secretly)\\b.{0,16}\\b" +
        role + "\\b",
      "i",
    );
    const explicitRole = new RegExp(
      "\\b" + name +
        "\\b(?:'s)?\\s+(?:hidden|secret)\\s+role\\s+is\\s+(?:the\\s+)?" +
        role + "\\b",
      "i",
    );

    return confirmedRole.test(text) || explicitRole.test(text);
  });
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
