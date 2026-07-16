'use strict';
/* Minimal single-user token store (JSON file). Layout-agnostic: writes into
   ./data if it exists (folder layout), otherwise next to this file (flat layout).
   For multi-user production, swap for a database keyed by athlete id. */
const fs = require('fs');
const path = require('path');

// pick the first existing candidate dir, else default to this file's dir
const DIR = [path.join(__dirname, '..', 'data'), path.join(__dirname, 'data'), __dirname]
  .find(d => { try { return fs.statSync(d).isDirectory(); } catch { return false; } }) || __dirname;
const FILE = path.join(DIR, 'tokens.json');

function get() {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
  catch {
    // Ephemeral-host bootstrap: seed from a refresh token in the environment,
    // so the app survives restarts on hosts without a persistent disk.
    if (process.env.STRAVA_REFRESH_TOKEN) {
      return { access_token: null, refresh_token: process.env.STRAVA_REFRESH_TOKEN, expires_at: 0, bootstrap: true };
    }
    return null;
  }
}
function set(tok) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(tok, null, 2));
}
function clear() { try { fs.unlinkSync(FILE); } catch {} }

module.exports = { get, set, clear };
