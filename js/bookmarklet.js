/* BOOKMARKLET
   Generates the javascript: URL that users save as a bookmark.
   When clicked on the IULMS page, it scrapes course data, builds a compact
   IULMS-style text payload, and redirects to IUSemPlanner.ai. */

const BOOKMARKLET_TARGET = 'https://ctrlaltimran.com/IUSemPlanner/';

// Source kept readable here. It runs INSIDE the IULMS page so it must be
// self-contained — no references to our app code.
const BOOKMARKLET_SOURCE = `(function(){
  try {
    var TARGET = '${BOOKMARKLET_TARGET}';
    var tables = document.querySelectorAll('table');
    if (!tables || tables.length === 0) {
      alert('IUSemPlanner\\n\\nNo course tables found.\\n\\nOpen your IULMS Student Information Center (SIC) course list page, then click this bookmark.');
      return;
    }
    var lines = [];
    tables.forEach(function(table) {
      var rows = table.querySelectorAll(':scope > tbody > tr, :scope > tr');
      if (rows.length === 0) return;
      var firstText = (rows[0].innerText || rows[0].textContent || '').trim();
      var semMatch = firstText.match(/^Semester\\s*-\\s*\\d+/i);
      var elecMatch = firstText.match(/^Electives/i);
      if (!semMatch && !elecMatch) return;
      lines.push(semMatch ? semMatch[0] : 'Electives');
      for (var i = 1; i < rows.length; i++) {
        var rowText = (rows[i].innerText || rows[i].textContent || '').trim();
        if (!rowText) continue;
        // Heal IULMS <br> tags that split a single course row in two
        rowText = rowText.replace(/\\n\\t?(\\d+)\\t/g, '\\t$1\\t');
        rowText = rowText.replace(/\\n([A-Z]{2,5}[-\\s]?\\d{2,4}(?:-L)?\\t)/g, '\\n$1');
        var parts = rowText.split('\\n');
        for (var j = 0; j < parts.length; j++) {
          var p = parts[j].trim();
          if (p) lines.push(p);
        }
      }
    });
    if (lines.length === 0) {
      alert('IUSemPlanner\\n\\nNo IULMS semester data found on this page.\\n\\nMake sure you are on the SIC course list page (with all 8 semesters visible).');
      return;
    }
    var text = lines.join('\\n');
    var encoded = btoa(unescape(encodeURIComponent(text)));
    var url = TARGET + '?import=' + encoded;
    var win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      if (confirm('IUSemPlanner: Pop-up blocked.\\n\\nRedirect this tab instead?')) {
        window.location.href = url;
      }
    }
  } catch (err) {
    alert('IUSemPlanner error:\\n' + err.message + '\\n\\nMake sure you are on the IULMS course list page.');
  }
})();`;

function buildBookmarkletURL() {
  let code = BOOKMARKLET_SOURCE
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();,])\s*/g, '$1')
    .trim();
  return 'javascript:' + encodeURIComponent(code);
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || (typeof window !== 'undefined' && window.innerWidth < 768);
}
