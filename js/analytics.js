/* SCHEDULE ANALYTICS
   Pure functions over course/session data — used by the Planner tab. */

function computeStats(courses) {
  const byStatus = { completed: [], inProgress: [], available: [], locked: [], notOffered: [], elective: [] };
  for (const c of courses) (byStatus[c.status] || []).push(c);

  const completedCredits = byStatus.completed.reduce((s, c) => s + c.credits, 0);
  const inProgressCredits = byStatus.inProgress.reduce((s, c) => s + c.credits, 0);
  const remainingCredits = Math.max(0, TOTAL_CREDITS - completedCredits - inProgressCredits);

  let totalPoints = 0, totalCr = 0;
  for (const c of byStatus.completed) {
    if (c.grade && GRADE_POINTS[c.grade] != null) {
      totalPoints += GRADE_POINTS[c.grade] * c.credits;
      totalCr += c.credits;
    }
  }
  const gpa = totalCr > 0 ? (totalPoints / totalCr).toFixed(2) : null;
  const electivesCompleted = byStatus.completed.filter(c => c.isElective).length;
  const completedSet = new Set(byStatus.completed.map(c => c.code));

  return {
    byStatus, completedCredits, inProgressCredits, remainingCredits,
    pctComplete: Math.round((completedCredits / TOTAL_CREDITS) * 100),
    gpa, electivesCompleted, electivesNeeded: 5, completedSet,
  };
}

function prereqMet(course, completedSet) {
  if (!course.prereq) return true;
  return completedSet.has(course.prereq);
}

function planItems(courses) {
  const items = [];
  for (const c of courses) {
    if (!c.planned) continue;
    for (const s of c.sessions) items.push({ course: c, session: s, day: s.day });
  }
  return items;
}

function detectConflicts(items) {
  const conflicts = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.day !== b.day || a.course.id === b.course.id) continue;
      const a1 = toMin(a.session.start), a2 = toMin(a.session.end);
      const b1 = toMin(b.session.start), b2 = toMin(b.session.end);
      if (a1 < b2 && b1 < a2) {
        conflicts.push({ a: a.course, b: b.course, day: a.day, overlap: Math.min(a2, b2) - Math.max(a1, b1) });
      }
    }
  }
  return conflicts;
}

function dailyLoad(items) {
  const load = {};
  for (const d of DAYS) load[d.key] = { courses: new Set(), sessions: 0, minutes: 0, list: [] };
  for (const it of items) {
    load[it.day].courses.add(it.course.id);
    load[it.day].sessions += 1;
    load[it.day].minutes += toMin(it.session.end) - toMin(it.session.start);
    load[it.day].list.push(it);
  }
  for (const d of DAYS) load[d.key].list.sort((x, y) => toMin(x.session.start) - toMin(y.session.start));
  return load;
}

function findGaps(items) {
  const load = dailyLoad(items);
  const gaps = [];
  for (const d of DAYS) {
    const list = load[d.key].list;
    for (let i = 0; i < list.length - 1; i++) {
      const gap = toMin(list[i + 1].session.start) - toMin(list[i].session.end);
      if (gap >= 60) {
        gaps.push({
          day: d.key, after: list[i].course, before: list[i + 1].course,
          start: list[i].session.end, end: list[i + 1].session.start, minutes: gap
        });
      }
    }
  }
  return gaps;
}

function findTraps(items) {
  const load = dailyLoad(items);
  const traps = [];
  for (const d of DAYS) {
    const list = load[d.key].list;
    if (list.length < 2) continue;
    const first = toMin(list[0].session.start);
    const last = toMin(list[list.length - 1].session.end);
    if (first <= 10 * 60 && last >= 16 * 60 && (last - first) >= 7 * 60) {
      traps.push({ day: d.key, first: list[0], last: list[list.length - 1], span: last - first });
    }
  }
  return traps;
}

function hasLunchBreak(items) {
  const load = dailyLoad(items);
  const violations = [];
  for (const d of DAYS) {
    if (load[d.key].sessions === 0) continue;
    for (const it of load[d.key].list) {
      const s = toMin(it.session.start), e = toMin(it.session.end);
      if (s < 13 * 60 && e > 12 * 60) {
        violations.push({ day: d.key, course: it.course });
        break;
      }
    }
  }
  return violations;
}

