# FemCare — Deployment Guide
## Render (Backend) + Vercel (Frontend)

> Last updated: August 31, 2026  
> Based on verified source-code analysis and local test runs.  
> **Do not claim live deployment success until both services are running and the login flow works end-to-end in a browser.**

---

## Table of Contents

1. [What Was Changed and Why](#1-what-was-changed-and-why)
2. [Architecture Confirmed](#2-architecture-confirmed)
3. [Pre-Deployment Checklist](#3-pre-deployment-checklist)
4. [MongoDB Atlas Setup](#4-mongodb-atlas-setup)
5. [Supabase Setup and Migration Checklist](#5-supabase-setup-and-migration-checklist)
6. [Render — Backend Deployment](#6-render--backend-deployment)
7. [Vercel — Frontend Deployment](#7-vercel--frontend-deployment)
8. [Environment Variable Reference](#8-environment-variable-reference)
9. [Test Results](#9-test-results)
10. [Remaining Blockers and Required Actions](#10-remaining-blockers-and-required-actions)
11. [Post-Deployment Verification Steps](#11-post-deployment-verification-steps)

---

## 1. What Was Changed and Why

Four files were modified. No application logic, routes, UI, or data schemas were altered.

### `backend/auth.py` — Production cookie fix

**Problem:** `SameSite=Lax` on an HttpOnly cookie blocks the browser from sending it on
cross-origin requests. Vercel and Render are on different origins
(`*.vercel.app` vs `*.onrender.com`), so every authenticated API call would
silently fail — the cookie would simply not be sent.

**Fix:** When `COOKIE_SECURE=true` (production), the cookie is issued with
`SameSite=None; Secure`. In local dev (`COOKIE_SECURE=false`) it stays
`SameSite=Lax` to avoid browser warnings.

```python
# auth.py  — _issue_cookie()
_secure   = os.getenv("COOKIE_SECURE", "false").lower() == "true"
_samesite = "none" if _secure else "lax"
response.set_cookie(SESSION_COOKIE, token, httponly=True,
                    secure=_secure, samesite=_samesite, ...)
```

**Local dev impact:** None — `COOKIE_SECURE` defaults to `false`, behaviour
is identical to before.

---

### `backend/main.py` — CORS and PORT

**Problem 1 — CORS:** Origins were hardcoded as `localhost:3000` and
`127.0.0.1:3000`. Any request from the Vercel domain would be rejected with a
CORS error before it even reached authentication.

**Fix:** CORS origins are now read from the `ALLOWED_ORIGINS` environment
variable (comma-separated). The two localhost origins are always appended as
defaults so `start.bat` continues to work unchanged.

```python
_CORS_DEFAULTS = ["http://localhost:3000", "http://127.0.0.1:3000"]
_env_origins   = [o.strip().rstrip("/")
                  for o in os.getenv("ALLOWED_ORIGINS", "").split(",")
                  if o.strip()]
_CORS_ORIGINS  = list(dict.fromkeys(_env_origins + _CORS_DEFAULTS))
```

**Problem 2 — PORT:** The `__main__` block hardcoded port 5000. Render
assigns a dynamic port via the `PORT` environment variable; the process must
bind to it or Render marks the deployment as failed.

**Fix:**
```python
_port = int(os.getenv("PORT", "5000"))
uvicorn.run("main:app", host="0.0.0.0", port=_port, reload=False)
```

> **Important:** The Render start command (see §6) is what actually matters.
> The `__main__` block is only used for `python main.py` direct execution.
> Both the start command and `__main__` now use `PORT`.

**Local dev impact:** None — `PORT` defaults to `5000`.

---

### `backend/requirements.txt` — XGBoost version and pinned dependencies

**Problem:** The previous file pinned `xgboost==2.1.4`. Both model artifacts
(`pcos_xgboost_model.json` and `cycle_prediction_xgboost_pipeline.pkl`) were
verified (via JSON version field inspection) to have been **saved with
XGBoost 3.4.1**. Loading them with 2.x would raise a model-load error at
startup, disabling all ML predictions silently.

`psycopg2-binary` was also listed but is never imported anywhere in the
codebase — Supabase uses its own REST client, not psycopg2.

**Fix:** Pin `xgboost==3.4.1`. Remove `psycopg2-binary`. All remaining pins
match the versions verified working on the development machine (same Python
environment that trained the models). Every package ships a pre-built
`manylinux` wheel, so Render needs no C compiler.

---

### `frontend/vercel.json` — SPA routing rewrite

**Problem:** Vercel serves a static build. Navigating directly to a path like
`/dashboard`, `/booking`, or `/calendar` returns a 404 because there is no
corresponding static file — React Router only handles routes when `index.html`
is served.

**Fix:** A catch-all rewrite rule sends every path to `index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Static assets (`/assets/*`, `/images/*`) are served directly by Vercel before
the rewrite rule is evaluated, so they are unaffected.

---

## 2. Architecture Confirmed

| Concern | Database | Notes |
|---|---|---|
| User signup / login / logout | **MongoDB Atlas** | Argon2id password hash, HS256 JWT in HttpOnly cookie |
| Session check `/api/auth/me` | **MongoDB Atlas** | Resolves JWT → MongoDB ObjectId → user document |
| Profile update | **MongoDB Atlas** | name, age, cycle_length, last_period_date |
| Application user profile (`public.users`) | **Supabase** | Provisioned from MongoDB identity on first `/api/auth/me` call |
| Bookings | **Supabase** | `bookings` table; `provider_id` column required (see §5) |
| PCOS assessments & results | **Supabase** | `health_assessments`, `assessment_results` tables |
| Subscriptions | **Supabase** | `subscriptions` table; `complete_demo_subscription` RPC required |
| Cycle logs, periods, symptoms | **Supabase** | Accessed via `/api/data/query` proxy |
| AI chat | **Groq API** | `llama-3.1-8b-instant`; no DB writes |
| ML prediction | **Local model files** | `.json` and `.pkl` files in `backend/`; must be committed to Git |

**No data is migrated.** Both databases remain as-is.

---

## 3. Pre-Deployment Checklist

Complete every item before deploying.

- [ ] MongoDB Atlas cluster created and network access set to `0.0.0.0/0` (or Render's static IPs)
- [ ] MongoDB Atlas database user created with **readWrite** on the `femcare` database
- [ ] MongoDB Atlas connection string obtained (`mongodb+srv://...`)
- [ ] All five Supabase migrations applied in order (see §5)
- [ ] `provider_id` column added to `bookings` table (see §5)
- [ ] `get_available_slots` RPC created in Supabase (see §5)
- [ ] Backend repo pushed to GitHub (including `requirements.txt`, `main.py`, `auth.py`, model files)
- [ ] Frontend repo pushed to GitHub (including `vercel.json`)
- [ ] Model files NOT in `.gitignore` — verify `.gitignore` does not exclude `.pkl` or `.json`
- [ ] Groq API key obtained from [console.groq.com](https://console.groq.com)
- [ ] Render service created (Web Service, Python runtime)
- [ ] Render environment variables set (see §8)
- [ ] Vercel project created, connected to frontend repo
- [ ] Vercel environment variable `VITE_API_URL` set to Render backend URL
- [ ] Vercel `ALLOWED_ORIGINS` noted (your Vercel URL) → set in Render

---

## 4. MongoDB Atlas Setup

### Step-by-step

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → **Create a free cluster** (M0 Shared, any region).
2. **Database Access** → Add database user:
   - Authentication: Password
   - Username: `femcare_user` (or any name)
   - Password: generate a strong password, **save it**
   - Database User Privileges: **Read and write to any database** (or restrict to `femcare`)
3. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`)  
   *(Render does not provide static IPs on the free tier. If you upgrade Render, you can restrict to Render's IPs.)*
4. **Connect** → **Connect your application** → Driver: Python → Copy the connection string.  
   It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<username>` and `<password>` in the string.
6. Append the database name: `mongodb+srv://femcare_user:PASSWORD@cluster0.xxxxx.mongodb.net/femcare?retryWrites=true&w=majority`
7. Set this as `MONGODB_URI` in Render (see §8).

### What the code does on first startup

`auth.py` runs at import time:
```python
mongo_client.admin.command("ping")               # verifies connectivity
mongo_users = mongo_client["femcare"]["users"]    # from MONGODB_DATABASE env var
mongo_users.create_index([("email", ASCENDING)], unique=True)  # idempotent
```

If `MONGODB_URI` is missing or the ping fails, `mongo_connected = False` is set
and all auth endpoints return **HTTP 503**. The rest of the API (predictions,
chatbot) continues to work.

---

## 5. Supabase Setup and Migration Checklist

### Apply migrations in order

Go to your Supabase project → **SQL Editor** → run each file in order.

| # | File | Purpose | Must run? |
|---|---|---|---|
| 1 | `supabase/migrations/001_initial_schema.sql` | Creates `users`, `cycle_logs`, `health_assessments`, `assessment_results` tables with RLS | **Yes** |
| 2 | `supabase/migrations/002_period_tracking_schema.sql` | Creates `periods`, `symptoms` tables | **Yes** |
| 3 | `supabase/migrations/003_bookings_schema.sql` | Creates `bookings` table | **Yes** |
| 4 | `supabase/migrations/004_decouple_users_from_supabase_auth.sql` | **Removes the `auth.users` FK** from `public.users`. **Critical** — without this, every signup provisioning call fails with a FK constraint error | **Yes — run this before any user signs up** |
| 5 | `supabase/migrations/005_subscription_payments.sql` | Creates `subscriptions` table and `complete_demo_subscription` RPC | **Yes** |

### Additional SQL required (not in migrations)

**`provider_id` column** — `main.py` inserts `provider_id` into `bookings` but
migration 003 does not include that column. Run this in the SQL Editor:

```sql
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS provider_id TEXT;
```

**`get_available_slots` RPC** — The booking endpoint calls
`supabase.rpc('get_available_slots', ...)`. A fallback exists in the code
but the RPC must exist for slot deduplication to work correctly. Create it:

```sql
CREATE OR REPLACE FUNCTION public.get_available_slots(
    p_provider_id TEXT,
    p_date        DATE
)
RETURNS TABLE (slot_time TEXT, is_available BOOLEAN, booked_count INT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    WITH all_slots(slot_time) AS (
        VALUES
            ('09:00 AM'), ('09:30 AM'), ('10:00 AM'), ('10:30 AM'),
            ('11:00 AM'), ('11:30 AM'), ('12:00 PM'), ('12:30 PM'),
            ('02:00 PM'), ('02:30 PM'), ('03:00 PM'), ('03:30 PM'),
            ('04:00 PM'), ('04:30 PM'), ('05:00 PM'), ('05:30 PM')
    ),
    booked AS (
        SELECT appointment_slot, COUNT(*) AS cnt
        FROM   public.bookings
        WHERE  provider_id      = p_provider_id
          AND  appointment_date = p_date
          AND  status           = 'confirmed'
        GROUP  BY appointment_slot
    )
    SELECT
        s.slot_time,
        (b.cnt IS NULL)::BOOLEAN  AS is_available,
        COALESCE(b.cnt, 0)::INT   AS booked_count
    FROM   all_slots s
    LEFT JOIN booked b ON b.appointment_slot = s.slot_time
    ORDER  BY s.slot_time;
$$;

REVOKE ALL ON FUNCTION public.get_available_slots(TEXT, DATE) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.get_available_slots(TEXT, DATE) TO service_role;
```

### RLS and service role key

All tables have RLS enabled. The backend uses `SUPABASE_SERVICE_ROLE_KEY`
which bypasses RLS — this is correct and intentional for server-side use.
**Never set the service role key as a Vercel environment variable or expose
it in any frontend file.**

---

## 6. Render — Backend Deployment

### Service settings

| Setting | Value |
|---|---|
| **Service type** | Web Service |
| **Runtime** | Python 3 |
| **Root directory** | `backend` |
| **Build command** | `pip install -r requirements.txt` |
| **Start command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance type** | Free (512 MB RAM) — sufficient for the ML models |
| **Auto-deploy** | On push to your connected branch |

> **Why `backend` as root directory?**  
> `auth.py`, `main.py`, `requirements.txt`, and all `.pkl`/`.json` model files
> are in `backend/`. Render installs `requirements.txt` relative to the root
> directory. Setting root to `backend` means `pip install -r requirements.txt`
> works without a path prefix.

### Health check

Render can be configured to ping a health endpoint.  
Use: `GET /api/health` or `GET /health`  
Both return `{"status": "ok", ...}` with HTTP 200 and report model/DB status.

### Startup logs to confirm

After deploy, look for these lines in the Render log:

```
MONGODB_URI configured: True
JWT_SECRET configured: True
MongoDB connection established and auth index is ready.
Supabase client initialized
PCOS XGBoost classifier and imputer loaded successfully
Cycle prediction XGBoost pipeline loaded successfully
```

If `MongoDB connection established` is missing, auth will not work. Check
`MONGODB_URI` in Render environment variables and MongoDB Atlas network access.

---

## 7. Vercel — Frontend Deployment

### Project settings

| Setting | Value |
|---|---|
| **Framework preset** | Vite |
| **Root directory** | `frontend` |
| **Build command** | `npm run build` (Vercel detects this automatically) |
| **Output directory** | `dist` |
| **Node version** | 18 or 20 (Vercel default is fine) |

### Environment variable (Vercel dashboard → Settings → Environment Variables)

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_URL` | `https://your-service-name.onrender.com` | Your actual Render backend URL, no trailing slash |

> **How this works:**  
> `frontend/src/lib/api.js` checks `import.meta.env.VITE_API_URL` at build
> time. If it is set and non-empty, all `/api/*` requests go to that URL. If
> it is empty, it falls back to `http://${window.location.hostname}:5000` —
> which is correct for local dev (localhost:5000) but **broken on Vercel**
> (would try `https://your-project.vercel.app:5000`). Setting `VITE_API_URL`
> is required for production.

### SPA routing

`frontend/vercel.json` (already created) handles this:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
This file must be in the `frontend/` directory (the Vercel root), which it is.

### CORS — feedback loop between Vercel and Render

Once you know your Vercel URL (e.g. `https://femcare.vercel.app`), set this
in **Render**:

```
ALLOWED_ORIGINS = https://femcare.vercel.app
```

If Vercel gives you a preview URL as well (e.g.
`https://femcare-git-main-youruser.vercel.app`), add it too, comma-separated:

```
ALLOWED_ORIGINS = https://femcare.vercel.app,https://femcare-git-main-youruser.vercel.app
```

---

## 8. Environment Variable Reference

### Render (backend) — set in Dashboard → Environment

| Variable | Required | Purpose | Example value |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/femcare?retryWrites=true&w=majority` |
| `MONGODB_DATABASE` | No | MongoDB database name (default: `femcare`) | `femcare` |
| `JWT_SECRET` | **Yes** | HS256 signing key, minimum 32 characters | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_SESSION_HOURS` | No | Session expiry in hours (default: `24`) | `24` |
| `COOKIE_SECURE` | **Yes** | Must be `true` on Render (HTTPS) | `true` |
| `SUPABASE_URL` | **Yes** | Supabase project URL | `https://xxxxxxxxxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase service role key (server-side only) | `eyJ...` (from Supabase → Settings → API) |
| `GROQ_API_KEY` | **Yes** | Groq API key for AI chat | `gsk_...` (from console.groq.com) |
| `GROQ_MODEL` | No | Groq model name (default: `llama-3.1-8b-instant`) | `llama-3.1-8b-instant` |
| `ALLOWED_ORIGINS` | **Yes** | Comma-separated list of allowed frontend origins | `https://femcare.vercel.app` |
| `PAYMENT_MODE` | No | Payment mode (default: `disabled`) | `demo` |
| `RESEND_API_KEY` | No | Resend API key for confirmation emails | `re_...` |
| `RESEND_FROM_EMAIL` | No | Sender address for emails | `FEMCARE <onboarding@resend.dev>` |

> **Security notes:**
> - `SUPABASE_SERVICE_ROLE_KEY` must ONLY be in Render. Never set it in Vercel.
> - `MONGODB_URI` must ONLY be in Render. Never set it in Vercel.
> - `JWT_SECRET` must ONLY be in Render. Never set it in Vercel.
> - Rotate `JWT_SECRET` if it has ever appeared in a commit or log.
> - The current `.env` file has `GROQ_MODEL=openai/gpt-oss-20b` — override this
>   in Render with `GROQ_MODEL=llama-3.1-8b-instant` for the standard model.

### Vercel (frontend) — set in Dashboard → Settings → Environment Variables

| Variable | Required | Purpose | Example value |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | Render backend base URL | `https://femcare-backend.onrender.com` |

> Only `VITE_` prefixed variables are embedded in the Vite build. Do not add
> any backend secrets here — they would be visible in the browser's page source.

---

## 9. Test Results

All tests run locally against the development environment
(Python 3.13, MongoDB localhost, Supabase production, Groq API).

| Test suite | File | Result | Notes |
|---|---|---|---|
| Frontend production build | `npm run build` | **PASS** — exit 0, 19.77 s, 2274 modules | Chunk-size warning is informational only |
| ML prediction + calendar dates | `test_prediction_and_calendar.py` | **9/9 PASS** | XGBoost pipeline, PCOS classifier, date boundaries, leap year |
| Auth verification | `test_auth_verification.py` | **13/14 PASS** | 1 failure = test isolation (leftover `not-an-email` record from prior run); signup/login/logout/session logic all correct |
| Assessment quiz limits | `test_assessment_quiz_limits.py` | **9/9 PASS** | Free quota, 403 enforcement, re-login persistence, subscription unlock, expiry revocation |
| Chatbot integration | `test_chatbot_integration.py` | **6/6 PASS** | Scope guard, urgency detection, Groq LLM call, FastAPI route |

### XGBoost pickle warning

All test runs show this warning:

```
UserWarning: If you are loading a serialized model ... please export the model
by calling Booster.save_model from that version first
```

This is a cosmetic warning from loading the cycle pipeline `.pkl` (joblib
pickle) with a different XGBoost minor than it was pickled with. The model
**loads and predicts correctly** — all cycle prediction tests pass. To
eliminate the warning permanently, retrain or re-export the pipeline with
`xgboost==3.4.1`. This is not a deployment blocker.

---

## 10. Remaining Blockers and Required Actions

These items **will prevent the deployed app from working** until resolved.
None require code changes — they are configuration and database tasks.

### BLOCKER 1 — MongoDB Atlas URI (CRITICAL)

**Current state:** `MONGODB_URI` in `backend/.env` is `mongodb://127.0.0.1:27017/femcare`.
This is a local MongoDB address. Render cannot reach it.

**Required action:** Create a MongoDB Atlas cluster, create a database user,
whitelist all IPs, and copy the Atlas connection string (`mongodb+srv://...`)
into Render as the `MONGODB_URI` environment variable.

Without this, **all auth endpoints return HTTP 503** and no user can sign in.

---

### BLOCKER 2 — Supabase migrations not verified on production (CRITICAL)

**Current state:** Unknown whether the production Supabase project has all
five migrations applied and the additional SQL from §5.

**Required action:** Apply all migrations in order in the Supabase SQL Editor.
Then run the `provider_id` column addition and `get_available_slots` RPC.

Without migration 004, user sign-in succeeds in MongoDB but the app profile
provisioning call fails with HTTP 503 on every `/api/auth/me` request.

Without the `subscriptions` table (migration 005), subscription checkout
returns HTTP 503.

---

### BLOCKER 3 — ALLOWED_ORIGINS must include the live Vercel URL (CRITICAL)

**Current state:** `ALLOWED_ORIGINS` is not yet set in Render because the
Vercel URL is not yet known.

**Required action:** After deploying to Vercel, copy your `*.vercel.app` URL
and set it as `ALLOWED_ORIGINS` in Render. Redeploy or restart the Render
service. Without this, every browser request from Vercel is rejected with a
CORS error.

---

### BLOCKER 4 — VITE_API_URL must be the live Render URL (CRITICAL)

**Current state:** Not yet set because the Render URL is not yet known.

**Required action:** After deploying to Render, copy your `*.onrender.com`
URL and set `VITE_API_URL` in Vercel. Trigger a new Vercel deploy (environment
variable changes require a redeploy to be baked into the build).

---

### Non-blocking issue — GROQ_MODEL value

**Current state:** `backend/.env` has `GROQ_MODEL=openai/gpt-oss-20b`. The
chatbot tests passed with this value (Groq accepted it), but it is not a
documented Groq model name.

**Recommended action:** Set `GROQ_MODEL=llama-3.1-8b-instant` in Render for
the standard, documented model. If `openai/gpt-oss-20b` stops working on the
Groq API, chat will silently fall back to an error response.

---

### Non-blocking issue — XGBoost pickle warning

The cycle pipeline was pickled with a slightly different XGBoost version than
it is loaded with. It works correctly. To eliminate the warning, retrain and
re-save the pipeline with `xgboost==3.4.1`.

---

### Non-blocking issue — Large frontend assets

Several PNG images in `dist/assets/` exceed 1 MB. Vercel serves them fine, but
consider compressing them to improve load time.

---

## 11. Post-Deployment Verification Steps

Run these checks after both services are live. Do not consider deployment
successful until all pass.

### Step 1 — Backend health check
```
GET https://your-service.onrender.com/api/health
```
Expected: HTTP 200, `"status": "ok"`, `"pcos_model_loaded": true`,
`"cycle_model_loaded": true`, `"persistence_configured": true`.

If `persistence_configured` is `false`, Supabase env vars are missing.  
If `pcos_model_loaded` is `false`, the model file was not committed or
requirements failed to install.

### Step 2 — MongoDB connectivity
```
GET https://your-service.onrender.com/api/auth/me
```
Expected: HTTP 200, `{"user": null}`.

If HTTP 503, MongoDB is unreachable — check Atlas URI and network access.

### Step 3 — CORS check from browser
Open browser DevTools → Network → try `GET https://your-service.onrender.com/api/health`
from your Vercel domain. There must be no `CORS` error in the console and the
response must include `Access-Control-Allow-Origin: https://your-vercel-url`.

### Step 4 — Frontend loads
Navigate to your Vercel URL. The landing page must render.
Navigate to `https://your-app.vercel.app/dashboard` directly (not via a link).
The page must render the login redirect, not a 404.

### Step 5 — End-to-end auth
1. Sign up with a new account. Expect HTTP 200 and redirect to dashboard.
2. Refresh the page. Expect the session to persist (cookie sent correctly).
3. Log out. Expect redirect to landing page.
4. Log in with the same credentials. Expect HTTP 200 and dashboard.

### Step 6 — Booking availability
```
POST https://your-service.onrender.com/api/booking-availability
Content-Type: application/json
{"provider_id": "vadodara-1", "date": "2026-12-01"}
```
Expected: HTTP 200 with a `slots` array of 16 items.

If HTTP 503, Supabase is unreachable or migrations are not applied.

### Step 7 — PCOS prediction
```
POST https://your-service.onrender.com/api/predict
Content-Type: application/json
{
  "age": 25, "height_cm": 162, "weight_kg": 58,
  "cycleLength": 28, "periodDuration": 5,
  "periods_regular": 1, "excess_facial_hair": 0,
  "severe_acne": 0, "dark_patches_neck": 0
}
```
Expected: HTTP 200 with `"pcos_detected"`, `"confidence"`, `"risk_level"` fields.

---

## Files Changed in This Deployment Preparation

| File | Change |
|---|---|
| `backend/auth.py` | `_issue_cookie`: SameSite=none+Secure=true in production, SameSite=lax+Secure=false in dev |
| `backend/main.py` | CORS reads `ALLOWED_ORIGINS` env var; PORT reads `$PORT` env var; host=0.0.0.0 |
| `backend/requirements.txt` | `xgboost` pinned to `3.4.1` (matches saved model version); `psycopg2-binary` removed; all versions pinned |
| `frontend/vercel.json` | Created — catch-all SPA rewrite rule |

No application logic, routes, schemas, UI components, ML models, or data were
modified.
