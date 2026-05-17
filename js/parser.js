/* IULMS TEXT PARSER
   Reads pasted course list from Iqra University LMS and extracts
   structured course objects: code, name, prereq, credits, grade, status,
   semester, and (when registration is open) class sessions. */

function hasStatusKeyword(line) {
  return STATUS_KEYWORDS.some(k => line.includes(k));
}

/* Extract day/time sessions from a free-form timetable string.
   Handles formats like "MWF 9:00-10:30", "Mon Wed 14:00-15:30", "Tuesday 10:00 AM - 11:30 AM".
   Returns an array of {day, start, end} sessions. */
function parseScheduleString(text) {
  if (!text) return [];
  if (STATUS_KEYWORDS.some(k => text.includes(k))) return [];

  const sessions = [];
  const timeRe = /(\d{1,2})[:.](\d{2})\s*(am|pm)?\s*[-–to]+\s*(\d{1,2})[:.](\d{2})\s*(am|pm)?/gi;
  let match;
  while ((match = timeRe.exec(text)) !== null) {
    let h1 = parseInt(match[1]), m1 = match[2], ap1 = match[3];
    let h2 = parseInt(match[4]), m2 = match[5], ap2 = match[6];
    if (ap1 && ap1.toLowerCase() === 'pm' && h1 < 12) h1 += 12;
    if (ap2 && ap2.toLowerCase() === 'pm' && h2 < 12) h2 += 12;
    if (ap1 && ap1.toLowerCase() === 'am' && h1 === 12) h1 = 0;
    const start = String(h1).padStart(2, '0') + ':' + m1;
    const end = String(h2).padStart(2, '0') + ':' + m2;

    // Look at the text near this time for day codes
    const segStart = Math.max(0, match.index - 40);
    const segEnd = Math.min(text.length, match.index + match[0].length + 20);
    const segment = text.substring(segStart, segEnd);
    const days = extractDays(segment);
    for (const d of days) sessions.push({ day: d, start, end });
  }
  return sessions;
}

function extractDays(text) {
  const days = [];
  const lower = text.toLowerCase();
  const longWords = lower.match(/\b(monday|tuesday|wednesday|thursday|friday|mon|tue|wed|thu|fri|tues|thurs)\b/g);
  if (longWords) {
    for (const w of longWords) {
      if (DAY_NAME_MAP[w] && !days.includes(DAY_NAME_MAP[w])) days.push(DAY_NAME_MAP[w]);
    }
    return days;
  }
  const mwfMatch = text.match(/\b([MTWRFmtwrf]{2,5})\b/);
  if (mwfMatch) {
    const code = mwfMatch[1].toUpperCase();
    const charMap = { M: 'mon', T: 'tue', W: 'wed', R: 'thu', F: 'fri' };
    for (const ch of code) {
      if (charMap[ch] && !days.includes(charMap[ch])) days.push(charMap[ch]);
    }
  }
  return days;
}

