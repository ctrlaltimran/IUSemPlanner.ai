/* APP — state, helpers, event handlers, main render entry
   Loaded last so all other modules' globals are available. */

const defaultState = {
  user: null,
  tab: 'dashboard',
  courses: [],
  /* v2.0 — scraped from the super-bookmarklet */
  profile: null,           /* { name } */
  transcript: [],          /* [{ code, title, credits, grade, points }, …] */
  transcriptGPA: null,     /* Explicit GPA from transcript page */
  attendance: [],          /* [{ course, totalSessions, present, absent }, …] */
  currentSchedule: [],     /* [{ day, courseTitle, faculty, location, edpCode, startTime, endTime, raw }, …] */
  midterms: [],            /* [{ code, name, total, obtained, percentage, raw }, …] */
  examSchedule: [],        /* [{ code, name, date, time, venue }, …] */
  dataTimestamp: null,     /* ms epoch of last successful import */

  filter: 'all',
  search: '',
  modal: null,
  newCourse: null,
  uploadMode: 'bookmark',
  uploadProcessing: false,
  uploadError: null,
  aiSettings: { provider: 'default', apiKey: '', maxTokens: 1200 },
  ai: { summary: null, recommendations: null, loadingSummary: false, loadingRecs: false, errorSummary: null, errorRecs: null },
  showBookmarkCode: false,
  importBanner: null,
  targetCGPA: 3.5,         /* user-adjustable CGPA goal for predictions */

  /* ── account + cloud (Supabase) ── */
  account: null,           /* { id, email } when signed in, else null */
  authMode: 'signin',      /* 'signin' | 'signup' — which auth form to show */
  authError: null,
  authLoading: false,
  cloudStatus: null,       /* 'saving' | 'saved' | null — small sync indicator */

  /* ── AI data-aware chat ── */
  aiChat: { messages: [], loading: false, error: null },

  /* ── Courses (knowledge base) tab ── */
  libQuery: '',            /* search text */
  libOpen: null,           /* code of the currently expanded course */
};

// Load saved data from browser storage
let savedState = {};
try {
  const stored = localStorage.getItem('iusp_data');
  if (stored) savedState = JSON.parse(stored);
} catch (e) { }

const state = { ...defaultState, ...savedState };
// Reset UI-only states on reload so modals don't get stuck open
state.modal = null;
state.uploadProcessing = false;
state.authError = null;
state.authLoading = false;
state.aiChat = { messages: [], loading: false, error: null };
/* If saved tab no longer exists in v2 (old "progress" was default), keep it. */
if (!['dashboard', 'timetable', 'progress', 'transcript', 'courses', 'library', 'planner', 'ai'].includes(state.tab)) {
  state.tab = 'dashboard';
}

// Helper function to auto-save to browser storage
function dataBlob() {
  return {
    user: state.user,
    tab: state.tab,
    courses: state.courses,
    profile: state.profile,
    transcript: state.transcript,
    transcriptGPA: state.transcriptGPA,
    attendance: state.attendance,
    currentSchedule: state.currentSchedule,
    midterms: state.midterms,
    examSchedule: state.examSchedule,
    dataTimestamp: state.dataTimestamp,
    aiSettings: state.aiSettings,
    targetCGPA: state.targetCGPA,
  };
}

function saveLocal() {
  try {
    localStorage.setItem('iusp_data', JSON.stringify(dataBlob()));
  } catch (e) { }
  /* If signed in, also push to the cloud (debounced). */
  scheduleCloudSave();
}

/* ── Cloud save (debounced) ──
   Only runs when a Supabase account is connected. Safe no-op otherwise. */
