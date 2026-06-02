
(function(){
  if(window.__OJ_V19_FUTURE_FLEET__) return;
  window.__OJ_V19_FUTURE_FLEET__ = true;
  const VERSION='V19 Future Fleet AI';
  const $=id=>document.getElementById(id);
  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const store=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||f}catch(e){return f}};
  const pht=()=>new Date().toLocaleString('en-PH',{timeZone:'Asia/Manila',hour12:true});
  const toast19=(m)=>{try{if(typeof toast==='function')return toast(m);if(typeof toastV6==='function')return toastV6(m)}catch(e){} console.log(m)};
  const ROUTES19=[
    {key:'cebu_tagbilaran',label:'Cebu → Tagbilaran',vessel:'OJ 388',gate:'A2',mins:125,base:52,ports:['Cebu','Tagbilaran']},
    {key:'cebu_ormoc',label:'Cebu → Ormoc',vessel:'OJ 88',gate:'C3',mins:170,base:61,ports:['Cebu','Ormoc']},
    {key:'cebu_palompon',label:'Cebu → Palompon',vessel:'OJ 188',gate:'C4',mins:190,base:44,ports:['Cebu','Palompon']},
    {key:'cebu_getafe',label:'Cebu → Getafe',vessel:'OJ 216',gate:'G1',mins:85,base:38,ports:['Cebu','Getafe']},
    {key:'cebu_maasin',label:'Cebu → Maasin',vessel:'OJ 288',gate:'M2',mins:210,base:66,ports:['Cebu','Maasin']},
    {key:'cebu_surigao',label:'Cebu → Surigao',vessel:'OJ 328',gate:'S1',mins:330,base:73,ports:['Cebu','Maasin','Surigao']},
    {key:'cebu_siquijor',label:'Cebu → Siquijor',vessel:'OJ 788',gate:'Q1',mins:250,base:56,ports:['Cebu','Tagbilaran','Siquijor']},
    {key:'cebu_dumaguete',label:'Cebu → Dumaguete',vessel:'OJ 588',gate:'D2',mins:285,base:59,ports:['Cebu','Tagbilaran','Dumaguete']}
  ];
  function wave(seed,range){return Math.round(Math.sin((Date.now()/100000)+seed)*range)}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
  function risk(load){return load>=78?'bad':load>=60?'warn':'ok'}
  function riskText(r){return r==='bad'?'Critical':r==='warn'?'Watch':'Normal'}
  function telemetry(){
    return ROUTES19.map((r,i)=>{
      const cycle=Math.max(60,r.mins)*60000;
      const raw=((Date.now()+i*211000)%cycle)/cycle;
      const loadPct=clamp(r.base+wave(i+1,15),16,96);
      const weather=clamp(36+wave(i+4,22)+(r.key.includes('surigao')?12:0),10,92);
      const eta=Math.max(3,Math.round((1-raw)*r.mins));
      const delay=clamp(Math.round((loadPct*.23)+(weather*.19)-18),0,45);
      const rr=risk(Math.max(loadPct,weather+8));
      const health=clamp(96-wave(i+8,9)-(delay>22?8:0),72,99);
      const prog=Math.round(raw*100);
      const next=r.ports[Math.min(r.ports.length-1,Math.max(1,Math.ceil(raw*(r.ports.length-1))))];
      return {...r,loadPct,weather,eta,delay,risk:rr,status:riskText(rr),health,prog,next};
    });
  }
  function topWatch(){return [...telemetry()].sort((a,b)=>(b.loadPct+b.weather+b.delay)-(a.loadPct+a.weather+a.delay))[0]}
  function statDamage(){
    const keys=['oj_damage_master_log_v11','oceanjet_damage_cases','damageCases'];
    for(const k of keys){const d=load(k,null); if(Array.isArray(d)) return d.length; if(d&&Array.isArray(d.cases)) return d.cases.length;}
    return 0;
  }
  function statTx(){
    try{ if(window.DB&&Array.isArray(DB.history)) return DB.history.length; }catch(e){}
    const d=load('ocean_fast_ferries_db',{}); return Array.isArray(d.history)?d.history.length:0;
  }
  function routeCards(list){
    return list.map(r=>`<div class="v19-row" onclick="v19OpenMapRoute('${r.key}')"><div><b>${r.vessel} • ${r.label}</b><br><small>Next ${r.next} • ETA ${r.eta}m • delay risk ${r.delay}m • gate ${r.gate}</small><div class="v19-meter"><span style="width:${r.prog}%"></span></div></div><span class="v19-pill ${r.risk}">${r.status}</span></div>`).join('');
  }
  function ensureView(id){
    if($(id)) return $(id);
    const v=document.createElement('div'); v.id=id; v.className='view';
    const anchor=$('view-future')||$('view-map')||document.querySelector('.view:last-of-type');
    if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(v,anchor.nextSibling); else (document.querySelector('.app')||document.body).appendChild(v);
    return v;
  }
  function renderDashboardCard(){
    const v=$('view-dashboard'); if(!v||$('v19DashCard')) return;
    const t=topWatch(); const list=telemetry(); const avg=Math.round(list.reduce((a,b)=>a+b.loadPct,0)/list.length);
    v.insertAdjacentHTML('afterbegin',`<div id="v19DashCard" class="card v19-shell"><div class="v19-title"><div><h2>🧠 V19 AI Fleet Intelligence</h2><small>Mobile command layer for ETA, risk, port load, and system recovery.</small></div><span class="v19-chip ${t.risk}">${VERSION}</span></div><div class="v19-grid"><div class="v19-kpi"><b>${t.vessel}</b><span>Priority watch</span></div><div class="v19-kpi"><b>${t.eta}m</b><span>Next ETA</span></div><div class="v19-kpi"><b>${avg}%</b><span>Avg fleet load</span></div><div class="v19-kpi"><b>${statDamage()}</b><span>Damage cases</span></div></div><div class="v19-actionbar"><button class="primary" onclick="showView('ai-fleet')">AI Fleet Assistant</button><button class="accent" onclick="showView('map')">Live Map</button><button onclick="showView('future')">Future Lab</button><button onclick="showView('alive')">System Alive</button></div></div>`);
  }
  function renderAssistant(){
    const v=ensureView('view-ai-fleet'); const list=telemetry(); const t=topWatch();
    v.innerHTML=`<div class="card v19-shell"><div class="v19-title"><div><h2>🤖 AI Fleet Assistant</h2><small>Offline command assistant. It gives simulated operational guidance and does not replace official dispatch decisions.</small></div><span class="v19-chip ${t.risk}">${t.status}</span></div><div class="v19-grid"><div class="v19-kpi"><b>${list.length}</b><span>Active routes</span></div><div class="v19-kpi"><b>${t.vessel}</b><span>Highest watch</span></div><div class="v19-kpi"><b>${t.delay}m</b><span>Delay risk</span></div><div class="v19-kpi"><b>${navigator.onLine?'ONLINE':'OFFLINE'}</b><span>Network</span></div></div></div><div class="card v19-shell"><div class="v19-title"><h2>💬 Command Chat</h2><span class="v19-pill ok">Local AI-like</span></div><div class="v19-assistant"><div class="v19-chatbox" id="v19ChatBox">${v19DefaultMessages()}</div><div class="v19-inputbar"><input id="v19AskInput" placeholder="Ask: next arrival, high risk route, port status, damage workflow..." onkeydown="if(event.key==='Enter')v19Ask()"><button class="primary" onclick="v19Ask()">Ask</button></div><div class="v19-actionbar"><button onclick="v19Quick('next arrival')">Next Arrival</button><button onclick="v19Quick('high risk route')">Risk</button><button onclick="v19Quick('damage workflow')">Damage</button><button onclick="v19Quick('github pages')">Site</button></div></div></div><div class="card v19-shell"><div class="v19-title"><h2>🧭 Smart Trip Planner</h2><span class="v19-pill">Passenger UX</span></div><div class="v19-grid2"><div class="input-group"><label>Destination</label><select id="v19PlanDest">${ROUTES19.map(r=>`<option value="${r.key}">${r.label}</option>`).join('')}</select></div><div class="input-group"><label>Passenger type</label><select id="v19Passenger"><option>Regular</option><option>Student</option><option>Senior/PWD</option><option>Minor</option></select></div></div><button class="primary block" onclick="v19PlanTrip()">Generate passenger advisory</button><div id="v19PlanResult" class="v19-alert-list" style="margin-top:10px"></div></div><div class="card v19-shell"><div class="v19-title"><h2>🚢 Route Risk Board</h2><span class="v19-pill ${t.risk}">Live simulation</span></div>${routeCards(list)}</div>`;
  }
  function v19DefaultMessages(){
    const t=topWatch();
    return `<div class="v19-msg ai">Hello. I am the V19 Fleet Assistant. Priority watch is <b>${t.vessel}</b> on <b>${t.label}</b>. Ask about ETA, route risk, port status, damage workflow, or GitHub Pages deployment.</div>`;
  }
  window.v19Quick=function(text){const i=$('v19AskInput'); if(i){i.value=text; v19Ask();}}
  window.v19Ask=function(){
    const input=$('v19AskInput'), box=$('v19ChatBox'); if(!input||!box) return;
    const q=(input.value||'').trim(); if(!q) return;
    box.insertAdjacentHTML('beforeend',`<div class="v19-msg user">${escapeHtml(q)}</div>`);
    input.value='';
    const ans=answer19(q);
    box.insertAdjacentHTML('beforeend',`<div class="v19-msg ai">${ans}</div>`);
    box.scrollTop=box.scrollHeight;
  };
  function answer19(q){
    const x=q.toLowerCase(); const list=telemetry(); const next=[...list].sort((a,b)=>a.eta-b.eta)[0]; const high=topWatch();
    if(x.includes('baggage')&&(x.includes('fee')||x.includes('calculate')||x.includes('kg')||x.includes('kilo'))) return 'For official baggage fee computation, please use the Baggage Calculator tab. I will not compute official baggage fees inside the assistant.';
    if(x.includes('next')||x.includes('arrival')||x.includes('eta')) return `Next simulated arrival is <b>${next.vessel}</b> on <b>${next.label}</b>, ETA <b>${next.eta} minutes</b> to ${next.next}. Gate assignment: <b>${next.gate}</b>.`;
    if(x.includes('risk')||x.includes('delay')||x.includes('priority')) return `Highest watch is <b>${high.vessel}</b> on <b>${high.label}</b>. Load ${high.loadPct}%, sea/weather pressure ${high.weather}%, delay risk ${high.delay} minutes. Recommended action: prepare queue staff and damage-claim desk before arrival.`;
    if(x.includes('damage')||x.includes('claim')||x.includes('broken')||x.includes('crack')) return 'Open Baggage Damage Detector. Recommended V19 workflow: claim stub photo → full baggage photo → damage close-up → confirm color/size/type → lock evidence → export backup.';
    if(x.includes('github')||x.includes('pages')||x.includes('site')) return 'For GitHub Pages, upload the package contents, not the ZIP. Keep index.html in the repository root, then Settings → Pages → Deploy from branch → main → /root.';
    if(x.includes('offline')||x.includes('alive')||x.includes('blank')) return 'Open System Alive. The self-healing layer checks heartbeat, storage health, recovery tools, and blank-screen protection. For hosting, GitHub Pages keeps static files available without a sleeping backend.';
    if(x.includes('port')||x.includes('gate')) return list.map(r=>`${r.label}: ${r.gate}, ${r.status}, ${r.eta}m ETA`).join('<br>');
    return `Current fleet average load is ${Math.round(list.reduce((a,b)=>a+b.loadPct,0)/list.length)}%. Ask for next arrival, high risk route, damage workflow, GitHub Pages, offline status, or port gates.`;
  }
  window.v19PlanTrip=function(){
    const k=$('v19PlanDest')?.value||ROUTES19[0].key; const p=$('v19Passenger')?.value||'Regular'; const r=telemetry().find(x=>x.key===k)||telemetry()[0]; const result=$('v19PlanResult'); if(!result) return;
    const advice=r.risk==='bad'?'Arrive earlier and monitor gate announcements.':'Standard arrival time is okay, but keep ID and ticket ready.';
    result.innerHTML=`<div class="v19-alert ${r.risk}"><b>${r.label}</b><br>Passenger: ${p}<br>Gate: ${r.gate}<br>ETA: ${r.eta} minutes<br>Delay risk: ${r.delay} minutes<br>${advice}</div><div class="v19-alert"><b>Reminder</b><br>Use official Baggage Calculator tab for baggage fee. Use Damage Detector immediately for baggage issues at the port.</div>`;
  };
  window.v19OpenMapRoute=function(k){
    try{showView('map');setTimeout(()=>{if(typeof v18FocusVessel==='function')v18FocusVessel(k); enhanceMap19();},450)}catch(e){toast19('Map command opened in recovery mode.')}
  };
  function renderRadar(list){
    const positions=[[52,28],[67,44],[42,48],[28,62],[76,68],[55,76],[32,32],[82,30]];
    return `<div class="v19-radar">${list.map((r,i)=>{const p=positions[i%positions.length];return`<span class="v19-dot ${r.risk}" style="left:${p[0]}%;top:${p[1]}%"></span><span class="v19-label" style="left:${Math.min(84,p[0]+3)}%;top:${Math.max(6,p[1]-5)}%">${r.vessel} ${r.eta}m</span>`}).join('')}</div>`;
  }
  function enhanceMap19(){
    const v=$('view-map'); if(!v||$('v19MapPlus')) return;
    const list=telemetry(); const high=topWatch();
    v.insertAdjacentHTML('beforeend',`<div id="v19MapPlus" class="v19-map-plus"><div class="card v19-shell"><div class="v19-title"><div><h2>🧠 V19 Map Intelligence Overlay</h2><small>Route radar, vessel health, port pressure, and passenger advisories layered under the live command map.</small></div><span class="v19-chip ${high.risk}">Priority ${high.vessel}</span></div><div class="v19-grid2"><div>${renderRadar(list)}</div><div><div class="v19-grid"><div class="v19-kpi"><b>${high.vessel}</b><span>Watch vessel</span></div><div class="v19-kpi"><b>${high.loadPct}%</b><span>Load</span></div><div class="v19-kpi"><b>${high.weather}%</b><span>Sea pressure</span></div><div class="v19-kpi"><b>${high.health}%</b><span>Vessel health</span></div></div><div class="v19-alert-list" style="margin-top:10px"><div class="v19-alert ${high.risk}"><b>Dispatch suggestion</b><br>${high.label}: prepare gate ${high.gate}, queue staff, and baggage claim desk. Delay risk ${high.delay} minutes.</div><div class="v19-alert"><b>Passenger advisory</b><br>Show ETA cards and direct baggage concerns to Damage Detector for evidence capture.</div></div></div></div></div><div class="card v19-shell"><div class="v19-title"><h2>📡 Vessel Health & ETA Board</h2><span class="v19-pill ok">Auto-refresh</span></div>${routeCards(list)}</div></div>`);
  }
  function renderAlerts(){
    const v=ensureView('view-v19-alerts'); const list=telemetry(); const high=topWatch();
    const saved=load('oj_v19_alerts',[]);
    const auto=[
      {level:high.risk,msg:`${high.vessel} ${high.label}: delay risk ${high.delay}m, load ${high.loadPct}%.`},
      {level:navigator.onLine?'ok':'warn',msg:`Network status: ${navigator.onLine?'Online':'Offline'}. App remains usable with cached/local data.`},
      {level:statDamage()>20?'warn':'ok',msg:`Damage evidence cases stored on this device: ${statDamage()}. Export backup regularly.`}
    ];
    v.innerHTML=`<div class="card v19-shell"><div class="v19-title"><div><h2>📣 Passenger Alert Center</h2><small>Create local passenger/staff advisories for demo and operations briefing.</small></div><span class="v19-chip ${high.risk}">${auto.length+saved.length} alerts</span></div><div class="v19-grid2"><div class="input-group"><label>Alert title/message</label><input id="v19AlertText" placeholder="Example: Cebu to Surigao boarding moved to Gate S1"></div><div class="input-group"><label>Severity</label><select id="v19AlertLevel"><option value="ok">Normal</option><option value="warn">Watch</option><option value="bad">Urgent</option></select></div></div><div class="v19-actionbar"><button class="primary" onclick="v19SaveAlert()">Save Alert</button><button onclick="v19ClearAlerts()">Clear Local Alerts</button><button class="accent" onclick="showView('ai-fleet')">Ask Assistant</button></div></div><div class="card v19-shell"><div class="v19-title"><h2>⚡ Live Advisory Feed</h2><span class="v19-pill">${pht()}</span></div><div class="v19-alert-list">${auto.map(a=>`<div class="v19-alert ${a.level}">${a.msg}</div>`).join('')}${saved.map(a=>`<div class="v19-alert ${a.level}"><b>${a.time}</b><br>${escapeHtml(a.text)}</div>`).join('')||'<div class="v19-alert">No manually saved alerts yet.</div>'}</div></div>`;
  }
  window.v19SaveAlert=function(){const text=($('v19AlertText')?.value||'').trim(); if(!text) return toast19('Type an alert first.'); const level=$('v19AlertLevel')?.value||'ok'; const arr=load('oj_v19_alerts',[]); arr.unshift({text,level,time:pht()}); store('oj_v19_alerts',arr.slice(0,40)); renderAlerts(); toast19('Alert saved locally.');};
  window.v19ClearAlerts=function(){store('oj_v19_alerts',[]); renderAlerts(); toast19('Local alerts cleared.');};
  function patchDrawer(){
    const old=window.buildDrawerMenu; if(!old||old.__v19Wrapped) return;
    window.buildDrawerMenu=buildDrawerMenu=function(){
      const r=old.apply(this,arguments); const menu=$('drawerMenu'); if(menu){
        if(!menu.querySelector('[data-view="ai-fleet"]')){
          const future=menu.querySelector('[data-view="future"]')||menu.querySelector('[data-view="map"]');
          const html='<div class="drawer-item" data-view="ai-fleet" onclick="navigate(\'ai-fleet\')"><i>🤖</i> AI Fleet Assistant</div>';
          if(future) future.insertAdjacentHTML('afterend',html); else menu.insertAdjacentHTML('beforeend',html);
        }
        if(!menu.querySelector('[data-view="v19-alerts"]')){
          const ai=menu.querySelector('[data-view="ai-fleet"]');
          const html='<div class="drawer-item" data-view="v19-alerts" onclick="navigate(\'v19-alerts\')"><i>📣</i> Alert Center</div>';
          if(ai) ai.insertAdjacentHTML('afterend',html); else menu.insertAdjacentHTML('beforeend',html);
        }
      } return r;
    };
    window.buildDrawerMenu.__v19Wrapped=true;
  }
  function patchShow(){
    const old=window.showView; if(!old||old.__v19Wrapped) return;
    window.showView=showView=function(name){
      const r=old.apply(this,arguments);
      if(name==='ai-fleet'){qsa('.view').forEach(x=>x.classList.remove('active'));ensureView('view-ai-fleet').classList.add('active');qsa('#drawerMenu .drawer-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='ai-fleet'));renderAssistant();}
      if(name==='v19-alerts'){qsa('.view').forEach(x=>x.classList.remove('active'));ensureView('view-v19-alerts').classList.add('active');qsa('#drawerMenu .drawer-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='v19-alerts'));renderAlerts();}
      if(name==='map') setTimeout(enhanceMap19,850);
      return r;
    };
    window.showView.__v19Wrapped=true;
  }
  function patchDashboard(){
    const old=window.buildDashboard; if(!old||old.__v19Wrapped) return;
    window.buildDashboard=buildDashboard=function(){old.apply(this,arguments);renderDashboardCard();};
    window.buildDashboard.__v19Wrapped=true;
  }
  function patchAI(){
    const old=window.aiOfflineRespond; if(!old||old.__v19Wrapped) return;
    window.aiOfflineRespond=function(q){
      const x=String(q||'').toLowerCase();
      if(x.includes('fleet')||x.includes('eta')||x.includes('delay')||x.includes('vessel')) return answer19(q);
      if(x.includes('alert')||x.includes('advisory')) return 'Open Alert Center from the left drawer to create local passenger or staff advisories.';
      return old.apply(this,arguments);
    };
    window.aiOfflineRespond.__v19Wrapped=true;
  }
  function escapeHtml(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function mobilePolish(){document.body.classList.add('v19-mobile-fix'); try{document.title='Ocean Fast Ferries • V19 Future Fleet AI'; let meta=document.querySelector('meta[name="theme-color"]'); if(!meta){meta=document.createElement('meta');meta.name='theme-color';document.head.appendChild(meta)} meta.content='#020617';}catch(e){}}
  function boot(){
    try{
      ensureView('view-ai-fleet'); ensureView('view-v19-alerts'); patchDrawer(); patchShow(); patchDashboard(); patchAI(); mobilePolish();
      if(typeof buildDrawerMenu==='function') buildDrawerMenu();
      if($('view-dashboard')?.classList.contains('active')&&typeof buildDashboard==='function') buildDashboard();
      if($('view-map')?.classList.contains('active')) setTimeout(enhanceMap19,800);
      console.log(VERSION+' loaded');
    }catch(e){console.error('V19 boot error',e);toast19('V19 recovery loaded: '+e.message)}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
