import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function createClient() {
  if (!supabaseUrl?.trim() || !supabaseKey?.trim()) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY gerekli");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl.trim(), supabaseKey.trim(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* Sunucu bileşeninde setAll — middleware oturumu yeniler */
        }
      },
    },
  });
}
