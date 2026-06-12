# IUSemPlanner.ai · v2.4

A **predictive student dashboard** for **Iqra University**. One bookmark imports your full IULMS academic profile, then forecasts your end-of-semester CGPA, flags attendance risks, and renders your weekly timetable.

Live at: **https://ctrlaltimran.com/IUSemPlanner/**


## What's new in v2.4 — ML/ANN Lab (Neural Academic Predictor)

A new **ML/ANN Lab** tab (last tab in the dashboard) adds real Machine-Learning /
Artificial-Neural-Network based academic prediction to the project.

### What it predicts
| Prediction | How it is shown |
|---|---|
| **Expected grade per in-progress course** | Letter grade + grade points, with a pessimistic–optimistic range |
| **Semester GPA (SGPA)** | Credit-weighted over all predicted courses, with ±σ uncertainty |
| **Projected CGPA** | Current CGPA combined with the predicted semester |
| **Academic / fail risk** | ON TRACK · WATCH · HIGH RISK badges (incl. probability-of-fail from the ensemble) |
| **Attendance / debar risk** | The hard ≤75% university rule is enforced on top of the network |
| **Confidence score** | From the spread of a 5-network deep ensemble (+ lowered when inputs were imputed) |
| **Why — explanation** | Top contributing factors per prediction (occlusion sensitivity), with signed GP impact |
| **What-if simulator** | Sliders for attendance / midterm / quizzes — the ANN re-predicts live |

