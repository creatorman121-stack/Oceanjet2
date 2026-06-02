
(function(){
  if(window.__v17GithubPagesAliveSystem) return;
  window.__v17GithubPagesAliveSystem = true;

  const V17_VERSION = 'v17-github-pages-ready-self-healing';
  const ERROR_KEY = 'oj_v17_error_log';
  const HEARTBEAT_KEY = 'oj_v17_last_heartbeat';
  const BACKUP_KEY = 'oj_v17_lite_autobackup';
  const DB_KEY_PUBLIC = 'off_baggage_v14';
  const DAMAGE_KEY_PUBLIC = 'oj_damage_master_v11_backup';
  const startedAt = Date.now();
  const qs = id => document.getElementById(id);
  const qsa = sel => Array.from(document.querySelectorAll(sel));

  function safeJsonGet(key, fallback){ try{return JSON.parse(localStorage.getItem(key)||'null') || fallback}catch(e){return fallback} }
  function safeJsonSet(key, value){ try{localStorage.setItem(key, JSON.stringify(value)); return true}catch(e){return false} }
  function safeToast(msg){ try{ if(typeof toast === 'function') return toast(msg); }catch(e){} console.log('[V17]', msg); }
  function bytesOf(str){ return new Blob([String(str || '')]).size; }
  function escapeHtml(str){ return String(str ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function pht(){ return new Date().toLocaleString('en-PH',{timeZone:'Asia/Manila',hour12:true}); }
  function uptimeText(){ const s=Math.floor((Date.now()-startedAt)/1000); const m=Math.floor(s/60); const r=s%60; return (m?m+'m ':'')+r+'s'; }

  function storageStats(){
    let total=0, items=[];
    try{
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i) || '';
        const v=localStorage.getItem(k) || '';
        const b=bytesOf(k)+bytesOf(v);
        total += b;
        items.push({key:k, bytes:b});
      }
    }catch(e){ logError('storageStats', e.message); }
    items.sort((a,b)=>b.bytes-a.bytes);
    const mb=total/1024/1024;
    return {bytes:total, mb, pct:Math.min(100, Math.round((mb/5)*100)), items};
  }

  function getErrors(){ return safeJsonGet(ERROR_KEY, []); }
  function logError(source, message, detail){
    const list = getErrors();
    list.unshift({at:pht(), source:String(source||'app'), message:String(message||'Unknown error'), detail:String(detail||'').slice(0,600)});
    safeJsonSet(ERROR_KEY, list.slice(0,25));
    setAliveStatus('RECOVERING','warn');
  }

  window.addEventListener('error', e => logError('window.error', e.message, (e.filename||'')+':'+(e.lineno||'')), true);
  window.addEventListener('unhandledrejection', e => logError('promise', e.reason?.message || e.reason || 'Unhandled promise rejection'), true);

  function ensureHeadPwa(){
    try{
      const oldBlobManifest = qs('v14ManifestLink');
      if(oldBlobManifest && /^blob:/i.test(oldBlobManifest.href||'')) oldBlobManifest.remove();
      let link = qs('v17ManifestLink') || document.querySelector('link[rel="manifest"]');
      if(!link){ link=document.createElement('link'); link.rel='manifest'; document.head.appendChild(link); }
      link.id='v17ManifestLink';
      link.href='manifest.webmanifest';
      let theme = document.querySelector('meta[name="theme-color"]');
      if(!theme){ theme=document.createElement('meta'); theme.name='theme-color'; document.head.appendChild(theme); }
      theme.content='#070b19';
    }catch(e){ logError('ensureHeadPwa', e.message); }
  }

  function registerServiceWorker(){
    if(!('serviceWorker' in navigator)) return setPwaStatus('Service worker not supported on this browser');
    if(location.protocol === 'file:') return setPwaStatus('PWA activates after upload to GitHub Pages / HTTPS');
    navigator.serviceWorker.register('./sw.js', {scope:'./'})
      .then(reg => { setPwaStatus('Service worker active'); window.__v17ServiceWorkerReady = true; return reg.update().catch(()=>{}); })
      .catch(err => { setPwaStatus('Service worker failed'); logError('serviceWorker', err.message); });
  }

  function setPwaStatus(text){ window.__v17PwaStatus = text; const el=qs('v17PwaStatus'); if(el) el.textContent=text; }

  function ensureAliveBadge(){
    let badge = qs('v17AliveBadge');
    if(badge) return badge;
    const host = document.querySelector('.header-right') || document.querySelector('.header') || document.body;
    badge = document.createElement('span');
    badge.id='v17AliveBadge';
    badge.textContent='● ALIVE';
    host.appendChild(badge);
    return badge;
  }

  function setAliveStatus(text, mode){
    const badge = ensureAliveBadge();
    badge.classList.toggle('warn', mode === 'warn');
    badge.classList.toggle('bad', mode === 'bad');
    badge.textContent = '● ' + text;
    window.__v17AliveStatus = text;
  }

  function addAliveDrawerItem(){
    const menu = qs('drawerMenu');
    if(!menu || menu.querySelector('.drawer-item[data-view="alive"]')) return;
    const div=document.createElement('div');
    div.className='drawer-item';
    div.dataset.view='alive';
    div.onclick=()=>{ try{ navigate('alive'); }catch(e){ showView('alive'); } };
    div.innerHTML='<i>🟢</i> System Alive';
    menu.appendChild(div);
  }

  function ensureAliveView(){
    if(qs('view-alive')) return;
    const app = document.querySelector('.app') || document.body;
    const view=document.createElement('div');
    view.id='view-alive';
    view.className='view';
    app.appendChild(view);
  }

  function activateAliveView(){
    ensureAliveView();
    qsa('.view').forEach(v=>v.classList.remove('active'));
    qs('view-alive').classList.add('active');
    qsa('#drawerMenu .drawer-item').forEach(el=>el.classList.toggle('active', el.dataset.view === 'alive'));
    try{ if(typeof closeDrawer === 'function') closeDrawer(); }catch(e){}
    renderAliveView();
  }

  function patchNavigation(){
    if(!window.__v17ShowViewWrapped){
      window.__v17ShowViewWrapped = true;
      const oldShow = window.showView;
      window.showView = function(name){
        if(name === 'alive'){ activateAliveView(); return; }
        const result = typeof oldShow === 'function' ? oldShow.apply(this, arguments) : undefined;
        setTimeout(()=>{ addAliveDrawerItem(); ensureAliveBadge(); }, 40);
        return result;
      };
    }
    const oldBuild = window.buildDrawerMenu;
    if(typeof oldBuild === 'function' && !oldBuild.__v17AliveWrapped){
      window.buildDrawerMenu = function(){ const r=oldBuild.apply(this, arguments); addAliveDrawerItem(); return r; };
      window.buildDrawerMenu.__v17AliveWrapped = true;
    }
    addAliveDrawerItem();
  }

  function heartbeat(){
    const hb = {at:pht(), ms:Date.now(), version:V17_VERSION, status:window.__v17AliveStatus||'ALIVE'};
    safeJsonSet(HEARTBEAT_KEY, hb);
    if((window.__v17AliveStatus||'').includes('RECOVER')) return;
    setAliveStatus(navigator.onLine ? 'ALIVE' : 'OFFLINE', navigator.onLine ? 'ok' : 'warn');
    const st=storageStats();
    if(st.mb > 4.3) setAliveStatus('STORAGE HIGH','warn');
    updateAliveViewIfOpen();
  }

  function buildLiteBackup(){
    try{
      const dbRaw = localStorage.getItem(DB_KEY_PUBLIC) || '{}';
      const damageRaw = localStorage.getItem(DAMAGE_KEY_PUBLIC) || '{}';
      const damage = safeJsonGet(DAMAGE_KEY_PUBLIC, {cases:[]});
      const backup = {
        at:pht(),
        version:V17_VERSION,
        appDb: dbRaw.length < 900000 ? JSON.parse(dbRaw || '{}') : {skipped:'App DB too large for automatic lite backup'},
        damageSummary:{
          cases:Array.isArray(damage.cases) ? damage.cases.length : 0,
          photos:Array.isArray(damage.cases) ? damage.cases.reduce((a,c)=>a+(c.photos?.length||0),0) : 0,
          note: damageRaw.length < 900000 ? 'Damage data small enough for full JSON export if needed.' : 'Damage data is large; use Export Center for manual backup.'
        }
      };
      safeJsonSet(BACKUP_KEY, backup);
    }catch(e){ logError('liteBackup', e.message); }
  }

  function appLooksBlank(){
    /* V47FIX: disabled aggressive blank-screen detection; it caused false Recovery Mode on mobile and during heavy rendering. */
    return false;
    if(Date.now() - startedAt < 3500) return false;
    const login = qs('loginOverlay');
    if(login && login.classList.contains('v15-admin-login') && getComputedStyle(login).display !== 'none') return false;
    const app = document.querySelector('.app');
    const active = document.querySelector('.view.active');
    if(!app) return true;
    if(!active) return true;
    const text = (active.innerText || '').trim();
    const hasCard = !!active.querySelector('.card,.result-banner,.damage-shell,.v11-shell');
    return text.length < 8 && !hasCard;
  }

  function repairNow(showNotice){
    try{
      ensureHeadPwa();
      ensureAliveBadge();
      ensureAliveView();
      patchNavigation();
      if(typeof buildDrawerMenu === 'function') buildDrawerMenu();
      addAliveDrawerItem();
      qsa('#aiFloatBtn,.ai-float-btn,#v11Dock,#v6FloatTools,#v7MiniDock,#v8Dock,#v9CleanDock,#v10Dock,.quick-dock,.floating-dock').forEach(el=>el.style.display='none');
      const login = qs('loginOverlay');
      if(login && !login.classList.contains('v15-admin-login')) login.style.setProperty('display','none','important');
      if(appLooksBlank()){
        try{ if(typeof showView === 'function') showView('dashboard'); }catch(e){}
        try{ if(typeof buildDashboard === 'function') buildDashboard(); }catch(e){}
      }
      removeRecovery();
      setAliveStatus('ALIVE','ok');
      if(showNotice) safeToast('V17 repair completed.');
      updateAliveViewIfOpen();
    }catch(e){
      logError('repairNow', e.message);
      showRecovery('Repair failed: '+e.message);
    }
  }
  window.v17RepairNow = repairNow;

  function showRecovery(reason){
    if(qs('v17RecoveryScreen')) return;
    logError('blankScreenRecovery', reason || 'Blank screen detected');
    const div=document.createElement('div');
    div.id='v17RecoveryScreen';
    div.className='v17-recovery';
    div.innerHTML=`<div class="v17-recovery-box">
      <h2>🛟 App Recovery Mode</h2>
      <p class="muted">The self-healing system detected a loading problem and opened recovery mode.</p>
      <div class="trip-row" style="margin:10px 0"><b>Reason:</b> ${escapeHtml(reason||'Blank screen detected')}</div>
      <div class="grid2" style="margin-top:10px">
        <button class="primary block" onclick="v17OpenDashboard()">Open Dashboard</button>
        <button class="accent block" onclick="v17RepairNow(true)">Repair App</button>
        <button class="accent block" onclick="v17OpenSafeMode()">Open Safe Mode</button>
        <button class="danger block" onclick="location.reload()">Reload</button>
      </div>
      <button class="block" style="margin-top:8px" onclick="v17CopyErrorLog()">Copy Error Log</button>
    </div>`;
    document.body.appendChild(div);
    setAliveStatus('RECOVERY','warn');
  }

  function removeRecovery(){ qs('v17RecoveryScreen')?.remove(); }
  window.v17OpenDashboard = function(){ removeRecovery(); try{ showView('dashboard'); }catch(e){} try{ if(typeof buildDashboard==='function') buildDashboard(); }catch(e){} };
  window.v17OpenSafeMode = function(){ removeRecovery(); try{ if(typeof v14SetSafeMode==='function') v14SetSafeMode(true); showView('safemode'); }catch(e){ showRecovery('Safe Mode failed: '+e.message); } };

  function updateAliveViewIfOpen(){ if(qs('view-alive')?.classList.contains('active')) renderAliveView(); }

  function damageStats(){
    const data = safeJsonGet(DAMAGE_KEY_PUBLIC, {cases:[]});
    const cases = Array.isArray(data.cases) ? data.cases : [];
    return {cases:cases.length, photos:cases.reduce((a,c)=>a+(c.photos?.length||0),0), critical:cases.filter(c=>c.severity==='Critical').length};
  }

  function renderAliveView(){
    ensureAliveView();
    const st=storageStats();
    const errs=getErrors();
    const ds=damageStats();
    const hb=safeJsonGet(HEARTBEAT_KEY, null);
    const backup=safeJsonGet(BACKUP_KEY, null);
    const protocol = location.protocol === 'file:' ? 'Local File' : 'Website / HTTPS';
    const pwa = window.__v17PwaStatus || (location.protocol === 'file:' ? 'PWA activates after GitHub upload' : 'Checking service worker...');
    const storageMode = st.mb > 4.3 ? 'High' : st.mb > 3.2 ? 'Monitor' : 'Healthy';
    const storageClass = st.mb > 4.3 ? 'bad' : st.mb > 3.2 ? 'warn' : 'ok';
    const biggest = st.items.slice(0,5).map(i=>`<div>${escapeHtml(i.key)} — ${(i.bytes/1024).toFixed(1)} KB</div>`).join('') || '<div>No storage items yet.</div>';
    const errorList = errs.length ? errs.slice(0,8).map(e=>`<div><b>${escapeHtml(e.at)}</b><br>${escapeHtml(e.source)}: ${escapeHtml(e.message)}</div>`).join('') : '<div>No recent errors recorded.</div>';
    qs('view-alive').innerHTML=`
      <div class="card glow v17-card">
        <div class="card-header"><span>🟢 V17 Self-Healing Alive System</span><span class="v17-pill ${navigator.onLine?'ok':'warn'}">${navigator.onLine?'ONLINE':'OFFLINE'}</span></div>
        <p class="muted">This system watches the app, catches blank screens, repairs navigation, logs errors, checks storage health, and registers PWA files after upload to GitHub Pages.</p>
        <div class="v17-kpis">
          <div class="v17-kpi"><b>${escapeHtml(window.__v17AliveStatus||'ALIVE')}</b><span>Status</span></div>
          <div class="v17-kpi"><b>${uptimeText()}</b><span>Uptime</span></div>
          <div class="v17-kpi"><b>${escapeHtml(protocol)}</b><span>Mode</span></div>
        </div>
      </div>

      <div class="card v17-card">
        <div class="card-header"><span>📱 GitHub Pages / PWA Status</span><span id="v17PwaStatus" class="v17-pill">${escapeHtml(pwa)}</span></div>
        <div class="trip-row"><b>Manifest:</b> manifest.webmanifest<br><b>Service worker:</b> sw.js<br><b>Start page:</b> index.html<br><b>Last heartbeat:</b> ${escapeHtml(hb?.at || 'Starting...')}</div>
      </div>

      <div class="card v17-card">
        <div class="card-header"><span>💾 Storage Health</span><span class="v17-pill ${storageClass}">${storageMode}</span></div>
        <div class="v17-kpis">
          <div class="v17-kpi"><b>${st.mb.toFixed(2)}MB</b><span>Used</span></div>
          <div class="v17-kpi"><b>${ds.cases}</b><span>Damage Cases</span></div>
          <div class="v17-kpi"><b>${ds.photos}</b><span>Photos</span></div>
        </div>
        <div class="v14-meter"><span style="width:${st.pct}%"></span></div>
        <div class="v17-log" style="margin-top:8px">${biggest}</div>
      </div>

      <div class="card v17-card">
        <div class="card-header"><span>🛠 Repair Tools</span><span class="v17-pill">Safe</span></div>
        <div class="grid2">
          <button class="primary block" onclick="v17RepairNow(true)">Repair App Now</button>
          <button class="accent block" onclick="v17OpenDashboard()">Open Dashboard</button>
          <button class="accent block" onclick="v17OpenSafeMode()">Open Safe Mode</button>
          <button class="accent block" onclick="showView('exportcenter')">Export Center</button>
          <button class="block" onclick="v17DownloadBackup()">Download Backup</button>
          <button class="danger block" onclick="v17ClearErrors()">Clear Error Log</button>
        </div>
      </div>

      <div class="card v17-card">
        <div class="card-header"><span>⚠️ Error Log</span><span class="v17-pill ${errs.length?'warn':'ok'}">${errs.length} recorded</span></div>
        <div class="v17-log">${errorList}</div>
        <button class="block" style="margin-top:8px" onclick="v17CopyErrorLog()">Copy Error Log</button>
      </div>

      <div class="card v17-card">
        <div class="card-header"><span>🚀 GitHub Upload Checklist</span><span class="v17-pill ok">Ready</span></div>
        <div class="v17-code">1. Upload the files from this package to your GitHub repository.\n2. Make sure the main file is named index.html.\n3. Include manifest.webmanifest, sw.js, and the icons folder.\n4. Go to Settings → Pages → Deploy from branch → main → /root.\n5. Open the github.io link in Chrome and use Add to Home Screen.</div>
        <div class="trip-row" style="margin-top:8px"><b>Last lite backup:</b> ${escapeHtml(backup?.at || 'Not yet created')}</div>
      </div>`;
  }

  window.v17CopyErrorLog = function(){
    const text = JSON.stringify(getErrors(), null, 2);
    navigator.clipboard?.writeText(text).then(()=>safeToast('Error log copied.')).catch(()=>alert(text));
  };
  window.v17ClearErrors = function(){ safeJsonSet(ERROR_KEY, []); safeToast('Error log cleared.'); renderAliveView(); };
  window.v17DownloadBackup = function(){
    try{
      const payload = {
        exportedAt:pht(),
        version:V17_VERSION,
        appDB:safeJsonGet(DB_KEY_PUBLIC, {}),
        damage:safeJsonGet(DAMAGE_KEY_PUBLIC, {}),
        errors:getErrors(),
        heartbeat:safeJsonGet(HEARTBEAT_KEY, {})
      };
      const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download='oceanjet_v17_backup_'+new Date().toISOString().slice(0,10)+'.json';
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),500);
    }catch(e){ logError('downloadBackup', e.message); safeToast('Backup failed: '+e.message); }
  };

  function blankWatcher(){
    try{ if(appLooksBlank()) showRecovery('No active screen or empty app content detected.'); }
    catch(e){ logError('blankWatcher', e.message); }
  }

  function boot(){
    try{
      ensureHeadPwa();
      ensureAliveBadge();
      ensureAliveView();
      patchNavigation();
      registerServiceWorker();
      repairNow(false);
      heartbeat();
      buildLiteBackup();
      setInterval(heartbeat, 12000);
      /* V47FIX: keep manual V17 repair tools, but stop automatic recovery/repair loops. */
      // setInterval(blankWatcher, 5000);
      // setInterval(()=>repairNow(false), 45000);
      setInterval(buildLiteBackup, 180000);
      window.addEventListener('online', ()=>setAliveStatus('ALIVE','ok'));
      window.addEventListener('offline', ()=>setAliveStatus('OFFLINE','warn'));
      console.log('Ocean Fast Ferries V17 loaded:', V17_VERSION);
    }catch(e){
      logError('boot', e.message);
      showRecovery('V17 boot error: '+e.message);
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
