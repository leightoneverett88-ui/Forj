# Forj · Aureth — deployable server

The whole experience is baked into `server.js` (Three.js inlined, no CDN).
It is a Node/Express WEB SERVER — it must run as a Render **Web Service**,
NOT a Static Site. (A Static Site only serves files from a "publish directory"
and never runs server.js — that is the "Publish directory does not exist" error.)

## Easiest: deploy as a Blueprint (uses render.yaml here)
1. Commit these files to your repo root: server.js, package.json, render.yaml, .node-version
2. Render Dashboard → New + → **Blueprint** → pick the Forj repo → Apply.
   render.yaml creates a Web Service with the right build/start commands.
3. Add env vars when prompted (or in the service's Environment tab):
   STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET,
   STRAVA_REDIRECT_URI = https://<your-app>.onrender.com/auth/callback

## Or: create the Web Service by hand
Render Dashboard → New + → **Web Service** (NOT Static Site) → pick the repo →
  Language: Node · Build Command: `npm install` · Start Command: `npm start`
Then add the env vars above.

## After it deploys
- In your Strava app settings, Authorization Callback Domain = <your-app>.onrender.com
- Open /hearth and click "Connect with Strava" (a redeploy wipes the saved token,
  so reconnect once per deploy — or set STRAVA_REFRESH_TOKEN to persist it).

If you already have a Static Site for this repo, delete it (Static Sites can't be
converted) and create a Web Service as above.

Run locally:  `npm install && npm run local`  → http://localhost:3000
