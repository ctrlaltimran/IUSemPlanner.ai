/* ============================================================================
   CONFIG — paste your Supabase keys here
   ============================================================================
   This is the ONLY file you need to edit to connect your account system.

   1. Go to https://supabase.com  →  open your project
   2. Click the gear (Project Settings)  →  "API"
   3. Copy "Project URL"  → paste into SUPABASE_URL below
   4. Copy "anon public" key → paste into SUPABASE_ANON_KEY below

   The anon key is SAFE to put in front-end code — it is designed to be public.
   Your data is protected by Row Level Security (RLS) policies in Supabase,
   not by hiding this key. (See SUPABASE_SETUP.md for the exact steps.)

   If you leave these as the placeholder text, the app still works perfectly in
   "guest mode" (data saved only in this browser, exactly like the old version).
   ========================================================================== */

window.IUSP_CONFIG = {
  // 👇 PASTE YOUR PROJECT URL HERE (looks like https://abcdxyz.supabase.co)
  SUPABASE_URL: 'https://hayvgjhogemhctbvhoun.supabase.co',

  // 👇 PASTE YOUR ANON PUBLIC KEY HERE (a long string starting with "eyJ...")
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheXZnamhvZ2VtaGN0YnZob3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5Mzk0MjQsImV4cCI6MjA5NjUxNTQyNH0.mJSupMNPPScnel2Fl0Qxn-AX__7oFOQEVptcHRDMhFk',
};

/* Returns true only when real keys have been pasted in above. */
window.isSupabaseConfigured = function () {
  const c = window.IUSP_CONFIG;
  return c
    && c.SUPABASE_URL && c.SUPABASE_URL.startsWith('http')
    && c.SUPABASE_ANON_KEY && c.SUPABASE_ANON_KEY.length > 20
    && !c.SUPABASE_URL.includes('YOUR_')
    && !c.SUPABASE_ANON_KEY.includes('YOUR_');
};

/* ── ML/ANN Lab backend (optional) ──
   Leave empty ('') to use the in-browser neural engine (default — works on
   static Hostinger hosting with no server). When the Python backend in
   ml-backend/ is deployed on your Hostinger VPS, put its base URL here,
   e.g. 'https://ml.ctrlaltimran.com' or 'http://YOUR_VPS_IP:8800'.
   If the API is unreachable the app automatically falls back to the
   in-browser engine, so the site never breaks. */
const ML_API_URL = '';
