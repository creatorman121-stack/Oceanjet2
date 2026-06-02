
(function(){
  if(window.__v14CleanMobileSafeMode) return;
  window.__v14CleanMobileSafeMode = true;
  const V14_VERSION='v14-clean-mobile-safe-mode';
  const SETTINGS_KEY='oj_v14_settings';
  const DAMAGE_KEY='oj_damage_master_v11_backup';
  const SAFE_ALLOWED=new Set(['dashboard','calculator','fares','schedules','history','damage','exportcenter','safemode']);
  const qs=id=>document.getElementById(id);
  const qsa=sel=>Array.from(document.querySelectorAll(sel));
  const jget=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||f}catch(e){return f}};
  const jset=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const bytesOf=s=>new Blob([String(s||'')]).size;
  const toast14=msg=>{try{if(typeof toast==='function')return toast(msg)}catch(e){} const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),2400)};
  let settings=jget(SETTINGS_KEY,{safeMode:false,lastExport:'Never'});

  function injectManifest(){
    if(qs('v14ManifestLink')) return;
    try{
      const manifest={name:'Ocean Fast Ferries Baggage Pro',short_name:'OFF Baggage',start_url:'.',display:'standalone',background_color:'#070b19',theme_color:'#2dd4bf',description:'Offline field app for baggage fees and damage evidence logging.'};
      const blob=new Blob([JSON.stringify(manifest)],{type:'application/manifest+json'});
      const link=document.createElement('link');link.id='v14ManifestLink';link.rel='manifest';link.href=URL.createObjectURL(blob);document.head.appendChild(link);
      let meta=document.querySelector('meta[name="theme-color"]'); if(!meta){meta=document.createElement('meta');meta.name='theme-color';document.head.appendChild(meta)} meta.content='#070b19';
    }catch(e){console.warn('V14 manifest skipped',e)}
  }

  function storageStats(){
    let total=0; const items=[];
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);const v=localStorage.getItem(k)||'';const b=bytesOf(k)+bytesOf(v);total+=b;items.push({k,b});}
    items.sort((a,b)=>b.b-a.b);
    const mb=total/1024/1024; const pct=Math.min(100,Math.round((mb/5)*100));
    return {bytes:total,mb,pct,items};
  }
  function damageData(){return jget(DAMAGE_KEY,{cases:[],batches:[]});}
  function dbStats(){
    const d=damageData(); const cases=d.cases||[]; const photos=cases.reduce((a,c)=>a+(c.photos?.length||0),0); const crit=cases.filter(c=>c.severity==='Critical').length;
    return {cases,photos,crit};
  }
  function ensureViews(){
    const app=document.querySelector('.app')||document.body;
    if(!qs('view-exportcenter')){const v=document.createElement('div');v.id='view-exportcenter';v.className='view';app.appendChild(v)}
    if(!qs('view-safemode')){const v=document.createElement('div');v.id='view-safemode';v.className='view';app.appendChild(v)}
  }
  function addDrawerItem(view,icon,label){
    const menu=qs('drawerMenu'); if(!menu||menu.querySelector(`.drawer-item[data-view="${view}"]`)) return;
    const div=document.createElement('div'); div.className='drawer-item'; div.dataset.view=view; div.onclick=()=>{try{navigate(view)}catch(e){showView(view)}}; div.innerHTML=`<i>${icon}</i> ${label}`; menu.appendChild(div);
  }
  function normalizeDrawer(){
    const menu=qs('drawerMenu'); if(!menu) return;
    addDrawerItem('exportcenter','📤','Export Center'); addDrawerItem('safemode','🛡️','Safe Mode');
    const seen=new Set();
    qsa('#drawerMenu .drawer-item').forEach(item=>{const key=(item.dataset.view||item.textContent||'').trim().toLowerCase(); if(seen.has(key)) item.remove(); else seen.add(key);});
    qsa('#drawerMenu .drawer-item').forEach(item=>{const v=item.dataset.view||''; item.classList.toggle('v14-hidden',settings.safeMode && !SAFE_ALLOWED.has(v));});
  }
  function setSafeMode(on){settings.safeMode=!!on;jset(SETTINGS_KEY,settings);document.body.classList.toggle('v14-safe-mode',settings.safeMode);normalizeDrawer();toast14(settings.safeMode?'Safe Mode enabled':'Safe Mode disabled');}
  window.v14SetSafeMode=setSafeMode;

  function patchMenu(){
    const old=window.buildDrawerMenu;
    if(typeof old==='function' && !old.__v14Wrapped){
      window.buildDrawerMenu=function(){const r=old.apply(this,arguments); normalizeDrawer(); return r;}; window.buildDrawerMenu.__v14Wrapped=true;
    }
    normalizeDrawer();
  }
  function patchShowView(){
    if(window.__v14ShowWrapped) return; window.__v14ShowWrapped=true;
    const old=window.showView;
    window.showView=function(name){
      if(name==='exportcenter'){activateView('exportcenter');renderExportCenter();return;}
      if(name==='safemode'){activateView('safemode');renderSafeMode();return;}
      if(typeof old==='function') return old.apply(this,arguments);
    };
  }
  function activateView(name){
    qsa('.view').forEach(v=>v.classList.remove('active'));
    const v=qs('view-'+name); if(v) v.classList.add('active');
    qsa('.drawer-item').forEach(el=>el.classList.toggle('active',el.dataset.view===name));
    try{closeDrawer()}catch(e){}
  }
  function patchDashboard(){
    if(window.__v14DashWrapped || typeof buildDashboard!=='function') return; window.__v14DashWrapped=true;
    const old=buildDashboard;
    window.buildDashboard=buildDashboard=function(){old(); setTimeout(addDashboardPanel,20);};
  }
  function addDashboardPanel(){
    const v=qs('view-dashboard'); if(!v||qs('v14DashPanel')) return; const st=storageStats(),d=dbStats();
    v.insertAdjacentHTML('afterbegin',`<div class="card glow v14-card" id="v14DashPanel"><div class="card-header"><span>🛡️ V14 Stability Pack</span><span class="v14-pill ${settings.safeMode?'warn':''}">${settings.safeMode?'SAFE MODE':'FULL MODE'}</span></div><div class="v14-kpis"><div class="v14-kpi"><b>${st.mb.toFixed(2)}MB</b><span>Storage Used</span></div><div class="v14-kpi"><b>${d.cases.length}</b><span>Damage Cases</span></div><div class="v14-kpi"><b>${d.crit}</b><span>Critical</span></div><div class="v14-kpi"><b>${d.photos}</b><span>Evidence Photos</span></div></div><div class="v14-meter"><span style="width:${st.pct}%"></span></div><div class="v14-toolbar"><button class="sm primary block" onclick="showView('exportcenter')">Open Export Center</button><button class="sm accent block" onclick="showView('safemode')">Safe Mode</button></div></div>`);
  }
  function csvEscape(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
  function txCsv(){
    const rows=[['route','mode','class','pax','weight','total','time']];
    try{(DB.history||[]).forEach(h=>rows.push([h.route,h.mode,h.cls,h.pax,h.weight,h.total,h.time]))}catch(e){}
    return rows.map(r=>r.map(csvEscape).join(',')).join('\n');
  }
  function damageCsv(){
    const data=damageData(); const rows=[['caseId','destination','tagNo','color','size','baggageType','damageType','severity','status','dateTaken','timeTaken','photoCount','evidenceScore','locked','notes']];
    (data.cases||[]).forEach(c=>rows.push([c.caseId,c.destination,c.tagNo,c.color,c.size,c.baggageType,c.damageType,c.severity,c.status,c.dateTaken,c.timeTaken,(c.photos||[]).length,c.evidenceScore,c.locked,c.notes]));
    return rows.map(r=>r.map(csvEscape).join(',')).join('\n');
  }
  function downloadBlob(content,type,name){const a=document.createElement('a');const blob=content instanceof Blob?content:new Blob([content],{type});a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),300);settings.lastExport=new Date().toLocaleString();jset(SETTINGS_KEY,settings);}
  window.v14ExportFullBackup=function(){const backup={exportedAt:new Date().toISOString(),appDB:(typeof DB!=='undefined'?DB:null),damage:damageData(),v14:settings};downloadBlob(JSON.stringify(backup,null,2),'application/json','ocean_fast_ferries_full_backup_v14.json')};
  window.v14ExportTransactions=function(){downloadBlob(txCsv(),'text/csv','ocean_fast_ferries_transactions_v14.csv')};
  window.v14ExportDamageCSV=function(){downloadBlob(damageCsv(),'text/csv','ocean_jet_damage_claims_v14.csv')};
  window.v14ExportDamageJSON=function(){downloadBlob(JSON.stringify(damageData(),null,2),'application/json','ocean_jet_damage_master_v14.json')};
  window.v14CopyDiagnostics=function(){const st=storageStats(),d=dbStats(); const txt=`Ocean Fast Ferries V14 Diagnostics\nSafe Mode: ${settings.safeMode}\nStorage: ${st.mb.toFixed(2)}MB\nDamage cases: ${d.cases.length}\nPhotos: ${d.photos}\nLast export: ${settings.lastExport}`; navigator.clipboard?.writeText(txt).then(()=>toast14('Diagnostics copied')).catch(()=>alert(txt));};
  window.v14ResetTransactions=function(){if(!confirm('Reset transaction history and dashboard stats only?'))return; try{DB.history=[];DB.comps=[];DB.stats={transactions:0,revenue:0,totalKg:0,topRoute:'',routeCounts:{}};saveDB();toast14('Transaction log reset.');showView('dashboard')}catch(e){toast14('Could not reset transactions.')}};
  window.v14ResetDamage=function(){if(!confirm('Reset damage evidence log only? Export backup first.'))return; localStorage.removeItem(DAMAGE_KEY); toast14('Damage log reset. Reloading...'); setTimeout(()=>location.reload(),600)};
  window.v14ImportBackup=function(file){if(!file)return; const fr=new FileReader(); fr.onload=e=>{try{const data=JSON.parse(e.target.result); if(data.appDB){Object.assign(DB,data.appDB);saveDB&&saveDB()} if(data.damage){localStorage.setItem(DAMAGE_KEY,JSON.stringify(data.damage))} toast14('Backup imported. Reloading...'); setTimeout(()=>location.reload(),800)}catch(err){toast14('Invalid backup file.')}}; fr.readAsText(file)};
  function renderExportCenter(){
    const st=storageStats(),d=dbStats(); const biggest=st.items.slice(0,4).map(x=>`<div class="trip-row"><b>${x.k}</b><br>${(x.b/1024/1024).toFixed(2)}MB</div>`).join('')||'<p class="muted">No stored data.</p>';
    qs('view-exportcenter').innerHTML=`<div class="card glow v14-card"><div class="card-header"><span>📤 Export Center V14</span><span class="v14-pill">Last: ${settings.lastExport||'Never'}</span></div><div class="v14-kpis"><div class="v14-kpi"><b>${st.mb.toFixed(2)}MB</b><span>Storage</span></div><div class="v14-kpi"><b>${d.cases.length}</b><span>Damage Cases</span></div><div class="v14-kpi"><b>${d.photos}</b><span>Photos</span></div><div class="v14-kpi"><b>${(DB?.history||[]).length}</b><span>Transactions</span></div></div><div class="v14-meter"><span style="width:${st.pct}%"></span></div><div class="v14-toolbar"><button class="primary block" onclick="v14ExportFullBackup()">Full JSON Backup</button><button class="accent block" onclick="v14ExportTransactions()">Transactions CSV</button><button class="accent block" onclick="v14ExportDamageCSV()">Damage CSV</button><button class="accent block" onclick="v14ExportDamageJSON()">Damage JSON</button></div><label class="accent block" style="margin-top:8px;text-align:center;cursor:pointer;padding:10px;border-radius:10px">Import Full Backup<input type="file" accept=".json" hidden onchange="v14ImportBackup(this.files[0])"></label><button class="block" style="margin-top:8px" onclick="v14CopyDiagnostics()">Copy Diagnostics</button></div><div class="card"><div class="card-header">🧹 Maintenance</div><div class="v14-toolbar"><button class="danger block" onclick="v14ResetTransactions()">Reset Transactions Only</button><button class="danger block" onclick="v14ResetDamage()">Reset Damage Log Only</button></div></div><div class="card"><div class="card-header">💾 Largest Storage Items</div>${biggest}</div>`;
  }
  function renderSafeMode(){
    const st=storageStats();
    qs('view-safemode').innerHTML=`<div class="card glow v14-card"><div class="card-header"><span>🛡️ Safe Mode + Recovery</span><span class="v14-pill ${settings.safeMode?'warn':'mag'}">${settings.safeMode?'Enabled':'Disabled'}</span></div><p class="muted">Safe Mode hides experimental screens and keeps the field-ready tabs: Dashboard, Baggage Calc, Damage Detector, Fares, Schedules, History, and Export Center.</p><div class="v14-meter"><span style="width:${st.pct}%"></span></div><div class="trip-row"><b>Storage used:</b> ${st.mb.toFixed(2)}MB<br><b>Mode:</b> ${settings.safeMode?'Safe Mode':'Full Mode'}<br><b>Install tip:</b> Open this HTML in Chrome, tap menu ⋮, then Add to Home screen.</div><div class="v14-toolbar"><button class="primary block" onclick="v14SetSafeMode(true);renderSafeMode()">Enable Safe Mode</button><button class="accent block" onclick="v14SetSafeMode(false);renderSafeMode()">Disable Safe Mode</button><button class="accent block" onclick="showView('exportcenter')">Open Export Center</button><button class="danger block" onclick="v14HardRecovery()">Hard Recovery Reset</button></div></div><div class="card"><div class="card-header">📱 Mobile App Readiness</div><div class="trip-row">✅ Left navigation only<br>✅ Floating docks hidden<br>✅ Blank-screen recovery watcher<br>✅ Offline local data storage<br>✅ Manifest injected for browser install support</div></div>`;
  }
  window.v14HardRecovery=function(){ if(!confirm('Hard recovery clears local app data. Export backup first. Continue?'))return; localStorage.clear(); location.reload(); };
  function showErrorScreen(msg){
    if(qs('v14ErrorScreen')) return;
    const el=document.createElement('div'); el.id='v14ErrorScreen'; el.className='v14-error-screen';
    el.innerHTML=`<div class="v14-error-box"><h2>Ocean Fast Ferries Recovery</h2><p>${msg||'The app did not load correctly.'}</p><div class="v14-toolbar"><button class="primary block" onclick="v14SetSafeMode(true);document.getElementById('v14ErrorScreen').remove();try{showView('dashboard')}catch(e){}">Open Safe Mode</button><button class="accent block" onclick="location.reload()">Reload</button><button class="danger block" onclick="v14HardRecovery()">Reset Local Data</button></div></div>`; document.body.appendChild(el);
  }
  window.addEventListener('error',e=>{console.warn('V14 captured error:',e.message); /* V47FIX: automatic recovery overlay disabled to prevent false recovery loops; manual Safe Mode still works. */ });
  window.addEventListener('unhandledrejection',e=>{console.warn('V14 promise rejection:',e.reason)});
  function blankWatcher(){setTimeout(()=>{const app=document.querySelector('.app'); const active=document.querySelector('.view.active'); if(!app || !document.body.innerText.trim() || (active && active.innerText.trim().length<3 && !qs('loginOverlay'))){showErrorScreen('Blank screen protection activated.')}} ,2600);}
  function cleanFloating(){qsa('#v11Dock,#v10Dock,#v9CleanDock,#v8Dock,#v7MiniDock,#v6FloatTools,#bottomNavSafe,.bottom-nav,.quick-dock,.ai-float-btn,#aiFloatBtn').forEach(el=>{if(!el.closest('.side-drawer')){el.style.display='none';el.style.visibility='hidden';el.style.pointerEvents='none';}})}
  function boot(){
    try{injectManifest();ensureViews();document.body.classList.toggle('v14-safe-mode',!!settings.safeMode);patchMenu();patchShowView();patchDashboard();cleanFloating();blankWatcher(); if(typeof buildDrawerMenu==='function') buildDrawerMenu(); normalizeDrawer(); console.log('V14 loaded:',V14_VERSION)}catch(e){console.error('V14 boot error',e);showErrorScreen('V14 boot error: '+e.message)}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  setTimeout(()=>{patchMenu();normalizeDrawer();cleanFloating()},300);
  setTimeout(()=>{patchMenu();normalizeDrawer();cleanFloating();addDashboardPanel()},1200);
  new MutationObserver(()=>{cleanFloating();normalizeDrawer()}).observe(document.documentElement,{childList:true,subtree:true});
})();
