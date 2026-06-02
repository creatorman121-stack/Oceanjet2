
(function(){
  if(window.__OJ_V22_REAL_SMART_PORTAL__) return;
  window.__OJ_V22_REAL_SMART_PORTAL__ = true;

  const VERSION = 'V22_REAL_SMART_PASSENGER_STAFF_PORTAL';
  const CLAIM_KEY = 'oj_v22_claims';
  const CONTENT_KEY = 'oj_v22_content';
  const HEALTH_KEY = 'oj_v22_health';
  const ADMIN_KEY = 'oj_v22_admin_unlocked';
  const BACKUP_KEY = 'oj_v22_last_auto_backup';

  const $ = id => document.getElementById(id);
  const qs = (s,r=document) => r.querySelector(s);
  const qsa = (s,r=document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const load = (k,f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch(e) { return f; } };
  const save = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e) { logHealth('Storage save failed: '+e.message); return false; } };
  const nowPHT = () => new Date().toLocaleString('en-PH',{timeZone:'Asia/Manila',hour12:true});
  const todayPHT = () => new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'});

  const DEFAULT_CONTENT = {
    passengerHelp:'Keep your PSN, baggage tag, and photos ready. Report damage before leaving the port counter whenever possible.',
    damagePolicy:'Damage reports should include claim stub/tag, full baggage photo, close-up of damage, route, date, and contact details.',
    lostPolicy:'Lost baggage cases require PSN or ticket reference, passenger last name, route, baggage description, and last seen area.',
    privacy:'Collect only the information needed for verification. Avoid sharing claim photos publicly. Export backups only to authorized staff.',
    portContacts:'Cebu Pier Help Desk • Tagbilaran Counter • Ormoc Counter • Dumaguete Counter • Surigao Counter'
  };

  function claims(){ return load(CLAIM_KEY, []); }
  function setClaims(v){ save(CLAIM_KEY, v); updateHealthBackup(); }
  function content(){ return Object.assign({}, DEFAULT_CONTENT, load(CONTENT_KEY, {})); }
  function setContent(v){ save(CONTENT_KEY, v); }
  function logHealth(msg){ const h = load(HEALTH_KEY, []); h.unshift({time:nowPHT(), msg:String(msg).slice(0,240)}); save(HEALTH_KEY, h.slice(0,60)); }

  window.addEventListener('error', e => logHealth('JS error: '+(e.message||'unknown')));
  window.addEventListener('unhandledrejection', e => logHealth('Promise error: '+((e.reason&&e.reason.message)||e.reason||'unknown')));

  function routeOptions(selected){
    const fallback = ['cebu_tagbilaran','cebu_ormoc','cebu_palompom','cebu_palompom'.replace('palompom','palompon'),'cebu_getafe','cebu_maasin','cebu_surigao','cebu_siquijor','cebu_dumaguete'];
    let keys = [];
    try { keys = Object.keys(window.ROUTE_PLANS || window.ROUTES || {}); } catch(e){}
    keys = keys.length ? keys : fallback;
    const seen = new Set();
    return keys.filter(k => k && !seen.has(k) && seen.add(k)).map(k => `<option value="${esc(k)}" ${k===selected?'selected':''}>${esc(routeLabel(k))}</option>`).join('');
  }

  function routeLabel(k){
    try { if(typeof window.label === 'function') return window.label(k); } catch(e){}
    const map = {cebu_tagbilaran:'Cebu → Tagbilaran',cebu_ormoc:'Cebu → Ormoc',cebu_palompon:'Cebu → Palompon',cebu_getafe:'Cebu → Getafe',cebu_maasin:'Cebu → Maasin',cebu_surigao:'Cebu → Surigao',cebu_siquijor:'Cebu → Siquijor',cebu_dumaguete:'Cebu → Dumaguete'};
    return map[k] || String(k).replace(/^cebu_/,'Cebu → ').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  }

  function ensureView(name){
    const id = name.startsWith('view-') ? name : 'view-'+name;
    let v = $(id);
    if(!v){
      v = document.createElement('div');
      v.id = id;
      v.className = 'view';
      const anchor = $('view-map') || qs('.view:last-of-type') || qs('.app');
      if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(v, anchor.nextSibling);
      else document.body.appendChild(v);
    }
    return v;
  }

  function toast22(msg){
    try { if(typeof window.toast === 'function') return window.toast(msg); } catch(e){}
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:99999;background:#ff2f7d;color:white;padding:10px 14px;border-radius:999px;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,.35);max-width:92%;text-align:center';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),2600);
  }

  function claimId(type){
    const prefix = type === 'Lost Baggage' ? 'OJ-LOST' : 'OJ-DMG';
    return prefix + '-' + todayPHT().replace(/-/g,'') + '-' + String(claims().length+1).padStart(4,'0');
  }

  function statusSteps(status){
    const flow = ['Submitted','Under Review','Approved','Processing','Closed'];
    const idx = Math.max(0, flow.indexOf(status));
    return flow.map((s,i)=>`<div class="v22-step ${i<idx?'done':i===idx?'current':''}"><b>${esc(s)}</b>${i===idx?'<br><small>Current stage</small>':''}</div>`).join('');
  }

  function miniQrCanvas(id, canvas){
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const n = 29, cell = Math.floor(canvas.width/n);
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    let seed = 0; for(let i=0;i<id.length;i++) seed = (seed*31 + id.charCodeAt(i)) >>> 0;
    function rand(){ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    ctx.fillStyle = '#050816';
    function finder(x,y){ ctx.fillRect(x*cell,y*cell,7*cell,7*cell); ctx.fillStyle='#fff';ctx.fillRect((x+1)*cell,(y+1)*cell,5*cell,5*cell);ctx.fillStyle='#050816';ctx.fillRect((x+2)*cell,(y+2)*cell,3*cell,3*cell); }
    finder(1,1); finder(21,1); finder(1,21);
    for(let y=0;y<n;y++) for(let x=0;x<n;x++){
      const inFinder = (x<9&&y<9)||(x>19&&y<9)||(x<9&&y>19);
      if(!inFinder && rand()>.56) ctx.fillRect(x*cell,y*cell,cell,cell);
    }
  }

  function renderPortal(){
    const c = content();
    const cls = claims();
    const pending = cls.filter(x=>!['Closed','Rejected'].includes(x.status)).length;
    const today = cls.filter(x=>String(x.createdDate).startsWith(todayPHT())).length;
    ensureView('portal').innerHTML = `
      <div class="v22-hero">
        <div class="v22-title"><div><h2>🌊 OceanJet Smart Passenger + Staff Portal</h2><div class="v22-sub">Choose your role. Public tools open immediately. Admin tools stay protected.</div></div><span class="v22-chip green">${navigator.onLine?'Online':'Offline Ready'}</span></div>
        <div class="v22-grid">
          <div class="v22-role" tabindex="0" onclick="v22PassengerMode()"><div><div class="icon">🎫</div><b>I am a Passenger</b><span>Fare, schedule, baggage guide, claim report, claim status.</span></div><span class="v22-chip">Open</span></div>
          <div class="v22-role" tabindex="0" onclick="showView('staffcounter')"><div><div class="icon">🧳</div><b>Baggage Staff</b><span>Pending claims, status updates, damage workflow, daily export.</span></div><span class="v22-chip pink">Counter</span></div>
          <div class="v22-role" tabindex="0" onclick="showView('calculator')"><div><div class="icon">🧾</div><b>Cashier</b><span>Go directly to the preserved baggage calculator.</span></div><span class="v22-chip amber">Calc</span></div>
          <div class="v22-role" tabindex="0" onclick="showView('contentmanager')"><div><div class="icon">🔐</div><b>Supervisor / Admin</b><span>Content, health center, backup, settings, admin panel.</span></div><span class="v22-chip red">Login</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">📌 Today at a glance</div>
        <div class="v22-grid3">
          <div class="v22-kpi"><b>${cls.length}</b><span>Total Claims</span></div>
          <div class="v22-kpi"><b>${pending}</b><span>Active</span></div>
          <div class="v22-kpi"><b>${today}</b><span>Today</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">👥 Passenger Help</div>
        <div class="v22-notice">${esc(c.passengerHelp)}</div>
        <div class="v22-actions">
          <button class="primary block" onclick="showView('claimstatus')">Track Claim</button>
          <button class="accent block" onclick="showView('lostbaggage')">Report Baggage</button>
          <button class="block" onclick="showView('fares')">Check Fares</button>
          <button class="block" onclick="showView('schedules')">Schedules</button>
        </div>
      </div>
      <div class="card"><div class="card-header">🔏 Privacy Reminder</div><div class="v22-privacy">${esc(c.privacy)}</div></div>
    `;
    setTimeout(()=>drawAllQr(),60);
  }

  window.v22PassengerMode = function(){ showView('claimstatus'); };

  function renderClaimStatus(){
    const recent = claims().slice(0,5).map(c => `<div class="v22-row" onclick="v22LookupClaim('${esc(c.id)}')"><div><strong>${esc(c.id)}</strong><small>${esc(c.type)} • ${esc(c.route)} • ${esc(c.status)}</small></div><span class="v22-chip ${c.status==='Closed'?'green':c.status==='Under Review'?'amber':'pink'}">${esc(c.status)}</span></div>`).join('') || '<p class="muted">No claims yet on this device.</p>';
    ensureView('claimstatus').innerHTML = `
      <div class="card glow">
        <div class="card-header"><span>🔍 Claim Status Checker</span><span class="v22-chip">Public</span></div>
        <div class="v22-form">
          <div class="input-group"><label>Claim Number</label><input id="v22ClaimLookup" placeholder="Example: OJ-DMG-20260531-0001"></div>
          <button class="primary block" onclick="v22LookupClaim()">Check Status</button>
        </div>
        <div id="v22ClaimResult"></div>
      </div>
      <div class="card"><div class="card-header">📝 Submit a Report</div><div class="v22-actions"><button class="accent block" onclick="showView('lostbaggage');setTimeout(()=>{const x=document.getElementById('v22ClaimType'); if(x)x.value='Damage Report'},80)">Damage Report</button><button class="block" onclick="showView('lostbaggage')">Lost Baggage</button></div></div>
      <div class="card"><div class="card-header">Recent Local Claims</div>${recent}</div>
    `;
  }

  window.v22LookupClaim = function(id){
    const q = (id || $('v22ClaimLookup')?.value || '').trim().toUpperCase();
    const res = $('v22ClaimResult');
    if(!res) return;
    const c = claims().find(x => String(x.id).toUpperCase() === q);
    if(!c){ res.innerHTML = `<div class="v22-notice" style="margin-top:12px">No claim found on this device. For a real multi-device claim tracker, connect the app later to Firebase or Supabase.</div>`; return; }
    res.innerHTML = claimReceiptHtml(c, true);
    setTimeout(()=>drawAllQr(),60);
  };

  function renderLostBaggage(){
    const c = content();
    ensureView('lostbaggage').innerHTML = `
      <div class="card glow">
        <div class="card-header"><span>🧳 Baggage Report Form</span><span class="v22-chip green">Offline Save</span></div>
        <div class="v22-notice">${esc(c.damagePolicy)}<br><br>${esc(c.lostPolicy)}</div>
        <div class="v22-form" style="margin-top:12px">
          <div class="grid2">
            <div class="input-group"><label>Report Type</label><select id="v22ClaimType"><option>Damage Report</option><option>Lost Baggage</option></select></div>
            <div class="input-group"><label>Route</label><select id="v22ClaimRoute">${routeOptions('cebu_tagbilaran')}</select></div>
          </div>
          <div class="grid2">
            <div class="input-group"><label>PSN / Ticket Ref</label><input id="v22ClaimPsn" placeholder="Optional but recommended"></div>
            <div class="input-group"><label>Passenger Last Name</label><input id="v22ClaimLast" placeholder="For verification"></div>
          </div>
          <div class="grid2">
            <div class="input-group"><label>Baggage Tag / Claim Stub</label><input id="v22ClaimTag" placeholder="Example: OJ-12345"></div>
            <div class="input-group"><label>Contact Number</label><input id="v22ClaimContact" placeholder="Mobile number"></div>
          </div>
          <div class="input-group"><label>Description</label><textarea id="v22ClaimDesc" placeholder="Describe the damage/lost item, color, size, brand, and last seen area."></textarea></div>
          <button class="primary block" onclick="v22SubmitClaim()">Save Report + Generate Receipt</button>
        </div>
        <div id="v22ClaimSaveOut"></div>
      </div>
    `;
  }

  window.v22SubmitClaim = function(){
    const type = $('v22ClaimType')?.value || 'Damage Report';
    const last = ($('v22ClaimLast')?.value || '').trim();
    const desc = ($('v22ClaimDesc')?.value || '').trim();
    if(!last || !desc){ toast22('Please add passenger last name and description.'); return; }
    const item = {
      id: claimId(type === 'Lost Baggage' ? 'Lost Baggage' : 'Damage Report'),
      type,
      route: $('v22ClaimRoute')?.value || '',
      routeLabel: routeLabel($('v22ClaimRoute')?.value || ''),
      psn: ($('v22ClaimPsn')?.value || '').trim(),
      lastName: last,
      tag: ($('v22ClaimTag')?.value || '').trim(),
      contact: ($('v22ClaimContact')?.value || '').trim(),
      description: desc,
      status:'Submitted',
      priority: type === 'Damage Report' && /crack|broken|wet|missing|severe/i.test(desc) ? 'High' : 'Normal',
      createdAt: nowPHT(),
      createdDate: todayPHT(),
      updatedAt: nowPHT(),
      sync:'Pending Local Backup',
      history:[{time:nowPHT(),status:'Submitted',note:'Report saved locally on this device.'}]
    };
    const all = claims(); all.unshift(item); setClaims(all);
    const out = $('v22ClaimSaveOut');
    if(out) out.innerHTML = claimReceiptHtml(item, false);
    setTimeout(()=>drawAllQr(),60);
    toast22('Claim saved: '+item.id);
  };

  function claimReceiptHtml(c, showTimeline){
    return `
      <div class="v22-receipt">
        <div class="v22-qrwrap">
          <div class="v22-qr"><canvas class="v22-qr-canvas" width="116" height="116" data-claim="${esc(c.id)}"></canvas></div>
          <div>
            <div class="v22-chip pink">Claim Receipt</div>
            <h3 style="margin:8px 0;color:#fff">${esc(c.id)}</h3>
            <div class="muted">${esc(c.type)} • ${esc(c.routeLabel || routeLabel(c.route))}</div>
            <div style="margin-top:8px"><b>Status:</b> ${esc(c.status)}<br><b>Priority:</b> ${esc(c.priority || 'Normal')}<br><b>Date:</b> ${esc(c.createdAt)}</div>
          </div>
        </div>
        <div class="v22-actions"><button class="accent block" onclick="v22CopyClaim('${esc(c.id)}')">Copy Claim No.</button><button class="block" onclick="showView('staffcounter')">Open Staff Counter</button></div>
        ${showTimeline ? `<div class="v22-timeline">${statusSteps(c.status)}</div>` : ''}
      </div>`;
  }

  function drawAllQr(){ qsa('.v22-qr-canvas').forEach(cv => miniQrCanvas(cv.dataset.claim || 'OJ', cv)); }
  window.v22CopyClaim = function(id){ navigator.clipboard?.writeText(id).then(()=>toast22('Claim number copied.')).catch(()=>toast22(id)); };

  function renderStaffCounter(){
    const all = claims();
    const active = all.filter(c=>!['Closed','Rejected'].includes(c.status));
    const rows = active.map(c => staffClaimRow(c)).join('') || '<p class="muted">No active claims on this device.</p>';
    ensureView('staffcounter').innerHTML = `
      <div class="card glow">
        <div class="card-header"><span>🧳 Staff Counter Mode</span><span class="v22-chip amber">Local Queue</span></div>
        <div class="v22-grid3"><div class="v22-kpi"><b>${all.length}</b><span>Total</span></div><div class="v22-kpi"><b>${active.length}</b><span>Active</span></div><div class="v22-kpi"><b>${all.filter(c=>c.priority==='High').length}</b><span>High Priority</span></div></div>
        <div class="v22-actions"><button class="primary block" onclick="showView('lostbaggage')">New Report</button><button class="accent block" onclick="showView('damage')">Damage Detector</button><button class="block" onclick="v22ExportClaimsCSV()">Export Claims CSV</button><button class="block" onclick="showView('sitehealth')">Site Health</button></div>
      </div>
      <div class="card"><div class="card-header">Pending / Active Claims</div><div class="v22-toolbar-sticky"><input id="v22StaffSearch" placeholder="Search claim, last name, tag" oninput="v22FilterStaffClaims()"></div><div id="v22StaffRows">${rows}</div></div>
    `;
  }

  function staffClaimRow(c){
    return `<div class="v22-row v22-staff-row" data-search="${esc((c.id+' '+c.lastName+' '+c.tag+' '+c.description+' '+c.status).toLowerCase())}">
      <div><strong>${esc(c.id)}</strong><small>${esc(c.type)} • ${esc(c.routeLabel || routeLabel(c.route))}</small><small>Passenger: ${esc(maskName(c.lastName))} • Tag: ${esc(c.tag||'—')}</small><small>${esc(c.description).slice(0,120)}</small></div>
      <div style="min-width:132px"><span class="v22-chip ${c.priority==='High'?'red':'green'}">${esc(c.priority||'Normal')}</span><div style="height:8px"></div><select onchange="v22SetClaimStatus('${esc(c.id)}',this.value)">${['Submitted','Under Review','Approved','Processing','Closed','Rejected'].map(s=>`<option ${c.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
    </div>`;
  }

  function maskName(n){ n = String(n||''); if(n.length <= 2) return n ? n[0]+'*' : '—'; return n[0] + '*'.repeat(Math.max(1,n.length-2)) + n[n.length-1]; }
  window.v22FilterStaffClaims = function(){ const q = ($('v22StaffSearch')?.value || '').toLowerCase(); qsa('.v22-staff-row').forEach(r => r.style.display = !q || r.dataset.search.includes(q) ? '' : 'none'); };
  window.v22SetClaimStatus = function(id,status){
    const all = claims(); const c = all.find(x=>x.id===id); if(!c) return;
    c.status = status; c.updatedAt = nowPHT(); c.history = c.history || []; c.history.unshift({time:nowPHT(),status,note:'Updated from Staff Counter'}); c.sync = 'Pending Local Backup';
    setClaims(all); toast22('Updated '+id+' to '+status); renderStaffCounter();
  };

  function storageStats(){
    let total = 0, items = [];
    try { for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); const v=localStorage.getItem(k)||''; const bytes=(k.length+v.length)*2; total+=bytes; items.push({k,bytes}); } } catch(e){}
    const mb = total/1024/1024; return {mb,pct:Math.min(100,Math.round(mb/5*100)),items:items.sort((a,b)=>b.bytes-a.bytes).slice(0,8)};
  }

  function renderSiteHealth(){
    const st = storageStats(); const h = load(HEALTH_KEY, []); const all = claims();
    const pending = all.filter(c=>String(c.sync||'').includes('Pending')).length;
    const biggest = st.items.map(x=>`<div class="v22-row"><div><b>${esc(x.k)}</b><small>${(x.bytes/1024).toFixed(1)} KB</small></div></div>`).join('') || '<p class="muted">No local storage items found.</p>';
    ensureView('sitehealth').innerHTML = `
      <div class="card glow"><div class="card-header"><span>🛟 Site Health Center</span><span class="v22-chip ${navigator.onLine?'green':'amber'}">${navigator.onLine?'Online':'Offline'}</span></div>
        <div class="v22-grid3"><div class="v22-kpi"><b>${st.mb.toFixed(2)}MB</b><span>Storage</span></div><div class="v22-kpi"><b>${pending}</b><span>Pending</span></div><div class="v22-kpi"><b>${h.length}</b><span>Logs</span></div></div>
        <div class="v22-meter" style="margin:12px 0"><span style="width:${st.pct}%"></span></div>
        <div class="v22-health"><span class="v22-chip">${VERSION}</span><span class="v22-chip pink">Last backup: ${esc(localStorage.getItem(BACKUP_KEY)||'Never')}</span></div>
        <div class="v22-actions"><button class="primary block" onclick="v22ExportFullBackup()">Download Full Backup</button><button class="accent block" onclick="v22RepairApp()">Repair App</button><label class="block" style="text-align:center;padding:10px;border-radius:12px;background:var(--bg-elevated);cursor:pointer">Import Backup<input type="file" accept=".json" hidden onchange="v22ImportBackup(this.files[0])"></label><button class="danger block" onclick="v22ClearHealthLogs()">Clear Error Logs</button></div>
      </div>
      <div class="card"><div class="card-header">Largest Storage Items</div>${biggest}</div>
      <div class="card"><div class="card-header">Recent App Logs</div>${h.slice(0,12).map(x=>`<div class="v22-step"><b>${esc(x.time)}</b><br>${esc(x.msg)}</div>`).join('') || '<p class="muted">No errors recorded.</p>'}</div>
    `;
  }

  window.v22RepairApp = function(){
    try { ensureAllViews(); if(typeof buildDrawerMenu === 'function') buildDrawerMenu(); patchDrawerItems(); normalizeMenu(); document.body.classList.add('v22-mobile-polish'); toast22('Repair complete. Navigation rebuilt.'); logHealth('Manual repair executed.'); }
    catch(e){ alert('Repair failed: '+e.message); logHealth('Repair failed: '+e.message); }
  };
  window.v22ClearHealthLogs = function(){ save(HEALTH_KEY, []); renderSiteHealth(); toast22('Health logs cleared.'); };

  function renderContentManager(){
    if(!isAdminUnlocked()){
      ensureView('contentmanager').innerHTML = `
        <div class="card glow"><div class="card-header"><span>🔐 Admin Content Manager</span><span class="v22-chip red">Login required</span></div>
          <p class="muted">Public site tools remain open. Login is only needed for admin editing and sensitive maintenance.</p>
          <div class="v22-form" style="margin-top:12px"><div class="input-group"><label>Username</label><input id="v22AdminUser" placeholder="demo / admin / supervisor"></div><div class="input-group"><label>Password</label><input id="v22AdminPass" type="password" placeholder="demo / admin / supervisor"></div><button class="primary block" onclick="v22AdminLogin()">Unlock Admin Tools</button></div>
        </div>`;
      return;
    }
    const c = content();
    ensureView('contentmanager').innerHTML = `
      <div class="card glow"><div class="card-header"><span>📝 Admin Content Manager</span><span class="v22-chip green">Unlocked</span></div>
        <div class="v22-form">
          <div class="input-group"><label>Passenger Help Text</label><textarea id="v22cPassenger">${esc(c.passengerHelp)}</textarea></div>
          <div class="input-group"><label>Damage Policy Text</label><textarea id="v22cDamage">${esc(c.damagePolicy)}</textarea></div>
          <div class="input-group"><label>Lost Baggage Policy Text</label><textarea id="v22cLost">${esc(c.lostPolicy)}</textarea></div>
          <div class="input-group"><label>Privacy Notice</label><textarea id="v22cPrivacy">${esc(c.privacy)}</textarea></div>
          <div class="input-group"><label>Port Contacts / Help Desk</label><textarea id="v22cPorts">${esc(c.portContacts)}</textarea></div>
          <div class="v22-actions"><button class="primary block" onclick="v22SaveContent()">Save Content</button><button class="accent block" onclick="showView('sitehealth')">Site Health</button><button class="block" onclick="showView('admin')">Original Admin Panel</button><button class="danger block" onclick="v22AdminLogout()">Lock Admin</button></div>
        </div>
      </div>`;
  }

  function isAdminUnlocked(){ return sessionStorage.getItem(ADMIN_KEY)==='1' || localStorage.getItem(ADMIN_KEY)==='1'; }
  window.v22AdminLogin = function(){
    const u = ($('v22AdminUser')?.value||'').trim().toLowerCase();
    const p = ($('v22AdminPass')?.value||'').trim().toLowerCase();
    const ok = (u==='demo'&&p==='demo') || (u==='admin'&&p==='admin') || (u==='supervisor'&&p==='supervisor');
    if(!ok){ toast22('Invalid admin login.'); logHealth('Failed V22 admin login.'); return; }
    sessionStorage.setItem(ADMIN_KEY,'1'); toast22('Admin tools unlocked.'); renderContentManager();
  };
  window.v22AdminLogout = function(){ sessionStorage.removeItem(ADMIN_KEY); localStorage.removeItem(ADMIN_KEY); toast22('Admin tools locked.'); renderContentManager(); };
  window.v22SaveContent = function(){ setContent({passengerHelp:$('v22cPassenger').value,damagePolicy:$('v22cDamage').value,lostPolicy:$('v22cLost').value,privacy:$('v22cPrivacy').value,portContacts:$('v22cPorts').value}); toast22('Site content saved.'); };

  function updateHealthBackup(){ localStorage.setItem(BACKUP_KEY, nowPHT()); }
  window.v22ExportClaimsCSV = function(){
    const headers = ['id','type','routeLabel','lastName','psn','tag','contact','status','priority','createdAt','updatedAt','description'];
    const rows = claims().map(c => headers.map(h => '"'+String(c[h]??'').replace(/"/g,'""')+'"').join(','));
    downloadBlob(new Blob([[headers.join(','),...rows].join('\n')],{type:'text/csv'}),'oceanjet_v22_claims.csv');
  };
  window.v22ExportFullBackup = function(){
    const data = {version:VERSION,exportedAt:nowPHT(),claims:claims(),content:content(),damage:load('oj_damage_master_log_v11',[]),transactions:(window.DB&&window.DB.history)||load('ojDB',{}).history||[],health:load(HEALTH_KEY,[])};
    downloadBlob(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),'oceanjet_v22_full_backup.json');
  };
  window.v22ImportBackup = function(file){
    if(!file) return;
    const r = new FileReader();
    r.onload = e => { try { const data=JSON.parse(e.target.result); if(Array.isArray(data.claims)) setClaims(data.claims); if(data.content) setContent(data.content); logHealth('Backup imported.'); toast22('Backup imported.'); renderSiteHealth(); } catch(err){ toast22('Invalid backup file.'); logHealth('Import failed: '+err.message); } };
    r.readAsText(file);
  };
  function downloadBlob(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500); }

  function patchDrawerItems(){
    const menu = $('drawerMenu'); if(!menu) return;
    const items = [
      ['portal','🏠','Smart Portal'],['claimstatus','🔍','Claim Status'],['lostbaggage','🧳','Report Baggage'],['staffcounter','👥','Staff Counter'],['sitehealth','🛟','Site Health'],['contentmanager','📝','Content Manager']
    ];
    items.forEach(([view,icon,label])=>{
      if(!qs(`.drawer-item[data-view="${view}"]`,menu)){
        const d=document.createElement('div'); d.className='drawer-item'; d.dataset.view=view; d.setAttribute('onclick',`navigate('${view}')`); d.innerHTML=`<i>${icon}</i> ${label}`; menu.insertBefore(d, menu.firstChild);
      }
    });
  }

  function normalizeMenu(){ const active = qs('.view.active'); const name = active ? active.id.replace('view-','') : 'portal'; qsa('#drawerMenu .drawer-item').forEach(el=>el.classList.toggle('active', el.dataset.view===name)); }

  function showV22(name){
    ensureAllViews();
    qsa('.view').forEach(v=>v.classList.remove('active'));
    const v = ensureView(name); v.classList.add('active');
    normalizeMenu();
    const renders = {portal:renderPortal,claimstatus:renderClaimStatus,lostbaggage:renderLostBaggage,staffcounter:renderStaffCounter,sitehealth:renderSiteHealth,contentmanager:renderContentManager};
    if(renders[name]) renders[name]();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function patchNavigation(){
    const oldShow = window.showView;
    if(!oldShow || oldShow.__v22Wrapped) return;
    window.showView = function(name){
      if(['portal','claimstatus','lostbaggage','staffcounter','sitehealth','contentmanager'].includes(name)){ showV22(name); return; }
      const r = oldShow.apply(this, arguments); setTimeout(()=>{patchDrawerItems(); normalizeMenu();},40); return r;
    };
    window.showView.__v22Wrapped = true;
    const oldBuild = window.buildDrawerMenu;
    if(oldBuild && !oldBuild.__v22Wrapped){
      window.buildDrawerMenu = buildDrawerMenu = function(){ const r = oldBuild.apply(this, arguments); patchDrawerItems(); normalizeMenu(); return r; };
      window.buildDrawerMenu.__v22Wrapped = true;
    }
  }

  function ensureAllViews(){ ['portal','claimstatus','lostbaggage','staffcounter','sitehealth','contentmanager'].forEach(ensureView); }

  function blankGuard(){
    setTimeout(()=>{
      const app = qs('.app'); const active = qs('.view.active');
      if(!app || !active || active.getBoundingClientRect().height < 12){
        logHealth('Blank screen guard triggered.');
        ensureAllViews(); showV22('portal');
      }
    },1400);
  }

  function injectPwaHelper(){
    try{
      if('serviceWorker' in navigator && !window.__v22SWRegistered){
        window.__v22SWRegistered = true;
        navigator.serviceWorker.register('sw.js').catch(()=>{});
      }
    }catch(e){}
  }

  function boot(){
    try{
      document.body.classList.add('v22-mobile-polish');
      ensureAllViews(); patchNavigation();
      if(typeof window.buildDrawerMenu === 'function') window.buildDrawerMenu(); else patchDrawerItems();
      injectPwaHelper();
      logHealth('V22 booted successfully.');
      setTimeout(()=>{ if(!sessionStorage.getItem('oj_v22_landed')){ sessionStorage.setItem('oj_v22_landed','1'); showV22('portal'); }}, 520);
      blankGuard();
      setInterval(()=>{ try{ updateHealthBackup(); }catch(e){} }, 180000);
      console.log(VERSION+' loaded');
    }catch(e){
      console.error('V22 boot error', e); logHealth('V22 boot error: '+e.message);
      try{ ensureView('portal').innerHTML = `<div class="card glow"><div class="card-header">🛟 Recovery Mode</div><p>The app detected a startup issue. Use the repair button below.</p><button class="primary block" onclick="v22RepairApp()">Repair App</button></div>`; showV22('portal'); }catch(_){ alert('V22 recovery failed: '+e.message); }
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
