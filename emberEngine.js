'use strict';
/* ============================================================================
   THE EMBER ENGINE — activity normalization (real implementation)
   Ports the design in Forj blueprint §8 into code that runs on live Strava
   activity summaries. Pure functions, no dependencies.

   Ember(session) = base × consistency × improvement
     base        = relativeEffort × 6           (Strava relative effort = suffer score)
     consistency = 1 → 1.35, from trailing 28-day movement-day density   (§8.2 C)
     improvement = 1.15 if the session set a PR, else 1.0                 (§8.3 I)

   The economy's best wage goes to *becoming*, not *being*: a beginner's steep
   PR-laden week out-earns an elite's easy maintenance at equal relative effort.
   ========================================================================== */

const M_PER_MILE = 1609.344;
const FT_PER_M = 3.28084;

const toMiles = m => (m || 0) / M_PER_MILE;
const dayKey = iso => String(iso).slice(0, 10);           // 'YYYY-MM-DD'
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Some sessions (Zwift, weight training) carry no Strava relative_effort.
   Fall back to a defensible proxy so all movement still mints — §8.1 modality-agnosticism. */
function relativeEffort(a) {
  if (a.eff && a.eff > 0) return a.eff;
  if (a.cal && a.cal > 0) return Math.max(3, Math.round(a.cal / 14));   // calorie proxy
  const min = (a.mov || 0) / 60;
  return Math.max(2, Math.round(min * 0.5));                            // time proxy
}

/* trailing 28-day movement-day density → consistency multiplier (1.0 … 1.35). */
function consistencyAt(activeDays, iso) {
  const end = new Date(iso + 'T00:00:00Z').getTime();
  const start = end - 27 * 86400000;
  let days = 0;
  for (const d of activeDays) {
    const t = new Date(d + 'T00:00:00Z').getTime();
    if (t >= start && t <= end) days++;
  }
  return 1 + 0.35 * clamp(days / 20, 0, 1);                             // 20+ days in 28 → 1.35
}

function kindOf(a) {
  const n = (a.name || '').toLowerCase();
  const t = a.type;
  if (t === 'WeightTraining' || t === 'Workout') return 'strength';
  if (t === 'VirtualRide' || t === 'Ride') return 'virtual ride';
  if (t === 'Swim') return 'swim';
  if (n.includes('parkrun')) return 'parkrun · a milestone';
  if (n.includes('marathon')) return 'marathon';
  const mi = toMiles(a.dist), eff = a.eff || 0;
  if (n.includes('tt') || n.includes('interval') || n.includes('400') || n.includes('200') ||
      n.includes('800') || n.includes('1k') || n.includes('track') || n.includes('rep')) return 'intervals';
  if (mi >= 15) return 'long run';
  if (eff >= 45) return 'tempo';
  if (eff > 0 && eff < 18) return 'recovery';
  if (eff < 28) return 'easy';
  return 'steady run';
}

/* Ember earn for a single session, given the athlete's active-day set. */
function earn(a, activeDays) {
  const eff = relativeEffort(a);
  const base = eff * 6;
  const consistency = consistencyAt(activeDays, dayKey(a.date));
  const improvement = (a.pr || 0) > 0 ? 1.15 : 1.0;
  const ember = Math.round(base * consistency * improvement);
  const sparks = clamp(Math.round(eff / 16) + 1, 1, 5);
  const still = eff > 0 && eff < 22 ? 1 : 0;                            // low-load session brews Stillwater (§8.6)
  return {
    ember, sparks, still,
    base, consistency: consistency.toFixed(2), improvement: improvement.toFixed(2),
    relEffort: eff,
  };
}

function activeDaySet(acts) {
  const s = new Set();
  for (const a of acts) s.add(dayKey(a.date));
  return s;
}

/* Consecutive-day streak ending at the most recent active day. */
function streak(activeDays) {
  if (!activeDays.size) return 0;
  const days = [...activeDays].sort();
  let cur = days[days.length - 1];
  let n = 1;
  const has = d => activeDays.has(d);
  const prev = d => {
    const t = new Date(d + 'T00:00:00Z').getTime() - 86400000;
    return new Date(t).toISOString().slice(0, 10);
  };
  let d = prev(cur);
  while (has(d)) { n++; d = prev(d); }
  return n;
}

function weekSummary(acts, todayIso, vowTarget = 5) {
  const end = new Date(todayIso + 'T23:59:59Z').getTime();
  const start = end - 6 * 86400000;
  const inWeek = acts.filter(a => {
    const t = new Date(dayKey(a.date) + 'T12:00:00Z').getTime();
    return t >= start - 43200000 && t <= end;
  });
  const days = new Set(inWeek.map(a => dayKey(a.date)));
  const mi = inWeek.reduce((s, a) => s + toMiles(a.dist), 0);
  return {
    mi: +mi.toFixed(1),
    movementDays: days.size,
    vowTarget,
    vowDone: Math.min(days.size, vowTarget),
    surpassed: days.size > vowTarget,
  };
}

