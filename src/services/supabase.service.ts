import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// In demo / showcase mode (no Supabase env vars configured, or the configured
// project is paused / unreachable), supabase stays null and db.service.ts
// transparently falls back to a localStorage-backed mock. This lets the UI run
// end-to-end without a live backend.
let supabase: SupabaseClient | null = null;
let supabaseReachable = false;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  // Best-effort liveness probe — a paused/deleted Supabase project looks like
  // an HTTP error or a network "Failed to fetch". On any non-OK response we
  // mark the backend unreachable so every RPC falls back to local mode.
  fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { apikey: supabaseAnonKey },
  })
    .then(async (r) => {
      // A paused Supabase project can return HTTP 200 from a maintenance page.
      // Only treat the backend as reachable if the REST API itself answers
      // with its normal JSON shape (an openapi swagger doc, not an HTML page).
      if (!r.ok) {
        supabaseReachable = false;
        return;
      }
      const ct = r.headers.get('content-type') || '';
      supabaseReachable = ct.includes('application/json') || ct.includes('openapi');
    })
    .catch(() => {
      supabaseReachable = false;
    })
    .finally(() => {
      if (!supabaseReachable) {
        console.info(
          '[The Ledger] Supabase project is unreachable (paused or down). ' +
            'Switching to on-device demo mode automatically. All data stays on this phone.'
        );
      }
    });
} else {
  console.info(
    '[The Ledger] Running in local demo mode (no VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
      'All data is stored on this device only. Set those vars to connect a live Supabase backend.'
  );
}

// True only when the client exists AND we have confirmed it is live.
// db.service.ts reads this on every call so a paused project flips to local
// mode without you having to touch the Vercel env vars.
export const isSupabaseConfigured = (): boolean =>
  Boolean(supabase) && supabaseReachable;

export { supabase };
