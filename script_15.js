
(function(){
  'use strict';
  if(window.__OCEAN_V18_FUTURE_PACK__) return;
  window.__OCEAN_V18_FUTURE_PACK__ = true;
  const V18_VERSION='V18 Future Mobility Command Pack';
  const $=id=>document.getElementById(id);
  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const safeToast=(msg)=>{try{ if(typeof toast==='function') return toast(msg); if(typeof toastV6==='function') return toastV6(msg); }catch(e){} console.log(msg);};
  const money=(n)=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
  const pht=()=>new Date().toLocaleString('en-PH',{timeZone:'Asia/Manila',hour12:true});
  const PORTS={
    cebu:{name:'Cebu Pier',lat:10.294,lng:123.905,load:74,gate:'A1-A8'},
    tagbilaran:{name:'Tagbilaran',lat:9.65,lng:123.85,load:58,gate:'B2'},
    ormoc:{name:'Ormoc',lat:11.006,lng:124.607,load:62,gate:'C3'},
    palompon:{name:'Palompon',lat:11.05,lng:124.38,load:46,gate:'C4'},
    getafe:{name:'Getafe',lat:10.148,lng:124.154,load:39,gate:'G1'},
    maasin:{name:'Maasin',lat:10.133,lng:124.844,load:66,gate:'M2'},
    surigao:{name:'Surigao',lat:9.783,lng:125.488,load:71,gate:'S1'},
    siquijor:{name:'Siquijor',lat:9.214,lng:123.515,load:53,gate:'Q1'},
    dumaguete:{name:'Dumaguete',lat:9.307,lng:123.305,load:57,gate:'D2'}
  };
  const ROUTES={
    cebu_tagbilaran:{label:'Cebu → Tagbilaran',ports:['cebu','tagbilaran'],vessel:'OJ 388',mins:125,speed:33},
    cebu_ormoc:{label:'Cebu → Ormoc',ports:['cebu','ormoc'],vessel:'OJ 88',mins:170,speed:30},
    cebu_palompon:{label:'Cebu → Palompon',ports:['cebu','palompon'],vessel:'OJ 188',mins:190,speed:28},
    cebu_getafe:{label:'Cebu → Getafe',ports:['cebu','getafe'],vessel:'OJ 216',mins:85,speed:27},
    cebu_maasin:{label:'Cebu → Maasin',ports:['cebu','maasin'],vessel:'OJ 288',mins:210,speed:31},
    cebu_surigao:{label:'Cebu → Surigao',ports:['cebu','maasin','surigao'],vessel:'OJ 328',mins:330,speed:29},
    cebu_siquijor:{label:'Cebu → Siquijor',ports:['cebu','tagbilaran','siquijor'],vessel:'OJ 788',mins:250,speed:32},
    cebu_dumaguete:{label:'Cebu → Dumaguete',ports:['cebu','tagbilaran','dumaguete'],vessel:'OJ 588',mins:285,speed:30}
  };
  let map18=null, markers18=[], lines18=[], timer18=null, selectedRoute18='all', paused18=false, fallback18=false;
  function riskClass(n){return n>=75?'bad':n>=58?'warn':'ok'}
  function riskText(n){return n>=75?'High':n>=58?'Moderate':'Smooth'}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n))}
  function routeProgress(routeKey,seedOffset){
    const r=ROUTES[routeKey]; const cycle=Math.max(60,r.mins)*60*1000;
    const raw=((Date.now()+seedOffset)%cycle)/cycle;
    const ports=r.ports.map(k=>PORTS[k]);
    const segCount=ports.length-1;
    const seg=Math.min(segCount-1,Math.floor(raw*segCount));
    const local=(raw*segCount)-seg;
    const a=ports[seg],b=ports[seg+1];
    const lat=a.lat+(b.lat-a.lat)*local;
    const lng=a.lng+(b.lng-a.lng)*local;
    const eta=Math.max(4,Math.round((1-raw)*r.mins));
    const load=clamp(Math.round((PORTS[r.ports[0]].load+PORTS[r.ports.at(-1)].load)/2 + Math.sin(raw*6.28)*12),20,96);
    return {lat,lng,progress:Math.round(raw*100),eta,load,next:ports[seg+1].name,from:ports[seg].name};
  }
  function routeOptions(){return '<option value="all">All main Cebu routes</option>'+Object.entries(ROUTES).map(([k,r])=>`<option value="${k}">${r.label}</option>`).join('')}
  function vesselData(){return Object.entries(ROUTES).map(([key,r],i)=>{const s=routeProgress(key,i*193000);return {key,...r,...s,status:riskText(s.load),risk:riskClass(s.load)}})}
  function portRows(){return Object.entries(PORTS).map(([k,p])=>`<div class="v18-route-row"><div><b>${p.name}</b><br><small>Gate ${p.gate} • Queue load ${p.load}%</small><div class="v18-meter" style="margin-top:7px"><span style="width:${p.load}%"></span></div></div><span class="v18-pill ${riskClass(p.load)}"><i class="v18-glow-dot ${riskClass(p.load)}"></i>${riskText(p.load)}</span></div>`).join('')}
  function vesselCards(list){return list.map(v=>`<div class="v18-vessel-card" onclick="v18FocusVessel('${v.key}')"><b>${v.vessel}</b><br><small>${v.label}</small><div class="v18-meter" style="margin:8px 0"><span style="width:${v.progress}%"></span></div><span class="v18-pill ${v.risk}">${v.eta} min ETA</span> <span class="v18-pill">${v.speed} kn</span></div>`).join('')}
  function fallbackSvg(list){
    const coords={cebu:[48,33],tagbilaran:[44,55],ormoc:[68,21],palompon:[63,24],getafe:[57,39],maasin:[73,51],surigao:[87,66],siquijor:[36,70],dumaguete:[31,77]};
    const lines=Object.entries(ROUTES).filter(([k])=>selectedRoute18==='all'||selectedRoute18===k).map(([k,r])=>r.ports.map(p=>coords[p].join(',')).join(' ')).map(points=>`<polyline points="${points}" fill="none" stroke="rgba(34,211,238,.75)" stroke-width="1.3" stroke-dasharray="3 2"/>`).join('');
    const ports=Object.entries(coords).map(([k,c])=>`<g><circle cx="${c[0]}" cy="${c[1]}" r="2.6" fill="#22d3ee"><animate attributeName="r" values="2.6;4;2.6" dur="2s" repeatCount="indefinite"/></circle><text x="${c[0]+3}" y="${c[1]+1}" fill="#dffcff" font-size="3.2">${PORTS[k].name.replace(' Pier','')}</text></g>`).join('');
    const vessels=list.filter(v=>selectedRoute18==='all'||selectedRoute18===v.key).map(v=>{const x=38+(v.lng-123.25)*33,y=82-(v.lat-9.1)*48;return`<g><circle cx="${clamp(x,8,94)}" cy="${clamp(y,8,92)}" r="3.8" fill="#f43f5e" stroke="#fff" stroke-width=".8"/><text x="${clamp(x,8,94)+4}" y="${clamp(y,8,92)+1}" fill="#fff" font-size="3.1">${v.vessel}</text></g>`}).join('');
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none"><defs><radialGradient id="sea" cx="50%" cy="45%"><stop offset="0" stop-color="rgba(34,211,238,.25)"/><stop offset="1" stop-color="rgba(2,6,23,.1)"/></radialGradient></defs><rect width="100" height="100" fill="url(#sea)"/>${lines}${ports}${vessels}</svg>`;
  }
  function buildMapHtml(){
    const list=vesselData(); const avg=Math.round(list.reduce((a,b)=>a+b.load,0)/list.length); const active=selectedRoute18==='all'?list:list.filter(v=>v.key===selectedRoute18);
    return `<div class="card v18-shell"><div class="v18-title"><h2>🗺️ Live Map Command Center</h2><span class="v18-pill ${riskClass(avg)}"><i class="v18-glow-dot ${riskClass(avg)}"></i>Fleet ${riskText(avg)}</span></div><div class="v18-ticker"><span>⚓ Simulated fleet telemetry • Cebu hub active • Use this tab as a demo command map for routes, ETA, queue pressure, and port readiness • ${pht()} PHT</span></div><div class="v18-map-wrap" id="v18MapWrap"><div id="v18LiveMap"></div><div id="v18MapFallback" class="v18-map-fallback"></div><div class="v18-map-hud"><div class="v18-map-card"><b id="v18HudTitle">All vessels</b><br><small id="v18HudSub">${active.length} active route(s)</small></div><div class="v18-map-card"><span class="v18-pill ${riskClass(avg)}">Avg load ${avg}%</span></div></div><div class="v18-map-controls"><select id="v18RouteSelect" onchange="v18SelectRoute(this.value)">${routeOptions()}</select><button class="primary" onclick="v18ToggleMapPause()" id="v18PauseBtn">⏸ Pause telemetry</button></div></div></div><div class="card"><div class="card-header">🚢 Smart Vessel Cards</div><div class="v18-vessel-list" id="v18VesselCards">${vesselCards(active)}</div></div><div class="card"><div class="card-header">⚓ Port Readiness Board</div>${portRows()}</div><div class="card v18-shell"><div class="card-header">🧠 AI Operations Suggestions</div><div id="v18OpsAdvice">${opsAdvice(list)}</div></div>`;
  }
  function opsAdvice(list){
    const highest=[...list].sort((a,b)=>b.load-a.load)[0]; const fastest=[...list].sort((a,b)=>a.eta-b.eta)[0];
    return `<div class="v18-route-row"><div><b>Priority Watch</b><br><small>${highest.label} has ${highest.load}% pressure. Prepare baggage claim and gate queue staff.</small></div><span class="v18-pill ${highest.risk}">${highest.status}</span></div><div class="v18-route-row"><div><b>Next Arrival</b><br><small>${fastest.vessel} on ${fastest.label}, ETA ${fastest.eta} minutes to ${fastest.next}.</small></div><span class="v18-pill ok">Dispatch ready</span></div><div class="v18-route-row"><div><b>Passenger UX</b><br><small>Keep public mode open. Admin login remains required only inside Admin Panel.</small></div><span class="v18-pill">Public access</span></div>`;
  }
  function renderMap18(){
    const v=$('view-map'); if(!v) return;
    v.innerHTML=buildMapHtml();
    setTimeout(initLeaflet18,80);
    refreshMap18();
    clearInterval(timer18); timer18=setInterval(()=>{if(!paused18) refreshMap18()},3000);
  }
  function initLeaflet18(){
    const wrap=$('v18MapWrap'); const el=$('v18LiveMap'); if(!wrap||!el) return;
    try{
      if(!window.L) throw new Error('Leaflet not loaded');
      fallback18=false; wrap.classList.remove('fallback');
      if(map18){try{map18.remove()}catch(e){} map18=null;}
      try{ if(window.map && typeof window.map.remove==='function'){ window.map.remove(); window.map=null; } }catch(e){}
      map18=L.map('v18LiveMap',{zoomControl:false,attributionControl:false,preferCanvas:true}).setView([10.28,124.25],7);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:18}).addTo(map18);
      L.control.zoom({position:'bottomright'}).addTo(map18);
      drawLeaflet18();
      setTimeout(()=>{try{map18.invalidateSize()}catch(e){}},260);
    }catch(e){
      fallback18=true; wrap.classList.add('fallback');
      refreshFallback18();
    }
  }
  function drawLeaflet18(){
    if(!map18||fallback18) return;
    markers18.forEach(m=>{try{m.remove()}catch(e){}}); lines18.forEach(l=>{try{l.remove()}catch(e){}}); markers18=[]; lines18=[];
    const list=vesselData().filter(v=>selectedRoute18==='all'||v.key===selectedRoute18);
    Object.entries(ROUTES).filter(([k])=>selectedRoute18==='all'||selectedRoute18===k).forEach(([k,r])=>{
      const latlngs=r.ports.map(p=>[PORTS[p].lat,PORTS[p].lng]);
      lines18.push(L.polyline(latlngs,{color:'#22d3ee',weight:selectedRoute18===k?4:2,opacity:selectedRoute18===k?.95:.45,dashArray:'8 8'}).addTo(map18));
    });
    Object.entries(PORTS).forEach(([k,p])=>{
      const m=L.circleMarker([p.lat,p.lng],{radius:5,color:'#22d3ee',fillColor:'#0f172a',fillOpacity:.95,weight:2}).addTo(map18);
      m.bindPopup(`<b>${p.name}</b><br>Gate: ${p.gate}<br>Queue: ${p.load}%`); markers18.push(m);
    });
    list.forEach(v=>{
      const color=v.risk==='bad'?'#ef4444':v.risk==='warn'?'#f59e0b':'#22c55e';
      const m=L.circleMarker([v.lat,v.lng],{radius:9,color:'#ffffff',fillColor:color,fillOpacity:.95,weight:2}).addTo(map18);
      m.bindPopup(`<b>${v.vessel}</b><br>${v.label}<br>ETA: ${v.eta} min<br>Load: ${v.load}%<br>Next: ${v.next}`); markers18.push(m);
    });
    if(selectedRoute18!=='all'){
      const r=ROUTES[selectedRoute18]; const bounds=L.latLngBounds(r.ports.map(p=>[PORTS[p].lat,PORTS[p].lng]));
      try{map18.fitBounds(bounds.pad(.28),{animate:true,duration:.4})}catch(e){}
    }
  }
  function refreshFallback18(){const f=$('v18MapFallback'); if(f) f.innerHTML=fallbackSvg(vesselData());}
  function refreshMap18(){
    const list=vesselData(); const active=selectedRoute18==='all'?list:list.filter(v=>v.key===selectedRoute18); const avg=Math.round(active.reduce((a,b)=>a+b.load,0)/Math.max(1,active.length));
    if($('v18VesselCards')) $('v18VesselCards').innerHTML=vesselCards(active);
    if($('v18OpsAdvice')) $('v18OpsAdvice').innerHTML=opsAdvice(list);
    if($('v18HudTitle')) $('v18HudTitle').textContent=selectedRoute18==='all'?'All vessels':ROUTES[selectedRoute18].label;
    if($('v18HudSub')) $('v18HudSub').textContent=`${active.length} active • avg load ${avg}% • ${pht().split(',').pop().trim()}`;
    if(fallback18) refreshFallback18(); else drawLeaflet18();
  }
  window.v18SelectRoute=function(k){selectedRoute18=k||'all'; refreshMap18();};
  window.v18ToggleMapPause=function(){paused18=!paused18; const b=$('v18PauseBtn'); if(b)b.textContent=paused18?'▶ Resume telemetry':'⏸ Pause telemetry'; safeToast(paused18?'Telemetry paused.':'Telemetry resumed.');};
  window.v18FocusVessel=function(k){selectedRoute18=k; const s=$('v18RouteSelect'); if(s)s.value=k; refreshMap18();};
  function patchMap(){window.buildMap=buildMap=renderMap18; window.initMap=initLeaflet18;}
  function ensureFutureView(){
    if($('view-future')) return;
    const v=document.createElement('div'); v.id='view-future'; v.className='view';
    const anchor=$('view-map')||document.querySelector('.view:last-of-type');
    if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(v,anchor.nextSibling); else document.querySelector('.app')?.appendChild(v);
  }
  function buildFuture(){
    const list=vesselData(); const avg=Math.round(list.reduce((a,b)=>a+b.load,0)/list.length);
    $('view-future').innerHTML=`<div class="card v18-shell"><div class="v18-title"><h2>🚀 Future Mobility Lab</h2><span class="v18-pill ok">V18 Active</span></div><div class="v18-grid4"><div class="v18-kpi"><b>${Object.keys(ROUTES).length}</b><span>Smart Routes</span></div><div class="v18-kpi"><b>${avg}%</b><span>Fleet Load</span></div><div class="v18-kpi"><b>${navigator.onLine?'ON':'OFF'}</b><span>Network</span></div><div class="v18-kpi"><b>PWA</b><span>Site Ready</span></div></div><div class="v18-action-grid" style="margin-top:12px"><button class="primary" onclick="showView('map')">Open Live Map</button><button class="accent" onclick="showView('damage')">Damage Evidence</button><button onclick="showView('export')">Export Center</button><button onclick="showView('alive')">System Alive</button></div></div><div class="card"><div class="card-header">🧭 Innovation Added</div><div class="v18-route-row"><div><b>Command Map 2.0</b><br><small>Live vessel simulation, route filter, ETA, port load, and Leaflet fallback SVG map.</small></div><span class="v18-pill ok">New</span></div><div class="v18-route-row"><div><b>Mobile-first polish</b><br><small>Better spacing, drawer scroll, safe-area support, no floating tab clutter.</small></div><span class="v18-pill ok">New</span></div><div class="v18-route-row"><div><b>Operations suggestions</b><br><small>App shows priority route, next arrival, and staffing recommendation.</small></div><span class="v18-pill hot">AI-like</span></div></div><div class="card v18-shell"><div class="card-header">🌊 Route Network Preview</div>${Object.entries(ROUTES).map(([k,r])=>{const s=routeProgress(k,0);return`<div class="v18-route-row" onclick="showView('map');setTimeout(()=>v18FocusVessel('${k}'),250)"><div><b>${r.label}</b><br><small>${r.vessel} • ${s.eta} min ETA • ${r.ports.map(p=>PORTS[p].name.replace(' Pier','')).join(' → ')}</small><div class="v18-meter" style="margin-top:7px"><span style="width:${s.progress}%"></span></div></div><span class="v18-pill ${riskClass(s.load)}">${s.load}%</span></div>`}).join('')}</div>`;
  }
  function patchShowView(){
    const old=window.showView;
    if(!old||old.__v18Wrapped) return;
    window.showView=showView=function(name){
      const r=old.apply(this,arguments);
      if(name==='future') buildFuture();
      if(name==='map') setTimeout(()=>{try{renderMap18()}catch(e){console.error('V18 map error',e)}},50);
      return r;
    };
    window.showView.__v18Wrapped=true;
  }
  function patchDrawer(){
    const old=window.buildDrawerMenu;
    if(!old||old.__v18Wrapped) return;
    window.buildDrawerMenu=buildDrawerMenu=function(){
      const r=old.apply(this,arguments); const menu=$('drawerMenu');
      if(menu&&!menu.querySelector('[data-view="future"]')){
        const mapItem=menu.querySelector('[data-view="map"]');
        const html=`<div class="drawer-item" data-view="future" onclick="navigate('future')"><i>🚀</i> Future Mobility Lab</div>`;
        if(mapItem) mapItem.insertAdjacentHTML('afterend',html); else menu.insertAdjacentHTML('beforeend',html);
      }
      return r;
    };
    window.buildDrawerMenu.__v18Wrapped=true;
  }
  function patchDashboard(){
    const old=window.buildDashboard;
    if(!old||old.__v18Wrapped) return;
    window.buildDashboard=buildDashboard=function(){
      old.apply(this,arguments); const v=$('view-dashboard'); if(!v||$('v18Dash')) return;
      const list=vesselData(); const hi=[...list].sort((a,b)=>b.load-a.load)[0];
      v.insertAdjacentHTML('afterbegin',`<div id="v18Dash" class="card v18-shell"><div class="v18-title"><h2>🚀 V18 Fleet Intelligence</h2><span class="v18-pill ${hi.risk}">${hi.status}</span></div><div class="v18-grid3"><div class="v18-kpi"><b>${hi.vessel}</b><span>Watch Vessel</span></div><div class="v18-kpi"><b>${hi.eta}m</b><span>Next ETA</span></div><div class="v18-kpi"><b>${hi.load}%</b><span>Route Load</span></div></div><button class="primary block" style="margin-top:12px" onclick="showView('map')">Open Live Map Command Center</button></div>`);
    };
    window.buildDashboard.__v18Wrapped=true;
  }
  function patchAI(){
    const old=window.aiOfflineRespond;
    if(!old||old.__v18Wrapped) return;
    window.aiOfflineRespond=function(q){
      const x=String(q||'').toLowerCase();
      if(x.includes('map')||x.includes('vessel')||x.includes('eta')||x.includes('port')||x.includes('live')){
        const hi=[...vesselData()].sort((a,b)=>a.eta-b.eta)[0];
        return `Live Map Command Center is available in the left navigation. Next simulated arrival: ${hi.vessel} on ${hi.label}, ETA ${hi.eta} minutes to ${hi.next}.`;
      }
      if(x.includes('future')||x.includes('innovation')||x.includes('v18')) return 'Open Future Mobility Lab to see the V18 route network, mobile polish, fleet command map, and system shortcuts.';
      return old.apply(this,arguments);
    };
    window.aiOfflineRespond.__v18Wrapped=true;
  }
  function enhanceDamageView(){
    const v=$('view-damage'); if(!v||$('v18DamageHint')) return;
    v.insertAdjacentHTML('afterbegin',`<div id="v18DamageHint" class="card v18-shell"><div class="card-header">🧳 V18 Field Workflow</div><div class="v18-grid3"><div class="v18-kpi"><b>1</b><span>Claim Stub</span></div><div class="v18-kpi"><b>2</b><span>Full Bag</span></div><div class="v18-kpi"><b>3</b><span>Damage Close</span></div></div><div class="v18-route-row"><div><b>Staff reminder</b><br><small>Capture at least 3 angles before locking evidence. Export backup before clearing logs.</small></div><span class="v18-pill ok">Ready</span></div></div>`);
  }
  function watchDamage(){
    const old=window.showView;
    if(!old||old.__v18DamageWrapped) return;
    window.showView=showView=function(name){const r=old.apply(this,arguments); if(name==='damage') setTimeout(enhanceDamageView,300); return r;};
    window.showView.__v18DamageWrapped=true;
  }
  function updateManifestMeta(){
    try{document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#020617'); document.title='Ocean Fast Ferries • V18 Command App';}catch(e){}
  }
  function boot(){
    try{
      ensureFutureView(); patchMap(); patchDrawer(); patchShowView(); patchDashboard(); patchAI(); watchDamage(); updateManifestMeta();
      if(typeof buildDrawerMenu==='function') buildDrawerMenu();
      if($('view-dashboard')?.classList.contains('active')&&typeof buildDashboard==='function') buildDashboard();
      if($('view-map')?.classList.contains('active')) renderMap18();
      console.log(V18_VERSION+' loaded');
    }catch(e){console.error('V18 boot error',e); safeToast('V18 loaded with recovery mode: '+e.message)}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