function monthly(acts) {
  const m = {};
  for (const a of acts) {
    const key = dayKey(a.date).slice(0, 7);
    m[key] = (m[key] || 0) + (a.dist || 0) / 1000;               // km
  }
  return Object.keys(m).sort().map(k => ({
    m: ['J','F','M','A','M','J','J','A','S','O','N','D'][+k.slice(5, 7) - 1],
    ym: k, km: Math.round(m[k]),
  }));
}

function biggestWeek(acts) {
  const byDay = {};
  for (const a of acts) { if (a.type !== 'Run') continue; byDay[dayKey(a.date)] = (byDay[dayKey(a.date)] || 0) + toMiles(a.dist); }
  const days = Object.keys(byDay).sort();
  let best = 0;
  for (const d0 of days) {
    const t0 = new Date(d0 + 'T00:00:00Z').getTime();
    let sum = 0;
    for (const d of days) {
      const t = new Date(d + 'T00:00:00Z').getTime();
      if (t >= t0 && t < t0 + 7 * 86400000) sum += byDay[d];
    }
    best = Math.max(best, sum);
  }
  return +best.toFixed(1);
}

function feats(acts) {
  const runs = acts.filter(a => a.type === 'Run' && a.dist > 0);
  const out = [];
  const longest = runs.slice().sort((x, y) => y.dist - x.dist)[0];
  if (longest) out.push({ t: longest.name, d: `${toMiles(longest.dist).toFixed(1)} mi · your longest journey` });
  const hardest = runs.slice().sort((x, y) => (y.eff || 0) - (x.eff || 0))[0];
  if (hardest && hardest !== longest) out.push({ t: hardest.name, d: `relative effort ${hardest.eff} · your biggest single effort` });
  const parkrun = runs.find(a => /parkrun/i.test(a.name));
  if (parkrun) {
    const s = parkrun.mov, mm = Math.floor(s / 60), ss = String(s % 60).padStart(2, '0');
    out.push({ t: parkrun.name, d: `5K in ${mm}:${ss} · ${parkrun.pr} PRs on the day` });
  }
  out.push({ t: 'Your biggest week', d: `${biggestWeek(acts)} mi in a single seven days` });
  const st = streak(activeDaySet(acts));
  if (st >= 7) out.push({ t: `A ${st}-day movement streak`, d: 'ran, rolled or lifted — every day' });
  return out.slice(0, 6);
}

function lifetime(acts) {
  const runs = acts.filter(a => a.type === 'Run');
  const activeDays = activeDaySet(acts);
  const runMi = runs.reduce((s, a) => s + toMiles(a.dist), 0);
  const totalMi = acts.reduce((s, a) => s + toMiles(a.dist), 0);
  const hours = acts.reduce((s, a) => s + (a.mov || 0), 0) / 3600;
  const elevFt = acts.reduce((s, a) => s + (a.elev || 0) * FT_PER_M, 0);
  const kcal = acts.reduce((s, a) => s + (a.cal || 0), 0);
  const dates = [...activeDays].sort();
  return {
    runMi: Math.round(runMi).toLocaleString(),
    totalMi: Math.round(totalMi).toLocaleString(),
    runs: runs.length,
    activities: acts.length,
    hours: Math.round(hours),
    elevFt: Math.round(elevFt).toLocaleString(),
    kcal: '~' + (Math.round(kcal / 1000) * 1000).toLocaleString(),
    streak: streak(activeDays),
    longestMi: (runs.length ? toMiles(runs.slice().sort((x, y) => y.dist - x.dist)[0].dist) : 0).toFixed(1),
    biggestWeekMi: biggestWeek(acts).toFixed(1),
    span: dates.length ? `${dates[0]} → ${dates[dates.length - 1]}` : '—',
    monthly: monthly(acts),
    feats: feats(acts),
  };
}

/* Build everything the Daily Hearth needs from a list of normalized activities. */
function computeHearth(acts, todayIso) {
  const sorted = acts.slice().sort((a, b) => (a.date < b.date ? 1 : -1));   // newest first
  const activeDays = activeDaySet(acts);
  const feed = sorted.slice(0, 8).map(a => {
    const e = earn(a, activeDays);
    return {
      id: a.id, name: a.name, when: dayKey(a.date), kind: kindOf(a),
      distMi: toMiles(a.dist).toFixed(1),
      timeStr: fmtTime(a.mov), prs: a.pr || 0, earn: e,
    };
  });
  const totals = acts.reduce((s, a) => {
    const e = earn(a, activeDays); s.ember += e.ember; s.sparks += e.sparks; s.still += e.still; return s;
  }, { ember: 0, sparks: 0, still: 0 });
  const lt = lifetime(acts);
  return {
    week: weekSummary(acts, todayIso),
    currencies: { ember: totals.ember, sparks: totals.sparks, still: totals.still },
    feed,
    lifetime: lt,
    milestone: feed.find(f => /parkrun|marathon/.test(f.kind)) || feed[0],
  };
}

function fmtTime(s) {
  s = s || 0; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
}

module.exports = { computeHearth, earn, lifetime, weekSummary, streak, kindOf, relativeEffort, toMiles };
