# Supabase Setup Guide — IUSemPlanner.ai v2.1

This guide tells you **exactly** what to create in the Supabase dashboard and
**where to paste your keys** so that login / signup, Google sign-in, and
cross-device cloud saving all work.

> ⏱️ Takes about 10 minutes. You only edit **one file** in the project:
> `js/config.js`.

> 💡 If you skip this entirely, the app still works as a **guest-only** version
> (data saved in the browser, exactly like the old build). Nothing breaks.

---

## Step 1 — Create a Supabase project

1. Go to **https://supabase.com** and sign in (free tier is enough).
2. Click **New project**.
3. Give it a name (e.g. `iusemplanner`), set a database password (save it
   somewhere), pick the region closest to your users, and create it.
4. Wait ~1 minute for it to finish provisioning.

---

## Step 2 — Copy your keys and paste them into `js/config.js`

1. In your project, open **Project Settings** (the ⚙️ gear, bottom-left) → **API**.
2. Copy these two values:
   - **Project URL** — looks like `https://abcdxyz.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`
3. Open the file **`js/config.js`** in this project and paste them in:

```js
window.IUSP_CONFIG = {
  SUPABASE_URL: 'https://abcdxyz.supabase.co',      // ← your Project URL
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiInR5cCI...', // ← your anon public key
};
```

> ✅ The **anon public** key is *meant* to be in front-end code — it is safe to
> ship publicly. Your data is protected by the Row Level Security rules you set
> up in Step 4, **not** by hiding this key. Never paste the `service_role`
> (secret) key here.

That is the only file you ever edit.

---

## Step 3 — Create the `user_data` table

This is the single table that stores each user's saved data as one JSON blob.

1. In the dashboard, open the **SQL Editor** (left sidebar) → **New query**.
2. Paste the SQL below and click **Run**. It creates the table **and** the
   security rules in one go.

```sql
-- One row per user; their whole app state is stored in the `data` column.
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Turn on Row Level Security so users can only touch their OWN row.
alter table public.user_data enable row level security;

-- Read own row
create policy "read own data"
  on public.user_data for select
  using ( auth.uid() = user_id );

-- Insert own row
create policy "insert own data"
  on public.user_data for insert
  with check ( auth.uid() = user_id );

-- Update own row
create policy "update own data"
  on public.user_data for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );
```

> The app reads with `select('data')` / `maybeSingle()` and writes with
> `upsert(..., { onConflict: 'user_id' })` — these match the table above
> exactly, so no other configuration is needed.

---

## Step 4 — Enable Email sign-up

1. Open **Authentication** → **Providers** → **Email**.
2. Make sure **Email** is **enabled**.
3. (Optional but recommended for testing) Under Email settings you can turn
   **"Confirm email"** off while developing, so new sign-ups log in instantly.
   Leave it **on** for real users — the app already shows a "check your inbox"
   message when confirmation is required.

---

## Step 5 — Enable Google sign-in

1. Create a Google OAuth client:
   - Go to **https://console.cloud.google.com** → create/select a project.
   - **APIs & Services** → **Credentials** → **Create Credentials** →
     **OAuth client ID** → application type **Web application**.
   - Under **Authorized redirect URIs**, add the callback URL Supabase gives you
     (next step shows where to find it). It looks like:
     `https://abcdxyz.supabase.co/auth/v1/callback`
   - Save, then copy the **Client ID** and **Client secret**.
2. Back in Supabase: **Authentication** → **Providers** → **Google**:
   - Toggle **Enable**.
   - Paste the **Client ID** and **Client secret**.
   - Copy the **Callback URL** shown here and make sure it's in your Google
     client's Authorized redirect URIs (step 1).
   - **Save**.

---

## Step 6 — Tell Supabase about your site URL (important for redirects)

Because the app lives at a permalink on your Hostinger/WordPress site, Supabase
needs to know it's allowed to send users back there after login.

1. Open **Authentication** → **URL Configuration**.
2. Set **Site URL** to your live address:
   ```
   https://ctrlaltimran.com/IUSemPlanner/
   ```
3. Under **Redirect URLs**, add (one per line):
   ```
   https://ctrlaltimran.com/IUSemPlanner/
   http://localhost:5500
   ```
   (The localhost line is optional — only if you test locally with Live Server.)
4. **Save**.

> The app calls Google sign-in with `redirectTo = window.location.origin +
> window.location.pathname`, so it always returns the user to the exact
> permalink they started from. That's why the URL above must be listed here.

---

## Step 7 — Test it

1. Upload the project files to your Hostinger permalink (overwrite the old
   build), or open `index.html` locally.
2. Open the site. You should see the new **Sign in / Create account** card with
   a **Continue with Google** button.
3. Create an account (or use Google), add some data, then open the site on a
   different device / browser and sign in — your data should load. ✅
4. The little dot next to your email in the header shows cloud-save status
   (green = saved, amber = saving, red = error).

---

## How the cloud sync works (quick mental model)

- Each user has **one row** in `user_data`. Their entire app state (profile,
  transcript, courses, attendance, plans, AI chat) is stored as one JSON object
  in the `data` column.
- On login, the app loads that row. As you use the app, changes are saved to
  `localStorage` instantly and pushed to the cloud (debounced ~1.2s).
- If you imported data from IULMS *before* logging in, that fresh import wins
  and is saved to your account on first login.

---

## Does this affect my WordPress site?

**No.** Everything runs in the browser using Supabase's public JavaScript SDK
loaded from a CDN. There is no server code, no WordPress plugin, and no database
on your Hostinger account. The app is just static files at a permalink — the
same as before. Supabase is a separate, external service your front-end talks to
directly.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Still shows "Accounts aren't connected on this build yet" | Keys in `js/config.js` are still the `YOUR_..._HERE` placeholders, or the URL doesn't start with `https://`. |
| Google login redirects to a 404 / error page | The exact permalink isn't in **Authentication → URL Configuration → Redirect URLs**, or the callback URL isn't in your Google OAuth client. |
| "Email not confirmed" after sign-up | Confirmation is on (Step 4). Check the inbox, or disable confirmation while testing. |
| Data doesn't sync across devices | Re-check the `user_data` table + the three RLS policies from Step 3. |
| Red dot next to email | A cloud save failed — open the browser console (F12) for the Supabase error message. |
