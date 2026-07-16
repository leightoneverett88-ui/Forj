'use strict';
/* Quick sanity check: run the Ember Engine over data/activities.json and print. */
const path = require('path');
const eng = require('../src/emberEngine');
const acts = require('../data/activities.json');
const today = acts.map(a => String(a.date).slice(0, 10)).sort().pop();
const h = eng.computeHearth(acts, today);
console.log('This week :', JSON.stringify(h.week));
console.log('Balances  :', JSON.stringify(h.currencies));
console.log('Recent feed:');
h.feed.forEach(f => console.log(`  ${f.when}  ${f.name.padEnd(28)} ${f.distMi}mi  ${f.kind.padEnd(20)} +${f.earn.ember} Ember`));
console.log('Lifetime  :', JSON.stringify({ runMi: h.lifetime.runMi, runs: h.lifetime.runs, hours: h.lifetime.hours, streak: h.lifetime.streak, biggestWeek: h.lifetime.biggestWeekMi }));
