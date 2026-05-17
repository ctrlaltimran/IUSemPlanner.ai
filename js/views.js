/* RENDER FUNCTIONS
   Each tab and modal has its own render function returning an HTML string.
   The main render() in app.js picks one based on state.tab / state.modal. */

function svgWrap(icon, size) {
  size = size || 16;
  return `<span style="width:${size}px;height:${size}px;display:inline-flex">${icon}</span>`;
}
function renderLogin() {
  return `
    <div class="login">
      <div class="login-wrap">

        <div style="text-align:center;margin-bottom:16px;">
          <div class="login-pill">v2.0 · predictive dashboard · IUSemPlanner.ai</div>
        </div>

        <div class="hero-split">
          <div class="hero-left">
            <h1 class="hero-headline" style="font-family: 'JetBrains Mono', monospace; font-size: clamp(28px, 4vw, 50px); letter-spacing: -0.02em; line-height: 1.3;">
              <span style="color: #059669; font-size: 16px; display: block; margin-bottom: 12px; font-weight: 600; letter-spacing: 0;">// from spreadsheet to dashboard</span>
              <span style="color: #111827;">Your full IULMS profile,</span><br>
              <span style="color: #6b7280;">in</span>
              <em style="color: #d97706; font-style: normal; font-weight: 800; position: relative; padding: 2px 10px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a; display: inline-block; margin-left: 4px; vertical-align: text-bottom;">
                &lt;ONE CLICK/&gt;
              </em>
            </h1>
            <p class="hero-body">
              Courses · transcript · attendance · weekly schedule · midterm results · exam dates —
              one bookmark pulls all six and forecasts your end-of-semester CGPA.
              <b>Built by students of IQRA University, for its students.</b>
            </p>
          </div>
          <div class="hero-right">
            <div class="hero-char-wrap">
              <img src="./media/iui.png" alt="IUSemPlanner mascot" class="hero-char">
              <div class="hero-float-tag t1">6 pages, 1 click</div>
              <div class="hero-float-tag t2">CGPA forecast</div>
              <div class="hero-float-tag t3">Attendance alerts</div>
            </div>
          </div>
        </div>

        <div class="demo-preview">
          <div class="demo-head">
            <div style="font-weight:700;font-size:14px">Live schedule preview</div>
            <div class="demo-tag">no clashes detected</div>
          </div>
          <div class="demo-grid">
            <div class="demo-col" data-label="MON"></div>
            <div class="demo-col" data-label="TUE"></div>
            <div class="demo-col" data-label="WED"></div>
            <div class="demo-col" data-label="THU"></div>
            <div class="demo-col" data-label="FRI"></div>
            <div class="demo-block b-em" style="left:calc(0% + 4px);width:calc(20% - 8px);top:10%;height:30%">SEN-301<br>9:00 AM</div>
            <div class="demo-block b-bl" style="left:calc(20% + 4px);width:calc(20% - 8px);top:35%;height:25%">MATH-201<br>11:00 AM</div>
            <div class="demo-block b-em" style="left:calc(40% + 4px);width:calc(20% - 8px);top:10%;height:30%">SEN-301<br>9:00 AM</div>
            <div class="demo-block b-bl" style="left:calc(60% + 4px);width:calc(20% - 8px);top:35%;height:25%">MATH-201<br>11:00 AM</div>
            <div class="demo-block b-am" style="left:calc(0% + 4px);width:calc(20% - 8px);top:55%;height:30%">PHYS-150<br>2:00 PM</div>
            <div class="demo-block b-vi" style="left:calc(40% + 4px);width:calc(20% - 8px);top:55%;height:30%">PHYS-150<br>2:00 PM</div>
            <div class="demo-block b-rs" style="left:calc(80% + 4px);width:calc(20% - 8px);top:10%;height:30%">ENG-110<br>9:00 AM</div>
          </div>
        </div>

        <div class="bm-promo">
          <div class="bm-promo-left">
            <div class="bm-promo-badge">${svgWrap(ICON.zap, 12)} NEW · Fastest way</div>
            <div class="bm-promo-title">One-click import from IULMS</div>
            <div class="bm-promo-sub">Skip the copy-paste. Drag a bookmark, click it on IULMS, and your full transcript loads here instantly — semesters, grades, credits, schedule.</div>
            <div class="bm-promo-actions">
              <button class="btn btn-accent" data-login-and="open-import">${svgWrap(ICON.book, 14)} Set up bookmark</button>
              <span class="bm-promo-hint">takes 10 seconds · works in Chrome, Firefox, Edge, Safari</span>
            </div>
          </div>
          <div class="bm-promo-right">
            <div class="bm-promo-window">
              <div class="bm-promo-dots"><span></span><span></span><span></span></div>
              <div class="bm-promo-bar"><div class="bm-promo-bm">${svgWrap(ICON.book, 10)} Import from IULMS</div></div>
              <div class="bm-promo-body">
                <div class="bm-promo-line"><span class="m">SEN101</span> Applied Physics <span class="g">B+</span></div>
                <div class="bm-promo-line"><span class="m">SEN102</span> Calculus <span class="g">B+</span></div>
                <div class="bm-promo-line"><span class="m">HUM111</span> Functional English <span class="g">B</span></div>
                <div class="bm-promo-line dim">+ 90 more courses…</div>
              </div>
            </div>
          </div>
        </div>

        <div class="login-cards">
          <button class="plan-card" data-login="free">
            <div class="plan-head">
              <span class="plan-tag">Free Plan</span>
              ${svgWrap(ICON.code, 20)}
            </div>
            <div class="plan-name">Free Student</div>
            <p class="plan-desc">Full planning tools — import, progress, GPA, course catalog, clash detection, smart recommendations.</p>
            <ul class="plan-features">
              <li>${svgWrap(`<span class="check">${ICON.check}</span>`, 14)}iulms text & file upload</li>
              <li>${svgWrap(`<span class="check">${ICON.check}</span>`, 14)}progress & gpa tracker</li>
              <li>${svgWrap(`<span class="check">${ICON.check}</span>`, 14)}course planner & clash detection</li>
              <li>${svgWrap(`<span class="check">${ICON.check}</span>`, 14)}smart rule-based tips</li>
              <li class="locked">${svgWrap(ICON.lock, 12)}image upload & ai insights</li>
            </ul>
            <div class="plan-cta">continue as free ${svgWrap(ICON.arrow, 14)}</div>
          </button>
          <button class="plan-card pro" data-login="pro">
            <div class="plan-head">
              <span class="plan-tag">Pro Plan</span>
              <span style="width:20px;height:20px;color:#34d399">${ICON.crown}</span>
            </div>
            <div class="plan-name">Pro Student</div>
            <p class="plan-desc">Everything in Free, plus image upload (vision AI), AI summary, recommendations, and bring-your-own API key.</p>
            <ul class="plan-features">
              <li>${svgWrap(`<span class="check">${ICON.check}</span>`, 14)}all free features</li>
              <li><span class="spark" style="width:14px;height:14px;display:inline-flex;color:#34d399">${ICON.spark}</span>image upload (vision)</li>
              <li><span class="spark" style="width:14px;height:14px;display:inline-flex;color:#34d399">${ICON.spark}</span>ai progress summary</li>
              <li><span class="spark" style="width:14px;height:14px;display:inline-flex;color:#34d399">${ICON.spark}</span>smart recommendations</li>
              <li><span class="spark" style="width:14px;height:14px;display:inline-flex;color:#34d399">${ICON.spark}</span>your own api key</li>
            </ul>
            <div class="plan-cta">continue as pro ${svgWrap(ICON.arrow, 14)}</div>
          </button>
        </div>

        <div class="features-row">
          <div class="feature-card">
            <div class="feature-icon">${ICON.download}</div>
            <div class="feature-title">One-click IULMS import</div>
            <div class="feature-desc">Paste your transcript or upload a file — we parse semesters, grades, prerequisites automatically.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">${ICON.trophy}</div>
            <div class="feature-title">Degree progress</div>
            <div class="feature-desc">Track completed credits, GPA, electives — exactly like your university dashboard.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">${ICON.warning}</div>
            <div class="feature-title">Clash detection</div>
            <div class="feature-desc">Spot time conflicts, dead hours, overloaded days before you register.</div>
          </div>
          <div class="feature-card">
            <div class="feature-icon">${ICON.brain}</div>
            <div class="feature-title">Smart recommendations</div>
            <div class="feature-desc">Rule-based tips for all; AI-powered personalized advice for Pro.</div>
          </div>
        </div>

        <p class="login-footer">// no signup, no database — your data stays in this browser tab</p>
        <p class="login-footer">// Built for the Web Engineering course by Sir Muhammad Farhan,</p>
        <p class="login-footer">// Developed by Syed Imran Murtaza (65196) and M. Raza (63234).</p>

      </div>
    </div>
  `;
}