let _cloudTimer = null;
function scheduleCloudSave() {
  if (!state.account || !window.IUSPAuth || !window.IUSPAuth.authAvailable()) return;
  if (_cloudTimer) clearTimeout(_cloudTimer);
  _cloudTimer = setTimeout(async () => {
    state.cloudStatus = 'saving';
    const ok = await window.IUSPAuth.cloudSave(state.account.id, dataBlob());
    state.cloudStatus = ok ? 'saved' : null;
    /* repaint the tiny sync indicator without disrupting inputs */
    const el = document.getElementById('cloud-status');
    if (el) el.textContent = ok ? 'synced' : '';
    setTimeout(() => { state.cloudStatus = null; const e2 = document.getElementById('cloud-status'); if (e2) e2.textContent = ''; }, 2500);
  }, 1200);
}

/* Apply a data blob (from cloud or pending import) into state. */
function applyBlob(blob) {
  if (!blob) return;
  if (blob.courses) state.courses = blob.courses;
  if (blob.profile !== undefined) state.profile = blob.profile;
  if (blob.transcript) state.transcript = blob.transcript;
  if (blob.transcriptGPA !== undefined) state.transcriptGPA = blob.transcriptGPA;
  if (blob.attendance) state.attendance = blob.attendance;
  if (blob.currentSchedule) state.currentSchedule = blob.currentSchedule;
  if (blob.midterms) state.midterms = blob.midterms;
  if (blob.examSchedule) state.examSchedule = blob.examSchedule;
  if (blob.dataTimestamp) state.dataTimestamp = blob.dataTimestamp;
  if (blob.aiSettings) state.aiSettings = blob.aiSettings;
  if (blob.targetCGPA != null) state.targetCGPA = blob.targetCGPA;
}

function $(id) { return document.getElementById(id); }

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function uid() {
  return 'c' + Date.now() + Math.floor(Math.random() * 10000);
}

function toMin(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function fmtTime(t) {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ':' + String(m).padStart(2, '0') + ' ' + ap;
}

function fmtDur(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return m + 'm';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'm';
}

function render() {
  saveLocal();
  const onHome = state.user === null;
  $('app').innerHTML = onHome ? renderLogin() : renderApp();
  document.body.classList.toggle('view-home', onHome);
  document.body.classList.toggle('view-app', !onHome);

  if (state._focusSearch) {
    const inp = document.querySelector('[data-f="search"]');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(state.search.length, state.search.length);
    }
    state._focusSearch = false;
  }

  if (state._focusLibSearch) {
    const inp = document.querySelector('[data-f="lib-search"]');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(state.libQuery.length, state.libQuery.length);
    }
    state._focusLibSearch = false;
  }
}

/* Send AI chat on Enter (Shift+Enter for newline). */
document.addEventListener('keydown', (e) => {
  if (e.target && e.target.id === 'aiChatInput' && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAIChat();
  }
});

/* ── File upload handlers ── */

async function handleTextFile(file) {
  state.uploadProcessing = true;
  state.uploadError = null;
  render();
  try {
    const text = await readTextFile(file);
    const parsed = parseIULMS(text);
    if (parsed.length === 0) {
      throw new Error('Could not parse any courses from this file. Make sure it contains your IULMS course list.');
    }
    state.courses = parsed;
    state.dataTimestamp = Date.now();
    state.modal = null;
    state.uploadProcessing = false;
    render();
    alert('✓ Imported ' + parsed.length + ' courses from file.');
  } catch (e) {
    state.uploadError = e.message;
    state.uploadProcessing = false;
    render();
  }
}

async function handleImageFile(file) {
  state.uploadProcessing = true;
  state.uploadError = null;
  render();
  try {
    const text = await extractCoursesFromImage(file);
    const parsed = parseIULMS(text);
    if (parsed.length === 0) {
      throw new Error('Vision AI could not extract a recognizable course list. Try a clearer screenshot.');
    }
    state.courses = parsed;
    state.dataTimestamp = Date.now();
    state.modal = null;
    state.uploadProcessing = false;
    render();
    alert('✓ Vision AI extracted ' + parsed.length + ' courses from image.');
  } catch (e) {
    state.uploadError = e.message;
    state.uploadProcessing = false;
    render();
  }
}