### The algorithm — and why it was selected
- **Model:** a feed-forward **Artificial Neural Network (Multi-Layer Perceptron), 8 → 16 → 10 → 1**, `tanh` hidden units, linear output, trained with **backpropagation + the Adam optimizer** (mini-batches of 32, ~60 epochs/network).
- **Why an MLP:** academic prediction here is a *small tabular regression* problem (8 features → grade points). An MLP is the canonical ANN for tabular data and captures the **non-linear interactions** that matter (e.g. low attendance doesn't just subtract marks — below the debar threshold it collapses the grade entirely). CNNs/RNNs/transformers would be the wrong tools (no images/sequences), and using them "for the name" would be dishonest engineering.
- **Why a deep ensemble (×5):** five networks with different random initializations are trained on bootstrap samples; the **ensemble mean is the prediction and the ensemble spread is an honest confidence score** (deep-ensemble uncertainty estimation — a standard, defensible technique).
- **Rules + ANN:** known university constraints (the 75% attendance debar rule) are *enforced*, not learned — a hard rule should never depend on what a network happened to fit.
- **Explainability:** per-prediction **occlusion sensitivity** — each feature is replaced with the training-set average and the change in output is the feature's signed contribution.

### The 8 input features (all taken from your real IULMS import)
`midterm /20 · quizzes /10 · project /10 · attendance % · prior CGPA · credit hours · lab flag · course level` — matched per course from the imported ExamResultMid, StudentAttendance and transcript data. IULMS shows `0` for unmarked components, so zeros are treated as *not yet marked* and imputed (and the confidence is lowered accordingly — the card says so).

### Data honesty (important — also stated in the UI)
The network trains on a **synthetic, education-research-informed dataset** (1,400 samples; attendance, continuous assessment and prior GPA drive grades, with a hard low-attendance collapse). It is **NOT trained on real IULMS/university records** — your real imported data is the *input* to predictions, not the training set. Validation MAE on held-out synthetic data: **≈0.22 grade points**. Training on real historical data (supported via `ml-backend/train.py --csv`) would improve real-world accuracy.

### Architecture: two interchangeable engines
1. **In-browser ANN (`js/ml.js`, default)** — the MLP + ensemble implemented from scratch in vanilla JS. It **trains live in the browser** (the "Initialize Neural Engine" screen shows real epochs, MSE loss and a loss curve). Zero backend → works on the static Hostinger/WordPress hosting unchanged.
2. **VPS backend (`ml-backend/`, optional)** — FastAPI + scikit-learn `MLPRegressor` ensemble with the **identical feature schema and data generator** (validated: both engines agree within ~0.04 GP). Set `ML_API_URL` in `js/config.js` to use it; if the API is unreachable the app **falls back to the in-browser engine automatically**, so the site never breaks.

### Files added / changed in v2.4
| File | Change |
|---|---|
| `js/ml.js` | **NEW** — ANN engine (MLP, backprop, Adam, ensemble, dataset generator, explanations, what-if, VPS API client) |
| `ml-backend/` | **NEW** — `app.py` (FastAPI), `train.py`, `requirements.txt`, `deploy/iusp-ml.service` |
| `js/views.js` | `renderMLLab()` (idle / training / dashboard screens) + tab button |
| `js/app.js` | `ml` state, `runML()` orchestration, what-if live wiring, tab whitelist |
| `js/config.js` | `ML_API_URL` setting appended (Supabase keys untouched) |
| `js/constants.js` | `ICON.chip` |
| `css/ios.css` | ML/ANN Lab styles (responsive) |
| `index.html` | loads `js/ml.js`, cache-bust `?v=2.4` |

### How to run & test the ML module
1. Open the site → sign in / guest → **ML/ANN Lab** tab (last tab).
2. Click **Initialize Neural Engine** → watch the live training (≈4–8 s, 5 networks × 60 epochs) → the prediction dashboard appears.
3. Import from IULMS first for personal predictions; without data the engine still trains and the what-if simulator works.
4. Console shows `[IUSP] ML: …` logs (engine used, SGPA, course count).
5. Backend test (any machine/VPS):
   ```bash
   cd ml-backend
   pip install -r requirements.txt
   python train.py                                   # trains + prints validation MAE
   uvicorn app:app --host 0.0.0.0 --port 8800        # serve
   curl http://localhost:8800/health
   curl -X POST http://localhost:8800/predict -H "Content-Type: application/json" \
        -d '{"rows":[{"features":[0.75,0.7,0.5,0.83,0.78,0.75,0,0.75]}]}'
   ```

### Deploying the backend on a Hostinger VPS
```bash
# on the VPS (Ubuntu)
sudo apt update && sudo apt install -y python3-venv
sudo mkdir -p /opt/iusp-ml && sudo chown $USER /opt/iusp-ml
# upload the ml-backend/ folder contents to /opt/iusp-ml (scp/SFTP), then:
cd /opt/iusp-ml
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python train.py
# run as a service:
sudo cp deploy/iusp-ml.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now iusp-ml
sudo ufw allow 8800/tcp
curl http://localhost:8800/health
```
Recommended hardening: put nginx in front with HTTPS (e.g. `ml.ctrlaltimran.com` → proxy to `127.0.0.1:8800`) because a page served over HTTPS cannot call a plain `http://IP:8800` API (mixed content). Set `IUSP_CORS=https://ctrlaltimran.com` in the service file (already included).

### How the WordPress-hosted frontend connects to the VPS backend
The static frontend (Hostinger WordPress permalink) builds the 8 features per course locally, then `POST`s them to `ML_API_URL + /predict` (set in `js/config.js`). CORS on the FastAPI side allows the site's origin. No student data is stored on the VPS — it is a stateless prediction service. If it's down or `ML_API_URL` is empty, the in-browser ANN takes over transparently; the engine actually used is shown in the tab header.

### What to say in viva about the ML/ANN part
- *"We added a neural academic predictor: a feed-forward ANN — a Multi-Layer Perceptron with architecture 8→16→10→1 and tanh activations — trained with backpropagation and the Adam optimizer."*
- *"We chose an MLP because grade prediction from 8 tabular features is a small non-linear regression problem; an MLP captures interactions like the attendance-debar collapse, while CNNs or transformers would be inappropriate for tabular data of this size."*
- *"We train a deep ensemble of five networks on bootstrap samples; the ensemble mean is the prediction and the ensemble standard deviation gives a calibrated confidence score."*
- *"Predictions are explainable: occlusion sensitivity replaces each feature with the population average and measures the change in output, giving signed per-factor contributions shown in the UI."*
- *"Hard university rules — the 75% attendance debar — are enforced on top of the model, because constraints should not depend on what a network happened to learn."*
- *"For training data we were honest: no real IULMS records were available, so we generated a synthetic dataset whose feature-grade relationships follow established education research; the student's real imported IULMS marks and attendance are the prediction inputs. Validation MAE is about 0.22 grade points, and the pipeline accepts real historical CSVs to retrain (`train.py --csv`)."*
- *"It's deployed in two interchangeable forms: an in-browser implementation written from scratch in JavaScript that trains live on the page, and a scikit-learn FastAPI service on a Hostinger VPS with the same feature schema — the frontend falls back automatically if the API is unreachable."*
- If asked **"why not linear regression?"**: the attendance-debar collapse and feature interactions are non-linear; a linear model cannot represent them (we verified the network learns the collapse — at 55% attendance the attendance factor alone contributes about −1.3 GP).

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
