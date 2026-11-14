// Dueño: P4. Cliente de Supabase. Las llaves van en .env.local (nunca en git) y en Vercel:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** null si no hay llaves: la app sigue funcionando sin Supabase. */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