/* ── Account / auth actions ── */
async function handleAuthAction(action) {
  if (action === 'toggle') {
    state.authMode = state.authMode === 'signin' ? 'signup' : 'signin';
    state.authError = null;
    render();
    return;
  }
  if (action === 'guest') {
    /* Continue without an account — local only (old behaviour). */
    state.user = { plan: 'free' };
    state.modal = null;
    if (_pendingImport) applyPendingImport();
    state.tab = (state.courses.length || state.transcript.length) ? 'dashboard' : 'progress';
    render();
    window.scrollTo(0, 0);
    return;
  }
  if (action === 'google') {
    state.authError = null;
    state.authLoading = true;
    render();
    try {
      await window.IUSPAuth.authSignInGoogle();
      /* page will redirect to Google, then back; onAuthChange handles the rest */
    } catch (err) {
      state.authError = err.message;
      state.authLoading = false;
      render();
    }
    return;
  }
  if (action === 'submit') {
    const email = (document.getElementById('auth-email') || {}).value || '';
    const password = (document.getElementById('auth-password') || {}).value || '';
    if (!email.trim() || !password.trim()) {
      state.authError = 'Please enter both your email and password.';
      render();
      return;
    }
    state.authError = null;
    state.authLoading = true;
    render();
    try {
      if (state.authMode === 'signup') {
        const res = await window.IUSPAuth.authSignUp(email.trim(), password);
        if (res && res.user && !res.session) {
          /* Email confirmation is ON in Supabase — tell the user to verify. */
          state.authLoading = false;
          state.authError = null;
          state.importBanner = { type: 'info', text: 'Check your email to confirm your account, then sign in.' };
          state.authMode = 'signin';
          render();
          return;
        }
        if (res && res.user) await enterApp(res.user);
      } else {
        const res = await window.IUSPAuth.authSignIn(email.trim(), password);
        if (res && res.user) await enterApp(res.user);
      }
    } catch (err) {
      state.authError = err.message;
      state.authLoading = false;
      render();
    }
  }
}

/* ── AI chat: read the input box and ask the AI ── */
function sendAIChat() {
  const inp = document.getElementById('aiChatInput');
  if (!inp) return;
  const q = inp.value.trim();
  if (!q) return;
  inp.value = '';
  askAIQuestion(q); /* defined in ai.js — pushes messages and re-renders */
}

/* ── Event handlers ── */