function emptyDays(items) {
  const load = dailyLoad(items);
  return DAYS.filter(d => load[d.key].sessions === 0);
}

function balanceScore(items) {
  if (items.length === 0) return null;
  const load = dailyLoad(items);
  const sessCounts = DAYS.map(d => load[d.key].sessions);
  const minutes = DAYS.map(d => load[d.key].minutes);
  const maxS = Math.max(...sessCounts), minS = Math.min(...sessCounts);
  const maxM = Math.max(...minutes);
  const conflicts = detectConflicts(items).length;
  const traps = findTraps(items).length;
  const totalGapMin = findGaps(items).reduce((s, g) => s + g.minutes, 0);
  const lunch = hasLunchBreak(items).length;
  const empty = emptyDays(items).length;

  let score = 100;
  score -= conflicts * 25;
  score -= Math.max(0, (maxS - minS - 1)) * 4;
  if (maxM > 5 * 60) score -= (maxM - 5 * 60) / 8;
  score -= traps * 12;
  score -= Math.min(totalGapMin / 40, 15);
  score -= lunch * 3;
  if (empty === 0) score -= 5;
  score = Math.max(0, Math.round(score));

  const diffByDay = {};
  for (const d of DAYS) diffByDay[d.key] = 0;
  for (const it of items) diffByDay[it.day] += DIFFICULTY[it.course.difficulty].weight;
  const activeDays = Object.values(diffByDay).filter(v => v > 0);
  const dSpread = activeDays.length ? Math.max(...activeDays) - Math.min(...activeDays) : 0;
  const difficultyBalance = Math.max(0, 100 - dSpread * 10);

  return { score, difficultyBalance, conflicts, traps, totalGapMin, lunch, empty, diffByDay };
}

function computeRecommendations(courses) {
  const items = planItems(courses);
  const recs = [];

  if (items.length === 0) {
    recs.push({
      tone: 'info', icon: ICON.target,
      text: '<strong>No plan yet.</strong> Pick courses on the left to start building this semester\'s schedule.'
    });
    return recs;
  }

  const score = balanceScore(items);
  const load = dailyLoad(items);
  const gaps = findGaps(items);
  const traps = findTraps(items);
  const conflicts = detectConflicts(items);
  const empties = emptyDays(items);
  const lunch = hasLunchBreak(items);

  for (const c of conflicts.slice(0, 3)) {
    recs.push({
      tone: 'danger', icon: ICON.warning,
      text: `<strong>${esc(c.a.code)} clashes with ${esc(c.b.code)}</strong> on ${DAYS.find(d => d.key === c.day).full} — they overlap by ${fmtDur(c.overlap)}. Move one of them.`
    });
  }

  for (const d of DAYS) {
    if (load[d.key].sessions >= 4) {
      const codes = [...new Set(load[d.key].list.map(it => it.course.code))];
      recs.push({
        tone: 'warn', icon: ICON.zap,
        text: `<strong>${d.full} is overloaded</strong> — ${load[d.key].sessions} sessions back-to-back (${fmtDur(load[d.key].minutes)}). Consider moving one of: ${codes.join(', ')}.`
      });
    }
  }

  if (score.totalGapMin >= 180) {
    const worst = gaps.sort((a, b) => b.minutes - a.minutes)[0];
    recs.push({
      tone: 'warn', icon: ICON.coffee,
      text: `<strong>${fmtDur(score.totalGapMin)} of dead time per week.</strong> Longest gap: ${fmtDur(worst.minutes)} on ${DAYS.find(d => d.key === worst.day).full} between ${esc(worst.after.code)} and ${esc(worst.before.code)}.`
    });
  }

  for (const t of traps) {
    recs.push({
      tone: 'warn', icon: ICON.sun,
      text: `<strong>${DAYS.find(d => d.key === t.day).full} is a long day</strong> — first class at ${fmtTime(t.first.session.start)}, last ends ${fmtTime(t.last.session.end)} (${fmtDur(t.span)} total).`
    });
  }

  for (const d of DAYS) {
    if (score.diffByDay[d.key] >= 7) {
      const hard = load[d.key].list.filter(it => ['hard', 'brutal'].includes(it.course.difficulty));
      if (hard.length >= 2) {
        const codes = [...new Set(hard.map(it => it.course.code))];
        recs.push({
          tone: 'warn', icon: ICON.brain,
          text: `<strong>${d.full} stacks hard courses</strong> — ${codes.join(' + ')} same day will be brutal mentally.`
        });
      }
    }
  }

  if (lunch.length >= 3) {
    recs.push({
      tone: 'info', icon: ICON.coffee,
      text: `<strong>No lunch break ${lunch.length} days/week.</strong> Classes run through 12-1 PM. Consider keeping that slot free.`
    });
  }

  if (conflicts.length === 0 && score.score >= 80) {
    recs.push({
      tone: 'success', icon: ICON.check,
      text: `<strong>Solid schedule!</strong> Balance score is ${score.score}/100 with no conflicts and clean load distribution.`
    });
  }

  if (empties.length > 0) {
    recs.push({
      tone: 'success', icon: ICON.spark,
      text: `<strong>${empties.map(d => d.full).join(', ')} free</strong> — great for study, work, or rest.`
    });
  }

  const totalCr = courses.filter(c => c.planned).reduce((s, c) => s + c.credits, 0);
  if (totalCr > 0 && totalCr < 12) {
    recs.push({
      tone: 'info', icon: ICON.target,
      text: `<strong>Only ${totalCr} credit hours planned.</strong> Most students take 15-18 cr/semester.`
    });
  }
  if (totalCr > 21) {
    recs.push({
      tone: 'warn', icon: ICON.warning,
      text: `<strong>${totalCr} credit hours is a heavy load.</strong> Universities typically cap at 18-21 cr/semester.`
    });
  }

  return recs;
}

