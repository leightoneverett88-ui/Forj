'use strict';
/* ============================================================================
   Forj backend — serves the Daily Hearth from live Strava data.

   Layout-agnostic: works whether the files sit in folders (src/, public/,
   data/) or all flat in one directory. Two modes:
     • live  (default when STRAVA_CLIENT_ID is set): OAuth + live activity pull.
     • local (FORJ_MODE=local, or no client id): reads activities.json.
   ========================================================================== */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');

// --- load modules whether they're in ./src or flat next to this file ---
function load(name) { try { return require('./src/' + name); } catch (e) { return require('./' + name); } }
const eng = load('emberEngine');
const strava = load('strava');
const store = load('store');

// --- find a data file whether it's in ./data, ./public, or flat here ---
function findFile(...cands) { for (const c of cands) { if (fs.existsSync(c)) return c; } return cands[cands.length - 1]; }
const ACTIVITIES = findFile(path.join(__dirname, 'data', 'activities.json'), path.join(__dirname, 'activities.json'));
const HEARTH = findFile(path.join(__dirname, 'public', 'hearth.html'), path.join(__dirname, 'hearth.html'));

const app = express();
app.set('trust proxy', 1);                 // behind Render/Railway/Fly TLS proxies
const PORT = process.env.PORT || 3000;
const WEIGHT = +(process.env.ATHLETE_WEIGHT_KG || 92);
const MODE = (process.env.FORJ_MODE === 'local' || !process.env.STRAVA_CLIENT_ID) ? 'local' : 'live';

app.get('/healthz', (req, res) => res.json({ ok: true, mode: MODE }));

/* --- the Forj character layer wrapped around the real athlete --- */
function forjIdentity(athlete) {
  const first = athlete?.first_name || 'Wanderer';
  const city = athlete?.location?.city || athlete?.city || 'Rainhill';
  return { name: first, of: 'of ' + city, house: 'Everburning', kindred: 'Emberkin', cls: 'Vanguard', day: 'Age II · Spring' };
}

function localActivities() { return JSON.parse(fs.readFileSync(ACTIVITIES, 'utf8')); }
function latestDate(acts) { return acts.map(a => String(a.date).slice(0, 10)).sort().pop(); }

async function buildHearth() {
  if (MODE === 'local') {
    const acts = localActivities();
    const today = latestDate(acts);
    const data = eng.computeHearth(acts, today);
    return { mode: 'local', connected: true, syncedAt: today,
      identity: forjIdentity({ first_name: 'Leighton', location: { city: 'Newport' } }), ...data };
  }
  const token = await strava.validToken(store);
  const [athlete, raw] = await Promise.all([
    strava.getAthlete(token),
    strava.getActivities(token, { perPage: 100, maxPages: 4 }),
  ]);
  const acts = raw.map(a => strava.normalize(a, WEIGHT));
  const today = new Date().toISOString().slice(0, 10);
  const data = eng.computeHearth(acts, today);
  return { mode: 'live', connected: true, syncedAt: new Date().toISOString(),
    identity: forjIdentity(athlete), ...data };
}

/* --- API --- */
app.get('/api/status', (req, res) => {
  const connected = MODE === 'local' ? true : !!store.get();
  res.json({ mode: MODE, connected });
});

app.get('/api/hearth', async (req, res) => {
  try {
    if (MODE === 'live' && !store.get()) return res.status(401).json({ needAuth: true });
    res.json(await buildHearth());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e.message || e) });
  }
});

/* --- OAuth --- */
app.get('/auth/strava', (req, res) => res.redirect(strava.authorizeUrl()));

app.get('/auth/callback', async (req, res) => {
  try {
    if (req.query.error) return res.redirect('/?error=' + encodeURIComponent(req.query.error));
    const tok = await strava.exchangeCode(req.query.code);
    store.set(tok);
    res.redirect('/');
  } catch (e) {
    console.error(e);
    res.status(500).send('Auth failed: ' + e.message);
  }
});

app.post('/auth/logout', (req, res) => { store.clear(); res.json({ ok: true }); });

app.get('/', (req, res) => res.sendFile(HEARTH));

app.listen(PORT, () => {
  console.log(`\n  Forj backend · mode=${MODE} · http://localhost:${PORT}`);
  if (MODE === 'live') console.log(store.get() ? '  Strava: connected' : '  Strava: not connected — open the page and click Connect.');
  else console.log('  Local mode — serving activities.json through the Ember Engine.\n');
});
