/* ============================================================================
   SUPER-BOOKMARKLET  v2.2
   ----------------------------------------------------------------------------
   Runs ON the IULMS page (iulms.edu.pk) where the student is already logged in.
   It silently fetches every relevant page in the background and bundles the
   data into one payload, then redirects to IUSemPlanner with the data in the
   URL hash.

   IMPORTANT FIX (v2.2):
     • Courses + profile are now read from the Registration / Curriculum page
       directly (fetched in the background) instead of "the current page", so
       the bookmark works no matter which IULMS page you click it on.
     • The TRANSCRIPT is now pulled from the data service that the Transcript
       page itself calls (SICDataService.php → JSON). The old code scraped the
       Transcript HTML, but that page is empty until its own AJAX call runs —
       which is exactly why the transcript never transferred.
     • The weekly SCHEDULE now also captures the class time (it was being lost).

   The scraping helpers below are written as normal functions so they can be
   unit-tested. buildBookmarkletSource() serialises them into the bookmarklet.
   ========================================================================== */

/* ---- pure DOM helpers (serialised into the bookmarklet) ---- */

function _bm_cellText(c) {
  return ((c.innerText || c.textContent || '') + '').replace(/\s+/g, ' ').trim();
}
function _bm_pad(n) {
  n = String(n);
  return n.length < 2 ? '0' + n : n;
}
function _bm_parseTimeRange(text) {
  var out = { startTime: '', endTime: '' };
  if (!text) return out;
  var m = text.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?\s*[\/\-\u2013to]+\s*(\d{1,2})[:.](\d{2})\s*(am|pm)?/i);
  if (!m) return out;
  var h1 = parseInt(m[1], 10), m1 = m[2], a1 = m[3];
  var h2 = parseInt(m[4], 10), m2 = m[5], a2 = m[6];
  if (a1 && a1.toLowerCase() === 'pm' && h1 < 12) h1 += 12;
  if (a1 && a1.toLowerCase() === 'am' && h1 === 12) h1 = 0;
  if (a2 && a2.toLowerCase() === 'pm' && h2 < 12) h2 += 12;
  if (a2 && a2.toLowerCase() === 'am' && h2 === 12) h2 = 0;
  out.startTime = _bm_pad(h1) + ':' + m1;
  out.endTime = _bm_pad(h2) + ':' + m2;
  return out;
}

/* Registration / Curriculum page → { profile, courseListText } */
function _bm_scrapeRegistration(doc) {
  var T = _bm_cellText;
  var profile = { name: null, regNo: null, program: null, creditsRequired: null, creditsCompleted: null, creditsRemaining: null };

  var tds = doc.querySelectorAll('td');
  for (var i = 0; i < tds.length; i++) {
    var label = T(tds[i]).replace(/:\s*$/, '').trim().toLowerCase();
    var val = tds[i + 1] ? T(tds[i + 1]) : '';
    if (label === 'name' && !profile.name) profile.name = val;
    else if ((label === 'reg. number' || label === 'reg number' || label === 'registration number') && !profile.regNo) profile.regNo = val;
    else if (label === 'program' && !profile.program) profile.program = val;
    else if (label === 'credit hours required' && profile.creditsRequired == null) profile.creditsRequired = parseInt(val, 10) || null;
    else if (label === 'credit hours completed' && profile.creditsCompleted == null) profile.creditsCompleted = parseInt(val, 10) || null;
    else if (label === 'credit hours remaining' && profile.creditsRemaining == null) profile.creditsRemaining = parseInt(val, 10) || null;
  }
  if (!profile.name) {
    var li = doc.querySelector('.logininfo a');
    if (li) profile.name = T(li);
  }

  var lines = [];
  var codeRe = /^(ELECT\d|[A-Z]{2,6}[-\s]?\d{2,4}(?:-L)?)$/i;
  var trs = doc.querySelectorAll('tr');
  trs.forEach(function (tr) {
    var anchor = tr.querySelector('a[name]');
    if (anchor) {
      var nm = anchor.getAttribute('name') || '';
      var sm = nm.match(/Semester\s*-\s*\d+/i);
      if (sm) { lines.push(sm[0]); return; }
      if (/^Electives/i.test(nm)) { lines.push('Electives'); return; }
    }
    /* only DIRECT <td> children so we never double-count nested tables */
    var arr = [];
    for (var k = 0; k < tr.children.length; k++) {
      if (tr.children[k].tagName === 'TD') arr.push(T(tr.children[k]));
    }
    if (arr.length < 5) return;
    var ci = -1;
    for (var j = 0; j < arr.length; j++) { if (codeRe.test(arr[j])) { ci = j; break; } }
    if (ci === -1) return;
    var code = arr[ci].toUpperCase();
    var prereq = (arr[ci + 1] || '').trim();
    if (prereq === '' || /^-+$/.test(prereq)) prereq = '-';
    var credits = (arr[ci + 2] || '').trim();
    var name = (arr[ci + 3] || '').trim();
    var grade = (arr[ci + 4] || '').trim();
    var rest = arr.slice(ci + 5).join('\t');
    lines.push([code, prereq, credits, name, grade, rest].join('\t'));
  });

  return { profile: profile, courseListText: lines.join('\n') };
}

