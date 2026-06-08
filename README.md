# IUSemPlanner.ai · v2.1

A **predictive student dashboard** for **Iqra University**. One bookmark imports your full IULMS academic profile, then forecasts your end-of-semester CGPA, flags attendance risks, and renders your weekly timetable.

Live at: **https://ctrlaltimran.com/IUSemPlanner/**

## What's new in v2.1

- **Accounts + cloud sync (optional).** Email/password **and Google** sign-in via Supabase. Your data is saved to your account and follows you across devices. If you import from IULMS while logged out, the app keeps that data and saves it to your account the moment you sign in. Setup is one file (`js/config.js`) — see **`SUPABASE_SETUP.md`**. With no keys configured, the app runs exactly as before in guest mode (browser-only).
- **New "Courses" tab — a study knowledge base.** A clean, searchable catalogue of BS(SE) courses. Each card has a title, code, short + detailed description, important topics, study notes, exam-prep points and keywords, grouped by semester (plus electives). Search across codes, titles, topics and keywords.
- **Data-aware AI advisor.** The AI now sees your *entire* dataset (profile, official CGPA, full course list, transcript, attendance, schedule, midterms, exam dates, planned courses) **plus** the course knowledge base, and answers grounded in it. A new chat sits inside the AI tab.
- **Hardened transcript import.** The bookmarklet's transcript scraper now has a robust fallback that scans every table for transcript-shaped rows, so the transcript transfers reliably from IULMS.
- **iOS-style UI polish.** A calmer, more premium home page (same hero image) and dashboard — soft surfaces, gentle gradients, frosted glass and restrained shadows. Delivered via a separate `css/ios.css` layered over the base theme.

## What's new in v2.0

The bookmarklet is no longer a one-table scraper — it's a **silent multi-page fetcher**. With a single click on the IULMS Student Information Center, it pulls:

1. **Your name** (from `sic.php` — current page)
2. **Full course list** (semesters 1–8 + electives, from current page)
3. **Attendance** (from `sic/StudentAttendance.php`)
4. **Transcript** (from `sic/Transcript.php` — for the authoritative CGPA)
5. **Weekly schedule** (from `sic/Schedule.php`)
6. **Midterm results** (from `sic/ExamResultMid.php`)
7. **Exam schedule** (from `sic/examschedule.php` — optional, may not exist)

Everything is bundled into one Base64-encoded JSON payload and posted back to the app in a single redirect.

## New views

- **Dashboard** — greeting, CGPA, attendance health, midterm-based CGPA forecast (pessimistic / expected / optimistic), grade distribution, and an interactive *"what would I need to hit CGPA X?"* slider.
- **Timetable** — auto-built visual weekly grid from your IULMS schedule, with a day-by-day summary card view below.
- **Progress / Courses / Planner / AI Insights** — unchanged from the previous version.

## How to import your IULMS data

1. Open IUSemPlanner.ai → click **Import courses** → **Bookmark** tab
2. Drag the green **Import from IULMS** button to your bookmarks bar
3. Go to **lms.iuk.edu.pk** and log in
4. **Important:** open the **Student Information Center** page (the one at `sic.php` that lists all 8 semesters)
5. Click the bookmark. A loading overlay appears while six pages are scraped silently. You'll be redirected back with everything filled in.

## Tech

Pure HTML / CSS / vanilla JS — no build step, no dependencies.

