# Forj — Live Backend (Daily Hearth)

This is the real backend that makes the **Daily Hearth** run on live Strava data instead of a baked snapshot. It does the Strava OAuth handshake, pulls your activities, runs them through a real implementation of the **Ember Engine** (blueprint §8), and serves the Hearth from a small JSON API.

Every number on the page is computed live: `Ember = relativeEffort × 6 × consistency × improvement`, scored against your own trailing baseline — exactly the design, now in code.

---

## Two ways to run it

### 1. Local demo (no Strava app needed)

Runs the whole pipeline against `data/activities.json` (a real slice of one athlete's year), so you can see it work in 30 seconds.

```bash
npm install
npm run local
# open http://localhost:3000
```

### 2. Live (your own Strava)

1. Create a Strava API application at **https://www.strava.com/settings/api**
   - Set **Authorization Callback Domain** to `localhost` (for local dev) or your deployed host.
2. Copy the env file and fill it in:
   ```bash
   cp .env.example .env
   # set STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI
   ```
3. Start it and connect:
   ```bash
   npm install
   npm start
   # open http://localhost:3000  →  click "Connect with Strava"
   ```

The first time, Strava asks you to authorize (scope `activity:read_all`). Tokens are stored in `data/tokens.json` and auto-refreshed.

---

## What's inside

```
server.js              Express app: OAuth routes + JSON API + static frontend
src/emberEngine.js     The Ember Engine — pure functions, the scientific core (§8)
src/strava.js          Strava OAuth (authorize / exchange / refresh) + activity fetch + normalize
src/store.js           Token store (JSON file; swap for a DB in multi-user production)
public/hearth.html     The Daily Hearth, driven entirely by the API
data/activities.json   Real activity slice for local mode
scripts/engineCheck.js `npm run engine-check` — prints the engine's output for the sample data
```

### API

| Route | Returns |
|---|---|
| `GET /api/status` | `{ mode, connected }` |
| `GET /api/hearth` | identity + this-week + currencies + recent feed (with live Ember) + lifetime Chronicle |
| `GET /auth/strava` | redirect into the Strava consent screen |
| `GET /auth/callback` | token exchange, then back to `/` |
| `POST /auth/logout` | clears stored tokens |

### The Ember Engine (`src/emberEngine.js`)

- **base** = Strava relative effort (`suffer_score`) × 6
- **consistency** = 1 → 1.35, from trailing 28-day movement-day density
- **improvement** = 1.15 if the session set a PR, else 1.0
- **Ember** = round(base × consistency × improvement)
- Sessions with no relative effort (some Zwift/strength) fall back to a calorie/time proxy so **all movement mints** — modality-agnostic by design.
- Also computes the weekly vow, currency balances, streak, monthly chart, and lifetime feats.

Run `npm run engine-check` to see it print the computed feed/week/lifetime for the sample data.

---

## Deploying

Any Node 18+ host works (Render, Railway, Fly.io, a VPS). Set the same env vars, and make **STRAVA_REDIRECT_URI** point at `https://your-host/auth/callback` with the matching callback domain in your Strava app settings. `npm start` is the entry point.

---

## Honest scope (what a production build still needs)

This is a faithful single-user backend, not a finished service. For real users you'd add:

- **A real database** keyed by athlete id (the JSON token store is single-user).
- **A webhook subscription** (Strava push) so new activities sync without a page refresh, plus a cache so you're not re-pulling the whole history each request.
- **Anti-cheat / data integrity** (blueprint §22) — attestation, physiological plausibility, trust scoring. Movement is money here.
- **Calories** come from a MET estimate (Strava's *summary* endpoint omits them); the per-activity detail endpoint has true values if you want them.
- The **game/character layer** (House, Kindred, class, expeditions, currencies-as-balances) is still front-of-house mock — the backend proves the *fitness→Ember* spine, which is the part that needed real data.
