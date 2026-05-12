/* AI PROVIDER ABSTRACTION
   Routes AI requests through Claude, OpenAI, or the demo built-in key
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

function buildContext() {
  const stats = computeStats(state.courses);
  const items = planItems(state.courses);
  const planText = items.length === 0 ? '(no planned courses)' :
    state.courses.filter(c => c.planned).map(c => {
      const days = c.sessions.map(s => DAYS.find(d => d.key === s.day).full + ' ' + s.start + '-' + s.end).join('; ');
      return `${c.code} ${c.name} (${c.credits}cr, ${c.difficulty}): ${days}`;
    }).join('\n');

  return `Student profile (Iqra University, BS Software Engineering):
- Credits completed: ${stats.completedCredits}/${TOTAL_CREDITS} (${stats.pctComplete}%)
- Credits in progress: ${stats.inProgressCredits}
- Credits remaining: ${stats.remainingCredits}
- Current GPA: ${stats.gpa || 'N/A'}
- Electives completed: ${stats.electivesCompleted}/5

Planned courses for current semester:
${planText}`;
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
