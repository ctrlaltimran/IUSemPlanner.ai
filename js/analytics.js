/* SCHEDULE ANALYTICS
   Pure functions over course/session data — used by the Planner tab. */

function computeStats(courses) {
  const byStatus = { completed: [], inProgress: [], available: [], locked: [], notOffered: [], elective: [] };
  for (const c of courses) (byStatus[c.status] || []).push(c);

  const completedCredits  = byStatus.completed.reduce((s, c) => s + c.credits, 0);
  const inProgressCredits = byStatus.inProgress.reduce((s, c) => s + c.credits, 0);
  const remainingCredits  = Math.max(0, TOTAL_CREDITS - completedCredits - inProgressCredits);

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