/* Schedule.php → [ {day,startTime,endTime,courseTitle,faculty,location,edpCode,courseCode,raw} ] */
function _bm_scrapeSchedule(doc) {
  var T = _bm_cellText;
  var out = [];
  doc.querySelectorAll('tr').forEach(function (tr) {
    var dateCell = null, detCell = null;
    for (var i = 0; i < tr.children.length; i++) {
      var td = tr.children[i];
      if (!td.tagName || td.tagName !== 'TD') continue;
      if ((td.className || '').indexOf('dateStyle') !== -1) dateCell = td;
      if ((td.className || '').indexOf('detailsStyle') !== -1) detCell = td;
    }
    if (!dateCell || !detCell) return;
    var day = '';
    var ds = dateCell.querySelector('.dayStyle');
    if (ds) day = T(ds);
    var times = _bm_parseTimeRange(T(dateCell));
    var raw = T(detCell);
    function grab(re) { var m = raw.match(re); return m ? m[1].trim() : ''; }
    out.push({
      day: day,
      startTime: times.startTime,
      endTime: times.endTime,
      courseTitle: grab(/Course Title\s*:\s*(.*?)\s*(?:Faculty\s*:|Location\s*:|EDP Code\s*:|Course Code\s*:|$)/i),
      faculty: grab(/Faculty\s*:\s*(.*?)\s*(?:Location\s*:|EDP Code\s*:|Course Code\s*:|$)/i),
      location: grab(/Location\s*:\s*(.*?)\s*(?:EDP Code\s*:|Course Code\s*:|$)/i),
      edpCode: grab(/EDP Code\s*:\s*(\d+)/i),
      courseCode: grab(/Course Code\s*:\s*([A-Z]{2,6}[-\s]?\d{2,4}(?:-L)?)/i),
      raw: raw
    });
  });
  return out;
}

/* StudentAttendance.php → [ {course,totalSessions,present,absent} ] */
function _bm_scrapeAttendance(doc) {
  var T = _bm_cellText;
  var out = [];
  doc.querySelectorAll('table.attendance-table tr.attendanceRow').forEach(function (r) {
    var c = r.querySelectorAll('td');
    if (c.length < 4) return;
    out.push({
      course: T(c[0]).replace(/\s*\(\d+\)\s*$/, ''),
      edpCode: (T(c[0]).match(/\((\d+)\)\s*$/) || [, ''])[1],
      totalSessions: parseInt(T(c[1]), 10) || 0,
      present: parseInt(T(c[2]), 10) || 0,
      absent: parseInt(T(c[3]), 10) || 0
    });
  });
  return out;
}

/* ExamResultMid.php → [ {cells:[...]} ] */
function _bm_scrapeMidterms(doc) {
  var T = _bm_cellText;
  var out = [];
  var tables = doc.querySelectorAll('table.tblAttendance');
  if (!tables.length) tables = doc.querySelectorAll('table');
  tables.forEach(function (tbl) {
    tbl.querySelectorAll('tr').forEach(function (tr) {
      if (tr.className && tr.className.indexOf('tableHeaderStyle') !== -1) return;
      var arr = [];
      tr.querySelectorAll('td').forEach(function (td) { arr.push(T(td)); });
      var nonEmpty = arr.filter(function (x) { return x.length > 0; });
      if (nonEmpty.length >= 2 && /[A-Za-z]/.test(arr[0]) && arr.slice(1).some(function (x) { return /^\d+(\.\d+)?$/.test(x); })) {
        out.push({ cells: arr });
      }
    });
  });
  return out;
}

