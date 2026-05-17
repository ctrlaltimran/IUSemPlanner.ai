# IUSemPlanner.ai · v2.0

A **predictive student dashboard** for **Iqra University**. One bookmark imports your full IULMS academic profile, then forecasts your end-of-semester CGPA, flags attendance risks, and renders your weekly timetable.

Live at: **https://ctrlaltimran.com/IUSemPlanner/**

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
| `styles.css` | all styling (light theme, JetBrains Mono + Manrope) |
| `js/constants.js` | icons, day map, grade points, attendance thresholds, sample data |
| `js/parser.js` | IULMS text parser + v2 JSON payload decoder + legacy v1/v0 compat |
| `js/bookmarklet.js` | v2 super-bookmarklet source + URL builder |
| `js/analytics.js` | schedule analytics + transcript stats, attendance risk, CGPA prediction |
| `js/ai.js` | Claude / OpenAI provider abstraction |
| `js/views.js` | UI rendering (Dashboard, Timetable, Progress, Courses, Planner, AI) |
| `js/app.js` | state + event handlers + URL import + localStorage persistence |

## State shape (v2)

```js
state = {
  user: { plan: 'free' | 'pro' },
  tab: 'dashboard' | 'timetable' | 'progress' | 'courses' | 'planner' | 'ai',
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

Your IULMS credentials never touch this site. The bookmark runs on the IULMS page itself (where you're already logged in), reads visible data through same-origin fetches, and posts only the extracted data via the URL fragment. No database, no analytics — your data lives in your browser's `localStorage` only.

## Built by

- **Syed Imran Murtaza** (65196) — [ctrlaltimran.com](https://ctrlaltimran.com)
- **M. Raza** (63234)

For the Web Engineering course taught by **Sir Muhammad Farhan** at Iqra University.
