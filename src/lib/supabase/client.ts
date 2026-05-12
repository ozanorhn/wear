import { createBrowserClient } from "@supabase/ssr";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (typeof window !== "undefined") {
      console.warn(
        "[waer] NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY fehlen — App läuft nicht. Auf Netlify in den Environment variables eintragen.",
      );
    }
    return createBrowserClient(PLACEHOLDER_URL, PLACEHOLDER_KEY);
  }
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
