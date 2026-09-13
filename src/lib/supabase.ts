import { createClient } from "@supabase/supabase-js";

// Client Supabase côté navigateur (respecte la RLS)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url!, key!)
  : (null as unknown as ReturnType<typeof createClient>);
