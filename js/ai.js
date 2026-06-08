/* AI PROVIDER ABSTRACTION
   Routes AI requests through Claude, OpenAI, or the default built-in key
   based on the user's settings. Supports text prompts and image analysis. */

async function callAI(prompt) {
  const s = state.aiSettings;
  if (s.provider === 'openai' && s.apiKey) {
    return callOpenAI(prompt, s.apiKey, s.maxTokens);
  }
  if (s.provider === 'claude' && s.apiKey) {
    return callClaudeWithKey(prompt, s.apiKey, s.maxTokens);
  }
  return callClaudeDefault(prompt, s.maxTokens);
}

async function callClaudeDefault(prompt, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) throw new Error('API request failed (' + res.status + ')');
  const data = await res.json();
  return (data.content || []).map(b => b.text || '').join('\n').trim();
}

async function callClaudeWithKey(prompt, apiKey, maxTokens) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Claude API failed (' + res.status + '): ' + txt.slice(0, 200));
  }
  const data = await res.json();
  return (data.content || []).map(b => b.text || '').join('\n').trim();
}

async function callOpenAI(prompt, apiKey, maxTokens) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('OpenAI API failed (' + res.status + '): ' + txt.slice(0, 200));
  }
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

/* Image upload (Pro) — uses Claude's vision API to extract IULMS-formatted
   text from a screenshot of the course list page. */
async function extractCoursesFromImage(file) {
  const base64 = await fileToBase64(file);
  const mediaType = file.type;
  const s = state.aiSettings;
  const useUserKey = s.provider === 'claude' && s.apiKey;

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
        {
          type: 'text',
          text: `Extract the course list from this image and output it in tab-separated IULMS format.

For each course, output one line with tab-separated fields:
code<tab>prerequisite<tab>credit_hours<tab>course_name<tab>grade_or_to_be_taken<tab>status

Status must be one of: "Already cleared", "In Progress", "Course not Offered", "Pre Requisite not cleared", "Refer below for Electives".

If you see semester groupings, include them as separate lines like "Semester - 1", "Semester - 2", etc.
If you see an electives section, include "Electives" as a header line.

Only output the tab-separated lines, no explanation, no markdown.`
        }
      ]
    }]
  };

  const headers = { 'Content-Type': 'application/json' };
  if (useUserKey) {
    headers['x-api-key'] = s.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers, body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error('Image analysis failed (' + res.status + '): ' + txt.slice(0, 200));
  }
  const data = await res.json();
  return (data.content || []).map(b => b.text || '').join('\n').trim();
}

/* Build a FULL context string describing every piece of the student's data.
   This is what makes the AI "know everything" — it now sees the transcript,
   attendance, schedule, midterms, exams and the full course list, not just a
   tiny summary. Kept reasonably compact so it fits in the prompt. */
function buildContext() {
  const stats = state.courses.length ? computeStats(state.courses) : null;
  const tStats = computeTranscriptStats(state.transcript);
  const items = planItems(state.courses);

  const planText = items.length === 0 ? '(no planned courses)' :
    state.courses.filter(c => c.planned).map(c => {
      const days = c.sessions.map(s => DAYS.find(d => d.key === s.day).full + ' ' + s.start + '-' + s.end).join('; ');
      return `${c.code} ${c.name} (${c.credits}cr, ${c.difficulty}): ${days}`;
    }).join('\n');

  /* Full course list grouped by status (codes + names). */
  const courseList = state.courses.length
    ? state.courses.map(c => `${c.code} ${c.name} [${c.status}${c.grade ? ', ' + c.grade : ''}${c.semester ? ', sem ' + c.semester : ''}]`).join('\n')
    : '(no course list imported)';

  /* Transcript records. */
  const transcriptText = (state.transcript && state.transcript.length)
    ? state.transcript.map(t => `${t.code} ${t.title}: ${t.grade} (${t.credits}cr, ${t.points}pt)`).join('\n')
    : '(no transcript imported)';

  /* Attendance. */
  const attendanceText = (state.attendance && state.attendance.length)
    ? state.attendance.map(a => {
        const total = a.totalSessions || (a.present + a.absent);
        const pct = total ? Math.round((a.present / total) * 100) : 0;
        return `${a.course}: ${a.present}/${total} present (${pct}%)`;
      }).join('\n')
    : '(no attendance imported)';

  /* Weekly schedule. */
  const scheduleText = (state.currentSchedule && state.currentSchedule.length)
    ? state.currentSchedule.map(s => {
        const day = (DAYS.find(d => d.key === s.day) || {}).full || s.day;
        return `${day}: ${s.courseTitle || '—'} ${s.startTime || ''}-${s.endTime || ''} ${s.location ? '(' + s.location + ')' : ''}`;
      }).join('\n')
    : '(no schedule imported)';

  /* Midterm results. */
  const midtermText = (state.midterms && state.midterms.length)
    ? state.midterms.map(m => `${m.code || m.name}: ${m.obtained != null ? m.obtained + '/' + m.total : 'n/a'}${m.quizzes != null ? ', quiz ' + m.quizzes : ''}${m.project != null ? ', project ' + m.project : ''}`).join('\n')
    : '(no midterm results imported)';

  /* Exam schedule. */
  const examText = (state.examSchedule && state.examSchedule.length)
    ? state.examSchedule.map(e => `${e.code} ${e.name || ''}: ${e.date || 'TBA'} ${e.time || ''} ${e.venue || ''}`).join('\n')
    : '(no exam schedule imported)';

  return `STUDENT PROFILE (Iqra University, BS Software Engineering)
Name: ${(state.profile && state.profile.name) || 'Unknown'}
Official CGPA: ${state.transcriptGPA != null ? state.transcriptGPA : (tStats ? tStats.cgpa : 'N/A')}
${stats ? `Credits completed: ${stats.completedCredits}/${TOTAL_CREDITS} (${stats.pctComplete}%)
Credits in progress: ${stats.inProgressCredits} · remaining: ${stats.remainingCredits}
Computed GPA: ${stats.gpa || 'N/A'} · Electives: ${stats.electivesCompleted}/5` : ''}

=== FULL COURSE LIST ===
${courseList}

=== TRANSCRIPT ===
${transcriptText}

=== ATTENDANCE ===
${attendanceText}

=== WEEKLY SCHEDULE ===
${scheduleText}

=== MIDTERM RESULTS ===
${midtermText}

=== EXAM SCHEDULE ===
${examText}

=== PLANNED COURSES (current semester) ===
${planText}

=== COURSE KNOWLEDGE BASE (program reference) ===
${typeof libraryDigest === 'function' ? libraryDigest() : ''}`;
}

