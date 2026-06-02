
(function(){
  'use strict';
  if(window.__oj41StableRoleUI) return;
  window.__oj41StableRoleUI = true;
  const VERSION='OceanJet V41 Stable Futuristic Role UI';
  const ROLE_KEY='oj41_role';
  const LEGACY_V35_KEY='oj_v35_active_role';
  const $=id=>document.getElementById(id);
  const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const legacyShow=window.showView;
  const roleLabel={pax:'👤 Passenger',cashier:'💼 Cashier',admin:'👑 Admin'};
  const safeStore={
    get(k,d){try{return sessionStorage.getItem(k)||localStorage.getItem(k)||d}catch(e){return d}},
    set(k,v){try{sessionStorage.setItem(k,v)}catch(e){} try{localStorage.setItem(k,v)}catch(e){}},
    del(k){try{sessionStorage.removeItem(k)}catch(e){} try{localStorage.removeItem(k)}catch(e){}}
  };
  function db(){try{return window.DB||{}}catch(e){return {}}}
  function toast41(msg){ try{ if(typeof toast==='function') return toast(msg); }catch(e){} const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2600); }
  function normalizeRole(r){r=String(r||'pax').toLowerCase(); if(r==='supervisor')return'admin'; if(!['pax','cashier','admin'].includes(r))return'pax'; return r;}
  function getRole(){return normalizeRole(safeStore.get(ROLE_KEY,'pax'))}
  function setRole(role,openHome=true){
    role=normalizeRole(role); safeStore.set(ROLE_KEY,role); safeStore.set(LEGACY_V35_KEY,role);
    try{window.currentRole = role==='admin'?'supervisor':role;}catch(e){}
    document.body.classList.toggle('oj41-role-pax',role==='pax');
    document.body.classList.toggle('oj41-role-cashier',role==='cashier');
    document.body.classList.toggle('oj41-role-admin',role==='admin');
    const badge=$('roleBadge'); if(badge) badge.textContent=roleLabel[role]||'Passenger';
    const logout=$('headerLogoutBtn'); if(logout){logout.style.display=role==='pax'?'none':'flex'; logout.title='Return to Passenger Mode'; logout.onclick=()=>setRole('pax',true);}
    buildDrawer(); if(openHome) open41('home');
  }
  function ensureView(name){
    const id=name.startsWith('view-')?name:'view-'+name;
    let el=$(id);
    if(!el){ el=document.createElement('div'); el.id=id; el.className='view'; const app=document.querySelector('.app')||document.body; app.appendChild(el); }
    return el;
  }
  function activateView(name){
    const id=name.startsWith('view-')?name:'view-'+name;
    qsa('.view').forEach(v=>v.classList.remove('active'));
    const el=ensureView(id); el.classList.add('active');
    qsa('.drawer-item').forEach(x=>x.classList.toggle('active',x.dataset.view===name||x.dataset.view===id.replace(/^view-/,'')));
    closeDrawer41(); try{window.scrollTo({top:0,behavior:'smooth'})}catch(e){window.scrollTo(0,0)}
    return el;
  }
  function closeDrawer41(){try{ $('sideDrawer')?.classList.remove('open'); $('overlay')?.classList.remove('show'); $('hamburger')?.classList.remove('open'); }catch(e){} }
  const MENU={
    pax:[['home','🏠','Passenger Home'],['calculator','🧮','Baggage Fee'],['fares','💵','Passenger Fares'],['schedules','🕐','Schedules'],['damage','📷','Damage Report'],['claimstatus','🔎','Claim Status'],['login-cashier','💼','Cashier Login'],['login-admin','🔐','Admin Login']],
    cashier:[['home','🏠','Counter Home'],['calculator','🧮','Baggage Calc'],['damage','📷','Damage Evidence'],['ar','📹','AR Camera'],['lostbaggage','🧳','Claim Form'],['claimstatus','🔎','Claim Status'],['staffcounter','👥','Staff Counter'],['history','📋','Transactions'],['reports','📄','PDF Center'],['login-admin','🔐','Admin Login'],['logout','🚪','Passenger Mode']],
    admin:[['home','🏠','Control Tower'],['calculator','🧮','Baggage Calc'],['fares','💵','Fare Matrix'],['schedules','🕐','Schedules'],['damage','📷','Damage Evidence'],['ar','📹','AR Camera'],['history','📋','Transactions'],['reports','📄','PDF Reports'],['admin','⚙️','Admin Panel'],['advanced','🧬','Advanced'],['logout','🚪','Passenger Mode']]
  };
  const allowed={
    pax:new Set(['home','calculator','fares','schedules','damage','claimstatus','login-cashier','login-admin']),
    cashier:new Set(['home','calculator','fares','schedules','damage','ar','lostbaggage','claimstatus','staffcounter','history','reports','login-admin','logout']),
    admin:new Set(['home','calculator','fares','schedules','damage','ar','lostbaggage','claimstatus','staffcounter','history','reports','admin','advanced','exportcenter','sitehealth','contentmanager','v33-command','v33-staff','v33-data','v30-admin','v29-admin','v27-guardian','logout'])
  };
  let drawerLock=false;
  function buildDrawer(){
    if(drawerLock) return;
    drawerLock=true;
    const role=getRole(); const box=$('drawerMenu');
    if(box){
      box.innerHTML=(MENU[role]||MENU.pax).map(([view,ico,label])=>`<div class="drawer-item" data-view="${esc(view)}" onclick="oj41Open('${esc(view)}')"><i>${ico}</i> ${esc(label)}</div>`).join('');
    }
    const l=document.querySelector('.drawer-logout'); if(l){l.textContent=role==='pax'?'Passenger Mode':'🚪 Return to Passenger Mode';l.onclick=()=>setRole('pax',true);l.style.display=role==='pax'?'none':'block';}
    const badge=$('roleBadge'); if(badge) badge.textContent=roleLabel[role]||'Passenger';
    const brand=document.querySelector('.brand'); if(brand) brand.textContent='OceanJet Baggage Pro';
    drawerLock=false;
  }
  function strictDrawer(){
    const role=getRole(), box=$('drawerMenu'); if(!box) return;
    const allowedViews=new Set((MENU[role]||MENU.pax).map(x=>x[0]));
    qsa('.drawer-item',box).forEach(el=>{ if(!allowedViews.has(el.dataset.view)) el.remove(); });
    const visible=qsa('.drawer-item',box).map(el=>el.dataset.view).join('|');
    const expected=(MENU[role]||MENU.pax).map(x=>x[0]).join('|');
    if(visible!==expected) buildDrawer();
  }
  function iconAction(ico,title,sub,target,type=''){
    return `<div class="oj41-action ${type}" onclick="oj41Open('${esc(target)}')"><i>${ico}</i><b>${esc(title)}</b><small>${esc(sub)}</small></div>`;
  }
  function iconFn(ico,title,sub,fn,type=''){
    return `<div class="oj41-action ${type}" onclick="${fn}"><i>${ico}</i><b>${esc(title)}</b><small>${esc(sub)}</small></div>`;
  }
  function stats(){
    const d=db(); const hist=Array.isArray(d.history)?d.history:[]; let damage=0,claims=0;
    try{const log=JSON.parse(localStorage.getItem('oj_damage_master_v11_backup')||'{}'); damage=(log.cases||[]).length;}catch(e){}
    try{claims=(JSON.parse(localStorage.getItem('oj_v22_claims')||'[]')||[]).length}catch(e){}
    const rev=hist.reduce((s,x)=>s+(Number(x.total)||0),0);
    return {hist,damage,claims,rev,kg:(d.stats&&d.stats.totalKg)||0,tx:hist.length};
  }
  function kpis(){const s=stats();return `<div class="oj41-grid3"><div class="oj41-kpi"><b>${s.tx}</b><span>Transactions</span></div><div class="oj41-kpi"><b>${s.damage}</b><span>Damage Cases</span></div><div class="oj41-kpi"><b>₱${Math.round(s.rev).toLocaleString('en-PH')}</b><span>Revenue</span></div></div>`}
  function renderHome(){
    const role=getRole(); const v=activateView('oj41-home');
    let head='', tools='', extra='';
    if(role==='pax'){
      head=`<div class="oj41-title"><div><h2>Passenger Portal</h2><div class="oj41-sub">No login needed. Passengers only see baggage fee checking, passenger fares, schedules, damage reporting, and claim tracking.</div></div><span class="oj41-chip good">DEFAULT MODE</span></div>`;
      tools=iconAction('🧮','Check baggage fee','Official baggage calculator, using preserved source pricing logic.','calculator','good')+iconAction('💵','Passenger fares','View fare matrix and route pricing.','fares')+iconAction('🕐','Trip schedules','Open route departure and travel information.','schedules')+iconAction('📷','Report damage','Open baggage damage evidence scanner/report.','damage','hot')+iconAction('🔎','Track claim','Search claim status on this device.','claimstatus','warn')+iconAction('💼','Staff login','Cashier/Admin tools are hidden until login.','login-cashier');
      extra=`<div class="card"><div class="card-header">Clean passenger experience</div><div class="oj41-soft">The site now opens as Passenger by default. No counter tools, admin panels, test modules, or experimental tabs are shown to passengers.</div></div>`;
    }else if(role==='cashier'){
      head=`<div class="oj41-title"><div><h2>Counter Desk</h2><div class="oj41-sub">Cashier view shows only the tools needed for baggage computation, claim intake, evidence capture, receipts, and daily PDFs.</div></div><span class="oj41-chip warn">CASHIER</span></div>`;
      tools=iconAction('🧮','Baggage calculator','Official fee computation and receipt generation.','calculator','good')+iconAction('📷','Damage evidence','Capture and record baggage damage claims.','damage','hot')+iconAction('📹','AR camera','Open preserved AR baggage scanner.','ar')+iconAction('🧳','Claim form','Passenger lost/damaged baggage intake.','lostbaggage','warn')+iconAction('🔎','Claim status','Lookup claim progress.','claimstatus')+iconAction('📄','PDF center','Receipt, transaction, and damage reports.','reports','good');
      extra=`<div class="card"><div class="card-header">Counter workflow</div>${['Compute baggage fee','Print/download PDF receipt','Capture damage evidence','Create/track claim','Export cashier PDF report'].map((x,i)=>`<div class="oj41-row"><div><strong>${i+1}. ${x}</strong><small>Only counter-related tools are visible.</small></div><span class="oj41-chip">OK</span></div>`).join('')}</div>`;
    }else{
      head=`<div class="oj41-title"><div><h2>Admin Control Tower</h2><div class="oj41-sub">Admin can access all passenger, cashier, reports, and advanced maintenance tools, but the main navigation stays clean.</div></div><span class="oj41-chip hot">FULL ACCESS</span></div>`;
      tools=iconAction('🧮','Baggage calculator','Official source calculator preserved.','calculator','good')+iconAction('📷','Damage evidence','AR/evidence damage workflow preserved.','damage','hot')+iconAction('💵','Fare matrix','Passenger prices and route fare data.','fares')+iconAction('📋','Transactions','History and recorded receipts.','history','warn')+iconAction('📄','PDF reports','Receipt, transaction, claims, and audit PDFs.','reports','good')+iconAction('⚙️','Admin panel','Pricing, backup, and configuration tools.','admin','hot')+iconAction('🧬','Advanced modules','Older technical modules grouped away from main tabs.','advanced')+iconAction('🛟','Site health','Run app/storage/readiness checks.','sitehealth');
      extra=`<div class="card"><div class="card-header">Professional organization rule</div><div class="oj41-soft">Passenger tools stay public, cashier tools stay at counter level, and admin has everything. Old experimental modules are not removed, but grouped under Advanced to avoid messy navigation.</div></div>`;
    }
    v.innerHTML=`<div class="oj41-hero">${head}<div style="margin-top:14px">${kpis()}</div></div><div class="card" style="margin-top:12px"><div class="card-header">Main workflow</div><div class="oj41-grid">${tools}</div></div>${extra}`;
  }
  function renderLogin(type){
    const v=activateView('oj41-login'); const isAdmin=type==='admin';
    v.innerHTML=`<div class="card oj41-shell oj41-login"><div class="oj41-title"><div><h2>${isAdmin?'Admin Login':'Cashier Login'}</h2><div class="oj41-sub">${isAdmin?'Unlock full control tower and all tools.':'Unlock counter tools for receipts, claims, and reports.'}</div></div><span class="oj41-chip ${isAdmin?'hot':'warn'}">LOCKED</span></div><div class="oj41-divider"></div><div class="input-group"><label>Username</label><input id="oj41User" autocomplete="username" placeholder="${isAdmin?'admin / demo':'cashier'}"></div><div class="input-group"><label>Password</label><input id="oj41Pass" type="password" autocomplete="current-password" placeholder="Password"></div><button class="primary block" onclick="oj41SubmitLogin('${type}')">Login</button><button class="accent block" style="margin-top:8px" onclick="oj41Open('home')">Back to Passenger</button><div class="oj41-soft" style="margin-top:12px">Default test access: cashier/cashier for cashier, admin/admin or demo/demo for admin.</div></div>`;
    setTimeout(()=>$('oj41User')?.focus(),80);
  }
  window.oj41SubmitLogin=function(type){
    const u=($('oj41User')?.value||'').trim(); const p=($('oj41Pass')?.value||'').trim(); const d=db();
    const cashier=(d.creds&&d.creds.cashier)||{u:'cashier',p:'cashier'}; const sup=(d.creds&&d.creds.supervisor)||{u:'demo',p:'demo'};
    if(type==='cashier'){
      if((u===cashier.u&&p===cashier.p)||(u==='cashier'&&p==='cashier')){setRole('cashier',true);toast41('Cashier tools unlocked.');return;}
      toast41('Invalid cashier login.'); return;
    }
    const ok=(u===sup.u&&p===sup.p)||(u==='admin'&&p==='admin')||(u==='demo'&&p==='demo')||(u==='supervisor'&&p==='supervisor');
    if(ok){setRole('admin',true);toast41('Admin control tower unlocked.');return;} toast41('Invalid admin login.');
  };
  function renderReports(){
    const role=getRole(); const v=activateView('oj41-reports'); const isAdmin=role==='admin';
    v.innerHTML=`<div class="oj41-hero"><div class="oj41-title"><div><h2>Professional PDF Center</h2><div class="oj41-sub">Receipts and export outputs are grouped here. JSON remains technical recovery only.</div></div><span class="oj41-chip good">PDF FIRST</span></div>${kpis()}</div><div class="card" style="margin-top:12px"><div class="card-header">PDF exports</div><div class="oj41-grid">${iconFn('🧾','Receipt PDF','Export current baggage receipt as PDF.','oj35ExportReceiptPDF&&oj35ExportReceiptPDF()','good')}${iconFn('📋','Transactions PDF','Cashier daily/shift report.','oj35ExportTransactionsPDF&&oj35ExportTransactionsPDF()','warn')}${iconFn('🧳','Claims + Damage PDF','Damage and claims summary report.','oj35ExportClaimsPDF&&oj35ExportClaimsPDF()','hot')}${isAdmin?iconFn('🛡️','System Audit PDF','Admin audit and app status report.','oj35ExportSystemPDF&&oj35ExportSystemPDF()',''):''}</div></div>${isAdmin?`<div class="card"><div class="card-header">Technical recovery</div><div class="oj41-soft">Use JSON only for backup/restore, not for normal receipts or reports.</div><button class="accent block" style="margin-top:10px" onclick="oj35ExportTechnicalJSON&&oj35ExportTechnicalJSON()">Export Technical JSON Backup</button></div>`:''}`;
  }
  function renderAdvanced(){
    const v=activateView('oj41-advanced');
    v.innerHTML=`<div class="oj41-hero"><div class="oj41-title"><div><h2>Advanced Modules</h2><div class="oj41-sub">Older/admin experimental tools are grouped here so the main app stays professional and clean.</div></div><span class="oj41-chip hot">ADMIN ONLY</span></div></div><div class="card" style="margin-top:12px"><div class="card-header">Grouped technical tools</div><div class="oj41-grid">${iconAction('🧭','V33 Command','Operations command module.','v33-command')}${iconAction('🎒','Staff Workbench','Staff operations tools.','v33-staff')}${iconAction('🛡️','Data Guardian','Data and backup utilities.','v33-data')}${iconAction('🛟','Site Health','Diagnostics and readiness checks.','sitehealth')}${iconAction('📝','Content Manager','Content/settings manager.','contentmanager')}${iconAction('📤','Export Center','Original export center.','exportcenter')}</div></div>`;
  }
  function canOpen(target){return (allowed[getRole()]||allowed.pax).has(target)}
  function legacyActivate(name){
    try{
      if(name==='damage'){activateView('damage'); if(typeof window.renderDamage==='function'){window.renderDamage('dashboard'); return;} if(typeof legacyShow==='function'){legacyShow('damage'); return;} }
      if(name==='calculator'){activateView('calculator'); if(typeof buildCalculator==='function')buildCalculator(); return;}
      if(name==='fares'){activateView('fares'); if(typeof buildFares==='function')buildFares(); return;}
      if(name==='schedules'){activateView('schedules'); if(typeof buildSchedules==='function')buildSchedules(); return;}
      if(name==='history'){activateView('history'); if(typeof buildHistory==='function')buildHistory(); return;}
      if(name==='ar'){activateView('ar'); if(typeof buildAR==='function')buildAR(); return;}
      if(name==='admin'){try{window.currentRole='supervisor'}catch(e){} activateView('admin'); if(typeof buildAdmin==='function')buildAdmin(); return;}
      if(typeof legacyShow==='function'){legacyShow(name); closeDrawer41(); setTimeout(buildDrawer,50); return;}
      activateView(name);
    }catch(e){console.error('V41 open error',name,e); renderHome(); toast41('Recovered from '+name+' loading issue.');}
  }
  function open41(target){
    target=String(target||'home'); if(target==='logout'){setRole('pax',true);toast41('Returned to Passenger Mode.');return;}
    if(target==='login-cashier'){renderLogin('cashier');return;} if(target==='login-admin'){renderLogin('admin');return;}
    if(!canOpen(target)){
      if(getRole()==='pax'){renderLogin(/admin|export|site|content|v33|v30|v29|guardian|advanced/i.test(target)?'admin':'cashier');toast41('Login required for this tool.');return;}
      renderHome();toast41('This tool is not available for the current role.');return;
    }
    if(target==='home'){renderHome();return;} if(target==='reports'){renderReports();return;} if(target==='advanced'){renderAdvanced();return;}
    legacyActivate(target);
  }
  window.oj41Open=open41;
  window.showView=function(name){ open41(name); };
  try{showView=window.showView}catch(e){}
  window.navigate=function(name){open41(name)};
  window.logout=function(){setRole('pax',true)};
  window.toggleDrawer=window.toggleDrawer||function(){ $('sideDrawer')?.classList.toggle('open'); $('overlay')?.classList.toggle('show'); $('hamburger')?.classList.toggle('open'); };
  function patchUpdateDashboardSafe(){
    try{
      const old=window.updateDashboard;
      if(typeof old==='function' && !old.__oj41Safe){
        window.updateDashboard=function(){
          try{
            if(!$('statTrans') || !$('statRev') || !$('statKg') || !$('statTop')) return;
            return old.apply(this,arguments);
          }catch(e){console.warn('V41 skipped dashboard refresh because dashboard cards are not visible',e);}
        };
        window.updateDashboard.__oj41Safe=true;
        try{updateDashboard=window.updateDashboard}catch(e){}
      }
    }catch(e){}
  }
  function patchReceiptDefault(){
    const tryPatch=()=>{try{ if(typeof window.downloadReceipt==='function' && typeof window.oj35ExportReceiptPDF==='function') window.downloadReceipt=window.oj35ExportReceiptPDF; }catch(e){}};
    tryPatch(); setTimeout(tryPatch,600);
  }
  function patchARSafe(){
    const old=window.startAR;
    if(typeof old==='function' && !old.__oj41Safe){
      window.startAR=async function(){
        try{
          if(!window.cocoSsd){ console.warn('COCO model not loaded yet; starting camera with manual damage capture fallback.'); }
          return await old.apply(this,arguments);
        }catch(e){
          console.warn('AR fallback',e);
          try{
            const video=$('arVideo')||document.querySelector('video');
            if(video && navigator.mediaDevices && navigator.mediaDevices.getUserMedia){ video.srcObject=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); await video.play(); toast41('Camera active. AI model unavailable, use manual evidence/photo capture.'); return; }
          }catch(_){ }
          toast41('Camera/AI model unavailable on this device or browser.');
        }
      };
      window.startAR.__oj41Safe=true;
    }
  }
  function unregisterOldWorkers(){
    try{ if(navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>{try{r.update()}catch(e){}})); }catch(e){}
    try{ if(window.caches) caches.keys().then(keys=>keys.filter(k=>!/v41/i.test(k)).forEach(k=>caches.delete(k))); }catch(e){}
  }
  function watchDrawer(){
    const box=$('drawerMenu'); if(!box || box.__oj41Observed) return; box.__oj41Observed=true;
    let t=null; new MutationObserver(()=>{clearTimeout(t); t=setTimeout(strictDrawer,40);}).observe(box,{childList:true,subtree:false});
  }
  function enforceShell(){buildDrawer(); strictDrawer(); const badge=$('roleBadge'); if(badge) badge.textContent=roleLabel[getRole()]||'Passenger'; const brand=document.querySelector('.brand'); if(brand) brand.textContent='OceanJet Baggage Pro';}
  function boot(){
    document.body.classList.add('oj41-ready'); document.title='OceanJet Baggage Pro V42';
    const brand=document.querySelector('.brand'); if(brand) brand.textContent='OceanJet Baggage Pro';
    patchUpdateDashboardSafe(); patchReceiptDefault(); patchARSafe(); unregisterOldWorkers();
    ['oj41-home','oj41-login','oj41-reports','oj41-advanced'].forEach(ensureView);
    const stored=normalizeRole(safeStore.get(ROLE_KEY,'pax')); setRole(stored,true); watchDrawer(); enforceShell();
    [500,900,1400,2200,3500,5200,7500].forEach(ms=>setTimeout(()=>{enforceShell(); patchUpdateDashboardSafe(); patchReceiptDefault(); patchARSafe(); if(getRole()==='pax' && !document.querySelector('#view-oj41-home.active')) renderHome();},ms));
    console.log(VERSION+' loaded');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
