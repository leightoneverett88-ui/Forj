<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<title>Forj · Daily Hearth (live)</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
  @property --deg{ syntax:'<angle>'; inherits:false; initial-value:180deg; }
  :root{
    --bg:#0b0910;--card:rgba(255,255,255,.045);--card2:rgba(255,255,255,.03);--line:rgba(255,255,255,.09);--line2:rgba(255,255,255,.06);
    --ink:#f4ecdd;--dim:#a99e8c;--dim2:#7d7466;--ember:#fc7137;--ember2:#ffb454;--ember3:#ffd27a;--gold:#d8b06a;
    --blue2:#a9d9ea;--green:#7fd08a;--strava:#fc4c02;
    --serif:'Iowan Old Style','Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif;
    --ui:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;}
  html,body{height:100%}
  body{font-family:var(--ui);background:radial-gradient(80% 50% at 30% 0%,rgba(120,60,25,.35),rgba(0,0,0,0) 60%),#08070c;
    color:var(--ink);display:flex;align-items:center;justify-content:center;min-height:100%;padding:26px}
  .device{position:relative;width:392px;height:844px;border-radius:52px;background:linear-gradient(160deg,#221b16,#0c0a0e);
    padding:11px;box-shadow:0 40px 90px rgba(0,0,0,.7),0 0 0 2px rgba(255,190,120,.06),inset 0 1px 1px rgba(255,255,255,.14)}
  .device::after{content:'';position:absolute;inset:11px;border-radius:42px;pointer-events:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,.6),inset 0 0 40px rgba(0,0,0,.5);z-index:40}
  .screen{position:absolute;inset:11px;border-radius:42px;overflow:hidden;background:var(--bg)}
  .scroll{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;padding-bottom:30px;scrollbar-width:none}
  .scroll::-webkit-scrollbar{display:none}
  .island{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:104px;height:29px;background:#000;border-radius:16px;z-index:30}
  .glow{position:absolute;top:-40px;left:0;right:0;height:280px;pointer-events:none;z-index:0;background:radial-gradient(70% 100% at 50% 0%,rgba(252,113,55,.22),rgba(0,0,0,0) 70%)}

  header{position:relative;z-index:5;padding:56px 22px 8px}
  .crestrow{display:flex;align-items:center;gap:10px}
  .crest{width:30px;height:30px;flex:none}
  .hmeta{flex:1;min-width:0}
  .house{font-family:var(--serif);font-size:15px;color:#fbeed6;line-height:1.1;display:flex;align-items:center;gap:8px}
  .realm{font-size:10.5px;color:var(--dim2);letter-spacing:.08em;text-transform:uppercase;margin-top:3px}
  .live{display:inline-flex;align-items:center;gap:5px;font-size:8.5px;letter-spacing:.12em;text-transform:uppercase;color:#ff7a3c;
    border:1px solid rgba(252,76,2,.5);border-radius:20px;padding:2px 7px}
  .live .dot{width:5px;height:5px;border-radius:50%;background:var(--strava);box-shadow:0 0 6px var(--strava);animation:blink 2s ease-in-out infinite}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}

  .greet{position:relative;z-index:5;padding:12px 22px 6px}
  .hi{font-family:var(--serif);font-size:24px;line-height:1.15;color:#fbeed6}
  .hi b{color:var(--ember2)}
  .subhi{font-size:12.5px;color:var(--dim);margin-top:5px;line-height:1.45}

  .wrap{position:relative;z-index:5;padding:0 18px}
  .sectlbl{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ember);font-weight:700;margin:20px 6px 8px;display:flex;justify-content:space-between}
  .sectlbl .lv{color:#ff7a3c;letter-spacing:.1em}
  .card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:18px}

  .vow{display:flex;align-items:center;gap:20px}
  .ring{position:relative;width:104px;height:104px;flex:none}
  .ring .track{position:absolute;inset:0;border-radius:50%;background:conic-gradient(var(--ember) var(--deg,180deg),rgba(255,255,255,.08) 0);transition:--deg 1s cubic-bezier(.2,.8,.2,1)}
  .ring .hole{position:absolute;inset:9px;border-radius:50%;background:#100c11;display:grid;place-items:center;text-align:center}
  .ring .rv{font-family:var(--serif);font-size:25px;color:#fff1d8;line-height:1}
  .ring .rl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin-top:3px}
  .vowinfo h3{font-family:var(--serif);font-size:17px;font-weight:400;color:#fbeed6}
  .vowinfo .mi{font-size:12.5px;color:var(--dim);margin-top:4px}.vowinfo .mi b{color:var(--ember2)}

  .curs{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:14px}
  .cur{background:var(--card2);border:1px solid var(--line2);border-radius:15px;padding:12px 8px;text-align:center}
  .cur .ci{font-size:15px}.cur .cv{font-family:var(--serif);font-size:19px;margin-top:5px;color:#fff1d8;font-variant-numeric:tabular-nums}
  .cur .cl{font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim2);margin-top:3px}
  .ci.e{color:var(--ember2)}.ci.s{color:var(--ember3)}.ci.w{color:var(--blue2)}

  .feed{display:flex;flex-direction:column}
  .act{display:flex;align-items:center;gap:12px;padding:13px 0;border-top:1px solid var(--line2)}
  .act:first-child{border-top:none}
  .act .ai{width:36px;height:36px;border-radius:10px;flex:none;display:grid;place-items:center;font-size:15px;background:var(--card2);border:1px solid var(--line2)}
  .act .ab{flex:1;min-width:0}
  .act .an{font-size:13px;color:#fbeed6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .act .an .via{font-size:8.5px;color:#ff7a3c;letter-spacing:.06em;text-transform:uppercase;margin-left:6px}
  .act .ad{font-size:10.5px;color:var(--dim);margin-top:2px}
  .act .aw{font-size:9.5px;color:var(--dim2);margin-top:3px}
  .act .ae{text-align:right;flex:none}
  .act .ae .em{font-family:var(--serif);font-size:15px;color:var(--ember2)}
  .act .ae .sp{font-size:9.5px;color:var(--dim2)}

  .chron{display:flex;align-items:center;gap:14px;cursor:pointer}
  .chron .cg{font-size:22px;color:var(--ember);text-shadow:0 0 16px rgba(255,150,60,.5)}
  .chron .ct{flex:1}.chron .ct b{font-family:var(--serif);font-size:15px;color:#fbeed6;font-weight:400}
  .chron .ct span{display:block;font-size:11.5px;color:var(--dim);margin-top:2px}.chron .chev{color:var(--dim2);font-size:20px}

  .foot{text-align:center;font-size:10.5px;color:var(--dim2);padding:20px 24px 8px;line-height:1.6}
  .foot .rf{color:var(--ember2);cursor:pointer;text-decoration:underline}

  /* connect screen */
  .connect{position:absolute;inset:0;z-index:20;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 32px;background:var(--bg)}
  .connect.show{display:flex}
  .connect h2{font-family:var(--serif);font-size:24px;color:#fbeed6;margin-top:20px}
  .connect p{font-size:13px;color:var(--dim);line-height:1.6;margin-top:12px;max-width:280px}
  .cbtn{margin-top:26px;display:inline-flex;align-items:center;gap:9px;background:var(--strava);color:#fff;font-weight:700;font-size:14px;
    border:none;border-radius:14px;padding:14px 24px;cursor:pointer;text-decoration:none;box-shadow:0 12px 26px rgba(252,76,2,.35)}

  /* pip */
  .pip{position:absolute;right:18px;bottom:22px;width:40px;height:52px;z-index:15}
  .pipfl{width:100%;height:100%;transform-origin:50% 100%;animation:flick 2.6s ease-in-out infinite}
  @keyframes flick{0%,100%{transform:scaleY(1)}30%{transform:scaleY(1.05) scaleX(.97)}60%{transform:scaleY(.97) scaleX(1.03)}}

  /* chronicle sheet */
  .sheet{position:absolute;inset:0;z-index:35;display:flex;align-items:flex-end;background:rgba(6,5,9,.55);opacity:0;visibility:hidden;transition:opacity .4s}
  .sheet.show{opacity:1;visibility:visible}
  .sheetbody{width:100%;max-height:86%;overflow-y:auto;background:linear-gradient(180deg,#191320,#0f0b13);border-top-left-radius:26px;border-top-right-radius:26px;
    border-top:1px solid rgba(255,190,110,.2);padding:10px 20px 30px;transform:translateY(100%);transition:transform .45s cubic-bezier(.2,.8,.2,1);scrollbar-width:none}
  .sheetbody::-webkit-scrollbar{display:none}
  .sheet.show .sheetbody{transform:none}
  .grab{width:40px;height:4px;border-radius:4px;background:rgba(255,255,255,.18);margin:8px auto 14px}
  .shead{text-align:center;margin-bottom:16px}.shead .sg{font-size:20px;color:var(--ember)}
  .shead .st{font-family:var(--serif);font-size:21px;letter-spacing:.28em;text-indent:.28em;color:#f4ecd8;margin-top:2px}
  .shead .ss{font-family:var(--serif);font-style:italic;font-size:12px;color:var(--dim);margin-top:5px}
  .sgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
  .stile{background:var(--card2);border:1px solid var(--line2);border-radius:13px;padding:13px 6px;text-align:center}
  .stile b{display:block;font-family:var(--serif);font-size:19px;color:#ffca7d;line-height:1;font-variant-numeric:tabular-nums}
  .stile span{display:block;font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim2);margin-top:5px}
  .bars{display:flex;align-items:flex-end;gap:6px;height:80px;margin-top:18px}
  .bar{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;justify-content:flex-end}
  .bar>i{display:block;width:100%;max-width:26px;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#f0973a,#7a4a1e);min-height:3px}
  .bar>span{font-size:8.5px;color:var(--dim2)}
  .sfeats{list-style:none;margin-top:18px}
  .sfeats li{position:relative;padding:9px 0 9px 18px;border-top:1px solid var(--line2);font-size:13px;color:var(--ink)}
  .sfeats li:first-child{border-top:none}
  .sfeats li::before{content:'◆';position:absolute;left:0;top:11px;color:rgba(255,180,84,.6);font-size:8px}
  .sfeats li b{font-weight:400;color:#ffe0b0}.sfeats li span{display:block;font-size:11px;color:var(--dim);margin-top:1px}

  @media (max-width:480px){body{padding:0}.device{width:100vw;height:100vh;border-radius:0;padding:0;box-shadow:none}.device::after{inset:0;border-radius:0}.screen{inset:0;border-radius:0}.island{display:none}}
</style>
</head>
<body>
<div class="device"><div class="screen">
  <div class="scroll" id="scroll">
    <div class="glow"></div>
    <div id="app"></div>
  </div>

  <!-- connect state -->
  <div class="connect" id="connect">
    <svg width="60" height="78" viewBox="0 0 66 86"><defs><radialGradient id="cf" cx="50%" cy="66%" r="56%">
      <stop offset="0%" stop-color="#fff3d0"/><stop offset="42%" stop-color="#ffb454"/><stop offset="78%" stop-color="#f0731f"/><stop offset="100%" stop-color="#c0410e"/></radialGradient></defs>
      <path d="M33 84 C9 72 18 42 33 4 C48 42 57 72 33 84 Z" fill="url(#cf)"/></svg>
    <h2>Your Hearth is waiting</h2>
    <p>Connect Strava and every walk, run, ride and session becomes Ember — scored against your own baseline, written into Aureth.</p>
    <a class="cbtn" href="/auth/strava">◎ Connect with Strava</a>
  </div>

  <!-- chronicle sheet -->
  <div class="sheet" id="sheet"><div class="sheetbody">
    <div class="grab"></div>
    <div class="shead"><div class="sg">◈</div><div class="st">THE CHRONICLE</div><div class="ss" id="shSub"></div></div>
    <div class="sgrid" id="shStats"></div>
    <div class="bars" id="shBars"></div>
    <ul class="sfeats" id="shFeats"></ul>
  </div></div>
  <div class="island"></div>
</div></div>

<script>
'use strict';
const $=id=>document.getElementById(id);
const CUR_ICON={ember:'◆',sparks:'✦',still:'❉'};
let A=null;

async function boot(){
  const st=await fetch('/api/status').then(r=>r.json()).catch(()=>({mode:'live',connected:false}));
  if(st.mode==='live' && !st.connected){ $('connect').classList.add('show'); return; }
  try{ A=await fetch('/api/hearth').then(r=>{ if(r.status===401){throw 'auth';} return r.json(); }); }
  catch(e){ $('connect').classList.add('show'); return; }
  render();
}

function fmt(n){ return (typeof n==='number'?Math.round(n):n).toLocaleString?Math.round(n).toLocaleString():n; }

function render(){
  const id=A.identity, w=A.week, c=A.currencies, lt=A.lifetime;
  const surpass = w.surpassed;
  $('app').innerHTML=`
    <header><div class="crestrow">
      <svg class="crest" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#a9853f" stroke-width="3"/>
        <path d="M50 76 C33 66 40 48 50 26 C60 48 67 66 50 76 Z" fill="#fc7137"/><path d="M50 68 C42 62 45 52 50 40 C55 52 58 62 50 68 Z" fill="#ffd699"/></svg>
      <div class="hmeta"><div class="house">House ${id.house}<span class="live"><span class="dot"></span>${A.mode==='live'?'Live · Strava':'Live demo'}</span></div>
        <div class="realm">${id.name} ${id.of} · ${id.kindred} ${id.cls} · ${id.day}</div></div>
    </div></header>

    <div class="greet">
      <div class="hi">Good day,<br><b>${id.name}</b>.</div>
      <div class="subhi" id="subhi"></div>
    </div>

    <div class="wrap">
      <div class="sectlbl">This week <span class="lv">● from your Strava</span></div>
      <div class="card">
        <div class="vow">
          <div class="ring"><div class="track" id="vowTrack"></div><div class="hole"><div><div class="rv">${w.vowDone}/${w.vowTarget}</div><div class="rl">days</div></div></div></div>
          <div class="vowinfo"><h3>Move ${w.vowTarget} days</h3>
            <div class="mi"><b>${w.mi}</b> mi logged this week</div>
            <div class="mi" style="margin-top:2px;color:var(--dim2)">${w.movementDays} day${w.movementDays!==1?'s':''} moved${surpass?' — vow surpassed':''}.</div></div>
        </div>
        <div class="curs">
          ${['ember','sparks','still'].map(k=>`<div class="cur"><div class="ci ${k[0]}">${CUR_ICON[k]}</div><div class="cv">${fmt(c[k])}</div><div class="cl">${k==='still'?'Stillwater':k}</div></div>`).join('')}
        </div>
      </div>

      <div class="sectlbl">Recent activity <span class="lv">● live Ember</span></div>
      <div class="card feed">
        ${A.feed.map(f=>{ const e=f.earn; const ic={strength:'🏋',['virtual ride']:'🚴',swim:'🌊'}[f.kind]||'👟';
          return `<div class="act"><div class="ai">${ic}</div>
            <div class="ab"><div class="an">${f.name}<span class="via">Strava</span></div>
              <div class="ad">${+f.distMi>0?f.distMi+' mi · ':''}${f.timeStr} · ${f.kind}</div>
              <div class="aw">effort ${e.relEffort} × streak ${e.consistency} × ${e.improvement==='1.15'?'PR ':''}${e.improvement} = ${e.ember}</div></div>
            <div class="ae"><div class="em">+${e.ember}</div><div class="sp">+${e.sparks} ✦${e.still?' · +'+e.still+' ❉':''}</div></div></div>`;
        }).join('')}
      </div>

      <div class="sectlbl">Your Chronicle</div>
      <div class="card"><div class="chron" id="chronCard">
        <div class="cg">◈</div><div class="ct"><b>${lt.runMi} running miles, written into Aureth</b><span>${lt.runs} runs · ${lt.hours} hours · a ${lt.streak}-day streak now</span></div><div class="chev">›</div></div></div>

      <div class="foot">Synced from Strava · ${String(A.syncedAt).slice(0,10)} · <span class="rf" id="refresh">refresh</span><br>Every figure computed live by the Ember Engine — nothing baked.</div>
    </div>

    <div class="pip"><svg class="pipfl" viewBox="0 0 40 52"><defs><radialGradient id="pb" cx="50%" cy="66%" r="56%">
      <stop offset="0%" stop-color="#fff3d0"/><stop offset="40%" stop-color="#ffb454"/><stop offset="76%" stop-color="#f0731f"/><stop offset="100%" stop-color="#c0410e"/></radialGradient></defs>
      <path d="M20 50 C6 43 11 26 20 4 C29 26 34 43 20 50 Z" fill="url(#pb)"/><circle cx="16" cy="34" r="1.6" fill="#3a1e08"/><circle cx="24" cy="34" r="1.6" fill="#3a1e08"/></svg></div>`;

  // vow ring
  requestAnimationFrame(()=>{ const frac=Math.min(1,w.vowDone/w.vowTarget); $('vowTrack').style.setProperty('--deg',(frac*360)+'deg'); });
  // subhi — Pip reads the real data
  const top=A.feed[0];
  $('subhi').innerHTML = surpass
    ? `You’ve moved <b>${w.movementDays} days</b> this week — vow surpassed. Your last effort: ${top?top.name.toLowerCase():'—'}, <b>+${top?top.earn.ember:0} Ember</b>.`
    : `${w.vowTarget-w.vowDone} day${(w.vowTarget-w.vowDone)!==1?'s':''} left on your vow. Keep the chain.`;
  $('refresh').onclick=()=>{ A=null; boot(); };
  $('chronCard').onclick=openSheet;
}

function openSheet(){
  const lt=A.lifetime;
  $('shSub').textContent=A.identity.name+'’s legend · '+lt.span;
  const stats=[[lt.runMi,'running miles'],[lt.streak,'day streak'],[lt.runs,'runs logged'],[lt.hours,'hours moving'],[lt.elevFt,'feet climbed'],[lt.longestMi,'longest · mi']];
  $('shStats').innerHTML=stats.map(s=>`<div class="stile"><b>${s[0]}</b><span>${s[1]}</span></div>`).join('');
  const max=Math.max(...lt.monthly.map(m=>m.km),1);
  $('shBars').innerHTML=lt.monthly.map(m=>`<div class="bar"><i style="height:${Math.round(m.km/max*100)}%"></i><span>${m.m}</span></div>`).join('');
  $('shFeats').innerHTML=lt.feats.map(f=>`<li><b>${f.t}</b><span>${f.d}</span></li>`).join('');
  $('sheet').classList.add('show');
}
$('sheet').addEventListener('click',e=>{ if(e.target===$('sheet')) $('sheet').classList.remove('show'); });

boot();
window.HearthLive={ ready:()=>!!A||document.getElementById('connect').classList.contains('show'), data:()=>A };
</script>
</body>
</html>