document.addEventListener('click', (e) => {
  /* ── Account / auth buttons (login screen) ── */
  const authBtn = e.target.closest('[data-auth]');
  if (authBtn) {
    handleAuthAction(authBtn.dataset.auth);
    return;
  }

  /* ── Courses knowledge-base: expand/collapse a course card ── */
  const libCard = e.target.closest('[data-lib-open]');
  if (libCard) {
    const code = libCard.dataset.libOpen;
    state.libOpen = state.libOpen === code ? null : code;
    render();
    return;
  }

  /* ── AI chat: send a question ── */
  if (e.target.closest('[data-action="ai-chat-send"]')) {
    sendAIChat();
    return;
  }
  const chatChip = e.target.closest('[data-chat-suggest]');
  if (chatChip) {
    const inp = document.getElementById('aiChatInput');
    if (inp) { inp.value = chatChip.dataset.chatSuggest; inp.focus(); }
    return;
  }

  const loginBtn = e.target.closest('[data-login]');
  if (loginBtn) {
    /* Guest entry (no account). Keeps the old "pick a plan" flow working. */
    state.user = { plan: loginBtn.dataset.login };
    state.modal = null;
    if (_pendingImport) applyPendingImport();
    state.tab = (state.courses.length || state.transcript.length) ? 'dashboard' : 'progress';
    render();
    window.scrollTo(0, 0);
    return;
  }

  const loginAndBtn = e.target.closest('[data-login-and]');
  if (loginAndBtn) {
    state.user = { plan: 'free' };
    state.modal = null;

    state.tab = 'progress';
    state.modal = 'import';
    state.uploadMode = 'bookmark';
    render();
    window.scrollTo(0, 0);
    return;
  }

  const tabBtnEl = e.target.closest('[data-tab]');
  if (tabBtnEl) {
    state.tab = tabBtnEl.dataset.tab;
    render();
    window.scrollTo(0, 0);
    return;
  }

  const filterBtn = e.target.closest('[data-filter]');
  if (filterBtn) {
    state.filter = filterBtn.dataset.filter;
    render();
    return;
  }

  const uploadModeBtn = e.target.closest('[data-upload-mode]');
  if (uploadModeBtn) {
    if (uploadModeBtn.classList.contains('locked')) return;
    state.uploadMode = uploadModeBtn.dataset.uploadMode;
    state.uploadError = null;
    state.showBookmarkCode = false;
    render();
    return;
  }

  const bmPlatformBtn = e.target.closest('[data-bm-platform]');
  if (bmPlatformBtn) {
    const stepsEl = document.querySelector('.bm-steps');
    if (stepsEl) {
      stepsEl.classList.remove('desktop', 'mobile');
      stepsEl.classList.add(bmPlatformBtn.dataset.bmPlatform);
    }
    document.querySelectorAll('.bm-steps-tab').forEach(t => t.classList.remove('active'));
    bmPlatformBtn.classList.add('active');
    return;
  }

  // Close modal only on direct click of the backdrop (not bubbled from children)
  if (e.target.classList && e.target.classList.contains('modal-backdrop')) {
    state.modal = null;
    state.newCourse = null;
    state.uploadError = null;
    render();
    return;
  }

  const ab = e.target.closest('[data-action]');
  if (!ab) return;
  const action = ab.dataset.action;

  switch (action) {
    case 'logout':
      if (state.account && window.IUSPAuth) { window.IUSPAuth.authSignOut(); }
      state.account = null;
      state.user = null;
      state.tab = 'dashboard';
      state.ai = { summary: null, recommendations: null, loadingSummary: false, loadingRecs: false, errorSummary: null, errorRecs: null };
      state.aiChat = { messages: [], loading: false, error: null };
      render();
      break;

    case 'open-auth':
      state.authMode = ab.dataset.authMode || 'signin';
      state.modal = 'auth';
      state.authError = null;
      render();
      break;

    case 'open-import':
      state.modal = 'import';
      state.uploadMode = 'bookmark';
      state.uploadError = null;
      render();
      break;

    case 'open-settings':
      state.modal = 'settings';
      render();
      break;

    case 'open-add-custom':
      state.modal = 'addCustom';
      state.newCourse = null;
      render();
      break;

    case 'close-modal':
      state.modal = null;
      state.newCourse = null;
      state.uploadError = null;
      render();
      break;

    case 'paste-sample': {
      const ta = $('importTextarea');
      if (ta) ta.value = IULMS_SAMPLE;
      break;
    }

    case 'do-import': {
      const ta = $('importTextarea');
      const text = ta ? ta.value : '';
      if (!text.trim()) {
        alert('Please paste your IULMS text first, or click "paste sample data" to try it out.');
        return;
      }
      const parsed = parseIULMS(text);
      if (parsed.length === 0) {
        alert('Could not parse any courses. Make sure you copied the full IULMS page (with semester headers).');
        return;
      }
      state.courses = parsed;
      state.dataTimestamp = Date.now();
      state.modal = null;
      alert('✓ Imported ' + parsed.length + ' courses successfully.');
      render();
      break;
    }

    case 'load-sample':
      state.courses = parseIULMS(IULMS_SAMPLE);
      state.dataTimestamp = Date.now();
      state.modal = null;
      render();
      break;

    case 'reset-data':
      if (!confirm('Reset all data? This will clear your courses, transcript, attendance, schedule and all other imported data. This cannot be undone.')) return;
      state.courses = [];
      state.profile = null;
      state.transcript = [];
      state.attendance = [];
      state.currentSchedule = [];
      state.midterms = [];
      state.examSchedule = [];
      state.dataTimestamp = null;
      state.modal = null;
      state.tab = 'dashboard';
      state.ai = { summary: null, recommendations: null, loadingSummary: false, loadingRecs: false, errorSummary: null, errorRecs: null };
      render();
      break;

    case 'clear-plan':
      if (!confirm('Remove all courses from your plan?')) return;
      state.courses = state.courses.map(c => ({ ...c, planned: false }));
      render();
      break;

    case 'plan': {
      const id = ab.dataset.id;
      state.courses = state.courses.map(c => {
        if (c.id !== id) return c;
        const sessions = c.sessions.length > 0 ? c.sessions : [{ day: 'mon', start: '09:00', end: '10:30' }];
        return { ...c, planned: true, sessions };
      });
      render();
      break;
    }

    case 'unplan': {
      const id = ab.dataset.id;
      state.courses = state.courses.map(c => c.id === id ? { ...c, planned: false } : c);
      render();
      break;
    }

    case 'add-session': {
      const id = ab.dataset.id;
      state.courses = state.courses.map(c =>
        c.id === id ? { ...c, sessions: [...c.sessions, { day: 'mon', start: '09:00', end: '10:30' }] } : c
      );
      render();
      break;
    }

    case 'remove-session': {
      const id = ab.dataset.id;
      const i = parseInt(ab.dataset.i);
      state.courses = state.courses.map(c => {
        if (c.id !== id) return c;
        const sess = c.sessions.slice();
        sess.splice(i, 1);
        return { ...c, sessions: sess };
      });
      render();
      break;
    }

    case 'save-custom': {
      const code = ($('nc-code')?.value || '').trim();
      const name = ($('nc-name')?.value || '').trim();
      const credits = parseInt($('nc-credits')?.value) || 3;
      const difficulty = $('nc-difficulty')?.value || 'medium';
      if (!name) { alert('Course name required'); return; }
      state.courses = [...state.courses, {
        id: uid(),
        code: code || ('CUSTOM-' + (state.courses.length + 1)),
        name, credits, difficulty,
        prereq: '', grade: null,
        status: 'inProgress', semester: null,
        isLab: false, isElective: false,
        colorIdx: state.courses.length % 8,
        sessions: [{ day: 'mon', start: '09:00', end: '10:30' }],
        planned: true,
      }];
      state.modal = null;
      state.newCourse = null;
      render();
      break;
    }

    case 'save-settings':
      alert('✓ AI settings saved.');
      state.modal = null;
      render();
      break;

    case 'show-payment':
      alert('Payment system is not available yet.\n\nFor now, you can use the "Use your own API key" option below — it works the same and is completely free.');
      break;

    case 'gen-summary':
      generateAISummary();
      break;

    case 'dismiss-banner':
      state.importBanner = null;
      render();
      break;

    case 'gen-recs':
      generateAIRecommendations();
      break;
    case 'show-bookmark-code':
      state.showBookmarkCode = !state.showBookmarkCode;
      render();
      break;

    case 'copy-bookmark-code':
      const ta = document.getElementById('bookmarkCodeArea');
      if (ta) {
        ta.select();
        try {
          navigator.clipboard.writeText(ta.value);
          alert('Bookmarklet URL copied to clipboard!\n\nCreate a new bookmark and paste it as the URL.');
        } catch (e) {
          document.execCommand('copy');
          alert('Copied!');
        }
      }
      break;

  }
});

