import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// In demo / showcase mode (no Supabase env vars configured), supabase stays null
// and db.service.ts transparently falls back to a localStorage-backed mock.
// This lets the UI run end-to-end without a live backend.
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

if (!isSupabaseConfigured) {
  console.info(
    '[The Ledger] Running in local demo mode (no VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
      'All data is stored on this device only. Set those vars to connect a live Supabase backend.'
  );
}
