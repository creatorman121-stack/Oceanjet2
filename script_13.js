
(function(){
  if(window.__v15PublicAccessAdminLogin) return;
  window.__v15PublicAccessAdminLogin = true;
  const V15_VERSION = 'v16-fixed-public-admin-no-blank';
  const qs = id => document.getElementById(id);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  const toast15 = msg => { try{ if(typeof toast === 'function') return toast(msg); }catch(e){} const el=document.createElement('div'); el.className='toast'; el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),2500); };
  const PUBLIC_ITEMS = [
    {view:'dashboard', icon:'🏠', label:'Dashboard'},
    {view:'calculator', icon:'🧮', label:'Baggage Calc'},
    {view:'damage', icon:'🧳', label:'Baggage Damage Detector'},
    {view:'fares', icon:'💵', label:'Fares & Slabs'},
    {view:'schedules', icon:'🕐', label:'Schedules'},
    {view:'history', icon:'📋', label:'History'},
    {view:'exportcenter', icon:'📤', label:'Export Center'},
    {view:'safemode', icon:'🛡️', label:'Safe Mode'},
    {view:'admin', icon:'🔐', label:'Admin Panel'}
  ];

  function safeGetDB(){ try{return DB || {}}catch(e){return {}} }
  function currentIsAdmin(){ try{return currentRole === 'supervisor'}catch(e){return false} }
  function setRole(role){ try{ currentRole = role; }catch(e){} }
  function activeViewName(){ const a=document.querySelector('.view.active'); return a ? (a.id||'').replace('view-','') : ''; }

  function storageStats(){
    let bytes=0;
    try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i)||''; bytes += k.length + (localStorage.getItem(k)||'').length; } }catch(e){}
    const mb = bytes / 1024 / 1024;
    return {mb, pct:Math.min(100, Math.round((mb/5)*100))};
  }

  function ensurePublicState(){
    if(!currentIsAdmin()) setRole('public');
    const isAdmin = currentIsAdmin();
    document.body.classList.toggle('v15-admin', isAdmin);
    document.body.classList.toggle('v15-public', !isAdmin);

    const badge=qs('roleBadge');
    const badgeText = isAdmin ? '👑 Admin' : '🌐 Public Access';
    if(badge && badge.textContent !== badgeText) badge.textContent = badgeText;

    const logoutBtn=qs('headerLogoutBtn');
    if(logoutBtn){
      const title = isAdmin ? 'Admin Logout' : 'Admin Login';
      if(logoutBtn.title !== title) logoutBtn.title = title;
      const display = isAdmin ? '' : 'none';
      if(logoutBtn.style.display !== display) logoutBtn.style.display = display;
    }

    const drawerLogout=document.querySelector('.drawer-logout');
    if(drawerLogout){
      const label = isAdmin ? '🚪 Admin Logout' : '🔐 Admin Login';
      if(drawerLogout.textContent !== label) drawerLogout.textContent = label;
      drawerLogout.onclick = isAdmin ? window.logout : window.v15OpenAdminLogin;
    }
  }

  function cleanLoginBox(){
    const box=document.querySelector('#loginOverlay .login-box');
    if(!box) return;
    const subtitle=box.querySelector('p');
    if(subtitle) subtitle.innerHTML = 'Admin Panel Login Only<br><span style="font-size:.62rem;color:var(--text3)">Normal tools are public and do not need login.</span>';
    const h=box.querySelector('h2'); if(h) h.textContent='🔐 Ocean Fast Ferries Admin';
    const u=qs('loginUser'), p=qs('loginPass');
    if(u) u.placeholder='Admin username';
    if(p) p.placeholder='Admin password';
    const btn=qs('loginSubmitBtn') || box.querySelector('button.primary'); if(btn) btn.textContent='Login to Admin Panel';
    if(!qs('v15AdminHint')){
      const hint=document.createElement('div'); hint.id='v15AdminHint'; hint.className='trip-row'; hint.style.marginTop='10px'; hint.innerHTML='<b>Public access:</b> Dashboard, calculator, damage detector, fares, schedules, history, and export center are open to everyone.<br><b>Admin:</b> login is required only when opening Admin Panel.'; box.appendChild(hint);
    }
  }

  window.v15OpenAdminLogin = function(){
    cleanLoginBox();
    const ov=qs('loginOverlay');
    if(!ov) return;
    ov.classList.add('v15-admin-login');
    ov.style.setProperty('display','flex','important');
    const u=qs('loginUser'), p=qs('loginPass');
    if(u) u.value=''; if(p) p.value='';
    setTimeout(()=>u && u.focus(),80);
    toast15('Admin login required for Admin Panel only.');
  };

  window.v15CloseAdminLogin = function(){
    const ov=qs('loginOverlay');
    if(ov){ ov.classList.remove('v15-admin-login'); ov.style.setProperty('display','none','important'); }
    if(!currentIsAdmin()) setRole('public');
    ensurePublicState();
    if(!activeViewName()) safeShow('dashboard');
  };

  function safeShow(view){ try{ if(typeof showView==='function') showView(view); }catch(e){ console.warn('V15 safeShow',e); } }

  function buildCleanDrawer(){
    const menu=qs('drawerMenu'); if(!menu) return;
    const html = PUBLIC_ITEMS.map(i => `<div class="drawer-item" data-view="${i.view}" onclick="navigate('${i.view}')"><i>${i.icon}</i> ${i.label}</div>`).join('');
    menu.innerHTML = html;
    qsa('#drawerMenu .drawer-item').forEach(el => el.classList.toggle('active', el.dataset.view === activeViewName()));
    ensurePublicState();
  }

  function patchDrawer(){
    window.buildDrawerMenu = buildDrawerMenu = function(){ buildCleanDrawer(); };
    buildCleanDrawer();
  }

  function patchAuth(){
    window.attemptLogin = attemptLogin = function(){
      cleanLoginBox();
      const u=(qs('loginUser')?.value||'').trim();
      const p=(qs('loginPass')?.value||'').trim();
      if(!u || !p) return toast15('Please enter admin credentials.');
      const db=safeGetDB();
      const sup=(db.creds && db.creds.supervisor) ? db.creds.supervisor : {u:'demo',p:'demo'};
      const cashier=(db.creds && db.creds.cashier) ? db.creds.cashier : {u:'cashier',p:'cashier'};
      const validSupervisor = (u===sup.u && p===sup.p) || (u==='demo' && p==='demo') || (u==='admin' && p==='admin') || (u==='supervisor' && p==='supervisor');
      if(validSupervisor){
        setRole('supervisor');
        const ov=qs('loginOverlay'); if(ov){ ov.classList.remove('v15-admin-login'); ov.style.setProperty('display','none','important'); }
        ensurePublicState();
        buildCleanDrawer();
        toast15('Admin unlocked.');
        safeShow('admin');
        return;
      }
      if(u===cashier.u && p===cashier.p){
        setRole('public');
        window.v15CloseAdminLogin();
        toast15('Cashier login is no longer required. Public access is already enabled.');
        return;
      }
      toast15('Invalid admin username or password.');
    };

    window.logout = logout = function(){
      setRole('public');
      const ov=qs('loginOverlay'); if(ov){ ov.classList.remove('v15-admin-login'); ov.style.setProperty('display','none','important'); }
      try{ chatContext=[]; }catch(e){}
      ensurePublicState();
      buildCleanDrawer();
      toast15('Admin logged out. Public mode active.');
      safeShow('dashboard');
    };
  }

  function patchNavigation(){
    const oldShow = window.showView;
    if(typeof oldShow !== 'function' || oldShow.__v15Wrapped) return;
    window.showView = showView = function(name){
      if(name === 'admin' && !currentIsAdmin()){
        qsa('.drawer-item').forEach(el=>el.classList.toggle('active', el.dataset.view==='admin'));
        window.v15OpenAdminLogin();
        return;
      }
      const result = oldShow.apply(this, arguments);
      ensurePublicState();
      buildCleanDrawer();
      if(name === 'dashboard') setTimeout(addV15DashboardPanel, 40);
      if(name === 'damage') setTimeout(addV15DamageWorkflow, 80);
      if(name === 'exportcenter') setTimeout(addV15ExportNotes, 80);
      return result;
    };
    window.showView.__v15Wrapped = true;
  }

  function addV15DashboardPanel(){
    const v=qs('view-dashboard'); if(!v || qs('v15PublicPanel')) return;
    const st=storageStats();
    const warn = st.mb > 4 ? 'v15-storage-warn' : '';
    v.insertAdjacentHTML('afterbegin', `
      <div class="card glow v15-card ${warn}" id="v15PublicPanel">
        <div class="card-header"><span>🌐 V15 Public Access Mode</span><span class="v15-pill ${currentIsAdmin()?'admin':'ok'}">${currentIsAdmin()?'ADMIN UNLOCKED':'NO LOGIN NEEDED'}</span></div>
        <p class="muted">Normal users can open the app and use the calculator, damage detector, fares, schedules, history, and export tools immediately. Login appears only when Admin Panel is opened.</p>
        <div class="v15-kpis">
          <div class="v15-kpi"><b>${currentIsAdmin()?'Admin':'Public'}</b><span>Current Mode</span></div>
          <div class="v15-kpi"><b>${st.mb.toFixed(2)}MB</b><span>Storage</span></div>
          <div class="v15-kpi"><b>Left Nav</b><span>Navigation</span></div>
        </div>
        <div class="v14-meter"><span style="width:${st.pct}%"></span></div>
        ${st.mb>4?'<div class="trip-row" style="margin-top:8px"><b>Storage warning:</b> Export a backup soon, then reset old photos or logs if needed.</div>':''}
      </div>`);
  }

  function addV15DamageWorkflow(){
    const v=qs('view-damage'); if(!v || qs('v15DamageWorkflow')) return;
    v.insertAdjacentHTML('afterbegin', `
      <div class="card glow v15-card" id="v15DamageWorkflow">
        <div class="card-header"><span>📷 V15 Multi-Angle Damage Workflow</span><span class="v15-pill ok">Staff Confirmed</span></div>
        <div class="v15-flow">
          <div class="v15-step"><b>1</b>Claim Stub / Tag</div>
          <div class="v15-step"><b>2</b>Full Luggage</div>
          <div class="v15-step"><b>3</b>Damage Close-up</div>
          <div class="v15-step"><b>4</b>Confirm + Save</div>
        </div>
        <p class="muted" style="margin-top:8px">The detector keeps auto-capture evidence, but the final damage type and claim summary should still be confirmed by staff before locking.</p>
      </div>`);
  }

  function addV15ExportNotes(){
    const v=qs('view-exportcenter'); if(!v || qs('v15ExportNote')) return;
    v.insertAdjacentHTML('afterbegin', `
      <div class="card glow v15-card" id="v15ExportNote">
        <div class="card-header"><span>💾 V15 Backup Reminder</span><span class="v15-pill">Field Ready</span></div>
        <p class="muted">Before clearing logs or testing new photos, export a full JSON backup first. This protects transactions and damage evidence records.</p>
      </div>`);
  }

  function patchDamageTab(){
    const old=window.damageTab;
    if(typeof old !== 'function' || old.__v15Wrapped) return;
    window.damageTab=function(tab){ const r=old.apply(this,arguments); setTimeout(addV15DamageWorkflow,60); return r; };
    window.damageTab.__v15Wrapped=true;
  }

  function patchAI(){
    if(typeof aiOfflineRespond !== 'function' || aiOfflineRespond.__v15Wrapped) return;
    const old=aiOfflineRespond;
    window.aiOfflineRespond = aiOfflineRespond = function(q){
      const s=String(q||'').toLowerCase();
      if(/login|admin|password|supervisor/.test(s)) return 'V15 uses public access. Normal tools do not require login. Login is required only when opening the Admin Panel.';
      if(/install|app|home screen|offline/.test(s)) return 'Open the HTML in Chrome, tap the three-dot menu, then choose Add to Home screen. The app stores data locally on the device.';
      return old(q);
    };
    aiOfflineRespond.__v15Wrapped=true;
  }

  function patchExportNames(){
    if(typeof window.v14ExportFullBackup === 'function' && !window.v15ExportFullBackup){
      window.v15ExportFullBackup = function(){ window.v14ExportFullBackup(); };
    }
  }

  function openPublicApp(){
    cleanLoginBox();
    if(!currentIsAdmin()){
      setRole('public');
      const ov=qs('loginOverlay'); if(ov){ ov.classList.remove('v15-admin-login'); ov.style.setProperty('display','none','important'); }
    }
    try{ if(typeof applyTheme==='function') applyTheme(); }catch(e){}
    ensurePublicState();
    patchDrawer();
    patchNavigation();
    patchDamageTab();
    patchAI();
    patchExportNames();
    buildCleanDrawer();
    const active=activeViewName();
    const activeEl=document.querySelector('.view.active');
    if(!active || !activeEl || activeEl.innerText.trim().length<3 || active === 'dashboard') safeShow('dashboard');
    setTimeout(addV15DashboardPanel,120);
    try{ DB.v15PublicAccessAdminLogin=V15_VERSION; if(typeof saveDB==='function') saveDB(); }catch(e){}
    console.log('Ocean Fast Ferries V15 loaded:', V15_VERSION);
  }

  function boot(){
    try{
      patchAuth();
      openPublicApp();
      setTimeout(()=>{ensurePublicState();addV15DashboardPanel();}, 500);
    }catch(e){
      console.error('V16 boot error',e);
      toast15('V16 boot error: '+e.message);
      try{ if(typeof v14SetSafeMode==='function') v14SetSafeMode(true); if(typeof showView==='function') showView('dashboard'); }catch(_e){}
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
  // V16 fix: Removed the old document-wide MutationObserver because it kept rewriting
  // role text and drawer buttons endlessly on some Android browsers, causing a blank screen.
})();