/* ════════════════════════════════════════════════════════════════════════
   v2.0 PREDICTIVE ANALYTICS
   Functions that operate on the new payload (transcript, attendance,
   midterms, exam schedule, current schedule).
   ════════════════════════════════════════════════════════════════════════ */

/* ── Transcript-driven CGPA ──
   Computes the official-style CGPA directly from the IULMS transcript.
   This is more accurate than the SIC-page-derived GPA because it uses
   the points column straight from the source. */
function computeTranscriptStats(transcript) {
  if (!transcript || transcript.length === 0) return null;

  let totalPoints = 0, totalCredits = 0;
  let passedCount = 0, failedCount = 0;
  const byGrade = {};

  for (const t of transcript) {
    const grade = (t.grade || '').toUpperCase();
    const cr = t.credits || 0;
    /* Skip W (withdrawn) and I (incomplete) — they don't count. */
    if (!grade || grade === 'W' || grade === 'I' || grade === 'NC') continue;
    if (GRADE_POINTS[grade] != null) {
      totalPoints += GRADE_POINTS[grade] * cr;
      totalCredits += cr;
      byGrade[grade] = (byGrade[grade] || 0) + 1;
      if (GRADE_POINTS[grade] >= 1.0) passedCount++;
      else failedCount++;
    }
  }
  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : null;
  return {
    cgpa: cgpa != null ? cgpa.toFixed(2) : null,
    cgpaRaw: cgpa,
    totalPoints,
    totalCredits,
    passedCount,
    failedCount,
    byGrade,
    coursesGraded: transcript.filter(t => t.grade && GRADE_POINTS[t.grade] != null).length,
  };
}

/* ── Attendance risk classification ──
   Returns { pct, status } where status is one of:
     'safe' (≥85%), 'caution' (80–85), 'warning' (75–80), 'critical' (<75) */
function attendanceStatus(record) {
  const total = record.totalSessions || (record.present + record.absent);
  if (total === 0) return { pct: null, status: 'no-data', total: 0 };
  const pct = (record.present / total) * 100;
  let status;
  if (pct < ATTENDANCE_LIMITS.critical) status = 'critical';
  else if (pct < ATTENDANCE_LIMITS.warning) status = 'warning';
  else if (pct < ATTENDANCE_LIMITS.caution) status = 'caution';
  else status = 'safe';
  return { pct, status, total };
}