function renderApp() {
  const isPro = state.user.plan === 'pro';
  const plannedCount = state.courses.filter(c => c.planned).length;
  let body = '';
  if (state.tab === 'dashboard') body = renderDashboard();
  if (state.tab === 'timetable') body = renderTimetable();
  if (state.tab === 'progress') body = renderProgress();
  if (state.tab === 'courses') body = renderCatalog();
  if (state.tab === 'planner') body = renderPlanner();
  if (state.tab === 'ai') body = renderAI();

  const userName = state.profile && state.profile.name;
  const firstName = userName ? userName.split(' ')[0] : null;
  const hasV2Data = (state.transcript && state.transcript.length > 0)
    || (state.attendance && state.attendance.length > 0)
    || (state.currentSchedule && state.currentSchedule.length > 0);

  return `
    <header class="header">
      <div class="header-inner">
        <div class="brand">
          <span class="brand-mark">IU</span>
          <span class="brand-name">SemPlanner.ai</span>
          ${firstName
      ? `<span class="brand-meta">${svgWrap(ICON.user, 12)}${esc(firstName)}</span>`
      : `<span class="brand-meta">${svgWrap(ICON.hash, 12)}${state.courses.length} courses</span>`}
        </div>
        <div class="header-right">
          <span class="plan-pill ${isPro ? 'pro' : 'free'}">
            ${svgWrap(isPro ? ICON.crown : ICON.code, 14)}
            ${isPro ? 'Pro' : 'Free'}
          </span>
          <button class="icon-btn-hdr" data-action="open-settings" title="Settings">${svgWrap(ICON.settings)}</button>
          <button class="icon-btn-hdr" data-action="logout" title="Logout">${svgWrap(ICON.logout)}</button>
        </div>
      </div>
    </header>
    <nav class="tabs">
      <div class="tabs-inner">
        ${tabBtn('dashboard', 'Dashboard', ICON.chart, false, 0, hasV2Data ? 'NEW' : null)}
        ${tabBtn('timetable', 'Timetable', ICON.calendar, false, 0, (state.currentSchedule && state.currentSchedule.length) ? null : null)}
        ${tabBtn('progress', 'Progress', ICON.trophy)}
        ${tabBtn('courses', 'Courses', ICON.book)}
        ${tabBtn('planner', 'Planner', ICON.target, false, plannedCount)}
        ${tabBtn('ai', 'AI Insights', ICON.brain, true)}
      </div>
    </nav>
    ${state.importBanner ? `
      <div class="import-banner ${state.importBanner.type}" style="position: fixed; top: 24px; left: 50%; transform: translateX(-50%); z-index: 9999; box-shadow: 0 8px 24px rgba(0,0,0,0.2); margin: 0; width: fit-content; min-width: 320px; max-width: 92vw;">
        <span style="display:flex; align-items:center;">${state.importBanner.type === 'success' ? ICON.check : ICON.warning}</span>
        <span>${esc(state.importBanner.text)}</span>
        <button class="icon-btn-hdr" data-action="dismiss-banner" style="margin-left:auto; cursor:pointer;">${svgWrap(ICON.close, 14)}</button>
      </div>` : ''}
    <main>${body}</main>
    ${state.modal === 'import' ? renderImportModal() : ''}
    ${state.modal === 'settings' ? renderSettingsModal() : ''}
    ${state.modal === 'addCustom' ? renderAddCustomModal() : ''}
  `;
}

function tabBtn(id, label, icon, isProTab, badgeCount, tag) {
  const isPro = state.user.plan === 'pro';
  const active = state.tab === id;
  let badge = '';
  if (isProTab && !isPro) badge = `<span style="width:12px;height:12px;display:inline-flex;color:var(--text-faint)">${ICON.lock}</span>`;
  if (isProTab && isPro) badge = `<span class="pro-badge">PRO</span>`;
  if (badgeCount > 0) badge = `<span class="count-badge">${badgeCount}</span>`;
  if (tag) badge = `<span class="new-badge">${esc(tag)}</span>`;
  return `<button class="tab ${active ? 'active' : ''}" data-tab="${id}">${icon}${label}${badge}</button>`;
}

function emptyView() {
  return `
    <div class="container">
      <div class="empty">
        <div class="empty-comment">// nothing here yet</div>
        <h3 class="empty-title">Import your courses to begin</h3>
        <p class="empty-text">Use the bookmarklet, paste your IULMS course list, or upload a text file — we'll parse everything (semesters, grades, prerequisites, GPA) automatically.</p>
        <div class="empty-actions">
          <button class="btn btn-primary" data-action="open-import">${svgWrap(ICON.download)}Import data</button>
        </div>
      </div>
    </div>
  `;
}

