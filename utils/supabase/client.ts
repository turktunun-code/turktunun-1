import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export function createClient() {
  if (!supabaseUrl?.trim() || !supabaseKey?.trim()) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY gerekli");
  }
  return createBrowserClient(supabaseUrl.trim(), supabaseKey.trim());
}
