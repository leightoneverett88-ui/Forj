# Forj · Aureth — deployable server

The whole experience is baked into `server.js` (Three.js + GLTFLoader inlined, no CDN).
Node/Express WEB SERVER — deploy as a Render **Web Service**, NOT a Static Site.

## Deploy (Blueprint — easiest)
1. Commit server.js, package.json, render.yaml, .node-version to the repo ROOT.
2. Render → New + → **Blueprint** → pick the Forj repo → Apply (render.yaml makes a Web Service).
3. Env vars when prompted: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET,
   STRAVA_REDIRECT_URI = https://<your-app>.onrender.com/auth/callback
   (Or New + → Web Service by hand → Node · build `npm install` · start `npm start`.)
4. Strava app: Authorization Callback Domain = <your-app>.onrender.com
5. Open /hearth → Connect with Strava (reconnect once per deploy, or set STRAVA_REFRESH_TOKEN).

## Your avatar (in /world → descend → 🧍 Avatar)
Three ways to set your character:
 · **Load a model from your device** — pick a `.glb` (one file), or a `.gltf` with its
   `.bin` + textures, or a whole **folder**. Loads instantly, stays in your browser.
 · **Ready Player Me** — Create in-app, or paste your avatar's `.glb` link
   (https://models.readyplayer.me/<id>.glb). Streams from readyplayer.me (needs internet).
 · Otherwise the rugged frontier survivor is your default.
"Turn avatar around" fixes facing. Ready Player Me / pasted links are remembered across
sessions (device models are per-session). In-app RPM creator uses the `demo` subdomain by
default — for your own, make one at studio.readyplayer.me and change RPM_SUBDOMAIN in server.js.

Run locally:  npm install && npm run local  → http://localhost:3000