/* examschedule.php → [ {cells:[...]} ]  (often "not available") */
function _bm_scrapeExam(doc) {
  var T = _bm_cellText;
  var bodyText = (doc.body && (doc.body.innerText || doc.body.textContent) || '').toLowerCase();
  if (bodyText.indexOf('not available') !== -1 || bodyText.indexOf('no exam') !== -1) return [];
  var out = [];
  doc.querySelectorAll('table').forEach(function (tbl) {
    tbl.querySelectorAll('tr').forEach(function (tr) {
      if (tr.className && tr.className.indexOf('tableHeaderStyle') !== -1) return;
      var arr = [];
      tr.querySelectorAll('td').forEach(function (td) { arr.push(T(td)); });
      var nonEmpty = arr.filter(function (x) { return x.length > 0; });
      if (nonEmpty.length >= 2) out.push({ cells: arr });
    });
  });
  return out;
}

/* All helpers that must be available inside the bookmarklet runtime. */
var _BM_HELPERS = [
  _bm_cellText, _bm_pad, _bm_parseTimeRange,
  _bm_scrapeRegistration, _bm_scrapeSchedule, _bm_scrapeAttendance,
  _bm_scrapeMidterms, _bm_scrapeExam
];

/* Build the actual javascript: bookmarklet source for a given target URL. */
function buildBookmarkletSource(target) {
  var helpers = _BM_HELPERS.map(function (f) { return f.toString(); }).join('\n');
  return '(async function(){\n'
    + 'var TARGET=' + JSON.stringify(target) + ';\n'
    + helpers + '\n'
    + 'var overlay=null;\n'
    + 'function showOverlay(){overlay=document.createElement("div");overlay.id="iusp-bm-overlay";overlay.style.cssText="position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.55);display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;";overlay.innerHTML="<div style=\\"background:#fff;padding:28px 32px;border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,0.3);text-align:center;min-width:320px;max-width:90%;border:1px solid #e5e7eb;\\"><div style=\\"font-size:11px;font-weight:700;color:#047857;letter-spacing:0.12em;margin-bottom:6px;font-family:ui-monospace,monospace;\\">IUSEMPLANNER.AI</div><div style=\\"font-size:18px;font-weight:700;color:#0a0a0a;margin-bottom:6px;\\">Importing your academic profile</div><div id=\\"iusp-bm-status\\" style=\\"font-size:13px;color:#525252;margin-bottom:18px;min-height:18px;\\">Starting...</div><div style=\\"width:100%;height:6px;background:#f1f5f9;border-radius:999px;overflow:hidden;\\"><div id=\\"iusp-bm-bar\\" style=\\"width:0%;height:100%;background:linear-gradient(90deg,#059669,#34d399);border-radius:999px;transition:width 300ms ease;\\"></div></div><div style=\\"margin-top:14px;font-size:11px;color:#9ca3af;font-family:ui-monospace,monospace;\\">fetching silently - do not close this tab</div></div>";document.body.appendChild(overlay);}\n'
    + 'function setStatus(t,p){var s=document.getElementById("iusp-bm-status"),b=document.getElementById("iusp-bm-bar");if(s)s.textContent=t;if(b)b.style.width=Math.min(100,Math.max(0,p))+"%";}\n'
    + 'function removeOverlay(){if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);}\n'
    + 'function failExit(m){removeOverlay();alert("IUSemPlanner\\n\\n"+m);}\n'
    + 'async function fetchDoc(path){try{var r=await fetch(path,{credentials:"include",cache:"no-store"});if(!r.ok)return null;var h=await r.text();return new DOMParser().parseFromString(h,"text/html");}catch(e){return null;}}\n'
    + 'try{\n'
    + 'showOverlay();\n'
    + 'var payload={version:2,timestamp:Date.now(),sourceUrl:location.href,profile:{name:null},courseListText:"",attendance:[],transcript:[],transcriptGPA:null,schedule:[],scheduleStructured:true,midterms:[],examSchedule:[]};\n'
    /* courses + profile */
    + 'setStatus("Reading your curriculum & courses...",12);\n'
    + 'var regDoc=await fetchDoc("/registration/Registration_FEST_student_EarlyRegistrationBeta.php");\n'
    + 'if(regDoc){var rr=_bm_scrapeRegistration(regDoc);payload.profile=rr.profile;payload.courseListText=rr.courseListText;}\n'
    + 'if(!payload.courseListText){var rr2=_bm_scrapeRegistration(document);if(rr2.courseListText){payload.courseListText=rr2.courseListText;if(!payload.profile||!payload.profile.name)payload.profile=rr2.profile;}}\n'
    /* transcript via data service */
    + 'setStatus("Fetching official transcript & CGPA...",34);\n'
    + 'try{var degreeId=(payload.profile&&payload.profile.program)||"BS(SE)";var tdoc=await fetchDoc("/sic/Transcript.php");if(tdoc){var opt=tdoc.querySelector("#cmbDegree option");if(opt&&opt.value)degreeId=opt.value;}\n'
    + 'var tr=await fetch("/sic/SICDataService.php",{method:"POST",credentials:"include",headers:{"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","X-Requested-With":"XMLHttpRequest"},body:"action=GetTranscript&degreeId="+encodeURIComponent(degreeId)});\n'
    + 'if(tr.ok){var data=null;try{data=await tr.json();}catch(e){try{data=JSON.parse(await tr.text());}catch(e2){}}\n'
    + 'if(data&&data.attemptedCourses){data.attemptedCourses.forEach(function(c){payload.transcript.push({code:(c.crsCode||"").toUpperCase(),title:c.crsTitle||"",credits:parseFloat(c.crsHours)||0,grade:(c.crsGrade||"").toUpperCase(),points:parseFloat(c.gpa)||0,semNo:c.semNo});});if(data.cgpa!=null)payload.transcriptGPA=parseFloat(data.cgpa);}}}catch(e){}\n'
    /* attendance */
    + 'setStatus("Fetching attendance...",54);\n'
    + 'var aDoc=await fetchDoc("/sic/StudentAttendance.php");if(aDoc)payload.attendance=_bm_scrapeAttendance(aDoc);\n'
    /* schedule */
    + 'setStatus("Fetching weekly schedule...",68);\n'
    + 'var sDoc=await fetchDoc("/sic/Schedule.php");if(sDoc)payload.schedule=_bm_scrapeSchedule(sDoc);\n'
    /* midterms */
    + 'setStatus("Fetching midterm results...",82);\n'
    + 'var mDoc=await fetchDoc("/sic/ExamResultMid.php");if(mDoc)payload.midterms=_bm_scrapeMidterms(mDoc);\n'
    /* exam schedule */
    + 'setStatus("Checking exam schedule...",92);\n'
    + 'var eDoc=await fetchDoc("/sic/examschedule.php");if(eDoc)payload.examSchedule=_bm_scrapeExam(eDoc);\n'
    /* encode + redirect */
    + 'setStatus("Done - redirecting...",100);\n'
    + 'if(!payload.courseListText&&payload.transcript.length===0){failExit("Could not read your data. Please make sure you are logged in to IULMS, then click the bookmark again.");return;}\n'
    + 'var json=JSON.stringify(payload);var encoded=btoa(unescape(encodeURIComponent(json)));var url=TARGET+"#import="+encoded;\n'
    + 'setTimeout(function(){removeOverlay();var w=window.open(url,"_blank");if(!w||w.closed||typeof w.closed==="undefined"){window.location.href=url;}},300);\n'
    + '}catch(err){removeOverlay();alert("IUSemPlanner error:\\n"+(err&&err.message?err.message:err)+"\\n\\nMake sure you are logged in to IULMS and try again.");}\n'
    + '})();';
}

var BOOKMARKLET_TARGET = (typeof window !== 'undefined' && window.location)
  ? (window.location.origin + window.location.pathname)
  : 'https://ctrlaltimran.com/IUSemPlanner/';

var BOOKMARKLET_SOURCE = buildBookmarkletSource(BOOKMARKLET_TARGET);

function buildBookmarkletURL() {
  return 'javascript:' + encodeURIComponent(BOOKMARKLET_SOURCE.trim());
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (typeof window !== 'undefined' && window.innerWidth < 768);
}

/* Allow Node-based unit testing of the scraper helpers. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _bm_cellText, _bm_pad, _bm_parseTimeRange,
    _bm_scrapeRegistration, _bm_scrapeSchedule, _bm_scrapeAttendance,
    _bm_scrapeMidterms, _bm_scrapeExam, buildBookmarkletSource
  };
}