/* ── How many more classes can the student miss before falling below 75%? ── */
function attendanceMargin(record) {
  const total = record.totalSessions || (record.present + record.absent);
  if (total === 0) return null;
  /* present / total >= 0.75  =>  total - present <= present/3 (when treating
     future absences). We approximate against the current snapshot. */
  const minNeeded = Math.ceil(total * (ATTENDANCE_LIMITS.critical / 100));
  return record.present - minNeeded;
}

/* ── Aggregate attendance summary for the dashboard. ── */
function computeAttendanceSummary(attendance) {
  if (!attendance || attendance.length === 0) return null;
  const enriched = attendance.map(a => ({
    ...a,
    ...attendanceStatus(a),
    margin: attendanceMargin(a),
  }));
  const critical = enriched.filter(e => e.status === 'critical');
  const warning = enriched.filter(e => e.status === 'warning');
  const caution = enriched.filter(e => e.status === 'caution');
  const safe = enriched.filter(e => e.status === 'safe');
  const totalSessions = enriched.reduce((s, e) => s + (e.totalSessions || 0), 0);
  const totalPresent = enriched.reduce((s, e) => s + (e.present || 0), 0);
  const overallPct = totalSessions > 0 ? (totalPresent / totalSessions) * 100 : null;
  return {
    list: enriched,
    critical, warning, caution, safe,
    overallPct,
    flagged: critical.length + warning.length,
  };
}

/* ── Midterm-based predictions ──
   Given a midterm percentage, predict the likely final letter grade by
   assuming the student maintains the same performance level. This is a
   coarse heuristic — it does NOT replace the official cutoffs, which
   vary by faculty, but it's useful for triage. */
const MIDTERM_TO_GRADE_BANDS = [
  { min: 87, grade: 'A', point: 4.0 },
  { min: 81, grade: 'A-', point: 3.7 },
  { min: 77, grade: 'B+', point: 3.3 },
  { min: 71, grade: 'B', point: 3.0 },
  { min: 67, grade: 'B-', point: 2.7 },
  { min: 63, grade: 'C+', point: 2.3 },
  { min: 57, grade: 'C', point: 2.0 },
  { min: 53, grade: 'C-', point: 1.7 },
  { min: 47, grade: 'D+', point: 1.3 },
  { min: 40, grade: 'D', point: 1.0 },
  { min: 0, grade: 'F', point: 0.0 },
];

function predictGradeFromPct(pct) {
  if (pct == null || !Number.isFinite(pct)) return null;
  for (const band of MIDTERM_TO_GRADE_BANDS) {
    if (pct >= band.min) return { grade: band.grade, point: band.point };
  }
  return { grade: 'F', point: 0.0 };
}

/* ── Predict end-of-semester CGPA ──
   Uses:
     - Historical: total credits + points from transcript
     - Current semester: in-progress courses with midterm-based predictions
   Returns three scenarios: pessimistic, expected, optimistic. */
