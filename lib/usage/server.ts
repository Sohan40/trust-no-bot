import "server-only";

import { resolveUsageLimits, type UsageLimits } from "@/lib/usage/limits";

export function getServerUsageLimits(): UsageLimits {
  return resolveUsageLimits(process.env);
}
