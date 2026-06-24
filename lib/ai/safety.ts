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
    const roleOrTeam =
      "(?:mafia|detective|doctor|villager|village)(?:\\s+team)?";
    const directRoleAttribution = new RegExp(
      "\\b" + name + "\\b(?:'s)?(?:\\s+role)?\\s+" +
        "(?:(?:is|was)(?:n't)?\\s+(?:not\\s+)?(?:on\\s+)?" +
        "(?:(?:a|the)\\s+)?" + roleOrTeam +
        "|checked\\s+as\\s+(?:not\\s+)?(?:(?:a|the)\\s+)?" +
        roleOrTeam + ")\\b",
      "i",
    );
    const emphaticRoleAttribution = new RegExp(
      "\\b" + name +
        "\\b.{0,24}\\b(?:confirmed|definitely|secretly)\\b.{0,16}\\b" +
        roleOrTeam + "\\b",
      "i",
    );

    return (
      directRoleAttribution.test(text) || emphaticRoleAttribution.test(text)
    );
  });
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