function parseIULMS(text) {
  const raw = text.split('\n').map(l => l.replace(/\t+/g, '\t').trim()).filter(Boolean);

  // Merge wrapped rows (LMS often splits a course across two lines)
  const merged = [];
  let buf = '';
  for (const line of raw) {
    if (/^Code\s+Pre Requisite/i.test(line)) continue;
    if (/^Semester\s*-\s*\d/i.test(line) || /^Electives/i.test(line)) {
      if (buf) { merged.push(buf); buf = ''; }
      merged.push(line);
      continue;
    }
    buf = buf ? buf + ' ' + line : line;
    if (hasStatusKeyword(buf)) {
      merged.push(buf);
      buf = '';
    }
  }
  if (buf) merged.push(buf);

  const courses = [];
  let currentSemester = null;
  let inElectives = false;

  for (const line of merged) {
    const semM = line.match(/^Semester\s*-\s*(\d+)/i);
    if (semM) { currentSemester = parseInt(semM[1]); inElectives = false; continue; }
    if (/^Electives/i.test(line)) { currentSemester = null; inElectives = true; continue; }

    let status = null;
    if (line.includes('Already cleared')) status = 'completed';
    else if (line.includes('In Progress')) status = 'inProgress';
    else if (line.includes('Pre Requisite not cleared')) status = 'locked';
    else if (line.includes('Refer below for Electives')) status = 'elective';
    else if (line.includes('Course not Offered')) status = 'notOffered';
    else continue;

    let tokens = line.split('\t').map(t => t.trim()).filter(t => t !== '');
    if (tokens.length < 4) tokens = line.split(/\s{2,}|\t/).map(t => t.trim()).filter(Boolean);

    let code = '', codeIdx = -1;
    for (let i = 0; i < tokens.length; i++) {
      if (/^(ELECT\d|[A-Z]{2,5}[-\s]?\d{2,4}(?:-L)?)$/i.test(tokens[i])) {
        code = tokens[i].toUpperCase().replace(/\s+/, '-');
        codeIdx = i;
        break;
      }
    }
    if (!code) continue;

    let prereq = '';
    if (codeIdx + 1 < tokens.length) {
      const t = tokens[codeIdx + 1];
      if (t === '-') prereq = '';
      else if (/^[A-Z]{2,5}[-\s]?\d{2,4}(?:-L)?$/i.test(t)) prereq = t.toUpperCase().replace(/\s+/, '-');
    }

    let crIdx = codeIdx + 1, credits = 3;
    while (crIdx < tokens.length && !/^[1-6]$/.test(tokens[crIdx])) crIdx++;
    if (crIdx < tokens.length) credits = parseInt(tokens[crIdx]);

    let nameTokens = [], grade = null, endIdx = tokens.length;
    for (let i = crIdx + 1; i < tokens.length; i++) {
      const t = tokens[i];
      if (GRADES.includes(t.toUpperCase())) { grade = t.toUpperCase(); endIdx = i + 1; break; }
      if (t === 'To be taken') { endIdx = i + 1; break; }
      if (STATUS_KEYWORDS.some(k => t === k || t.startsWith(k))) { endIdx = i; break; }
      nameTokens.push(t);
    }
    const name = nameTokens.join(' ').replace(/\s+/g, ' ').trim() || code;

    // After the status/grade, look for actual schedule info (when registration is open)
    const trailing = tokens.slice(endIdx).join(' ');
    const sessions = parseScheduleString(trailing);

    const isLab = /\(LAB\)/i.test(name) || /-L$/.test(code);
    const isElective = inElectives || /\(DE\)/i.test(name) || /^ELECT\d$/i.test(code);

    courses.push({
      id: 'c' + Date.now() + Math.floor(Math.random() * 10000),
      code, name, prereq, credits,
      grade, status, semester: currentSemester,
      isLab, isElective,
      colorIdx: courses.length % 8,
      difficulty: 'medium',
      sessions,
      planned: false,
    });
  }
  return courses;
}

/* ── File upload helpers ── */

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

/* ── Bookmarklet payload parser (v2) ──
   The super-bookmarklet bundles everything into one JSON payload:
     { version: 2, profile, courseListText, attendance, transcript,
       schedule, midterms, examSchedule }

   For backwards compatibility, we still accept the legacy v1 format
   (plain IULMS text, base64-encoded, no JSON wrapper). */

function parseIULMSBookmarkData(payload) {
  let decoded = payload;

  /* Try base64 decode first. Whitespace is stripped so atob() doesn't crash. */
  try {
    const cleanPayload = payload.replace(/\s+/g, '');
    decoded = decodeURIComponent(escape(atob(cleanPayload)));
  } catch (e) {
    /* Not base64 — assume it's raw text. */
  }

  /* ── Format v2: structured JSON payload ── */
  if (decoded && decoded.trim().startsWith('{')) {
    let json;
    try {
      json = JSON.parse(decoded);
    } catch (e) {
      throw new Error('Bookmark data is corrupted (invalid JSON).');
    }
    if (json && (json.version === 2 || json.courseListText !== undefined)) {
      return parseBookmarkPayloadV2(json);
    }
  }

  /* ── Format v1: plain IULMS-style text ── */
  if (/^\s*Semester\s*-\s*\d/im.test(decoded)) {
    const courses = parseIULMS(decoded);
    if (courses.length === 0) {
      throw new Error('No courses found in bookmark data.');
    }
    return {
      courses,
      profile: null,
      transcript: [],
      attendance: [],
      schedule: [],
      midterms: [],
      examSchedule: [],
    };
  }

  /* ── Format v0: legacy JSON array of {table, row, cells} ── */
  let data;
  try {
    data = JSON.parse(decoded);
  } catch (e) {
    throw new Error('Bookmark data is corrupted or not in the expected format.');
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Bookmark data is empty.');
  }

  const tables = {};
  for (const row of data) {
    if (row.table == null) continue;
    if (!tables[row.table]) tables[row.table] = [];
    tables[row.table][row.row] = row.cells || [];
  }

  let text = '';
  const keys = Object.keys(tables).map(Number).sort((a, b) => a - b);
  let foundSemester = false;

  for (const tk of keys) {
    const tableRows = tables[tk];
    if (!tableRows || tableRows.length === 0) continue;
    const headerCell = (tableRows[0] && tableRows[0][0]) || '';
    const isSemHeader = /^Semester\s*-\s*\d/i.test(headerCell);
    const isElectiveHeader = /^Electives/i.test(headerCell);
    if (!isSemHeader && !isElectiveHeader) continue;

    foundSemester = true;
    text += headerCell + '\n';

    let consumedBlob = false;
    for (let i = 1; i < tableRows.length; i++) {
      const cells = tableRows[i];
      if (!cells || cells.length === 0) continue;
      if (cells[0] && (cells[0].indexOf('\t') !== -1 || cells[0].indexOf('\n') !== -1)) {
        text += cells[0] + '\n';
        consumedBlob = true;
        break;
      }
    }
    if (!consumedBlob) {
      for (let i = 1; i < tableRows.length; i++) {
        const cells = tableRows[i];
        if (!cells || cells.length === 0) continue;
        text += cells.join('\t') + '\n';
      }
    }
  }

  if (!foundSemester) {
    throw new Error('No semester data found. Make sure you clicked the bookmark on the IULMS SIC course page.');
  }

  text = text.replace(/\n\t(\d+)\t/g, '\t$1\t');
  return {
    courses: parseIULMS(text),
    profile: null,
    transcript: [],
    attendance: [],
    schedule: [],
    midterms: [],
    examSchedule: [],
  };
}

