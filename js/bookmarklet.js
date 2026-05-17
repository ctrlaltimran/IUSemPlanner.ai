/* SUPER-BOOKMARKLET v2.0
   Silently scrapes the entire IULMS student profile in the background:
     1. User name (from sic.php — current page)
     2. Course list (from sic.php — current page tables)
     3. Attendance (sic/StudentAttendance.php)
     4. Transcript (sic/Transcript.php)
     5. Weekly schedule (sic/Schedule.php)
     6. Midterm results (sic/ExamResultMid.php)
     7. Exam schedule (sic/examschedule.php) — optional, may not exist

   Bundles everything into a single JSON payload, Base64-encodes it,
   and redirects to https://ctrlaltimran.com/IUSemPlanner/#import=[PAYLOAD].

   CRITICAL: BOOKMARKLET_SOURCE below must contain NO `//` line comments —
   they would survive URL-encoding and swallow the rest of the code. Use
   only block comments inside the bookmarklet body. */

const BOOKMARKLET_TARGET = 'https://ctrlaltimran.com/IUSemPlanner/';

const BOOKMARKLET_SOURCE = `(async function(){
  var TARGET = '${BOOKMARKLET_TARGET}';
  var overlay = null;

  function showOverlay(){
    overlay = document.createElement('div');
    overlay.id = 'iusp-bm-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;';
    overlay.innerHTML = '<div style="background:#fff;padding:28px 32px;border-radius:16px;box-shadow:0 24px 64px rgba(0,0,0,0.3);text-align:center;min-width:340px;max-width:90%;border:1px solid #e5e7eb;"><div style="font-size:11px;font-weight:700;color:#059669;letter-spacing:0.12em;margin-bottom:6px;font-family:ui-monospace,SFMono-Regular,monospace;">IUSEMPLANNER.AI \u00b7 v2.0</div><div style="font-size:18px;font-weight:700;color:#0a0a0a;margin-bottom:6px;">Extracting your academic profile</div><div id="iusp-bm-status" style="font-size:13px;color:#525252;margin-bottom:18px;min-height:18px;">Initializing\u2026</div><div style="width:100%;height:6px;background:#f1f5f9;border-radius:999px;overflow:hidden;"><div id="iusp-bm-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#059669,#10b981);border-radius:999px;transition:width 300ms ease;"></div></div><div id="iusp-bm-sub" style="margin-top:14px;font-size:11px;color:#9ca3af;font-family:ui-monospace,SFMono-Regular,monospace;letter-spacing:0.04em;">// fetching silently \u2014 do not close this tab</div></div>';
    document.body.appendChild(overlay);
  }
  function setStatus(text, pct){
    var s = document.getElementById('iusp-bm-status');
    var b = document.getElementById('iusp-bm-bar');
    if(s) s.textContent = text;
    if(b) b.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }
  function removeOverlay(){
    if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }
  function failExit(msg){
    removeOverlay();
    alert('IUSemPlanner\\n\\n' + msg + '\\n\\nMake sure you are on the IULMS Student Information Center (SIC) Dashboard \u2014 the page at sic.php that lists all 8 semesters.');
  }

  try {
    showOverlay();

    /* Verify we are on the SIC dashboard. */
    var onSIC = /sic\\.php/i.test(location.pathname) || document.querySelector('div.logininfo');
    if(!onSIC){
      failExit('This bookmark only works on the Student Information Center page.');
      return;
    }

    var payload = {
      version: 2,
      timestamp: Date.now(),
      sourceUrl: location.href,
      profile: { name: null },
      courseListText: '',
      attendance: [],
      transcript: [],
      schedule: [],
      midterms: [],
      examSchedule: []
    };

    /* === 1. PROFILE (current page) === */
    setStatus('Reading your profile\u2026', 4);
    try {
      var loginInfo = document.querySelector('div.logininfo a, .logininfo a');
      if(loginInfo){
        payload.profile.name = (loginInfo.textContent || '').trim();
      } else {
        var anyLogin = document.querySelector('.logininfo');
        if(anyLogin){
          payload.profile.name = (anyLogin.textContent || '').trim().split('\\n')[0].trim();
        }
      }
    } catch(e){}

    /* === 2. COURSE LIST (current page tables) === */
    setStatus('Reading your course list\u2026', 12);
    try {
      var tables = document.querySelectorAll('table');
      var lines = [];
      tables.forEach(function(table){
        var rows = table.querySelectorAll(':scope > tbody > tr, :scope > tr');
        if(rows.length === 0) return;
        var firstText = (rows[0].innerText || rows[0].textContent || '').trim();
        var semMatch = firstText.match(/^Semester\\s*-\\s*\\d+/i);
        var elecMatch = firstText.match(/^Electives/i);
        if(!semMatch && !elecMatch) return;
        lines.push(semMatch ? semMatch[0] : 'Electives');
        for(var i = 1; i < rows.length; i++){
          var rowText = (rows[i].innerText || rows[i].textContent || '').trim();
          if(!rowText) continue;
          rowText = rowText.replace(/\\n\\t?(\\d+)\\t/g, '\\t$1\\t');
          rowText = rowText.replace(/\\n([A-Z]{2,5}[-\\s]?\\d{2,4}(?:-L)?\\t)/g, '\\n$1');
          var parts = rowText.split('\\n');
          for(var j = 0; j < parts.length; j++){
            var p = parts[j].trim();
            if(p) lines.push(p);
          }
        }
      });
      payload.courseListText = lines.join('\\n');
    } catch(e){}

    /* === HELPER: fetch and parse a same-origin page === */
    async function fetchDoc(path){
      try {
        var res = await fetch(path, { credentials: 'include', cache: 'no-store' });
        if(!res.ok) return null;
        var html = await res.text();
        return new DOMParser().parseFromString(html, 'text/html');
      } catch(e){ return null; }
    }
    function cellText(c){
      return ((c.innerText || c.textContent || '') + '').replace(/\\s+/g,' ').trim();
    }

    /* === 3. ATTENDANCE === */
    setStatus('Fetching attendance records\u2026', 28);
    try {
      var doc = await fetchDoc('sic/StudentAttendance.php');
      if(doc){
        var attRows = doc.querySelectorAll('table.attendance-table tr.attendanceRow');
        attRows.forEach(function(r){
          var cells = r.querySelectorAll('td');
          if(cells.length >= 4){
            var total = parseInt(cellText(cells[1]), 10) || 0;
            var present = parseInt(cellText(cells[2]), 10) || 0;
            var absent = parseInt(cellText(cells[3]), 10) || 0;
            payload.attendance.push({
              course: cellText(cells[0]),
              totalSessions: total,
              present: present,
              absent: absent
            });
          }
        });
      }
    } catch(e){}

    /* === 4. TRANSCRIPT === */
    setStatus('Fetching transcript\u2026', 46);
    try {
      var doc = await fetchDoc('sic/Transcript.php');
      if(doc){
        var trRows = doc.querySelectorAll('table.transcript-table tr.transcript-content');
        trRows.forEach(function(r){
          var cells = r.querySelectorAll('td');
          if(cells.length >= 5){
            payload.transcript.push({
              code: cellText(cells[0]),
              title: cellText(cells[1]),
              credits: parseFloat(cellText(cells[2])) || 0,
              grade: cellText(cells[3]),
              points: parseFloat(cellText(cells[4])) || 0
            });
          }
        });
      }
    } catch(e){}

    /* === 5. SCHEDULE === */
    setStatus('Fetching weekly schedule\u2026', 64);
    try {
      var doc = await fetchDoc('sic/Schedule.php');
      if(doc){
        /* The schedule page typically has <tr> rows where one cell contains a
           <span class="dayStyle"> with the day name, and adjacent/parent cells
           with class .detailsStyle contain the course details. */
        var dayCells = doc.querySelectorAll('span.dayStyle, td.dayStyle');
        dayCells.forEach(function(daySpan){
          var dayText = cellText(daySpan);
          if(!dayText) return;
          var row = daySpan.closest('tr');
          if(!row) return;
          var details = row.querySelectorAll('td.detailsStyle');
          if(details.length === 0){
            details = row.querySelectorAll('td');
          }
          details.forEach(function(td){
            var raw = (td.innerText || td.textContent || '').trim();
            if(!raw || raw === dayText) return;
            payload.schedule.push({
              day: dayText,
              raw: raw
            });
          });
        });
        /* Fallback: if no .dayStyle found, try to read a generic schedule table. */
        if(payload.schedule.length === 0){
          var schedTables = doc.querySelectorAll('table');
          schedTables.forEach(function(t){
            var rows = t.querySelectorAll('tr');
            rows.forEach(function(r){
              var cells = r.querySelectorAll('td');
              if(cells.length >= 2){
                var first = cellText(cells[0]);
                if(/^(mon|tue|wed|thu|fri|sat|sun)/i.test(first)){
                  for(var k = 1; k < cells.length; k++){
                    var raw = (cells[k].innerText || cells[k].textContent || '').trim();
                    if(raw) payload.schedule.push({ day: first, raw: raw });
                  }
                }
              }
            });
          });
        }
      }
    } catch(e){}

    /* === 6. MIDTERM RESULTS === */
    setStatus('Fetching midterm results\u2026', 80);
    try {
      var doc = await fetchDoc('sic/ExamResultMid.php');
      if(doc){
        var midTables = doc.querySelectorAll('table.tblAttendance');
        if(midTables.length === 0){
          midTables = doc.querySelectorAll('table');
        }
        midTables.forEach(function(t){
          var rows = t.querySelectorAll('tr');
          rows.forEach(function(r){
            if(r.classList && r.classList.contains('tableHeaderStyle')) return;
            var cells = r.querySelectorAll('td');
            if(cells.length === 0) return;
            var cellArr = [];
            cells.forEach(function(c){ cellArr.push(cellText(c)); });
            var nonEmpty = cellArr.filter(function(x){ return x.length > 0; });
            if(nonEmpty.length >= 2){
              payload.midterms.push({ cells: cellArr });
            }
          });
        });
      }
    } catch(e){}

    /* === 7. EXAM SCHEDULE (optional, may not exist) === */
    setStatus('Checking exam schedule\u2026', 92);
    try {
      var doc = await fetchDoc('sic/examschedule.php');
      if(doc){
        var bodyText = (doc.body && (doc.body.innerText || doc.body.textContent) || '').toLowerCase();
        var notAvail = bodyText.indexOf('not available') !== -1 || bodyText.indexOf('no exam') !== -1;
        if(!notAvail){
          var examTables = doc.querySelectorAll('table');
          examTables.forEach(function(t){
            var rows = t.querySelectorAll('tr');
            rows.forEach(function(r){
              if(r.classList && r.classList.contains('tableHeaderStyle')) return;
              var cells = r.querySelectorAll('td');
              if(cells.length >= 2){
                var cellArr = [];
                cells.forEach(function(c){ cellArr.push(cellText(c)); });
                var nonEmpty = cellArr.filter(function(x){ return x.length > 0; });
                if(nonEmpty.length >= 2){
                  payload.examSchedule.push({ cells: cellArr });
                }
              }
            });
          });
        }
      }
    } catch(e){
      /* Graceful \u2014 exam schedule is allowed to fail entirely. */
    }

    /* === ENCODE AND REDIRECT === */
    setStatus('Encoding and redirecting\u2026', 100);

    if(!payload.courseListText && payload.transcript.length === 0){
      failExit('Could not find any course data on this page. Make sure your course list and grades are visible before clicking the bookmark.');
      return;
    }

    var json = JSON.stringify(payload);
    var encoded = btoa(unescape(encodeURIComponent(json)));
    var url = TARGET + '#import=' + encoded;

    setTimeout(function(){
      removeOverlay();
      var win = window.open(url, '_blank');
      if(!win || win.closed || typeof win.closed === 'undefined'){
        if(confirm('IUSemPlanner: Pop-up blocked.\\n\\nRedirect this tab instead?')){
          window.location.href = url;
        }
      }
    }, 350);

  } catch(err){
    removeOverlay();
    alert('IUSemPlanner error:\\n' + (err && err.message ? err.message : err) + '\\n\\nMake sure you are on the IULMS Student Information Center (SIC) Dashboard.');
  }
})();`;

function buildBookmarkletURL() {
  /* No aggressive minification — encodeURIComponent safely handles whitespace. */
  let code = BOOKMARKLET_SOURCE.trim();
  return 'javascript:' + encodeURIComponent(code);
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (typeof window !== 'undefined' && window.innerWidth < 768);
}