/* ── Data-aware Q&A chat ──
   Lets the student ASK anything about their own data or coursework. The full
   context above is supplied so answers are grounded in the student's actual
   records and the program syllabus. */
async function askAIQuestion(question) {
  if (state.aiChat.loading) return;
  state.aiChat.loading = true;
  state.aiChat.error = null;
  state.aiChat.messages.push({ role: 'user', text: question });
  render();
  try {
    const ctx = buildContext();
    const history = state.aiChat.messages.slice(-6)
      .map(m => `${m.role === 'user' ? 'Student' : 'Advisor'}: ${m.text}`).join('\n');
    const prompt = `You are the academic advisor inside IUSemPlanner.ai for a BS Software Engineering student at Iqra University. Answer the student's question using ONLY the data and knowledge base below. Be specific — cite actual course codes, grades, attendance %, dates. If the answer isn't in the data, say so plainly. If it's a study/course question, use the COURSE KNOWLEDGE BASE. Keep answers concise and friendly. Plain text, no markdown.

${ctx}

Recent conversation:
${history}

Answer the latest student question clearly.`;
    const answer = await callAI(prompt);
    state.aiChat.messages.push({ role: 'assistant', text: answer });
  } catch (e) {
    state.aiChat.error = e.message || 'Failed to get an answer.';
    /* drop the optimistic user echo error tail; keep their question visible */
  } finally {
    state.aiChat.loading = false;
    render();
  }
}

async function generateAISummary() {
  if (state.ai.loadingSummary) return;
  state.ai.loadingSummary = true;
  state.ai.errorSummary = null;
  render();
  try {
    const ctx = buildContext();
    const items = planItems(state.courses);
    const score = balanceScore(items);
    const prompt = `You are a university advisor for a BS Software Engineering student at Iqra University. Write a 3-4 sentence personalized summary of their academic progress AND current semester plan. Be specific (mention actual course codes, days). Mention strengths AND issues. Friendly, direct tone like an upperclassman. Plain text only.

${ctx}
${score ? `\nSchedule health: balance ${score.score}/100, ${score.conflicts} conflicts, ${fmtDur(score.totalGapMin)} dead time.` : ''}`;
    state.ai.summary = await callAI(prompt);
  } catch (e) {
    state.ai.errorSummary = e.message || 'Failed to fetch AI summary.';
  } finally {
    state.ai.loadingSummary = false;
    render();
  }
}

async function generateAIRecommendations() {
  if (state.ai.loadingRecs) return;
  state.ai.loadingRecs = true;
  state.ai.errorRecs = null;
  render();
  try {
    const ctx = buildContext();
    const stats = computeStats(state.courses);
    const items = planItems(state.courses);
    const score = balanceScore(items);
    const eligible = state.courses
      .filter(c => c.status !== 'completed' && c.status !== 'locked' && !c.planned && prereqMet(c, stats.completedSet))
      .slice(0, 15)
      .map(c => c.code + ' ' + c.name).join(', ') || 'none';
    const prompt = `You are a university advisor. Give 4-6 SPECIFIC, ACTIONABLE recommendations. Cover both academic planning (which courses to take, electives) and schedule optimization (gaps, conflicts, load). Reference actual course codes. Numbered list (1. 2. 3.). Plain text.

${ctx}

Courses they could take but haven't planned: ${eligible}
${score ? `\nSchedule: ${score.conflicts} conflicts, ${score.traps} traps, ${fmtDur(score.totalGapMin)} dead time, balance ${score.score}/100.` : ''}`;
    state.ai.recommendations = await callAI(prompt);
  } catch (e) {
    state.ai.errorRecs = e.message || 'Failed to fetch recommendations.';
  } finally {
    state.ai.loadingRecs = false;
    render();
  }
}
