import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

function requireServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required server environment variable: ${name}`);
  }

  return value;
}

export function createSupabaseServiceClient(): SupabaseClient<Database> {
  const supabaseUrl = requireServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function assertSupabaseServerEnv(): void {
  requireServerEnv("NEXT_PUBLIC_SUPABASE_URL");
  requireServerEnv("SUPABASE_SERVICE_ROLE_KEY");
}