| File | Role |
| --- | --- |
| `index.html` | entry point, SEO meta, structured data |
| `styles.css` | base styling (light theme, JetBrains Mono + Manrope) |
| `css/ios.css` | v2.1 layer: new components (auth, Courses, chat) + iOS polish |
| `js/config.js` | **paste your Supabase keys here** (only file you edit to enable accounts) |
| `js/supabase.js` | Supabase auth + cloud load/save module (no-ops safely if unconfigured) |
| `js/constants.js` | icons, day map, grade points, attendance thresholds, sample data |
| `js/coursedata.js` | the Courses knowledge base + `libraryDigest()` for the AI |
| `js/parser.js` | IULMS text parser + v2 JSON payload decoder + legacy v1/v0 compat |
| `js/bookmarklet.js` | v2 super-bookmarklet source (hardened transcript scrape) + URL builder |
| `js/analytics.js` | schedule analytics + transcript stats, attendance risk, CGPA prediction |
| `js/ai.js` | Claude / OpenAI provider abstraction + full-data context + grounded chat |
| `js/views.js` | UI rendering (auth, Dashboard, Timetable, Progress, Courses, Planner, AI) |
| `js/app.js` | state + event handlers + URL import + auth flow + local/cloud persistence |
| `SUPABASE_SETUP.md` | step-by-step Supabase dashboard setup |

## State shape (v2)

```js
state = {
  user: { plan: 'free' | 'pro' },
  tab: 'dashboard' | 'timetable' | 'progress' | 'transcript' | 'library' | 'courses' | 'planner' | 'ai',
  // v2.1 accounts (optional — null in guest mode)
  account: { email } | null,
  aiChat: { messages: [{ role, text }], loading, error },
  // v2 fields from the super-bookmarklet
  profile: { name } | null,
  transcript: [{ code, title, credits, grade, points }],
  attendance: [{ course, totalSessions, present, absent }],
  currentSchedule: [{ day, courseTitle, faculty, location, edpCode, startTime, endTime, raw }],
  midterms: [{ code, name, total, obtained, percentage, raw }],
  examSchedule: [{ code, name, date, time, venue }],
  dataTimestamp: 1700000000000,
  // unchanged from v1
  courses: [{ id, code, name, credits, status, semester, grade, prereq, sessions, planned, ... }],
  targetCGPA: 3.5,
  // ui-only
  filter, search, modal, uploadMode, aiSettings, ai, importBanner, ...
}
```

## Bookmarklet payload format (v2)

```json
{
  "version": 2,
  "timestamp": 1700000000000,
  "profile": { "name": "Student Name" },
  "courseListText": "Semester - 1\n\tSEN101\t-\t3\t...\nSemester - 2\n...",
  "attendance": [
    { "course": "SEN356 INFORMATION SECURITY", "totalSessions": 24, "present": 18, "absent": 6 }
  ],
  "transcript": [
    { "code": "SEN101", "title": "Applied Physics", "credits": 3, "grade": "B+", "points": 9.9 }
  ],
  "schedule": [
    { "day": "Monday", "raw": "INFORMATION SECURITY\nDr. Ali\nRoom 301-A\nEDP: 12345\n09:00 AM - 10:30 AM" }
  ],
  "midterms": [{ "cells": ["SEN356", "Information Security", "30", "24.5"] }],
  "examSchedule": [{ "cells": ["SEN356", "Information Security", "2025-12-15", "09:00 AM", "Hall A"] }]
}
```

The parser also accepts the **legacy v1** format (base64 text only) and the very early **v0** format (JSON array of `{table, row, cells}`) — old bookmarklets keep working.

## Privacy

Your IULMS credentials never touch this site. The bookmark runs on the IULMS page itself (where you're already logged in), reads visible data through same-origin fetches, and posts only the extracted data via the URL fragment.

By default your data lives only in your browser's `localStorage`. If **you** connect your own Supabase project (see `SUPABASE_SETUP.md`), signed-in users' data is additionally saved to **your** Supabase database — one JSON row per user, protected by Row Level Security so each user can only read/write their own row. There is no third-party analytics and no data leaves to anywhere you don't control.

## Built by

- **Syed Imran Murtaza** (65196) — [ctrlaltimran.com](https://ctrlaltimran.com)
- **M. Raza** (63234)

For the Web Engineering course taught by **Sir Muhammad Farhan** at Iqra University.
