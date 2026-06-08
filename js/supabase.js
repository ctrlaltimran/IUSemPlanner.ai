/* ============================================================================
   SUPABASE — authentication + per-user cloud data sync
   ============================================================================
   What this module does:
     • Creates a Supabase client from the keys in config.js
     • Email/password sign up + sign in
     • Google sign in (OAuth)
     • Loads & saves each user's data to a single `user_data` row (JSONB blob)

   Everything is OPTIONAL. If config.js still has placeholder keys, every
   function below becomes a safe no-op and the app runs in local "guest mode"
   exactly like before — so nothing breaks.

   IMPORTANT: This is 100% client-side (loaded from a CDN). It does NOT run any
   server code and does NOT touch your WordPress site.
   ========================================================================== */

let _supabase = null;

/* Build the client once. Returns null if not configured / SDK missing. */
function getSupabase() {
  if (_supabase) return _supabase;
  if (!window.isSupabaseConfigured || !window.isSupabaseConfigured()) return null;
  if (!window.supabase || !window.supabase.createClient) return null; // CDN not loaded
  _supabase = window.supabase.createClient(
    window.IUSP_CONFIG.SUPABASE_URL,
    window.IUSP_CONFIG.SUPABASE_ANON_KEY
  );
  return _supabase;
}

/* True when auth is actually available to use. */
function authAvailable() {
  return getSupabase() !== null;
}

/* ── Sign up with email + password ───────────────────────────────────────── */
async function authSignUp(email, password) {
  const sb = getSupabase();
  if (!sb) throw new Error('Accounts are not set up yet. (Add your Supabase keys in js/config.js.)');
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

/* ── Sign in with email + password ───────────────────────────────────────── */
async function authSignIn(email, password) {
  const sb = getSupabase();
  if (!sb) throw new Error('Accounts are not set up yet. (Add your Supabase keys in js/config.js.)');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

/* ── Sign in with Google (OAuth) ─────────────────────────────────────────── */
async function authSignInGoogle() {
  const sb = getSupabase();
  if (!sb) throw new Error('Accounts are not set up yet. (Add your Supabase keys in js/config.js.)');
  /* redirectTo brings the user back to THIS page after Google login, so it
     always returns to your Hostinger permalink wherever the app is hosted. */
  const redirectTo = window.location.origin + window.location.pathname;
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw new Error(error.message);
  return data;
}

/* ── Sign out ────────────────────────────────────────────────────────────── */
async function authSignOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}

/* ── Current session (null if logged out / not configured) ───────────────── */
async function getCurrentUser() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data && data.session ? data.session.user : null;
}

/* ── Subscribe to login/logout events. cb(user|null) ─────────────────────── */
function onAuthChange(cb) {
  const sb = getSupabase();
  if (!sb) return;
  sb.auth.onAuthStateChange((_event, session) => {
    cb(session ? session.user : null);
  });
}

/* ── Load this user's saved data blob from the cloud (or null) ───────────── */
async function cloudLoad(userId) {
  const sb = getSupabase();
  if (!sb || !userId) return null;
  const { data, error } = await sb
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) { console.warn('cloudLoad failed:', error.message); return null; }
  return data ? data.data : null;
}

/* ── Save (upsert) this user's data blob to the cloud ────────────────────── */
async function cloudSave(userId, blob) {
  const sb = getSupabase();
  if (!sb || !userId) return false;
  const { error } = await sb
    .from('user_data')
    .upsert(
      { user_id: userId, data: blob, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  if (error) { console.warn('cloudSave failed:', error.message); return false; }
  return true;
}

/* expose to the rest of the app */
window.IUSPAuth = {
  authAvailable,
  authSignUp,
  authSignIn,
  authSignInGoogle,
  authSignOut,
  getCurrentUser,
  onAuthChange,
  cloudLoad,
  cloudSave,
};