/* Parse the v2 payload from the super-bookmarklet. */
function parseBookmarkPayloadV2(p) {
  const courses = p.courseListText ? parseIULMS(p.courseListText) : [];

  /* Enrich schedule entries by extracting structured fields from the raw text. */
  const scheduleRaw = (p.schedule || []).map(s => ({
    day: normalizeDay(s.day),
    rawDay: s.day,
    raw: s.raw,
    ...extractScheduleFields(s.raw),
  })).filter(s => s.day && (s.courseTitle || s.edpCode || s.startTime));

  // Merge fragmented schedule blocks
  const schedule = [];
  let currentBlock = null;

  for (const s of scheduleRaw) {
    if (!currentBlock || currentBlock.day !== s.day) {
      if (currentBlock) schedule.push(currentBlock);
      currentBlock = { ...s };
    } else {
      const isNewCourse = s.courseTitle && currentBlock.courseTitle && s.courseTitle !== currentBlock.courseTitle;
      const isNewTime = s.startTime && currentBlock.startTime && s.startTime !== currentBlock.startTime;
      
      if (isNewCourse || isNewTime) {
        schedule.push(currentBlock);
        currentBlock = { ...s };
      } else {
        if (!currentBlock.courseTitle && s.courseTitle) currentBlock.courseTitle = s.courseTitle;
        if (!currentBlock.faculty && s.faculty) currentBlock.faculty = s.faculty;
        if (!currentBlock.location && s.location) currentBlock.location = s.location;
        if (!currentBlock.edpCode && s.edpCode) currentBlock.edpCode = s.edpCode;
        if (!currentBlock.startTime && s.startTime) currentBlock.startTime = s.startTime;
        if (!currentBlock.endTime && s.endTime) currentBlock.endTime = s.endTime;
        if (s.raw && !currentBlock.raw.includes(s.raw)) currentBlock.raw += '\\n' + s.raw;
      }
    }
  }
  if (currentBlock) schedule.push(currentBlock);

  return {
    courses,
    profile: p.profile || null,
    transcript: p.transcript || [],
    transcriptGPA: p.transcriptGPA || null,
    attendance: p.attendance || [],
    schedule,
    midterms: parseMidterms(p.midterms || []),
    examSchedule: parseExamSchedule(p.examSchedule || []),
  };
}

/* Normalize a day name like "Monday" -> "mon". */
function normalizeDay(name) {
  if (!name) return '';
  const lower = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 9);
  if (DAY_NAME_MAP[lower]) return DAY_NAME_MAP[lower];
  if (lower.startsWith('mon')) return 'mon';
  if (lower.startsWith('tue')) return 'tue';
  if (lower.startsWith('wed')) return 'wed';
  if (lower.startsWith('thu')) return 'thu';
  if (lower.startsWith('fri')) return 'fri';
  if (lower.startsWith('sat')) return 'sat';
  if (lower.startsWith('sun')) return 'sun';
  return '';
}

/* Extract structured fields from a raw schedule cell.
   The IULMS Schedule.php cell typically contains lines like:
     COURSE TITLE
     Faculty Name
     Room / Block
     EDP: 12345
     09:00 AM - 10:30 AM */
