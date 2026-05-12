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
  <div style="text-align:center;margin-bottom:32px;">
    <div class="login-pill">v4.0 · IUSemPlanner.ai</div>
  </div>
  <div class="hero-split">
    <div class="hero-left">
            <h1 class="hero-headline">
              They make software engineers. Their own software is a
              <em>JOKE.</em>
            </h1>
            <p class="hero-body">
              Import your IULMS courses in 10 seconds. Detect clashes,
              track your GPA, and plan a semester that doesn't break you.
              <b>Built by students of IQRA University, for its students.</b>
            </p>
           
          </div>
          <div class="hero-right">
            <div class="hero-char-wrap">
              <img src="./media/iui.png" alt="IUSemPlanner mascot" class="hero-char">
              <div class="hero-float-tag t1">8 semesters tracked</div>
              <div class="hero-float-tag t2">No clashes</div>
              <div class="hero-float-tag t3">GPA 3.4</div>
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

        <div class="login-cards">
          <button class="plan-card" data-login="free">
            <div class="plan-head">
              <span class="plan-tag">demo / free</span>
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
              <span class="plan-tag">demo / pro</span>
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
          <button class="btn btn-accent" data-action="logout" style="position:relative">${svgWrap(ICON.refresh)}Switch to Pro demo</button>
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
    : `using demo key · max ${state.aiSettings.maxTokens} tokens`;

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
  const mode = state.uploadMode || 'paste';

  const tabs = `
    <div class="upload-tabs">
      <button class="upload-tab ${mode === 'paste' ? 'active' : ''}" data-upload-mode="paste">${svgWrap(ICON.file, 14)}Paste text</button>
      <button class="upload-tab ${mode === 'file' ? 'active' : ''}" data-upload-mode="file">${svgWrap(ICON.download, 14)}Upload .txt file</button>
      <button class="upload-tab ${mode === 'image' ? 'active' : ''} ${!isPro ? 'locked' : ''}" data-upload-mode="image">
        ${svgWrap(ICON.image, 14)}Upload image
        <span class="pro-tag">PRO</span>
      </button>
    </div>
  `;

  let modeBody = '';
  if (mode === 'paste') {
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
          <div class="note">
            <div class="note-tag">// how to import</div>
            <p>Choose your method below. Recognizes "Already cleared", "In Progress", "Course not Offered", "Pre Requisite not cleared". Extracts grades, computes GPA, tracks prerequisites.</p>
          </div>
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
          <option value="default" ${s.provider === 'default' ? 'selected' : ''}>Demo key (built-in)</option>
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
            <p>Plan: <strong>${isPro ? 'Pro demo' : 'Free demo'}</strong></p>
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
              <button class="btn btn-secondary" data-action="load-sample" style="justify-content:flex-start">${svgWrap(ICON.spark)}Load sample data</button>
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