/* File input change events fire on the file picker */
document.addEventListener('change', (e) => {
  const t = e.target;

  if (t.dataset.action === 'file-selected' && t.files && t.files[0]) {
    handleTextFile(t.files[0]);
    return;
  }

  if (t.dataset.action === 'image-selected' && t.files && t.files[0]) {
    handleImageFile(t.files[0]);
    return;
  }

  if (t.dataset.sf && t.dataset.id != null && t.dataset.i != null) {
    const id = t.dataset.id, i = parseInt(t.dataset.i), field = t.dataset.sf;
    state.courses = state.courses.map(c => {
      if (c.id !== id) return c;
      const sess = c.sessions.slice();
      sess[i] = { ...sess[i], [field]: t.value };
      return { ...c, sessions: sess };
    });
    render();
    return;
  }

  if (t.dataset.action === 'set-diff' && t.dataset.id) {
    const id = t.dataset.id;
    state.courses = state.courses.map(c => c.id === id ? { ...c, difficulty: t.value } : c);
    render();
    return;
  }

  // AI settings
  if (t.dataset.setting === 'provider') {
    state.aiSettings.provider = t.value;
    render();
    return;
  }
});

document.addEventListener('input', (e) => {
  const t = e.target;

  if (t.dataset.f === 'search') {
    state.search = t.value;
    state._focusSearch = true;
    render();
    return;
  }

  if (t.dataset.f === 'lib-search') {
    state.libQuery = t.value;
    state._focusLibSearch = true;
    render();
    return;
  }

  if (t.dataset.f === 'target-cgpa') {
    const v = parseFloat(t.value);
    if (Number.isFinite(v)) {
      state.targetCGPA = Math.max(0, Math.min(4, v));
      /* Update the visible value without a full re-render for slider smoothness. */
      const lbl = document.getElementById('target-cgpa-val');
      if (lbl) lbl.textContent = state.targetCGPA.toFixed(2);
      const summary = document.getElementById('target-cgpa-summary');
      if (summary && typeof renderTargetCGPASummary === 'function') {
        summary.innerHTML = renderTargetCGPASummary();
      }
      saveLocal();
    }
    return;
  }

  // AI settings — text/number inputs (no re-render to keep focus)
  if (t.dataset.setting === 'apiKey') {
    state.aiSettings.apiKey = t.value;
    return;
  }
  if (t.dataset.setting === 'maxTokens') {
    state.aiSettings.maxTokens = Math.max(200, Math.min(4000, parseInt(t.value) || 1200));
    return;
  }

  // Session time inputs — re-render only if value is a complete time
  if (t.dataset.sf && t.dataset.id != null && t.dataset.i != null && t.type === 'time') {
    const id = t.dataset.id, i = parseInt(t.dataset.i), field = t.dataset.sf;
    state.courses = state.courses.map(c => {
      if (c.id !== id) return c;
      const sess = c.sessions.slice();
      sess[i] = { ...sess[i], [field]: t.value };
      return { ...c, sessions: sess };
    });
    if (/^\d{2}:\d{2}$/.test(t.value)) render();
  }
});

