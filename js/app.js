/* APP — state, helpers, event handlers, main render entry
   Loaded last so all other modules' globals are available. */

const defaultState = {
  user: null,
  tab: 'dashboard',
  courses: [],
  /* v2.0 — scraped from the super-bookmarklet */
  profile: null,           /* { name } */
  transcript: [],          /* [{ code, title, credits, grade, points }, …] */
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
/* If saved tab no longer exists in v2 (old "progress" was default), keep it. */
if (!['dashboard', 'timetable', 'progress', 'courses', 'planner', 'ai'].includes(state.tab)) {
  state.tab = 'dashboard';
}

// Helper function to auto-save to browser storage
function saveLocal() {
  try {
    localStorage.setItem('iusp_data', JSON.stringify({
      user: state.user,
      tab: state.tab,
      courses: state.courses,
      profile: state.profile,
      transcript: state.transcript,
      attendance: state.attendance,
      currentSchedule: state.currentSchedule,
      midterms: state.midterms,
      examSchedule: state.examSchedule,
      dataTimestamp: state.dataTimestamp,
      aiSettings: state.aiSettings,
      targetCGPA: state.targetCGPA,
    }));
  } catch (e) { }
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
  $('app').innerHTML = state.user === null ? renderLogin() : renderApp();

  if (state._focusSearch) {
    const inp = document.querySelector('[data-f="search"]');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(state.search.length, state.search.length);
    }
    state._focusSearch = false;
  }
}

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

/* ── Event handlers ── */

document.addEventListener('click', (e) => {
  const loginBtn = e.target.closest('[data-login]');
  if (loginBtn) {
    state.user = { plan: loginBtn.dataset.login };

    state.tab = 'progress';
    render();
    return;
  }

  const loginAndBtn = e.target.closest('[data-login-and]');
  if (loginAndBtn) {
    state.user = { plan: 'free' };

    state.tab = 'progress';
    state.modal = 'import';
    state.uploadMode = 'bookmark';
    render();
    return;
  }

  const tabBtnEl = e.target.closest('[data-tab]');
  if (tabBtnEl) {
    state.tab = tabBtnEl.dataset.tab;
    render();
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
      state.user = null;

      state.tab = 'dashboard';
      state.ai = { summary: null, recommendations: null, loadingSummary: false, loadingRecs: false, errorSummary: null, errorRecs: null };
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

/* URL parameter handler — auto-import from bookmarklet redirect */
function checkURLImport() {
  const url = new URL(window.location.href);

  // 1. Extract data from either query or hash
  let importData = url.searchParams.get('import');
  if (!importData && window.location.hash.startsWith('#import=')) {
    importData = window.location.hash.substring(8);
  }

  if (!importData) return false;

  // 2. CLEAN THE URL IMMEDIATELY (This makes the big messy string vanish)
  window.history.replaceState({}, document.title, window.location.pathname);

  // 3. Process the data
  try {
    const result = parseIULMSBookmarkData(importData);

    if (!result || (result.courses.length === 0 && result.transcript.length === 0)) {
      alert('Import failed: No data could be read from the bookmark payload.');
      return false;
    }

    // 4. Success! Load every field and bypass the login screen
    state.courses = result.courses || [];
    state.profile = result.profile || null;
    state.transcript = result.transcript || [];
    state.attendance = result.attendance || [];
    state.currentSchedule = result.schedule || [];
    state.midterms = result.midterms || [];
    state.examSchedule = result.examSchedule || [];
    state.dataTimestamp = Date.now();

    state.user = { plan: 'free' };
    state.tab = 'dashboard';

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
    return true;

  } catch (e) {
    // Alert the error so it doesn't fail silently on the login screen
    alert('Could not import from IULMS: ' + e.message);
    return false;
  }
}


checkURLImport();
render();
