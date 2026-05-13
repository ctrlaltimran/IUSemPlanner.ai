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
    const end   = String(h2).padStart(2, '0') + ':' + m2;

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
    if (line.includes('Already cleared'))                  status = 'completed';
    else if (line.includes('In Progress'))                 status = 'inProgress';
    else if (line.includes('Pre Requisite not cleared'))   status = 'locked';
    else if (line.includes('Refer below for Electives'))   status = 'elective';
    else if (line.includes('Course not Offered'))          status = 'notOffered';
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

/* ── Bookmarklet JSON parser ──
   Converts the JSON payload from the bookmarklet (which captures IULMS tables)
   into the same tab-separated format that parseIULMS() understands. */

function parseIULMSBookmarkData(payload) {
  let decoded;
  // Try base64 decode first; fallback to using payload as-is
  try {
    if (/^[A-Za-z0-9+/=]+$/.test(payload.trim())) {
      decoded = decodeURIComponent(escape(atob(payload)));
    } else {
      decoded = payload;
    }
  } catch (e) {
    throw new Error('Bookmark data could not be decoded.');
  }

  // Format A: plain IULMS-style text (from latest bookmarklet)
  // Detect by checking for "Semester - N" header anywhere in decoded text
  if (/^\s*Semester\s*-\s*\d/im.test(decoded)) {
    const courses = parseIULMS(decoded);
    if (courses.length === 0) {
      throw new Error('No courses found in bookmark data.');
    }
    return courses;
  }

  // Format B: legacy JSON dump (kept for backwards compatibility)
  let data;
  try {
    data = JSON.parse(decoded);
  } catch (e) {
    throw new Error('Bookmark data is corrupted or not in the expected format.');
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Bookmark data is empty.');
  }

  // Group by table index
  const tables = {};
  for (const row of data) {
    if (row.table == null) continue;
    if (!tables[row.table]) tables[row.table] = [];
    tables[row.table][row.row] = row.cells || [];
  }

  // Build IULMS-style text by walking semester tables
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

    // The IULMS semester table contains ONE big row whose cells[0] holds the
    // entire tab-separated course list. If we find that, use it and stop —
    // otherwise subsequent rows would re-introduce the same courses as duplicates.
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

    // Fallback: no blob found, join individual cell rows.
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

  // IULMS uses <br> tags inside course rows when a prerequisite is present,
  // which innerText converts to '\n'. This creates spurious newlines that
  // break the row in two. Heal these: if a line break is followed by tab+digit
  // (the credit hours column), merge it back into the previous line.
  text = text.replace(/\n\t(\d+)\t/g, '\t$1\t');

  return parseIULMS(text);
}