/* URL parameter handler — capture bookmarklet redirect data.
   IMPORTANT CHANGE (v2.1): we no longer log the user straight in. We parse the
   imported data and STASH it. Then initAuth() decides what to do:
     • already signed in  → apply + save to that account
     • signed out         → show login/signup and save once they authenticate
     • guest-only build    → apply locally (old behaviour, nothing breaks)
   The raw payload is also kept in localStorage so it survives the Google OAuth
   round-trip (which navigates away from the page and back). */
let _pendingImport = null; /* parsed result waiting to be applied after auth */

function checkURLImport() {
  const url = new URL(window.location.href);
  let importData = url.searchParams.get('import');
  if (!importData && window.location.hash.startsWith('#import=')) {
    importData = window.location.hash.substring(8);
  }
  if (!importData) {
    /* maybe a payload was stashed before a Google-login redirect */
    try {
      const raw = localStorage.getItem('iusp_pending_raw');
      if (raw) importData = raw;
    } catch (e) { }
    if (!importData) return false;
  }

  // Clean the URL immediately so the long string vanishes
  window.history.replaceState({}, document.title, window.location.pathname);

  try {
    const result = parseIULMSBookmarkData(importData);
    if (!result || (result.courses.length === 0 && result.transcript.length === 0)) {
      return false;
    }
    _pendingImport = result;
    /* persist raw so a Google OAuth redirect doesn't lose it */
    try { localStorage.setItem('iusp_pending_raw', importData); } catch (e) { }
    return true;
  } catch (e) {
    alert('Could not import from IULMS: ' + e.message);
    return false;
  }
}

