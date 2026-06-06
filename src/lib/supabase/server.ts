import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the service role key.
 * NEVER import this from a client component.
 * Returns null when env variables are missing so callers can degrade gracefully.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { "x-client-info": "etece-studio-server" },
    },
  });
}

export type ContactSubmissionRow = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string;
  message: string;
  source: string | null;
  status: string | null;
};