function extractScheduleFields(text) {
  const out = { courseTitle: '', faculty: '', location: '', edpCode: '', startTime: '', endTime: '' };
  if (!text) return out;

  const edpMatch = text.match(/EDP[\s#:]*(?:Code\s*:?\s*)?(\d+)/i);
  if (edpMatch) out.edpCode = edpMatch[1];

  const timeRe = /(\d{1,2})[:.](\d{2})\s*(am|pm)?\s*[-–to\/]+\s*(\d{1,2})[:.](\d{2})\s*(am|pm)?/i;
  const tm = text.match(timeRe);
  if (tm) {
    let h1 = parseInt(tm[1], 10), m1 = tm[2], ap1 = tm[3];
    let h2 = parseInt(tm[4], 10), m2 = tm[5], ap2 = tm[6];
    if (ap1 && ap1.toLowerCase() === 'pm' && h1 < 12) h1 += 12;
    if (ap2 && ap2.toLowerCase() === 'pm' && h2 < 12) h2 += 12;
    if (ap1 && ap1.toLowerCase() === 'am' && h1 === 12) h1 = 0;
    if (ap2 && ap2.toLowerCase() === 'am' && h2 === 12) h2 = 0;
    out.startTime = String(h1).padStart(2, '0') + ':' + m1;
    out.endTime = String(h2).padStart(2, '0') + ':' + m2;
  }

  /* Lines are heuristically: course (often uppercase), faculty, location. */
  const lines = text.split(/[\n;]/).map(l => l.trim()).filter(Boolean)
    .filter(l => !timeRe.test(l) && !/^EDP/i.test(l) && !/^Course Code/i.test(l));
    
  lines.forEach(l => {
    if (/^Course Title\s*:/i.test(l)) out.courseTitle = l.replace(/^Course Title\s*:/i, '').trim();
    else if (/^Faculty\s*:/i.test(l)) out.faculty = l.replace(/^Faculty\s*:/i, '').trim();
    else if (/^Location\s*:/i.test(l)) out.location = l.replace(/^Location\s*:/i, '').trim();
  });

  if (!out.courseTitle && lines.length >= 1 && !lines[0].includes(':')) out.courseTitle = lines[0];
  if (!out.faculty && lines.length >= 2 && !lines[1].includes(':')) out.faculty = lines[1];
  if (!out.location && lines.length >= 3 && !lines[2].includes(':')) out.location = lines.slice(2).join(' · ');

  return out;
}

/* Parse midterm result rows. The shape varies, so we try to detect the
   columns: course code, course name, total marks, obtained marks. */
/* Parse midterm result rows. Detects courses by name if code is missing. */
/* Parse midterm result rows. Detects courses by name and extracts all columns. */
function parseMidterms(rows) {
  return rows.map(r => {
    const cells = r.cells || [];
    if (cells.length < 2) return null;

    let code = '', name = '';
    let codeIdx = -1;
    for (let i = 0; i < cells.length; i++) {
      if (/^[A-Z]{2,5}[-\s]?\d{2,4}(?:-L)?$/i.test(cells[i])) { codeIdx = i; break; }
    }

    if (codeIdx !== -1) {
      code = cells[codeIdx].toUpperCase().replace(/\s+/, '-');
      name = (cells[codeIdx + 1] || '').trim();
    } else {
      name = (cells[0] || '').trim();
    }

    // Parse out the exact columns based on IU's table structure
    const midtermRaw = parseFloat(cells[1]);
    const quizRaw = parseFloat(cells[2]);
    const projRaw = parseFloat(cells[3]);

    const obtained = !isNaN(midtermRaw) && midtermRaw >= 0 ? midtermRaw : null;
    const quizzes = !isNaN(quizRaw) && quizRaw >= 0 ? quizRaw : null;
    const project = !isNaN(projRaw) && projRaw >= 0 ? projRaw : null;

    // Calculate percentage based on 20 max marks for midterm
    let pct = null;
    if (obtained !== null) {
      pct = (obtained / 20) * 100;
    }

    return { code, name, total: 20, obtained, quizzes, project, percentage: pct, raw: cells };
  }).filter(Boolean);
}

/* Parse exam schedule rows. Detect course code and date columns. */
function parseExamSchedule(rows) {
  return rows.map(r => {
    const cells = r.cells || [];
    let codeIdx = -1;
    for (let i = 0; i < cells.length; i++) {
      if (/^[A-Z]{2,5}[-\s]?\d{2,4}(?:-L)?$/i.test(cells[i])) { codeIdx = i; break; }
    }
    if (codeIdx === -1) return null;

    const code = cells[codeIdx].toUpperCase().replace(/\s+/, '-');
    const name = cells[codeIdx + 1] || '';

    let date = '', time = '', venue = '';
    for (let i = codeIdx + 2; i < cells.length; i++) {
      const c = cells[i];
      if (!c) continue;
      if (!date && /\d{1,2}[-\/]\w+[-\/]\d{2,4}|\d{4}-\d{2}-\d{2}/.test(c)) { date = c; continue; }
      if (!time && /\d{1,2}:\d{2}/.test(c)) { time = c; continue; }
      if (!venue && c.length > 0) { venue = c; }
    }
    return { code, name, date, time, venue, raw: cells };
  }).filter(Boolean);
}
