# CourseMap

Smart university course scheduler that imports IULMS data, tracks degree progress, and plans optimal semester schedules.

## How to run

Just open `index.html` in any modern browser. No build step, no server, no install.

If you want to test AI features without entering an API key, run it through a local server (any will do):

```
python3 -m http.server 8000
```

Then open http://localhost:8000

## Project structure

```
coursemap/
├── index.html         Entry point
├── styles.css         All styling
├── README.md          You are here
└── js/
    ├── constants.js   Days, grades, icons, sample data
    ├── parser.js      IULMS text parser + file readers
    ├── analytics.js   Stats, conflicts, recommendations
    ├── ai.js          AI provider abstraction (Claude / OpenAI)
    ├── views.js       UI rendering functions
    └── app.js         State management + event handlers
```

## Features

**Free tier**
- Paste IULMS text or upload `.txt` file
- Auto-parse semesters, grades, prerequisites, credit hours
- Progress dashboard with GPA and credit completion
- Course catalog with status filters
- Semester planner with live conflict detection
- Smart rule-based recommendations

**Pro tier**
- Everything in Free, plus:
- Image upload (PNG / JPG) → AI vision extracts courses
- AI-generated progress summary
- AI course recommendations
- Bring your own API key (Claude or OpenAI)

## Tech

Pure HTML / CSS / JavaScript — no React, no build tools, no dependencies.

- Single state object, re-render on change
- Event delegation (one click listener)
- AI integration via fetch to Claude / OpenAI APIs
- Parser uses regex on tab-separated IULMS text

## Viva talking points

- **Why no framework?** Vanilla JS keeps the project explainable line-by-line and removes build complexity.
- **State management:** One `state` object holds everything. Any change calls `render()` which rebuilds the DOM from state.
- **The parser** uses tab-splitting plus regex to handle the IULMS format, including multi-line entries (where prerequisite cells wrap).
- **Balance score** uses a penalty-based 0-100 scale considering conflicts, gaps, overloaded days, morning-evening traps, and lunch breaks.
- **AI calls** route through one `callAI()` function that detects which provider to use based on user settings.

## Privacy

Everything runs in your browser. No data leaves the page except AI requests (which only happen if you trigger them).
