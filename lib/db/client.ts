import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";
import { REQUIRED_GAMEPLAY_ENV_NAMES } from "@/lib/env/config";
import {
  assertServerEnvironmentVariables,
  getRequiredServerEnvironmentVariable,
} from "@/lib/env/server";

export function createSupabaseServiceClient(): SupabaseClient<Database> {
  assertSupabaseServerEnv();
  const supabaseUrl = getRequiredServerEnvironmentVariable(
    "NEXT_PUBLIC_SUPABASE_URL",
  );
  const serviceRoleKey = getRequiredServerEnvironmentVariable(
    "SUPABASE_SERVICE_ROLE_KEY",
  );

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function assertSupabaseServerEnv(): void {
  assertServerEnvironmentVariables(REQUIRED_GAMEPLAY_ENV_NAMES);
}
