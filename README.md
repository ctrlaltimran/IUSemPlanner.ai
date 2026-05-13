# IUSemPlanner.ai

Smart semester planner for **Iqra University** students. Imports your IULMS data with one click, tracks GPA, detects schedule clashes, and gives AI-powered recommendations.

Live at: **https://ctrlaltimran.com/IUSemPlanner/**

## How to import your IULMS data

**Method 1 — Bookmark (recommended)**
1. Open IUSemPlanner.ai → click "Import courses" → "Bookmark" tab
2. Drag the green "Import from IULMS" button to your bookmarks bar
3. Go to your IULMS Student Information Center → click the bookmark
4. Your courses load automatically

**Method 2 — Paste text**
Copy your IULMS course page text → paste into the textarea → click Import

**Method 3 — Upload file**
Save the IULMS page as `.txt` → upload

**Method 4 — Image upload (Pro)**
Screenshot the page → AI vision extracts the data

## Tech

Pure HTML / CSS / vanilla JS — no build, no dependencies.

- `index.html` — entry point, SEO meta, structured data
- `styles.css` — all styling
- `js/constants.js` — icons, days, grades, sample data
- `js/parser.js` — IULMS text + bookmark JSON parser
- `js/bookmarklet.js` — bookmarklet source + URL builder
- `js/analytics.js` — stats, conflicts, recommendations
- `js/ai.js` — Claude / OpenAI provider abstraction
- `js/views.js` — UI rendering
- `js/app.js` — state and event handling

## How the bookmarklet works

When you save the bookmark, you're saving a tiny JavaScript snippet. When clicked while on the IULMS page:

1. It reads all `<table>` elements on the page
2. Extracts only semester tables (Semester - 1, Semester - 2, ..., Electives)
3. Builds compact tab-separated text
4. Base64-encodes it (~10KB typical)
5. Opens IUSemPlanner.ai with the data in the URL

Your IULMS credentials never touch our site. The bookmark only reads visible page data.

## Built by

Imran Murtaza ([ctrlaltimran.com](https://ctrlaltimran.com)) — Software Engineering student at Iqra University.
