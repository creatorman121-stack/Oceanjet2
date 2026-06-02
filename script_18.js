
(function(){
  'use strict';
  if(window.__OJ_V23_EFFICIENCY_ENGINE__) return;
  window.__OJ_V23_EFFICIENCY_ENGINE__ = true;

  const VERSION = 'V23 Efficiency + Effectiveness Engine';
  const CLAIM_KEY = 'oj_v22_claims';
  const HEALTH_KEY = 'oj_v22_health';
  const BACKUP_KEY = 'oj_v22_last_auto_backup';
  const PERF_KEY = 'oj_v23_perf_settings';
  const INDEX_KEY = 'oj_v23_claim_index';
  const LAST_AUDIT_KEY = 'oj_v23_last_audit';
  const ROUTES = [
    ['cebu_tagbilaran','Cebu → Tagbilaran'],
    ['cebu_maasin','Cebu → Maasin'],
    ['cebu_surigao','Cebu → Surigao'],
    ['cebu_siquijor','Cebu → Siquijor'],
    ['cebu_dumaguete','Cebu → Dumaguete'],
    ['cebu_ormoc','Cebu → Ormoc'],
    ['cebu_palompon','Cebu → Palompon'],
    ['cebu_getafe','Cebu → Getafe']
  ];
  const VIEWS = {
    portal:'Smart Portal',dashboard:'Dashboard',calc:'Baggage Calculator',damage:'Damage Detector',
    claimstatus:'Claim Status',lostbaggage:'Report Baggage',staffcounter:'Staff Counter',
    efficiency:'Efficiency Center',triage:'Smart Triage Queue',quickfind:'Quick Find',
    sitehealth:'Site Health',contentmanager:'Content Manager',admin:'Admin Panel',fares:'Fares',schedules:'Schedules',history:'History',livemap:'Live Map'
  };

  const $ = id => document.getElementById(id);
  const qs = (s,root=document) => root.querySelector(s);
  const qsa = (s,root=document) => Array.from(root.querySelectorAll(s));
  const idle = window.requestIdleCallback || function(fn){ return setTimeout(()=>fn({timeRemaining:()=>15}), 1); };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const load = (k,f) => { try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : f; } catch(e) { return f; } };
  const save = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e) { v23Log('Storage save failed: '+e.message); return false; } };
  const now = () => new Date().toLocaleString('en-PH', {timeZone:'Asia/Manila', hour12:true});
  const claims = () => load(CLAIM_KEY, []);
  const setClaims = v => { save(CLAIM_KEY, v); localStorage.setItem(BACKUP_KEY, now()); buildClaimIndex(v); };

  function toast(msg){
    if(typeof window.toast === 'function') return window.toast(msg);
    const el = document.createElement('div');
    el.className = 'v23-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),2600);
  }

  function v23Log(msg){
    try{
      const h = load(HEALTH_KEY, []);
      h.unshift({time:now(), msg:'V23: '+String(msg).slice(0,220)});
      save(HEALTH_KEY, h.slice(0,80));
    }catch(e){}
  }

  window.addEventListener('error', e => v23Log('JS error: '+(e.message || 'unknown')));
  window.addEventListener('unhandledrejection', e => v23Log('Promise error: '+((e.reason && e.reason.message) || e.reason || 'unknown')));

  function injectStyles(){
    if($('ojV23Styles')) return;
    const style = document.createElement('style');
    style.id = 'ojV23Styles';
    style.textContent = `
      :root{--v23-cyan:#00f5ff;--v23-pink:#ff2f8d;--v23-lime:#7CFF8A;--v23-amber:#ffd166;--v23-red:#ff5d73;}
      .v23-mobile-optimized .app{max-width:980px;margin:0 auto;}
      .v23-mobile-optimized .view{padding-bottom:22px;}
      .v23-mobile-optimized input,.v23-mobile-optimized select,.v23-mobile-optimized textarea,.v23-mobile-optimized button{min-height:42px;font-size:15px;}
      .v23-mobile-optimized .card{overflow:hidden;}
      .v23-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:10px;}
      .v23-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;}
      .v23-kpi{border:1px solid rgba(0,245,255,.22);background:rgba(255,255,255,.055);border-radius:16px;padding:13px;text-align:center;}
      .v23-kpi b{display:block;font-size:1.45rem;color:var(--v23-cyan);text-shadow:0 0 12px rgba(0,245,255,.4);}
      .v23-kpi span{display:block;font-size:.68rem;color:#a8b2d1;text-transform:uppercase;letter-spacing:.75px;}
      .v23-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(0,245,255,.3);background:rgba(0,245,255,.08);color:#a9ffff;border-radius:999px;padding:4px 9px;font-size:.68rem;font-weight:900;}
      .v23-chip.pink{border-color:rgba(255,47,141,.4);background:rgba(255,47,141,.09);color:#ff9fcd;}
      .v23-chip.green{border-color:rgba(124,255,138,.38);background:rgba(124,255,138,.08);color:#bcffc3;}
      .v23-chip.amber{border-color:rgba(255,209,102,.48);background:rgba(255,209,102,.09);color:#ffe2a1;}
      .v23-chip.red{border-color:rgba(255,93,115,.48);background:rgba(255,93,115,.1);color:#ff9baa;}
      .v23-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:14px;margin:8px 0;}
      .v23-row strong{color:#fff;}
      .v23-row small{display:block;color:#a8b2d1;margin-top:3px;line-height:1.35;}
      .v23-actions{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-top:10px;}
      .v23-meter{height:9px;border-radius:999px;background:rgba(255,255,255,.13);overflow:hidden;}
      .v23-meter span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--v23-cyan),var(--v23-pink));transition:width .25s;}
      .v23-command{position:sticky;top:8px;z-index:15;border:1px solid rgba(0,245,255,.28);background:rgba(4,9,24,.86);backdrop-filter:blur(14px);border-radius:18px;padding:10px;margin-bottom:10px;box-shadow:0 0 22px rgba(0,245,255,.1);}
      .v23-result{cursor:pointer;transition:.18s;}
      .v23-result:hover{transform:translateY(-2px);border-color:rgba(0,245,255,.45);}
      .v23-alert{border-left:4px solid var(--v23-amber);padding:10px;background:rgba(255,209,102,.08);border-radius:12px;color:#ffe8b3;margin:8px 0;}
      .v23-toast{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:99999;background:linear-gradient(135deg,#00f5ff,#ff2f8d);color:#061020;font-weight:900;padding:10px 16px;border-radius:999px;box-shadow:0 10px 35px rgba(0,0,0,.35);}
      .v23-fast *{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important;}
      .v23-fast .glow,.v23-fast .card,.v23-fast .damage-shell{box-shadow:none!important;backdrop-filter:none!important;}
      .v23-fast .damage-hud{background:none!important;}
      .v23-fast img{image-rendering:auto;}
      @media(max-width:640px){.v23-row{align-items:flex-start;flex-direction:column}.v23-actions{grid-template-columns:1fr}.v23-grid,.v23-grid2{grid-template-columns:1fr}.v23-command{top:4px}.v23-mobile-optimized .card{margin:9px 0}.v23-mobile-optimized .drawer{max-width:86vw;}}
      @media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important;}}
    `;
    document.head.appendChild(style);
  }

  function ensureView(name){
    let el = $('view-'+name);
    if(!el){
      el = document.createElement('div');
      el.id = 'view-'+name;
      el.className = 'view';
      const app = qs('.app') || qs('main') || document.body;
      app.appendChild(el);
    }
    return el;
  }

  function storageStats(){
    let total = 0, items = [];
    try{
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i) || '';
        const v = localStorage.getItem(k) || '';
        const bytes = (k.length + v.length) * 2;
        total += bytes;
        items.push({key:k, bytes});
      }
    }catch(e){}
    return {bytes:total, mb:total/1024/1024, pct:Math.min(100, Math.round((total/1024/1024)/5*100)), items:items.sort((a,b)=>b.bytes-a.bytes)};
  }

  function healthScore(){
    const st = storageStats();
    const h = load(HEALTH_KEY, []);
    const active = claims().filter(c => !['Closed','Rejected'].includes(String(c.status || ''))).length;
    let score = 100;
    if(st.mb > 4) score -= 25; else if(st.mb > 2.5) score -= 12;
    if(h.length > 50) score -= 8;
    if(active > 25) score -= 10;
    if(!navigator.onLine) score -= 8;
    return Math.max(40, score);
  }

  function claimRisk(c){
    const text = ((c.type||'')+' '+(c.description||'')+' '+(c.priority||'')+' '+(c.status||'')).toLowerCase();
    let score = 0;
    if(String(c.priority).toLowerCase()==='high') score += 35;
    if(/crack|broken|wet|missing|wheel|handle|torn|critical|fragile/.test(text)) score += 28;
    if(['Submitted','Under Review'].includes(c.status)) score += 12;
    if(!c.contact) score += 7;
    if(!c.tag) score += 6;
    const created = Date.parse(c.createdAt || c.updatedAt || '') || 0;
    if(created && Date.now() - created > 86400000) score += 10;
    const label = score >= 55 ? 'Critical' : score >= 34 ? 'High' : score >= 18 ? 'Medium' : 'Normal';
    return {score:Math.min(100, score), label};
  }

  function buildClaimIndex(list=claims()){
    try{
      const index = {};
      list.forEach((c,i)=>{
        if(c.id) index[String(c.id).toUpperCase()] = i;
        if(c.tag) index[String(c.tag).toUpperCase()] = i;
      });
      sessionStorage.setItem(INDEX_KEY, JSON.stringify(index));
      return index;
    }catch(e){ return {}; }
  }

  function injectLazyLoading(){
    idle(()=> qsa('img').forEach(img => { img.loading = 'lazy'; img.decoding = 'async'; }));
  }

  function applyFastMode(){
    const settings = load(PERF_KEY, {fast:false, autoAudit:true});
    document.body.classList.toggle('v23-fast', !!settings.fast);
    document.body.classList.add('v23-mobile-optimized');
  }

  window.v23ToggleFastMode = function(){
    const s = load(PERF_KEY, {fast:false, autoAudit:true});
    s.fast = !s.fast;
    save(PERF_KEY, s);
    applyFastMode();
    toast(s.fast ? 'Fast Mode enabled.' : 'Fast Mode disabled.');
    renderEfficiency();
  };

  window.v23RunAudit = function(){
    const before = claims();
    const seen = new Set();
    const deduped = [];
    before.forEach(c=>{
      const key = String(c.id || c.tag || JSON.stringify(c).slice(0,50)).toUpperCase();
      if(!seen.has(key)){ seen.add(key); deduped.push(c); }
    });
    if(deduped.length !== before.length) setClaims(deduped);
    const h = load(HEALTH_KEY, []);
    if(h.length > 80) save(HEALTH_KEY, h.slice(0,80));
    localStorage.setItem(LAST_AUDIT_KEY, now());
    buildClaimIndex(deduped);
    injectLazyLoading();
    v23Log('Efficiency audit complete. Removed duplicates: '+(before.length-deduped.length));
    toast('Audit complete. Duplicate claims removed: '+(before.length-deduped.length));
    renderEfficiency();
  };

  window.v23CompactLogs = function(){
    const h = load(HEALTH_KEY, []);
    save(HEALTH_KEY, h.slice(0,35));
    v23Log('Logs compacted to latest 35 records.');
    toast('Logs compacted.');
    renderEfficiency();
  };

  window.v23DownloadSlimBackup = function(){
    const data = {
      version:VERSION,
      exportedAt:now(),
      claims:claims(),
      health:load(HEALTH_KEY, []).slice(0,50),
      settings:load(PERF_KEY, {}),
      damageSummary:(()=>{ const d=load('oj_damage_master_v11_backup',{}); return {cases:Array.isArray(d.cases)?d.cases.length:0,lastUpdated:d.lastUpdated||null}; })()
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)], {type:'application/json'}));
    a.download = 'oceanjet_v23_slim_backup.json';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),600);
  };

  function renderEfficiency(){
    const st = storageStats();
    const h = load(HEALTH_KEY, []);
    const all = claims();
    const active = all.filter(c => !['Closed','Rejected'].includes(String(c.status||''))).length;
    const high = all.filter(c => claimRisk(c).score >= 34).length;
    const score = healthScore();
    const settings = load(PERF_KEY, {fast:false});
    const biggest = st.items.slice(0,6).map(x => `<div class="v23-row"><div><strong>${esc(x.key)}</strong><small>${(x.bytes/1024).toFixed(1)} KB</small></div></div>`).join('') || '<p class="muted">No local storage data detected.</p>';
    ensureView('efficiency').innerHTML = `
      <div class="card glow">
        <div class="card-header"><span>⚡ Efficiency Center</span><span class="v23-chip ${score>=80?'green':score>=60?'amber':'red'}">Health ${score}%</span></div>
        <div class="v23-grid">
          <div class="v23-kpi"><b>${st.mb.toFixed(2)}MB</b><span>Storage Used</span></div>
          <div class="v23-kpi"><b>${all.length}</b><span>Total Claims</span></div>
          <div class="v23-kpi"><b>${active}</b><span>Active Queue</span></div>
          <div class="v23-kpi"><b>${high}</b><span>Needs Attention</span></div>
        </div>
        <div class="v23-meter" style="margin:12px 0"><span style="width:${st.pct}%"></span></div>
        <div class="v23-alert"><b>Recommended flow:</b> use Smart Triage Queue during duty, export a slim backup after each shift, and turn on Fast Mode on low-end phones.</div>
        <div class="v23-actions">
          <button class="primary block" onclick="showView('triage')">Open Smart Triage</button>
          <button class="accent block" onclick="v23RunAudit()">Run Efficiency Audit</button>
          <button class="block" onclick="v23ToggleFastMode()">${settings.fast?'Disable':'Enable'} Fast Mode</button>
          <button class="block" onclick="v23DownloadSlimBackup()">Slim Backup</button>
          <button class="block" onclick="v23CompactLogs()">Compact Logs</button>
          <button class="danger block" onclick="showView('sitehealth')">Site Health</button>
        </div>
      </div>
      <div class="card"><div class="card-header">Largest Local Data Blocks</div>${biggest}</div>
      <div class="card"><div class="card-header">Efficiency Notes</div>
        <div class="v23-row"><div><strong>Fast Mode</strong><small>Reduces heavy glow, animation, and blur effects to improve Android performance.</small></div><span class="v23-chip ${settings.fast?'green':'amber'}">${settings.fast?'ON':'OFF'}</span></div>
        <div class="v23-row"><div><strong>Claim Index</strong><small>Creates a fast session lookup table for claim number and baggage tag searches.</small></div><span class="v23-chip green">Ready</span></div>
        <div class="v23-row"><div><strong>Last Audit</strong><small>${esc(localStorage.getItem(LAST_AUDIT_KEY)||'Not yet run')}</small></div></div>
      </div>`;
  }

  function renderTriage(){
    const all = claims().slice();
    const open = all.filter(c=>!['Closed','Rejected'].includes(String(c.status || '')));
    open.sort((a,b)=>claimRisk(b).score-claimRisk(a).score || String(a.status).localeCompare(String(b.status)));
    const rows = open.map(c=>{
      const r = claimRisk(c);
      const cls = r.score >= 55 ? 'red' : r.score >= 34 ? 'amber' : 'green';
      return `<div class="v23-row v23-triage-row" data-search="${esc((c.id+' '+c.lastName+' '+c.tag+' '+c.description+' '+c.type+' '+c.status).toLowerCase())}">
        <div>
          <strong>${esc(c.id || 'No Claim ID')}</strong>
          <small>${esc(c.type || 'Claim')} • ${esc(c.routeLabel || c.route || 'No route')} • ${esc(c.createdAt || '')}</small>
          <small>Passenger: ${esc(mask(c.lastName))} • Tag: ${esc(c.tag || '—')} • Contact: ${esc(c.contact ? 'Provided' : 'Missing')}</small>
          <small>${esc(String(c.description || '').slice(0,160))}</small>
        </div>
        <div style="min-width:150px">
          <span class="v23-chip ${cls}">${r.label} ${r.score}%</span>
          <div style="height:8px"></div>
          <select onchange="v23SetStatus('${esc(c.id)}',this.value)">${['Submitted','Under Review','Approved','Processing','Closed','Rejected'].map(s=>`<option ${c.status===s?'selected':''}>${s}</option>`).join('')}</select>
          <button class="block" style="margin-top:7px" onclick="v23CopySummary('${esc(c.id)}')">Copy Summary</button>
        </div>
      </div>`;
    }).join('') || '<p class="muted">No active claims. Great job.</p>';
    ensureView('triage').innerHTML = `
      <div class="card glow">
        <div class="card-header"><span>🎯 Smart Triage Queue</span><span class="v23-chip pink">Priority Sorted</span></div>
        <div class="v23-command"><input id="v23TriageSearch" placeholder="Search claim, passenger, tag, route, status" oninput="v23FilterTriage()"></div>
        <div class="v23-grid"><div class="v23-kpi"><b>${open.length}</b><span>Open</span></div><div class="v23-kpi"><b>${open.filter(c=>claimRisk(c).score>=55).length}</b><span>Critical</span></div><div class="v23-kpi"><b>${open.filter(c=>!c.contact).length}</b><span>Missing Contact</span></div></div>
        <div class="v23-actions"><button class="primary block" onclick="showView('lostbaggage')">New Claim</button><button class="accent block" onclick="showView('damage')">Damage Detector</button><button class="block" onclick="v23BulkSetUnderReview()">Move Submitted to Review</button><button class="block" onclick="v23ExportTriageCSV()">Export Triage CSV</button></div>
      </div>
      <div class="card"><div class="card-header">Action Queue</div><div id="v23TriageRows">${rows}</div></div>`;
  }

  function mask(n){ n=String(n||''); return n.length<=2 ? (n ? n[0]+'*' : '—') : n[0]+'*'.repeat(Math.max(1,n.length-2))+n[n.length-1]; }

  window.v23FilterTriage = function(){
    const q = ($('v23TriageSearch')?.value || '').toLowerCase();
    qsa('.v23-triage-row').forEach(r => r.style.display = !q || r.dataset.search.includes(q) ? '' : 'none');
  };

  window.v23SetStatus = function(id,status){
    const all = claims();
    const c = all.find(x=>String(x.id)===String(id));
    if(!c) return toast('Claim not found.');
    c.status = status;
    c.updatedAt = now();
    c.history = c.history || [];
    c.history.unshift({time:now(), status, note:'Updated from V23 Smart Triage'});
    c.sync = 'Pending Local Backup';
    setClaims(all);
    toast(id+' → '+status);
    renderTriage();
  };

  window.v23BulkSetUnderReview = function(){
    const all = claims(); let n = 0;
    all.forEach(c=>{ if(c.status === 'Submitted'){ c.status = 'Under Review'; c.updatedAt = now(); c.history = c.history || []; c.history.unshift({time:now(),status:'Under Review',note:'Bulk review from V23'}); n++; } });
    setClaims(all); toast('Moved '+n+' claim(s) to Under Review.'); renderTriage();
  };

  window.v23CopySummary = function(id){
    const c = claims().find(x=>String(x.id)===String(id));
    if(!c) return;
    const r = claimRisk(c);
    const text = `${c.id} | ${c.type || 'Claim'} | ${c.routeLabel || c.route || 'No route'} | Status: ${c.status || 'Submitted'} | Priority: ${r.label} ${r.score}% | Tag: ${c.tag || 'N/A'} | Passenger: ${mask(c.lastName)} | ${String(c.description || '').slice(0,180)}`;
    navigator.clipboard?.writeText(text).then(()=>toast('Summary copied.')).catch(()=>alert(text));
  };

  window.v23ExportTriageCSV = function(){
    const headers = ['id','risk','type','routeLabel','lastName','tag','contact','status','createdAt','updatedAt','description'];
    const rows = claims().map(c=>{
      const data = Object.assign({}, c, {risk:claimRisk(c).label+' '+claimRisk(c).score});
      return headers.map(h=>'"'+String(data[h]??'').replace(/"/g,'""')+'"').join(',');
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[headers.join(','),...rows].join('\n')], {type:'text/csv'}));
    a.download = 'oceanjet_v23_triage.csv';
    a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),600);
  };

  function renderQuickFind(){
    ensureView('quickfind').innerHTML = `
      <div class="card glow">
        <div class="card-header"><span>🔎 Quick Find + Action Search</span><span class="v23-chip green">Fast lookup</span></div>
        <div class="v23-command"><input id="v23QuickInput" placeholder="Type claim no, baggage tag, route, tab, schedule, fare..." oninput="v23QuickSearch(this.value)" autofocus></div>
        <div id="v23QuickResults"><p class="muted">Search claims, routes, or pages. Example: OR123, Tagbilaran, Damage, Staff, Fare.</p></div>
      </div>`;
  }

  window.v23QuickSearch = function(q){
    q = String(q || '').trim().toLowerCase();
    const out = $('v23QuickResults');
    if(!out) return;
    if(!q){ out.innerHTML = '<p class="muted">Search claims, routes, or pages.</p>'; return; }
    const results = [];
    Object.entries(VIEWS).forEach(([view,label])=>{ if(label.toLowerCase().includes(q) || view.includes(q)) results.push({type:'Page',title:label,sub:'Open '+label,action:`showView('${view}')`}); });
    ROUTES.forEach(([route,label])=>{ if(label.toLowerCase().includes(q) || route.includes(q)) results.push({type:'Route',title:label,sub:'Open fare/schedule tools',action:`v23OpenRoute('${route}')`}); });
    claims().forEach(c=>{
      const hay = `${c.id} ${c.tag} ${c.lastName} ${c.routeLabel} ${c.route} ${c.status} ${c.description}`.toLowerCase();
      if(hay.includes(q)) results.push({type:'Claim',title:c.id || 'No Claim ID',sub:`${c.status || 'Submitted'} • ${mask(c.lastName)} • ${c.tag || 'No tag'}`,action:`v23GoClaim('${esc(c.id)}')`});
    });
    out.innerHTML = results.slice(0,18).map(r=>`<div class="v23-row v23-result" onclick="${r.action}"><div><strong>${esc(r.title)}</strong><small>${esc(r.sub)}</small></div><span class="v23-chip ${r.type==='Claim'?'pink':r.type==='Route'?'green':''}">${r.type}</span></div>`).join('') || '<p class="muted">No result found.</p>';
  };

  window.v23OpenRoute = function(route){
    try{ sessionStorage.setItem('oj_v23_focus_route', route); }catch(e){}
    if(typeof window.showView === 'function') window.showView('calc');
    setTimeout(()=>{ const r = $('calcRoute'); if(r){ r.value = route; r.dispatchEvent(new Event('change')); } }, 250);
  };

  window.v23GoClaim = function(id){
    if(typeof window.showView === 'function') window.showView('triage');
    setTimeout(()=>{
      const input = $('v23TriageSearch');
      if(input){ input.value = id; window.v23FilterTriage(); }
    }, 150);
  };

  function decoratePortal(){
    const p = $('view-portal');
    if(!p || $('v23PortalBoost')) return;
    const div = document.createElement('div');
    div.id = 'v23PortalBoost';
    div.className = 'card glow';
    div.innerHTML = `<div class="card-header"><span>⚡ V23 Efficiency Layer</span><span class="v23-chip green">Active</span></div><div class="v23-grid"><div class="v23-kpi"><b>${healthScore()}%</b><span>App Health</span></div><div class="v23-kpi"><b>${claims().filter(c=>!['Closed','Rejected'].includes(String(c.status||''))).length}</b><span>Open Claims</span></div></div><div class="v23-actions"><button class="primary block" onclick="showView('quickfind')">Quick Find</button><button class="accent block" onclick="showView('triage')">Smart Triage</button><button class="block" onclick="showView('efficiency')">Efficiency Center</button></div>`;
    p.insertBefore(div, p.firstChild);
  }

  function patchDrawer(){
    const menu = $('drawerMenu');
    if(!menu) return;
    const items = [
      ['quickfind','🔎','Quick Find'],
      ['triage','🎯','Smart Triage'],
      ['efficiency','⚡','Efficiency Center']
    ];
    items.reverse().forEach(([view,icon,label])=>{
      if(!qs(`.drawer-item[data-view="${view}"]`, menu)){
        const d = document.createElement('div');
        d.className = 'drawer-item';
        d.dataset.view = view;
        d.setAttribute('onclick', `navigate('${view}')`);
        d.innerHTML = `<i>${icon}</i> ${label}`;
        menu.insertBefore(d, menu.firstChild);
      }
    });
  }

  function showV23(name){
    qsa('.view').forEach(v=>v.classList.remove('active'));
    const v = ensureView(name);
    v.classList.add('active');
    if(name === 'efficiency') renderEfficiency();
    if(name === 'triage') renderTriage();
    if(name === 'quickfind') renderQuickFind();
    qsa('#drawerMenu .drawer-item').forEach(el => el.classList.toggle('active', el.dataset.view === name));
    injectLazyLoading();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function patchNavigation(){
    const oldShow = window.showView;
    if(oldShow && !oldShow.__v23Wrapped){
      window.showView = function(name){
        if(['efficiency','triage','quickfind'].includes(name)){ showV23(name); return; }
        const result = oldShow.apply(this, arguments);
        setTimeout(()=>{ patchDrawer(); injectLazyLoading(); if(name==='portal') decoratePortal(); }, 60);
        return result;
      };
      window.showView.__v23Wrapped = true;
    }
    const oldBuild = window.buildDrawerMenu;
    if(oldBuild && !oldBuild.__v23Wrapped){
      window.buildDrawerMenu = buildDrawerMenu = function(){
        const r = oldBuild.apply(this, arguments);
        patchDrawer();
        return r;
      };
      window.buildDrawerMenu.__v23Wrapped = true;
    }
  }

  function boot(){
    injectStyles();
    applyFastMode();
    ensureView('efficiency'); ensureView('triage'); ensureView('quickfind');
    patchNavigation();
    if(typeof window.buildDrawerMenu === 'function') window.buildDrawerMenu(); else patchDrawer();
    patchDrawer();
    buildClaimIndex();
    injectLazyLoading();
    idle(()=>{ if((load(PERF_KEY,{autoAudit:true}).autoAudit !== false) && !localStorage.getItem(LAST_AUDIT_KEY)) window.v23RunAudit(); });
    setTimeout(()=>{ decoratePortal(); const active = qs('.view.active'); if(!active || active.offsetHeight < 8){ v23Log('Blank guard opened Efficiency Center.'); showV23('efficiency'); } }, 1200);
    v23Log('Efficiency engine booted.');
    console.log(VERSION+' loaded');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