/* ── Predict end-of-semester CGPA ── */
function predictSemesterOutcome(transcript, midterms, currentCourses) {
  // 1. Get past stats. If transcript is empty, fallback to the main course list estimate!
  let pastPoints = 0;
  let pastCredits = 0;
  let pastCGPA = null;

  const pastTrans = computeTranscriptStats(transcript);
  if (pastTrans && pastTrans.totalCredits > 0) {
    pastPoints = pastTrans.totalPoints;
    pastCredits = pastTrans.totalCredits;
    pastCGPA = pastTrans.cgpa;
  } else {
    const stats = computeStats(currentCourses || []);
    if (stats && stats.gpa) {
      pastCGPA = stats.gpa;
      pastCredits = stats.completedCredits;
      pastPoints = parseFloat(stats.gpa) * pastCredits; // Reverse engineer the points
    }
  }

  // 2. Build map: link midterms by code OR name safely
  const midPct = {};
  const midData = {};
  for (const m of midterms || []) {
    if (m.code) {
      midPct[m.code] = m.percentage;
      midData[m.code] = m;
    }
    const normName = (m.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (normName) {
      midPct[normName] = m.percentage;
      midData[normName] = m;
    }
  }

  // 3. Only predict for courses actually marked "In Progress" in your main list
  const semesterCourses = (currentCourses || []).filter(c => c.status === 'inProgress');
  if (semesterCourses.length === 0) {
    return { pastCGPA, semesterPredictions: [], scenarios: null };
  }

  const semesterPredictions = semesterCourses.map(c => {
    const normName = (c.name || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const pct = midPct[c.code] != null ? midPct[c.code] : midPct[normName];
    const mData = midData[c.code] || midData[normName] || {};

    const expected = pct != null ? predictGradeFromPct(pct) : null;
    let optimisticPt = expected ? Math.min(4.0, expected.point + 0.3) : 3.0;
    let pessimisticPt = expected ? Math.max(0.0, expected.point - 0.7) : 1.7;

    if (!expected) {
      return {
        code: c.code, name: c.name, credits: c.credits,
        midtermPct: null, midtermRaw: null, quizzes: null, project: null, expected: null,
        expectedPt: 3.0, optimisticPt: 4.0, pessimisticPt: 2.0,
      };
    }
    return {
      code: c.code, name: c.name, credits: c.credits,
      midtermPct: pct,
      midtermRaw: mData.obtained,
      quizzes: mData.quizzes,
      project: mData.project,
      expected: expected.grade,
      expectedPt: expected.point,
      optimisticPt, pessimisticPt,
    };
  });

  const semCredits = semesterPredictions.reduce((s, p) => s + p.credits, 0);
  function scenario(field) {
    const semPoints = semesterPredictions.reduce((s, p) => s + p[field] * p.credits, 0);
    const totalPts = pastPoints + semPoints;
    const totalCr = pastCredits + semCredits;
    return {
      semGPA: semCredits > 0 ? (semPoints / semCredits).toFixed(2) : null,
      cgpa: totalCr > 0 ? (totalPts / totalCr).toFixed(2) : null,
    };
  }

  return {
    pastCGPA,
    pastCredits,
    semesterPredictions,
    semCredits,
    scenarios: {
      pessimistic: scenario('pessimisticPt'),
      expected: scenario('expectedPt'),
      optimistic: scenario('optimisticPt'),
    },
  };
}

/* ── What final grades do you need to hit a target CGPA? ──
   Returns the required per-credit GPA for current semester courses. */
function gpaNeededForTarget(transcript, currentCredits, targetCGPA) {
  const past = computeTranscriptStats(transcript);
  if (!past || currentCredits <= 0) return null;
  const totalCr = past.totalCredits + currentCredits;
  const requiredPoints = targetCGPA * totalCr - past.totalPoints;
  const requiredSemGPA = requiredPoints / currentCredits;
  return {
    requiredSemGPA: Math.max(0, requiredSemGPA),
    achievable: requiredSemGPA <= 4.0,
    requiredLetter: nearestLetterFor(requiredSemGPA),
  };
}

function nearestLetterFor(point) {
  if (point > 4.0) return 'A+ (impossible)';
  let best = 'F';
  let bestDelta = Infinity;
  for (const [letter, pt] of Object.entries(GRADE_POINTS)) {
    if (pt >= point && (pt - point) < bestDelta) {
      best = letter; bestDelta = pt - point;
    }
  }
  return best;
}

/* ── Map fetched schedule entries to a planner-style structure ──
   so the visual timetable can render them with the same engine. */
function scheduleEntriesToBlocks(schedule) {
  if (!schedule || schedule.length === 0) return [];
  const blocks = [];
  /* Pre-pick a color index per unique course title or EDP. */
  const colorMap = {};
  let nextColor = 0;
  for (const s of schedule) {
    const key = s.edpCode || s.courseTitle || s.raw;
    if (!colorMap[key]) {
      colorMap[key] = nextColor % 8;
      nextColor++;
    }
  }
  for (const s of schedule) {
    if (!s.day || !s.startTime || !s.endTime) continue;
    const key = s.edpCode || s.courseTitle || s.raw;
    blocks.push({
      day: s.day,
      start: s.startTime,
      end: s.endTime,
      title: s.courseTitle || '—',
      faculty: s.faculty || '',
      location: s.location || '',
      edpCode: s.edpCode || '',
      colorIdx: colorMap[key] || 0,
    });
  }
  return blocks;
}