/* Apply the stashed import into state (fresh IULMS data wins over old data). */
function applyPendingImport() {
  if (!_pendingImport) return false;
  const r = _pendingImport;
  state.courses = r.courses || [];
  state.profile = r.profile || null;
  state.transcript = r.transcript || [];
  state.transcriptGPA = r.transcriptGPA || null;
  state.attendance = r.attendance || [];
  state.currentSchedule = r.schedule || [];
  state.midterms = r.midterms || [];
  state.examSchedule = r.examSchedule || [];
  state.dataTimestamp = Date.now();

  const name = state.profile && state.profile.name;
  const bits = [];
  if (state.courses.length) bits.push(`${state.courses.length} courses`);
  if (state.transcript.length) bits.push(`${state.transcript.length} transcript records`);
  if (state.attendance.length) bits.push(`${state.attendance.length} attendance entries`);
  state.importBanner = {
    type: 'success',
    text: `Welcome${name ? ', ' + name.split(' ')[0] : ''} — imported ${bits.join(' · ') || 'your IULMS data'}.`,
  };
  setTimeout(() => { state.importBanner = null; render(); }, 6000);

  _pendingImport = null;
  try { localStorage.removeItem('iusp_pending_raw'); } catch (e) { }
  return true;
}

/* ── Enter the app as a signed-in account ──
   Loads cloud data, then reconciles with any fresh import or local data. */
async function enterApp(account) {
  state.account = { id: account.id, email: account.email || '' };
  if (!state.user) state.user = { plan: 'free' };
  state.authError = null;
  state.modal = null;

  let cloud = null;
  try { cloud = await window.IUSPAuth.cloudLoad(account.id); } catch (e) { }

  if (_pendingImport) {
    /* Fresh IULMS import takes priority, then save it to the account. */
    applyPendingImport();
    await window.IUSPAuth.cloudSave(account.id, dataBlob());
  } else if (cloud) {
    /* Returning user — load their saved data from the cloud. */
    applyBlob(cloud);
  } else {
    /* New account with no cloud row yet — push whatever is local up. */
    await window.IUSPAuth.cloudSave(account.id, dataBlob());
  }

  state.tab = 'dashboard';
  render();
  window.scrollTo(0, 0);
}

/* ── Auth initialization (runs once at startup) ── */
async function initAuth() {
  const hasAuth = window.IUSPAuth && window.IUSPAuth.authAvailable();

  if (!hasAuth) {
    /* Guest-only build (no Supabase keys). Preserve the old behaviour: a
       bookmark import logs you straight in locally. */
    if (_pendingImport) {
      applyPendingImport();
      state.user = { plan: 'free' };
      state.tab = 'dashboard';
    }
    render();
    return;
  }

  /* React to login/logout (also fires after Google OAuth redirect). */
  window.IUSPAuth.onAuthChange((user) => {
    if (user && !state.account) {
      enterApp(user);
    } else if (!user && state.account) {
      state.account = null;
      state.user = null;
      render();
    }
  });

  const user = await window.IUSPAuth.getCurrentUser();
  if (user) {
    await enterApp(user);
  } else if (_pendingImport) {
    /* Logged out + just imported → ask them to sign in / sign up to save it. */
    state.user = null;
    state.account = null;
    state.modal = 'auth';
    state.importBanner = {
      type: 'info',
      text: 'Almost there — sign in or create an account to save your imported data.',
    };
    render();
  } else {
    render();
  }
}

/* Boot: parse any import first, then start auth which renders the right view. */
checkURLImport();
initAuth();