function renderProgress() {
  if (state.courses.length === 0) return emptyView();
  const stats = computeStats(state.courses);
  const r = 80, circ = 2 * Math.PI * r;
  const offset = circ - (stats.pctComplete / 100) * circ;

  const semCards = [];
  for (let s = 1; s <= 8; s++) {
    const semCourses = state.courses.filter(c => c.semester === s);
    if (semCourses.length === 0) continue;
    const done = semCourses.filter(c => c.status === 'completed').reduce((a, b) => a + b.credits, 0);
    const total = semCourses.reduce((a, b) => a + b.credits, 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const rows = semCourses.map(c => `
      <div class="sem-course">
        <span class="sem-course-dot dot-${c.status}"></span>
        <span class="sem-course-code">${esc(c.code)}</span>
        <span class="sem-course-name">${esc(c.name)}</span>
        ${c.grade ? `<span class="sem-course-grade">${c.grade}</span>` : ''}
      </div>`).join('');
    semCards.push(`
      <div class="sem-card">
        <div class="sem-head"><div class="sem-name">Semester ${s}</div><div class="sem-meta">${done}/${total} cr · ${pct}%</div></div>
        <div class="sem-progress"><div class="sem-progress-fill" style="width:${pct}%"></div></div>
        <div class="sem-courses">${rows}</div>
      </div>`);
  }

  /* Catch electives or extra courses that don't belong to a specific 1-8 semester */
  const floatingCourses = state.courses.filter(c => !c.semester && c.status !== 'elective');
  if (floatingCourses.length > 0) {
    const done = floatingCourses.filter(c => c.status === 'completed').reduce((a, b) => a + b.credits, 0);
    const total = floatingCourses.reduce((a, b) => a + b.credits, 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const rows = floatingCourses.map(c => `
      <div class="sem-course">
        <span class="sem-course-dot dot-${c.status}"></span>
        <span class="sem-course-code">${esc(c.code)}</span>
        <span class="sem-course-name">${esc(c.name)}</span>
        ${c.grade ? `<span class="sem-course-grade">${c.grade}</span>` : ''}
      </div>`).join('');
    semCards.push(`
      <div class="sem-card">
        <div class="sem-head"><div class="sem-name">Electives & Extras</div><div class="sem-meta">${done}/${total} cr · ${pct}%</div></div>
        <div class="sem-progress"><div class="sem-progress-fill" style="width:${pct}%"></div></div>
        <div class="sem-courses">${rows}</div>
      </div>`);
  }

  return `
    <div class="container">
      <div class="page-head">
        <div>
          <h2 class="page-title">Academic progress</h2>
          <p class="page-sub">// degree completion · bs(se) · ${TOTAL_CREDITS} cr required</p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" data-action="open-import">${svgWrap(ICON.download)}Re-import</button>
        </div>
      </div>

      <div class="progress-hero">
        <div class="ring-card">
          <div class="ring">
            <svg width="200" height="200">
              <circle cx="100" cy="100" r="${r}" stroke="rgba(255,255,255,.1)" stroke-width="14" fill="none"/>
              <circle cx="100" cy="100" r="${r}" stroke="#34d399" stroke-width="14" fill="none"
                stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
                style="transition:stroke-dashoffset .8s ease"/>
            </svg>
            <div class="ring-text">
              <div class="ring-pct">${stats.pctComplete}%</div>
              <div class="ring-sub">${stats.completedCredits} / ${TOTAL_CREDITS} cr</div>
            </div>
          </div>
          <div class="ring-foot">${stats.remainingCredits} credit hours remaining</div>
        </div>
        <div class="progress-stats">
          <div class="big-stat accent">
            <div class="label">Completed</div>
            <div class="value">${stats.completedCredits}<span class="suffix">cr</span></div>
            <div class="hint">${stats.byStatus.completed.length} courses cleared</div>
          </div>
          <div class="big-stat info">
            <div class="label">In Progress</div>
            <div class="value">${stats.inProgressCredits}<span class="suffix">cr</span></div>
            <div class="hint">${stats.byStatus.inProgress.length} courses this semester</div>
          </div>
          <div class="big-stat warn">
            <div class="label">Current GPA</div>
            <div class="value">${stats.gpa || '—'}<span class="suffix">/4.0</span></div>
            <div class="hint">credit-weighted across ${stats.byStatus.completed.length} courses</div>
            <div class="footnote">* may differ slightly from your university's official calculation</div>
          </div>
          <div class="big-stat">
            <div class="label">Electives</div>
            <div class="value">${stats.electivesCompleted}<span class="suffix">/5</span></div>
            <div class="hint">${5 - stats.electivesCompleted} elective slots open</div>
          </div>
        </div>
      </div>

      <div style="margin-top:24px">
        <div class="panel-head" style="margin-bottom:16px"><div class="panel-title">By semester</div><div class="panel-meta">course completion breakdown</div></div>
        <div class="semester-grid">${semCards.join('')}</div>
      </div>
    </div>
  `;
}

function renderCatalog() {
  if (state.courses.length === 0) return emptyView();
  const stats = computeStats(state.courses);
  const filters = [
    { key: 'all', label: 'All', count: state.courses.length },
    { key: 'completed', label: 'Completed', count: stats.byStatus.completed.length },
    { key: 'inProgress', label: 'In Progress', count: stats.byStatus.inProgress.length },
    { key: 'locked', label: 'Locked', count: stats.byStatus.locked.length },
    { key: 'notOffered', label: 'Not Offered', count: stats.byStatus.notOffered.length },
    { key: 'elective', label: 'Elective slots', count: stats.byStatus.elective.length },
  ];

  let list = state.courses;
  if (state.filter !== 'all') list = list.filter(c => c.status === state.filter);
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }

  const rows = list.map(c => `
    <div class="catalog-row">
      <div class="cat-code">${esc(c.code)}</div>
      <div class="cat-main">
        <div class="cat-name">${esc(c.name)}</div>
        <div class="cat-meta">
          <span>${c.credits} cr</span>
          ${c.semester ? `<span>· Semester ${c.semester}</span>` : ''}
          ${c.prereq ? `<span>· prereq: ${esc(c.prereq)}</span>` : ''}
          ${c.isElective ? `<span>· elective</span>` : ''}
        </div>
      </div>
      <div class="cat-right">
        <span class="status-badge status-${c.status}">${STATUS_LABEL[c.status]}</span>
        ${c.grade ? `<span class="grade-pill">${c.grade}</span>` : ''}
      </div>
    </div>`).join('');

  return `
    <div class="container">
      <div class="page-head">
        <div>
          <h2 class="page-title">Course catalog</h2>
          <p class="page-sub">// ${list.length} of ${state.courses.length} courses</p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" data-action="open-import">${svgWrap(ICON.download)}Re-import</button>
        </div>
      </div>
      <input type="text" class="search-input" placeholder="Search by code or name..." value="${esc(state.search)}" data-f="search">
      <div class="filter-bar">
        ${filters.map(f => `<button class="filter-chip ${state.filter === f.key ? 'active' : ''}" data-filter="${f.key}">${f.label}<span class="count">${f.count}</span></button>`).join('')}
      </div>
      ${rows.length === 0 ? `<div class="empty"><p class="muted">No courses match this filter.</p></div>` : `<div class="catalog-list">${rows}</div>`}
    </div>
  `;
}

function renderPlanner() {
  if (state.courses.length === 0) return emptyView();
  const stats = computeStats(state.courses);

  const eligibleAll = state.courses.filter(c =>
    c.status !== 'completed' && c.status !== 'locked' && c.status !== 'elective'
  );
  const eligibleInProgress = eligibleAll.filter(c => c.status === 'inProgress' && !c.isElective);
  const eligibleCanTake = eligibleAll.filter(c => c.status === 'notOffered' && !c.isElective && prereqMet(c, stats.completedSet));
  const eligibleElectives = eligibleAll.filter(c => c.isElective && prereqMet(c, stats.completedSet));
  const lockedByPrereq = state.courses.filter(c =>
    (c.status === 'notOffered' || c.status === 'locked') && !c.isElective && !prereqMet(c, stats.completedSet)
  ).slice(0, 5);

  const planned = state.courses.filter(c => c.planned);
  const plannedCredits = planned.reduce((s, c) => s + c.credits, 0);
  const projectedCredits = stats.completedCredits + plannedCredits;
  const projectedPct = Math.round((projectedCredits / TOTAL_CREDITS) * 100);

  const items = planItems(state.courses);
  const score = items.length ? balanceScore(items) : null;
  const load = items.length ? dailyLoad(items) : null;
  const conflicts = items.length ? detectConflicts(items) : [];
  const gaps = items.length ? findGaps(items) : [];
  const recs = computeRecommendations(state.courses);

  const availGroup = (heading, list, locked) => {
    if (list.length === 0) return '';
    const rows = list.map(c => `
      <div class="avail-row ${locked ? 'locked' : ''} ${c.planned ? 'added' : ''}">
        <div class="avail-info">
          <div class="avail-code">${esc(c.code)}</div>
          <div class="avail-name">${esc(c.name)}</div>
          <div class="avail-meta">${c.credits} cr${c.prereq ? ' · prereq: ' + esc(c.prereq) : ''}${c.semester ? ' · sem ' + c.semester : ''}${locked ? ' · prereq not met' : ''}</div>
        </div>
        <div class="avail-action">
          ${locked
        ? `<span class="btn btn-ghost btn-sm" style="cursor:not-allowed">locked</span>`
        : c.planned
          ? `<button class="btn btn-secondary btn-sm" data-action="unplan" data-id="${c.id}">remove</button>`
          : `<button class="btn btn-primary btn-sm" data-action="plan" data-id="${c.id}">${svgWrap(ICON.plus, 12)}Add</button>`}
        </div>
      </div>`).join('');
    return `<div class="avail-group"><div class="avail-group-head"><span>${heading}</span><span>${list.length}</span></div>${rows}</div>`;
  };

  const availPanel = `
    <div class="planner-panel">
      <div class="planner-panel-head">
        <div class="planner-panel-title"><span class="step">1</span>Pick courses</div>
        <div class="planner-panel-meta">${eligibleAll.length} eligible</div>
      </div>
      <div class="planner-panel-body">
        ${availGroup('Currently in progress', eligibleInProgress)}
        ${availGroup('Could take (prereq met)', eligibleCanTake)}
        ${availGroup('Electives available', eligibleElectives)}
        ${availGroup('Locked (prereq pending)', lockedByPrereq, true)}
        ${eligibleAll.length === 0 ? `<div style="padding:32px;text-align:center;color:var(--text-muted);font-size:13px">No eligible courses available.</div>` : ''}
      </div>
    </div>
  `;

  const planItemsHtml = planned.map(c => {
    const diffOpts = Object.entries(DIFFICULTY).map(([k, v]) => `<option value="${k}" ${c.difficulty === k ? 'selected' : ''}>${v.label}</option>`).join('');
    const sessRows = c.sessions.map((s, i) => `
      <div class="plan-mini-sess">
        <select data-sf="day" data-id="${c.id}" data-i="${i}">
          ${DAYS.map(d => `<option value="${d.key}" ${s.day === d.key ? 'selected' : ''}>${d.label}</option>`).join('')}
        </select>
        <input type="time" value="${s.start}" data-sf="start" data-id="${c.id}" data-i="${i}">
        <span>→</span>
        <input type="time" value="${s.end}" data-sf="end" data-id="${c.id}" data-i="${i}">
        <span class="x" data-action="remove-session" data-id="${c.id}" data-i="${i}">×</span>
      </div>`).join('');
    return `
      <div class="plan-item">
        <div class="plan-item-head">
          <div class="plan-item-info">
            <div class="plan-item-code">${esc(c.code)} · ${c.credits} cr</div>
            <div class="plan-item-name">${esc(c.name)}</div>
          </div>
          <button class="icon-btn-hdr" data-action="unplan" data-id="${c.id}" title="Remove from plan">${svgWrap(ICON.trash, 14)}</button>
        </div>
        <div class="plan-item-controls">
          <select class="diff-mini diff-${c.difficulty}" data-action="set-diff" data-id="${c.id}">${diffOpts}</select>
        </div>
        <div class="plan-item-sessions">
          ${sessRows}
          <span class="add-mini" data-action="add-session" data-id="${c.id}">${svgWrap(ICON.plus, 10)}add session</span>
        </div>
      </div>`;
  }).join('');

  const planPanel = `
    <div class="planner-panel">
      <div class="planner-panel-head">
        <div class="planner-panel-title"><span class="step">2</span>Your plan</div>
        <div class="planner-panel-meta">${planned.length} courses · ${plannedCredits} cr</div>
      </div>
      <div class="planner-panel-body">
        ${planned.length === 0
      ? `<div style="padding:48px 24px;text-align:center;color:var(--text-muted);font-size:13px">Click <strong>Add</strong> on any course from the left to start planning.</div>`
      : planItemsHtml}
      </div>
    </div>
  `;

  let analysisHtml = '';
  if (planned.length > 0) {
    const conflictAlert = conflicts.length === 0 ? '' : `
      <div class="alert alert-danger">${ICON.warning}
        <div>
          <div class="alert-title">${conflicts.length} clash${conflicts.length > 1 ? 'es' : ''} — must resolve before registering</div>
          <div class="alert-body">${conflicts.map(c => `<span class="mono">${DAYS.find(d => d.key === c.day).label}: <strong>${esc(c.a.code)}</strong> ↔ <strong>${esc(c.b.code)}</strong> (${fmtDur(c.overlap)})</span>`).join('<br>')}</div>
        </div>
      </div>`;

    const successAlert = (conflicts.length === 0 && score && score.score >= 75) ? `
      <div class="alert alert-success">${ICON.check}
        <div>
          <div class="alert-title">Schedule looks good — balance score ${score.score}/100</div>
          <div class="alert-body">No clashes detected, load is reasonably distributed.</div>
        </div>
      </div>` : '';

    const totalSessions = items.length;
    const totalMin = DAYS.reduce((s, d) => s + load[d.key].minutes, 0);
    const heaviest = DAYS.reduce((w, d) => load[d.key].minutes > load[w.key].minutes ? d : w, DAYS[0]);
    const empties = emptyDays(items);

    const statGrid = `
      <div class="stat-grid">
        <div class="stat-card ${conflicts.length > 0 ? 'danger' : 'accent'}">
          <div class="stat-label">Balance score</div>
          <div class="stat-value">${score.score}<span class="suffix">/100</span></div>
          <div class="stat-hint">${score.score >= 80 ? 'excellent' : score.score >= 60 ? 'good' : score.score >= 40 ? 'okay' : 'needs work'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Credits planned</div>
          <div class="stat-value">${plannedCredits}<span class="suffix">cr</span></div>
          <div class="stat-hint">${totalSessions} sessions · ${fmtDur(totalMin)}/week</div>
        </div>
        <div class="stat-card info">
          <div class="stat-label">After this sem</div>
          <div class="stat-value">${projectedPct}<span class="suffix">%</span></div>
          <div class="stat-hint">${projectedCredits}/${TOTAL_CREDITS} cr complete</div>
        </div>
        <div class="stat-card ${conflicts.length > 0 ? 'danger' : ''}">
          <div class="stat-label">Conflicts</div>
          <div class="stat-value ${conflicts.length > 0 ? 'danger' : ''}">${conflicts.length}</div>
          <div class="stat-hint">${conflicts.length === 0 ? 'no overlaps' : 'must fix'}</div>
        </div>
        <div class="stat-card ${score.totalGapMin > 240 ? 'warn' : ''}">
          <div class="stat-label">Dead hours</div>
          <div class="stat-value">${fmtDur(score.totalGapMin)}</div>
          <div class="stat-hint">${gaps.length} gap${gaps.length !== 1 ? 's' : ''} of 1h+</div>
        </div>
        <div class="stat-card ${load[heaviest.key].minutes > 5 * 60 ? 'warn' : ''}">
          <div class="stat-label">Heaviest day</div>
          <div class="stat-value">${heaviest.label}</div>
          <div class="stat-hint">${load[heaviest.key].sessions} sess · ${fmtDur(load[heaviest.key].minutes)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Free days</div>
          <div class="stat-value">${empties.length}</div>
          <div class="stat-hint">${empties.length === 0 ? 'class every weekday' : empties.map(d => d.label).join(', ')}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Difficulty mix</div>
          <div class="stat-value">${score.difficultyBalance}<span class="suffix">/100</span></div>
          <div class="stat-hint">mental load spread</div>
        </div>
      </div>`;

    const maxLoadMin = Math.max(...DAYS.map(d => load[d.key].minutes), 5 * 60);
    const bars = DAYS.map(d => {
      const dl = load[d.key];
      const pct = (dl.minutes / maxLoadMin) * 100;
      const isEmpty = dl.sessions === 0;
      const cls = isEmpty ? 'bar-empty' : dl.minutes > 5 * 60 ? 'bar-high' : dl.minutes > 3.5 * 60 ? 'bar-mid' : 'bar-low';
      return `
        <div class="bar-row">
          <div class="bar-day">${d.label}</div>
          <div class="bar-track">
            <div class="bar-fill ${cls}" style="width:${Math.max(pct, isEmpty ? 0 : 8)}%"></div>
            <div class="bar-label ${isEmpty ? 'empty' : 'on-fill'}">${isEmpty ? 'no classes' : dl.sessions + ' sessions · ' + fmtDur(dl.minutes)}</div>
          </div>
        </div>`;
    }).join('');

    const SLOT_H = 60, START_H = 8;
    const conflictKeys = new Set();
    for (const c of conflicts) { conflictKeys.add(c.a.id + '-' + c.day); conflictKeys.add(c.b.id + '-' + c.day); }
    const dayCols = DAYS.map(d => {
      const blocks = [];
      for (const c of planned) {
        for (const s of c.sessions) {
          if (s.day !== d.key) continue;
          const startMin = toMin(s.start) - START_H * 60;
          const dur = toMin(s.end) - toMin(s.start);
          const top = (startMin / 60) * SLOT_H;
          const height = (dur / 60) * SLOT_H - 2;
          const hasC = conflictKeys.has(c.id + '-' + d.key);
          blocks.push(`
            <div class="tt-block c-${c.colorIdx} ${hasC ? 'conflict' : ''}" style="top:${top + 1}px;height:${height}px">
              <div class="b-code">${esc(c.code)}</div>
              <div class="b-name">${esc(c.name)}</div>
              ${height > 50 ? `<div class="b-time">${fmtTime(s.start)}</div>` : ''}
            </div>`);
        }
      }
      return `<div class="tt-day">${HOURS.map(() => '<div class="slot"></div>').join('')}${blocks.join('')}</div>`;
    }).join('');
    const timeCol = HOURS.map(h => `<div class="hour">${(h % 12 === 0 ? 12 : h % 12) + (h >= 12 ? 'PM' : 'AM')}</div>`).join('');

    const recHtml = recs.map(r => `
      <div class="rec-item ${r.tone}">
        <div class="rec-icon">${svgWrap(r.icon, 14)}</div>
        <div class="rec-text">${r.text}</div>
      </div>`).join('');

    analysisHtml = `
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title"><span style="width:20px;height:20px;background:var(--text);color:#fff;font-family:var(--font-mono);font-size:11px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700">3</span>Live analysis</div>
          <div class="panel-meta">updates as you add/edit courses</div>
        </div>
        ${conflictAlert}
        ${successAlert}
        ${statGrid}
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title">Weekly schedule preview</div><div class="panel-meta">8 AM – 6 PM</div></div>
        <div class="timetable">
          <div class="tt-header"><div>time</div>${DAYS.map(d => `<div>${d.label}</div>`).join('')}</div>
          <div class="tt-body"><div class="tt-time">${timeCol}</div>${dayCols}</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><div class="panel-title">Daily load</div><div class="panel-meta">hours of class per day</div></div>
        ${bars}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">${svgWrap(ICON.zap)}Smart recommendations</div>
          <div class="panel-meta">${recs.length} insight${recs.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="rec-list">${recHtml}</div>
      </div>`;
  } else {
    analysisHtml = `
      <div class="panel">
        <div class="panel-head"><div class="panel-title"><span style="width:20px;height:20px;background:var(--text);color:#fff;font-family:var(--font-mono);font-size:11px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700">3</span>Analysis</div></div>
        <div class="empty" style="padding:32px">
          <div class="empty-comment">// no courses planned yet</div>
          <p class="muted">Add courses from the left panel to see your weekly schedule, clashes, gaps, and recommendations.</p>
        </div>
      </div>`;
  }

  return `
    <div class="container">
      <div class="page-head">
        <div>
          <h2 class="page-title">Semester planner</h2>
          <p class="page-sub">// pick courses → see schedule, clashes, recommendations · all live</p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" data-action="open-add-custom">${svgWrap(ICON.plus)}Add custom course</button>
          ${planned.length > 0 ? `<button class="btn btn-ghost" data-action="clear-plan">${svgWrap(ICON.trash)}Clear plan</button>` : ''}
        </div>
      </div>
      <div class="planner-grid">${availPanel}${planPanel}</div>
      ${analysisHtml}
    </div>
  `;
}

function renderAI() {
  if (state.user.plan !== 'pro') {
    return `
      <div class="container">
        <div class="upgrade-card">
          <div class="lock-icon">${svgWrap(ICON.lock, 24)}</div>
          <h2>AI Insights — Pro only</h2>
          <p>Get personalized advice on your progress, which courses to take next, and how to optimize your schedule.</p>
          <div class="upgrade-features">
            <div>progress summary</div>
            <div>course recommendations</div>
            <div>schedule optimization</div>
            <div>elective suggestions</div>
          </div>
          <button class="btn btn-accent" data-action="logout" style="position:relative">${svgWrap(ICON.refresh)}Switch to Pro</button>
        </div>
      </div>`;
  }
  if (state.courses.length === 0) return emptyView();

  const sumBox = state.ai.loadingSummary ? `<div class="ai-loading"><div class="spinner"></div>analyzing your academic profile...</div>`
    : state.ai.errorSummary ? `<div class="ai-error">${esc(state.ai.errorSummary)}</div>`
      : state.ai.summary ? `<div class="ai-content">${esc(state.ai.summary)}</div>`
        : `<div class="ai-placeholder">click "Generate summary" for an AI-written analysis of your progress and plan</div>`;

  const recBox = state.ai.loadingRecs ? `<div class="ai-loading"><div class="spinner"></div>generating recommendations...</div>`
    : state.ai.errorRecs ? `<div class="ai-error">${esc(state.ai.errorRecs)}</div>`
      : state.ai.recommendations ? `<div class="ai-content">${esc(state.ai.recommendations)}</div>`
        : `<div class="ai-placeholder">click "Generate recommendations" for specific advice on next courses</div>`;

  const provider = state.aiSettings.provider;
  const usingOwn = (provider === 'claude' || provider === 'openai') && state.aiSettings.apiKey;
  const apiMeta = usingOwn
    ? `using your ${provider} key · max ${state.aiSettings.maxTokens} tokens`
    : `using default key · max ${state.aiSettings.maxTokens} tokens`;

  return `
    <div class="container">
      <div class="page-head">
        <div>
          <h2 class="page-title">AI Insights</h2>
          <p class="page-sub">// ${apiMeta}</p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" data-action="open-settings">${svgWrap(ICON.settings)}API settings</button>
        </div>
      </div>
      <div class="ai-panel">
        <div class="ai-head">
          <div class="ai-title">${svgWrap(ICON.spark, 18)}Progress summary</div>
          <button class="btn btn-secondary" data-action="gen-summary" ${state.ai.loadingSummary ? 'disabled' : ''}>
            ${svgWrap(ICON.refresh, 14)}${state.ai.summary ? 'Regenerate' : 'Generate summary'}
          </button>
        </div>
        ${sumBox}
      </div>
      <div class="ai-panel">
        <div class="ai-head">
          <div class="ai-title">${svgWrap(ICON.spark, 18)}Recommendations</div>
          <button class="btn btn-secondary" data-action="gen-recs" ${state.ai.loadingRecs ? 'disabled' : ''}>
            ${svgWrap(ICON.refresh, 14)}${state.ai.recommendations ? 'Regenerate' : 'Generate recommendations'}
          </button>
        </div>
        ${recBox}
      </div>
    </div>
  `;
}

function renderImportModal() {
  const isPro = state.user.plan === 'pro';
  const mode = state.uploadMode || 'bookmark';
  const isMobile = isMobileDevice();
  const bmURL = buildBookmarkletURL();

  const tabs = `
    <div class="upload-tabs">
      <button class="upload-tab ${mode === 'bookmark' ? 'active' : ''}" data-upload-mode="bookmark">${svgWrap(ICON.zap, 14)}Bookmark <span class="reco-tag">RECOMMENDED</span></button>
      <button class="upload-tab ${mode === 'paste' ? 'active' : ''}" data-upload-mode="paste">${svgWrap(ICON.file, 14)}Paste text</button>
      <button class="upload-tab ${mode === 'file' ? 'active' : ''}" data-upload-mode="file">${svgWrap(ICON.download, 14)}Upload .txt file</button>
      <button class="upload-tab ${mode === 'image' ? 'active' : ''} ${!isPro ? 'locked' : ''}" data-upload-mode="image">
        ${svgWrap(ICON.image, 14)}Upload image
        <span class="pro-tag">PRO</span>
      </button>
    </div>
  `;

  let modeBody = '';

  if (mode === 'bookmark') {
    const mobileWarning = isMobile ? `
      <div class="alert alert-warn" style="margin-bottom:16px">${ICON.warning}
        <div>
          <div class="alert-title">You're on mobile</div>
          <div class="alert-body">The bookmark method works best on a <strong>desktop or laptop browser</strong>. Mobile browsers have limited bookmark support. We've shown both desktop and mobile instructions below.</div>
        </div>
      </div>
    ` : '';

    modeBody = `
      ${mobileWarning}

      <div class="bm-hero">
        <div class="bm-hero-icon">${svgWrap(ICON.zap, 22)}</div>
        <div class="bm-hero-text">
          <div class="bm-hero-title">One-click IULMS import <span class="reco-tag" style="margin-left:6px">v2.0 · super-bookmarklet</span></div>
          <div class="bm-hero-sub">Save the bookmark below, open the IULMS <strong>Student Information Center</strong>, and click it. The bookmarklet silently fetches your <strong>profile, full course list, attendance, transcript, weekly schedule, midterm results, and exam schedule</strong> in one shot.</div>
        </div>
      </div>

      <div class="bm-drag-zone">
        <div class="bm-drag-label">Drag this button to your bookmarks bar →</div>
        <a class="bm-button" href="${esc(bmURL)}" draggable="true" onclick="event.preventDefault();alert('Don\\'t click — drag this button up to your bookmarks bar instead!\\n\\nOr right-click → Bookmark this link.');return false;">
          ${svgWrap(ICON.book, 16)}
          <span>Import from IULMS</span>
        </a>
        <div class="bm-shortcut-hint">No bookmarks bar visible? Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> (Windows) or <kbd>⌘</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> (Mac) to show it.</div>
      </div>

      <div class="bm-steps-tabs">
        <button class="bm-steps-tab ${!isMobile ? 'active' : ''}" data-bm-platform="desktop">${svgWrap(ICON.code, 12)} Desktop steps</button>
        <button class="bm-steps-tab ${isMobile ? 'active' : ''}" data-bm-platform="mobile">${svgWrap(ICON.image, 12)} Mobile steps</button>
      </div>

      <div class="bm-steps ${isMobile ? 'mobile' : 'desktop'}">
        <div class="bm-step">
          <div class="bm-step-num">1</div>
          <div class="bm-step-body">
            <div class="bm-step-title">Save the bookmark</div>
            <div class="bm-step-desc bm-desc-desktop">Drag the green button above onto your browser's bookmarks bar. Or right-click the button → "Bookmark this link…"</div>
            <div class="bm-step-desc bm-desc-mobile">On mobile, this is tricky. Tap the green button → "Share" → "Add to Bookmarks" / "Add to Home Screen". Honestly, switch to a desktop browser if you can.</div>
            <div class="bm-step-visual bm-step-visual-desktop">
              <div class="bm-anim-browser">
                <div class="bm-anim-dots"><span></span><span></span><span></span></div>
                <div class="bm-anim-bar">
                  <div class="bm-anim-bookmark">${svgWrap(ICON.book, 10)} Import from IULMS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

       <div class="bm-step bm-step-important">
          <div class="bm-step-num">2</div>
          <div class="bm-step-body">
            <div class="bm-step-title">Open your <span style="color:var(--accent)">Registration</span> page</div>
            <div class="bm-step-desc">
              <strong style="color:var(--danger)">Important:</strong> you MUST be on your <strong>Registration / Course List</strong> page (the page that shows the large tables of all 8 semesters of your degree).
              Log in to <span class="mono">iulms.edu.pk</span>, navigate to your active Registration page, and ensure your courses are visible on screen before clicking the bookmark.
            </div>
            <div class="bm-step-visual">
              <div class="bm-anim-lms">
                <div class="bm-anim-lms-head">IULMS / Student Information Center · <span style="color:var(--accent)">sic.php</span></div>
                <div class="bm-anim-lms-table">
                  <div class="bm-anim-lms-row"><span>SEN101</span><span>Applied Physics</span><span class="pill">B+</span></div>
                  <div class="bm-anim-lms-row"><span>SEN102</span><span>Calculus</span><span class="pill">B+</span></div>
                  <div class="bm-anim-lms-row"><span>HUM111</span><span>Functional English</span><span class="pill">B</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bm-step">
          <div class="bm-step-num">3</div>
          <div class="bm-step-body">
            <div class="bm-step-title">Click the bookmark</div>
            <div class="bm-step-desc">A small loading overlay appears while it silently pulls 6 pages in the background — your courses, attendance, transcript, schedule, midterm results, and exam schedule. When it's done, you land back here with everything filled in.</div>
            <div class="bm-step-visual">
              <div class="bm-anim-flow">
                <div class="bm-anim-flow-card iulms">IULMS · 6 pages</div>
                <div class="bm-anim-flow-arrow">${svgWrap(ICON.arrow, 18)}</div>
                <div class="bm-anim-flow-card us">IUSemPlanner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bm-footer-actions">
        <button class="btn btn-ghost" data-action="show-bookmark-code">${svgWrap(ICON.code, 14)}Show raw code</button>
        <div style="flex:1"></div>
        <button class="btn btn-ghost" data-action="close-modal">Done</button>
      </div>

      ${state.showBookmarkCode ? `
      <div class="bm-code-block">
        <div class="bm-code-head"><span class="mono">bookmarklet source · v2.0</span><button class="btn btn-sm btn-secondary" data-action="copy-bookmark-code">${svgWrap(ICON.download, 12)}Copy</button></div>
        <textarea readonly id="bookmarkCodeArea" class="field field-mono" rows="4">${esc(bmURL)}</textarea>
        <div class="bm-code-hint">Advanced: copy this and paste it as the URL of a new bookmark you create manually.</div>
      </div>
      ` : ''}
    `;
  } else if (mode === 'paste') {
    modeBody = `
      <div class="row">
        <div>
          <label>iulms_text</label>
          <textarea class="field field-mono" id="importTextarea" rows="12" placeholder="Paste your full IULMS course list here..."></textarea>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px">
        <button class="btn-ghost" data-action="paste-sample" style="font-size:12px;color:var(--text-muted);padding:4px 8px">paste sample data</button>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost" data-action="close-modal">Cancel</button>
          <button class="btn btn-primary" data-action="do-import">Import courses</button>
        </div>
      </div>
    `;
  } else if (mode === 'file') {
    modeBody = `
      <label class="upload-drop" for="fileInput">
        <div class="upload-icon">${svgWrap(ICON.file, 22)}</div>
        <div class="upload-label">Drop a .txt file or click to browse</div>
        <div class="upload-sub">supports .txt, .csv, .md files</div>
        <input type="file" id="fileInput" accept=".txt,.csv,.md,text/plain" data-action="file-selected">
      </label>
      ${state.uploadProcessing ? `<div class="upload-status"><div class="spinner"></div>reading file...</div>` : ''}
      ${state.uploadError ? `<div class="ai-error" style="margin-top:12px">${esc(state.uploadError)}</div>` : ''}
      <div class="modal-footer">
        <button class="btn btn-ghost" data-action="close-modal">Cancel</button>
      </div>
    `;
  } else if (mode === 'image') {
    if (!isPro) {
      modeBody = `
        <div class="alert alert-info">${ICON.lock}
          <div>
            <div class="alert-title">Image upload is a Pro feature</div>
            <div class="alert-body">Vision AI extracts course data from screenshots. Available on the Pro plan.</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" data-action="close-modal">Cancel</button>
        </div>
      `;
    } else {
      modeBody = `
        <label class="upload-drop" for="imageInput">
          <div class="upload-icon">${svgWrap(ICON.image, 22)}</div>
          <div class="upload-label">Drop a screenshot or click to browse</div>
          <div class="upload-sub">PNG, JPG up to 5MB · uses vision AI to extract course data</div>
          <input type="file" id="imageInput" accept="image/png,image/jpeg,image/jpg" data-action="image-selected">
        </label>
        ${state.uploadProcessing ? `<div class="upload-status"><div class="spinner"></div>analyzing image with vision AI... this may take 10-20 seconds</div>` : ''}
        ${state.uploadError ? `<div class="ai-error" style="margin-top:12px">${esc(state.uploadError)}</div>` : ''}
        <div class="modal-footer">
          <button class="btn btn-ghost" data-action="close-modal">Cancel</button>
        </div>
      `;
    }
  }

  return `
    <div class="modal-backdrop">
      <div class="modal wide">
        <div class="modal-head">
          <div class="modal-title">Import courses</div>
          <button class="icon-btn-hdr" data-action="close-modal">${svgWrap(ICON.close)}</button>
        </div>
        <div class="modal-body">
          ${tabs}
          ${modeBody}
        </div>
      </div>
    </div>
  `;
}


function renderSettingsModal() {
  const isPro = state.user.plan === 'pro';
  const hasData = state.courses.length > 0;
  const s = state.aiSettings;

  const proSection = !isPro ? '' : `
    <div class="pay-card">
      <div class="pay-card-title">${svgWrap(ICON.crown, 14)} Managed AI access</div>
      <div class="pay-card-sub">No setup, no API key required. Coming soon.</div>
      <div class="pay-card-price">100 Rs <span class="unit">/ month</span></div>
      <button class="btn btn-accent" data-action="show-payment" style="position:relative">Pay 100 Rs</button>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">${svgWrap(ICON.key, 14)} Use your own API key <span class="cost-pill">FREE</span></div>
      <div class="settings-section-sub">Works with Claude or OpenAI. Your key never leaves this browser.</div>
      <div class="settings-row">
        <label>provider</label>
        <select class="field" data-setting="provider">
          <option value="default" ${s.provider === 'default' ? 'selected' : ''}>Default key (built-in)</option>
          <option value="claude" ${s.provider === 'claude' ? 'selected' : ''}>Claude (Anthropic)</option>
          <option value="openai" ${s.provider === 'openai' ? 'selected' : ''}>OpenAI</option>
        </select>
      </div>
      ${s.provider !== 'default' ? `
      <div class="settings-row">
        <label>api_key</label>
        <input type="password" class="field field-mono" data-setting="apiKey" value="${esc(s.apiKey)}" placeholder="${s.provider === 'claude' ? 'sk-ant-...' : 'sk-...'}">
      </div>` : ''}
      <div class="settings-row">
        <label>max_tokens_per_request <span class="muted">(${s.maxTokens} — controls cost & response length)</span></label>
        <input type="number" min="200" max="4000" step="100" class="field field-mono" data-setting="maxTokens" value="${s.maxTokens}">
      </div>
      <button class="btn btn-primary btn-sm" data-action="save-settings" style="margin-top:8px">Save AI settings</button>
    </div>
  `;

  return `
    <div class="modal-backdrop">
      <div class="modal wide">
        <div class="modal-head">
          <div class="modal-title">Settings</div>
          <button class="icon-btn-hdr" data-action="close-modal">${svgWrap(ICON.close)}</button>
        </div>
        <div class="modal-body">
          <div class="note">
            <div class="note-tag">// account</div>
            <p>Plan: <strong>${isPro ? 'Pro' : 'Free'}</strong></p>
            <p style="margin-top:4px">Courses: <strong>${state.courses.length}</strong> · Planned: <strong>${state.courses.filter(c => c.planned).length}</strong></p>
          </div>

          ${proSection}

          <div class="settings-section">
            <div class="settings-section-title">Data</div>
            <div class="settings-section-sub">All data is stored in this browser tab only.</div>
            <div class="settings-row">
              <button class="btn btn-secondary" data-action="open-import" style="justify-content:flex-start">${svgWrap(ICON.download)}Import IULMS data</button>
            </div>
            <div class="settings-row">
              <button class="btn btn-danger" data-action="reset-data" style="justify-content:flex-start" ${!hasData ? 'disabled' : ''}>${svgWrap(ICON.trash)}Reset all data</button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-primary" data-action="close-modal">Done</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderAddCustomModal() {
  if (!state.newCourse) state.newCourse = { code: '', name: '', credits: 3, difficulty: 'medium' };
  const nc = state.newCourse;
  const diffOpts = Object.entries(DIFFICULTY).map(([k, v]) => `<option value="${k}" ${nc.difficulty === k ? 'selected' : ''}>${v.label}</option>`).join('');
  return `
    <div class="modal-backdrop">
      <div class="modal">
        <div class="modal-head">
          <div class="modal-title">Add custom course</div>
          <button class="icon-btn-hdr" data-action="close-modal">${svgWrap(ICON.close)}</button>
        </div>
        <div class="modal-body">
          <div class="note">
            <div class="note-tag">// for trial planning</div>
            <p>Add a course that isn't in your IULMS list — useful for hypothetical planning. Won't affect your degree progress stats.</p>
          </div>
          <div class="row two">
            <div><label>course_code</label><input class="field field-mono" id="nc-code" value="${esc(nc.code)}" placeholder="SEN-401"></div>
            <div><label>credits</label><input type="number" min="1" max="6" class="field field-mono" id="nc-credits" value="${nc.credits}"></div>
          </div>
          <div class="row">
            <div><label>course_name *</label><input class="field" id="nc-name" value="${esc(nc.name)}" placeholder="Software Project Management"></div>
          </div>
          <div class="row">
            <div><label>difficulty</label><select class="field" id="nc-difficulty">${diffOpts}</select></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" data-action="close-modal">Cancel</button>
            <button class="btn btn-primary" data-action="save-custom">Add and plan</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════════════════
   v2.0 — DASHBOARD VIEW
   Predictive student overview: profile, CGPA, attendance warnings,
   midterm-based forecasts, upcoming exams.
   ════════════════════════════════════════════════════════════════════════ */

function renderDashboard() {
  const hasAnyData = state.courses.length > 0
    || state.transcript.length > 0
    || state.attendance.length > 0;
  if (!hasAnyData) return emptyView();

  const profile = state.profile || {};
  const userName = profile.name || 'Student';
  const transcriptStats = computeTranscriptStats(state.transcript);
  const attendanceSummary = computeAttendanceSummary(state.attendance);
  const courseStats = state.courses.length > 0 ? computeStats(state.courses) : null;
  const prediction = predictSemesterOutcome(state.transcript, state.midterms, state.courses);
  const importedAt = state.dataTimestamp
    ? new Date(state.dataTimestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : null;

  /* ── Hero greeting + key stats ── */
  const cgpa = transcriptStats ? transcriptStats.cgpa : (courseStats ? courseStats.gpa : null);
  const credits = transcriptStats ? transcriptStats.totalCredits : (courseStats ? courseStats.completedCredits : 0);
  const pct = courseStats ? courseStats.pctComplete : null;

  const hero = `
    <div class="dash-hero">
      <div class="dash-hero-left">
        <div class="dash-hello">${svgWrap(ICON.user, 12)} welcome back</div>
        <h1 class="dash-name">${esc(userName)}</h1>
        <div class="dash-sub">
          ${importedAt ? `// last synced ${esc(importedAt)}` : '// no recent sync'}
        </div>
        <div class="dash-actions">
          <button class="btn btn-primary" data-action="open-import">${svgWrap(ICON.refresh, 14)}Re-sync from IULMS</button>
          <button class="btn btn-secondary" data-tab="timetable">${svgWrap(ICON.calendar, 14)}View timetable</button>
        </div>
      </div>
      <div class="dash-hero-stats">
        ${cgpa != null ? `
          <div class="dash-stat accent">
            <div class="dash-stat-label">${svgWrap(ICON.graduation, 12)} cgpa</div>
            <div class="dash-stat-value">${cgpa}<span class="suffix">/4.0</span></div>
            <div class="dash-stat-hint">${transcriptStats ? 'from official transcript' : 'estimate from grades'}</div>
          </div>` : ''}
        ${credits > 0 ? `
          <div class="dash-stat info">
            <div class="dash-stat-label">${svgWrap(ICON.layers, 12)} credits</div>
            <div class="dash-stat-value">${credits}${pct != null ? `<span class="suffix">cr</span>` : ''}</div>
            <div class="dash-stat-hint">${pct != null ? `${pct}% of ${TOTAL_CREDITS} cr degree` : 'completed so far'}</div>
          </div>` : ''}
        ${attendanceSummary && attendanceSummary.overallPct != null ? `
          <div class="dash-stat ${attendanceSummary.overallPct < 80 ? 'danger' : attendanceSummary.overallPct < 85 ? 'warn' : 'accent'}">
            <div class="dash-stat-label">${svgWrap(ICON.percent, 12)} attendance</div>
            <div class="dash-stat-value">${Math.round(attendanceSummary.overallPct)}<span class="suffix">%</span></div>
            <div class="dash-stat-hint">${attendanceSummary.flagged > 0 ? `${attendanceSummary.flagged} course${attendanceSummary.flagged > 1 ? 's' : ''} at risk` : 'all courses safe'}</div>
          </div>` : ''}
        ${prediction.scenarios ? `
          <div class="dash-stat warn">
            <div class="dash-stat-label">${svgWrap(ICON.trend, 12)} projected cgpa</div>
            <div class="dash-stat-value">${prediction.scenarios.expected.cgpa || '—'}<span class="suffix">/4.0</span></div>
            <div class="dash-stat-hint">if midterm trend continues</div>
          </div>` : ''}
      </div>
    </div>
  `;

  /* ── Attendance warnings panel ── */
  let attendancePanel = '';
  if (attendanceSummary && attendanceSummary.list.length > 0) {
    const sortedAtt = [...attendanceSummary.list].sort((a, b) => {
      const order = { critical: 0, warning: 1, caution: 2, safe: 3, 'no-data': 4 };
      return (order[a.status] - order[b.status]) || (a.pct - b.pct);
    });
    const rows = sortedAtt.map(a => {
      const pctTxt = a.pct != null ? a.pct.toFixed(1) + '%' : '—';
      const marginTxt = a.margin != null
        ? (a.margin > 0
          ? `${a.margin} class${a.margin > 1 ? 'es' : ''} buffer`
          : a.margin === 0 ? 'at the line' : `${Math.abs(a.margin)} over the limit`)
        : '';
      const barPct = a.pct != null ? Math.min(100, a.pct) : 0;
      return `
        <div class="att-row att-${a.status}">
          <div class="att-info">
            <div class="att-course">${esc(a.course)}</div>
            <div class="att-meta">${a.present}/${a.total || 0} sessions · ${a.absent} absent · ${marginTxt}</div>
          </div>
          <div class="att-bar-wrap">
            <div class="att-bar"><div class="att-bar-fill" style="width:${barPct}%"></div></div>
            <div class="att-pct">${pctTxt}</div>
          </div>
        </div>`;
    }).join('');
    attendancePanel = `
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">${svgWrap(ICON.percent)}Attendance health</div>
          <div class="panel-meta">${attendanceSummary.flagged} flagged · debar limit 75%</div>
        </div>
        ${attendanceSummary.critical.length > 0 ? `
          <div class="alert alert-danger">${ICON.warning}
            <div>
              <div class="alert-title">${attendanceSummary.critical.length} course${attendanceSummary.critical.length > 1 ? 's are' : ' is'} below 75% — debar risk</div>
              <div class="alert-body">Already past the university limit. Speak to your faculty about make-up sessions immediately.</div>
            </div>
          </div>` : ''}
        ${attendanceSummary.warning.length > 0 ? `
          <div class="alert alert-warn">${ICON.warning}
            <div>
              <div class="alert-title">${attendanceSummary.warning.length} course${attendanceSummary.warning.length > 1 ? 's' : ''} between 75% and 80%</div>
              <div class="alert-body">One more absence could push these into debar territory.</div>
            </div>
          </div>` : ''}
        <div class="att-list">${rows}</div>
      </div>`;
  }

  /* ── Midterm-based CGPA prediction panel ── */
  const courseRows = prediction.semesterPredictions.map(p => {
    let currentMarks = p.midtermRaw || 0;
    let remainingPool = 80; // 100 total - 20 midterm
    let extraMarks = '';

    // 1. Calculate Quizzes and Projects
    if (p.quizzes !== undefined || p.project !== undefined) {
      const q = (p.quizzes != null && p.quizzes > 0) ? p.quizzes : 0;
      const pr = (p.project != null && p.project > 0) ? p.project : 0;

      if (q > 0) { currentMarks += q; remainingPool -= 20; }
      if (pr > 0) { currentMarks += pr; remainingPool -= 20; }

      const qTxt = q > 0 ? q : 'not marked';
      const prTxt = pr > 0 ? pr : 'not marked';
      extraMarks = `<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Quizzes/Ass: <strong style="color:var(--text)">${qTxt}</strong> · Project: <strong style="color:var(--text)">${prTxt}</strong></div>`;
    }

    // 2. The 40-Mark Final Target Calculator
    let finalsNote = '';
    if (p.expected && typeof MIDTERM_TO_GRADE_BANDS !== 'undefined') {
      const band = MIDTERM_TO_GRADE_BANDS.find(b => b.grade === p.expected);
      if (band) {
        const neededForExpected = Math.max(0, band.min - currentMarks);

        if (neededForExpected <= 0) {
          finalsNote = `<div style="font-size:11px; color:#059669; margin-top:4px; font-weight:600;">✨ Secured a ${p.expected} already!</div>`;
        } else if (remainingPool === 40) {
          // Quiz and Project are marked, ONLY the 40-mark Final is left!
          finalsNote = `<div style="font-size:11px; color:#d97706; margin-top:4px; font-weight:600; background:#fffbeb; padding:2px 6px; border-radius:4px; display:inline-block; border:1px solid #fde68a;">🎯 Need ${neededForExpected}/40 on Final for a ${p.expected}</div>`;
        } else {
          // Quizzes or Projects are still 0/unmarked, so they have more than just the final left
          finalsNote = `<div style="font-size:11px; color:var(--accent); margin-top:4px; font-weight:500;">Need ${neededForExpected} more marks (out of ${remainingPool} remaining) for a ${p.expected}</div>`;
        }
      }
    }

    return `
      <div class="pred-row">
        <div class="pred-info">
          <div class="pred-code">${esc(p.code)}</div>
          <div class="pred-name">${esc(p.name)}</div>
          ${extraMarks}
          ${finalsNote}
        </div>
        <div class="pred-mid">
          ${p.midtermPct != null
        ? `<div class="pred-mid-val">${p.midtermRaw}/20</div><div class="pred-mid-lbl">${p.midtermPct.toFixed(0)}%</div>`
        : `<div class="pred-mid-val muted">—</div><div class="pred-mid-lbl">no midterm</div>`}
        </div>
        <div class="pred-grades">
          <span class="pred-grade pess">${nearestLetterFor(p.pessimisticPt)}</span>
          <span class="pred-grade exp ${gradeColorClass(p.expectedPt)}">${p.expected || nearestLetterFor(p.expectedPt)}</span>
          <span class="pred-grade opt">${nearestLetterFor(p.optimisticPt)}</span>
        </div>
      </div>`;
  }).join('');

  const targetSliderHTML = renderTargetCGPASummary();
  predictionPanel = `
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">${svgWrap(ICON.trend)}CGPA forecast</div>
          <div class="panel-meta">based on ${prediction.semesterPredictions.length} current course${prediction.semesterPredictions.length > 1 ? 's' : ''} · ${prediction.semCredits} cr</div>
        </div>
        <div class="scenario-grid">
          <div class="scenario-card pess">
            <div class="scenario-label">pessimistic</div>
            <div class="scenario-value">${prediction.scenarios.pessimistic.cgpa || '—'}</div>
            <div class="scenario-sub">if you slip in finals</div>
          </div>
          <div class="scenario-card exp">
            <div class="scenario-label">expected</div>
            <div class="scenario-value">${prediction.scenarios.expected.cgpa || '—'}</div>
            <div class="scenario-sub">if midterm pace holds</div>
          </div>
          <div class="scenario-card opt">
            <div class="scenario-label">optimistic</div>
            <div class="scenario-value">${prediction.scenarios.optimistic.cgpa || '—'}</div>
            <div class="scenario-sub">if finals go well</div>
          </div>
        </div>
        <div class="pred-list-head">
          <span>course</span>
          <span>midterm</span>
          <span class="pred-legend">pessimistic · <strong>expected</strong> · optimistic</span>
        </div>
        <div class="pred-list">${courseRows}</div>
        <div class="target-cgpa-block">
          <div class="target-cgpa-title">${svgWrap(ICON.target, 14)} what would it take to reach a target CGPA?</div>
          <div class="target-cgpa-slider">
            <input type="range" min="2.0" max="4.0" step="0.05" value="${state.targetCGPA}" data-f="target-cgpa">
            <span class="target-cgpa-val" id="target-cgpa-val">${state.targetCGPA.toFixed(2)}</span>
          </div>
          <div id="target-cgpa-summary">${targetSliderHTML}</div>
        </div>
      </div>`;
}

/* ── Exam schedule panel ── */
let examPanel = '';
if (state.examSchedule && state.examSchedule.length > 0) {
  const examRows = state.examSchedule.map(e => `
      <div class="exam-row">
        <div class="exam-code">${esc(e.code)}</div>
        <div class="exam-name">${esc(e.name || '')}</div>
        <div class="exam-meta">
          ${e.date ? `<span>${svgWrap(ICON.calendar, 11)} ${esc(e.date)}</span>` : ''}
          ${e.time ? `<span>${svgWrap(ICON.clock, 11)} ${esc(e.time)}</span>` : ''}
          ${e.venue ? `<span>${svgWrap(ICON.mappin, 11)} ${esc(e.venue)}</span>` : ''}
        </div>
      </div>`).join('');
  examPanel = `
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">${svgWrap(ICON.calendar)}Upcoming exams</div>
          <div class="panel-meta">${state.examSchedule.length} scheduled</div>
        </div>
        <div class="exam-list">${examRows}</div>
      </div>`;
} else if (state.dataTimestamp) {
  examPanel = `
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">${svgWrap(ICON.calendar)}Upcoming exams</div>
          <div class="panel-meta">not yet published</div>
        </div>
        <div class="empty" style="padding:28px;">
          <p class="muted" style="font-size:13px">The exam schedule wasn't available on IULMS at sync time. Re-sync once the exam timetable is uploaded.</p>
        </div>
      </div>`;
}

/* ── Transcript snapshot panel ── */
let transcriptPanel = '';
if (transcriptStats && transcriptStats.byGrade) {
  const grades = Object.entries(transcriptStats.byGrade)
    .sort((a, b) => (GRADE_POINTS[b[0]] || 0) - (GRADE_POINTS[a[0]] || 0));
  const totalGraded = transcriptStats.coursesGraded || 1;
  const bars = grades.map(([g, count]) => {
    const w = (count / totalGraded) * 100;
    const cls = (GRADE_POINTS[g] >= 3.3) ? 'g-strong' : (GRADE_POINTS[g] >= 2.5) ? 'g-mid' : (GRADE_POINTS[g] >= 1.0) ? 'g-low' : 'g-fail';
    return `<div class="g-bar"><div class="g-bar-letter">${g}</div><div class="g-bar-track"><div class="g-bar-fill ${cls}" style="width:${w}%"></div></div><div class="g-bar-count">${count}</div></div>`;
  }).join('');
  transcriptPanel = `
      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">${svgWrap(ICON.chart)}Grade distribution</div>
          <div class="panel-meta">${transcriptStats.coursesGraded} graded course${transcriptStats.coursesGraded > 1 ? 's' : ''} · ${transcriptStats.totalCredits} cr</div>
        </div>
        <div class="grade-bars">${bars}</div>
      </div>`;
}

return `
    <div class="container">
      ${hero}
      <div class="dash-grid">
        ${predictionPanel}
        ${attendancePanel}
        ${examPanel}
        ${transcriptPanel}
      </div>
    </div>
  `;
}

function gradeColorClass(point) {
  if (point >= 3.3) return 'g-strong';
  if (point >= 2.5) return 'g-mid';
  if (point >= 1.0) return 'g-low';
  return 'g-fail';
}

/* Re-rendered live on slider input — no full re-render needed. */
function renderTargetCGPASummary() {
  const prediction = predictSemesterOutcome(state.transcript, state.midterms, state.courses);
  if (!prediction || !prediction.semCredits) {
    return `<div class="muted" style="font-size:12px">Need current-semester courses with midterm results to compute.</div>`;
  }
  const needed = gpaNeededForTarget(state.transcript, prediction.semCredits, state.targetCGPA);
  if (!needed) return `<div class="muted" style="font-size:12px">Not enough data.</div>`;
  if (!needed.achievable) {
    return `<div class="target-result danger">
      ${ICON.warning}
      <div>Target <strong>${state.targetCGPA.toFixed(2)}</strong> is not reachable this semester — you'd need ${needed.requiredSemGPA.toFixed(2)} sem GPA, above the 4.0 ceiling.</div>
    </div>`;
  }
  return `<div class="target-result ok">
    ${ICON.check}
    <div>To hit a <strong>${state.targetCGPA.toFixed(2)}</strong> CGPA, average <strong>${needed.requiredSemGPA.toFixed(2)}</strong> this semester (≈ <strong>${needed.requiredLetter}</strong> in each course).</div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════════════════
   v2.0 — TIMETABLE VIEW
   Renders the fetched IULMS Schedule.php data as a visual weekly grid.
   ════════════════════════════════════════════════════════════════════════ */

function renderTimetable() {
  if (!state.currentSchedule || state.currentSchedule.length === 0) {
    if (state.courses.length === 0) return emptyView();
    return `
      <div class="container">
        <div class="page-head">
          <div>
            <h2 class="page-title">Weekly timetable</h2>
            <p class="page-sub">// auto-built from your IULMS schedule</p>
          </div>
          <div class="actions">
            <button class="btn btn-primary" data-action="open-import">${svgWrap(ICON.refresh, 14)}Re-sync</button>
          </div>
        </div>
        <div class="empty" style="padding:48px 24px">
          <div class="empty-comment">// no schedule data yet</div>
          <h3 class="empty-title">Your weekly schedule hasn't been imported</h3>
          <p class="empty-text">The v2 bookmarklet pulls your timetable from <span class="mono">sic/Schedule.php</span> automatically. Run it from the SIC dashboard to populate this view.</p>
          <div class="empty-actions">
            <button class="btn btn-primary" data-action="open-import">${svgWrap(ICON.download)}Set up bookmarklet</button>
          </div>
        </div>
      </div>
    `;
  }

  const blocks = scheduleEntriesToBlocks(state.currentSchedule);
  if (blocks.length === 0) {
    return `
      <div class="container">
        <div class="page-head">
          <div>
            <h2 class="page-title">Weekly timetable</h2>
            <p class="page-sub">// raw schedule entries from IULMS</p>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><div class="panel-title">Schedule entries</div><div class="panel-meta">no time info detected</div></div>
          ${state.currentSchedule.map(s => `
            <div class="tt-raw-row">
              <div class="tt-raw-day">${esc(s.rawDay || s.day || '?')}</div>
              <div class="tt-raw-detail">${esc(s.raw || '')}</div>
            </div>`).join('')}
        </div>
      </div>
    `;
  }

  /* Compute the time window dynamically to fit the schedule. */
  let minMin = 8 * 60, maxMin = 18 * 60;
  for (const b of blocks) {
    minMin = Math.min(minMin, toMin(b.start));
    maxMin = Math.max(maxMin, toMin(b.end));
  }
  const START_H = Math.floor(minMin / 60);
  const END_H = Math.ceil(maxMin / 60);
  const SLOT_H = 60;
  const hours = [];
  for (let h = START_H; h <= END_H; h++) hours.push(h);

  /* Build day-by-day columns. */
  const dayCols = DAYS.map(d => {
    const blocksToday = blocks.filter(b => b.day === d.key)
      .sort((a, b) => toMin(a.start) - toMin(b.start));
    const blockHtml = blocksToday.map(b => {
      const startMin = toMin(b.start) - START_H * 60;
      const dur = toMin(b.end) - toMin(b.start);
      const top = (startMin / 60) * SLOT_H;
      const height = Math.max(28, (dur / 60) * SLOT_H - 2);
      return `
        <div class="tt-block c-${b.colorIdx}" style="top:${top + 1}px;height:${height}px" title="${esc(b.title)}${b.faculty ? ' · ' + esc(b.faculty) : ''}${b.location ? ' · ' + esc(b.location) : ''}">
          <div class="b-code">${esc(b.title)}</div>
          ${b.location ? `<div class="b-name">${esc(b.location)}</div>` : ''}
          ${height > 50 && b.faculty ? `<div class="b-name" style="opacity:.85">${esc(b.faculty)}</div>` : ''}
          <div class="b-time">${fmtTime(b.start)}–${fmtTime(b.end)}</div>
        </div>`;
    }).join('');
    return `<div class="tt-day">${hours.map(() => '<div class="slot"></div>').join('')}${blockHtml}</div>`;
  }).join('');

  const timeCol = hours.map(h => `<div class="hour">${(h % 12 === 0 ? 12 : h % 12) + (h >= 12 ? 'PM' : 'AM')}</div>`).join('');

  /* Compact list summary by day. */
  const summaryByDay = DAYS.map(d => {
    const blocksToday = blocks.filter(b => b.day === d.key);
    if (blocksToday.length === 0) return `<div class="tt-summary-day empty"><div class="tt-summary-name">${d.full}</div><div class="tt-summary-meta">no classes</div></div>`;
    const rows = blocksToday.sort((a, b) => toMin(a.start) - toMin(b.start)).map(b => `
      <div class="tt-summary-row">
        <span class="tt-summary-time">${fmtTime(b.start)}</span>
        <span class="tt-summary-title">${esc(b.title)}</span>
        ${b.location ? `<span class="tt-summary-loc">${esc(b.location)}</span>` : ''}
      </div>`).join('');
    return `<div class="tt-summary-day"><div class="tt-summary-name">${d.full}</div><div class="tt-summary-rows">${rows}</div></div>`;
  }).join('');

  return `
    <div class="container">
      <div class="page-head">
        <div>
          <h2 class="page-title">Weekly timetable</h2>
          <p class="page-sub">// from your IULMS schedule · ${blocks.length} classes per week</p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" data-action="open-import">${svgWrap(ICON.refresh, 14)}Re-sync</button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">${svgWrap(ICON.calendar)}This week</div>
          <div class="panel-meta">${(END_H - START_H)}h window · ${fmtTime(String(START_H).padStart(2, '0') + ':00')} – ${fmtTime(String(END_H).padStart(2, '0') + ':00')}</div>
        </div>
        <div class="timetable">
          <div class="tt-header"><div>time</div>${DAYS.map(d => `<div>${d.label}</div>`).join('')}</div>
          <div class="tt-body"><div class="tt-time">${timeCol}</div>${dayCols}</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">
          <div class="panel-title">Day-by-day breakdown</div>
          <div class="panel-meta">order · time · venue</div>
        </div>
        <div class="tt-summary-grid">${summaryByDay}</div>
      </div>
    </div>
  `;
}
