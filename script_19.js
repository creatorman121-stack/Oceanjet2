
(function(){
  if(window.__OJ_V24_SERVICE_OPS_PORTAL__) return;
  window.__OJ_V24_SERVICE_OPS_PORTAL__ = true;

  const VERSION = 'V24_SERVICE_OPS_PORTAL';
  const CLAIM_KEY = 'oj_v22_claims';
  const TICKET_KEY = 'oj_v24_visit_tickets';
  const SHIFT_KEY = 'oj_v24_shift_board';
  const FEEDBACK_KEY = 'oj_v24_feedback';
  const SOP_KEY = 'oj_v24_sop_progress';
  const LOG_KEY = 'oj_v24_ops_log';

  const ROUTES = [
    ['cebu_tagbilaran','Cebu → Tagbilaran'],['cebu_maasin','Cebu → Maasin'],['cebu_surigao','Cebu → Surigao'],
    ['cebu_siquijor','Cebu → Siquijor'],['cebu_dumaguete','Cebu → Dumaguete'],['cebu_ormoc','Cebu → Ormoc'],
    ['cebu_palompon','Cebu → Palompon'],['cebu_getafe','Cebu → Getafe']
  ];

  const $ = id => document.getElementById(id);
  const qs = (s,root=document) => root.querySelector(s);
  const qsa = (s,root=document) => Array.from(root.querySelectorAll(s));
  const esc = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const load = (k,f) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? f; } catch(e){ return f; } };
  const save = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){ console.warn('V24 storage failed', e); } };
  const claims = () => load(CLAIM_KEY, []);
  const tickets = () => load(TICKET_KEY, []);
  const feedback = () => load(FEEDBACK_KEY, []);
  const sopProgress = () => load(SOP_KEY, {});
  const routeLabel = r => ROUTES.find(x=>x[0]===r)?.[1] || r || 'No route';
  const nowPHT = () => new Date().toLocaleString('en-PH', {timeZone:'Asia/Manila', hour12:true});
  const todayPHT = () => new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Manila'});
  const mask = v => { v = String(v || ''); return v.length <= 2 ? v : v[0] + '*'.repeat(Math.max(1,v.length-2)) + v.slice(-1); };
  const toast = msg => { if(typeof window.toast === 'function') return window.toast(msg); if(typeof window.toast22 === 'function') return window.toast22(msg); alert(msg); };

  function log(msg){ const rows = load(LOG_KEY, []); rows.unshift({time:nowPHT(), msg:String(msg)}); save(LOG_KEY, rows.slice(0,80)); }
  function ensureView(name){
    const id = name.startsWith('view-') ? name : 'view-' + name;
    let v = $(id);
    if(!v){ v = document.createElement('div'); v.id = id; v.className = 'view'; (qs('.app') || document.body).appendChild(v); }
    return v;
  }
  function statusClass(status){ status = String(status || '').toLowerCase(); if(status.includes('critical')||status.includes('escalated')) return 'red'; if(status.includes('review')||status.includes('processing')) return 'amber'; if(status.includes('closed')||status.includes('resolved')) return 'green'; return 'pink'; }
  function riskScore(c){
    let s = 8;
    const text = `${c.type||''} ${c.description||''} ${c.damageType||''} ${c.status||''}`.toLowerCase();
    if(text.includes('lost')) s += 32;
    if(text.includes('critical')||text.includes('wet')||text.includes('missing')||text.includes('crack')||text.includes('broken')) s += 25;
    if(!c.contact) s += 18;
    if(!c.tag) s += 12;
    if(String(c.status||'').toLowerCase().includes('review')) s += 10;
    const ageHours = Math.max(0, (Date.now() - Date.parse(c.createdAt || c.updatedAt || new Date())) / 36e5);
    if(ageHours > 24) s += 20; else if(ageHours > 8) s += 10;
    return Math.min(100, Math.round(s));
  }
  function openClaims(){ return claims().filter(c=>!['Closed','Rejected','Resolved'].includes(String(c.status || ''))); }
  function uid(prefix){ return prefix + '-' + todayPHT().replace(/-/g,'') + '-' + Math.random().toString(36).slice(2,6).toUpperCase(); }

  const SOP = {
    damage:{title:'Damage Claim Intake', icon:'🧳', steps:['Verify PSN or claim stub/tag and passenger last name.','Capture claim stub/tag photo first.','Capture full baggage view and close-up damage evidence.','Confirm route, destination, color, size, baggage type, and damage category.','Save case, issue claim number, and tell passenger how to track status.','Lock evidence only after supervisor review.']},
    lost:{title:'Lost Baggage Report', icon:'🔍', steps:['Ask passenger route, last seen port, baggage tag, and contact number.','Record color, size, type, and identifying marks.','Check today’s active claims and staff counter queue for possible match.','Mark as Under Review and assign next follow-up time.','Export daily lost baggage list at end of shift.']},
    cashier:{title:'Cashier Baggage Fee Flow', icon:'💳', steps:['Use Baggage Calc tab only for official baggage computation.','Confirm route, class, baggage weight, and declared value.','Use cashier adjustment only when authorized.','Save receipt and keep transaction in history.','Never calculate official baggage fee inside chatbot.']},
    backup:{title:'End-of-Shift Backup', icon:'💾', steps:['Open Efficiency Center or Site Health.','Run audit and duplicate cleanup.','Export full backup and claims CSV.','Store backup in approved OceanJet drive or device.','Confirm next shift can access needed records.']},
    passenger:{title:'Passenger Help Desk', icon:'🎫', steps:['Ask the passenger what they need: fare, schedule, claim status, lost baggage, or damage report.','Use Service Hub quick cards instead of searching through admin tools.','Issue visit ticket if the counter is busy.','For claim status, search claim number on the passenger device.','Escalate if passenger has missing contact details or critical damage.']}
  };

  function health(){
    const cls = claims();
    const open = openClaims();
    const urgent = open.filter(c=>riskScore(c)>=55).length;
    const missing = open.filter(c=>!c.contact || !c.tag).length;
    const todayTickets = tickets().filter(t=>String(t.createdAt||'').includes(todayPHT())).length;
    let score = 100 - urgent*8 - missing*4;
    try{ const mb = JSON.stringify(localStorage).length/1024/1024; if(mb > 4) score -= 20; else if(mb > 2) score -= 10; }catch(e){}
    return {claims:cls.length, open:open.length, urgent, missing, todayTickets, score:Math.max(35,Math.min(100,score))};
  }

  function renderServiceHub(){
    const h = health();
    ensureView('servicehub').innerHTML = `
      <div class="card v24-shell">
        <div class="v24-title"><div><h2>🧭 V24 Smart Service Hub</h2><small>One mobile front desk for passengers and staff. Choose a task, not a technical module.</small></div><span class="v24-chip green">Public-ready</span></div>
        <div class="v24-grid" style="margin-top:12px">
          <div class="v24-kpi"><b>${h.open}</b><span>Open Claims</span></div><div class="v24-kpi"><b>${h.urgent}</b><span>Urgent Cases</span></div><div class="v24-kpi"><b>${h.todayTickets}</b><span>Visit Tickets Today</span></div><div class="v24-kpi"><b>${h.score}%</b><span>Site Health</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">What do you need?</div>
        <div class="v24-grid2">
          <div class="v24-service-card" onclick="showView('calculator')"><div class="ico">🧮</div><div><b>Check Baggage Fee</b><small>Open the original official baggage calculator.</small></div></div>
          <div class="v24-service-card" onclick="showView('fares')"><div class="ico">💵</div><div><b>Check Passenger Fare</b><small>View Cebu main route passenger fare matrix.</small></div></div>
          <div class="v24-service-card" onclick="showView('schedules')"><div class="ico">🕐</div><div><b>Check Schedule</b><small>Open schedule list for available routes.</small></div></div>
          <div class="v24-service-card" onclick="showView('lostbaggage')"><div class="ico">🧳</div><div><b>Report Lost/Damaged Baggage</b><small>Create a claim number and local receipt.</small></div></div>
          <div class="v24-service-card" onclick="showView('claimstatus')"><div class="ico">🔎</div><div><b>Track Claim Status</b><small>Search by claim number on this device.</small></div></div>
          <div class="v24-service-card" onclick="showView('sopcenter')"><div class="ico">📘</div><div><b>Help / SOP Guide</b><small>Step-by-step guide for common port tasks.</small></div></div>
        </div>
      </div>
      <div class="card v24-shell">
        <div class="card-header">🎟 Counter Visit Ticket</div>
        <div class="grid2"><div class="input-group"><label>Purpose</label><select id="v24TicketPurpose"><option>Damage Claim</option><option>Lost Baggage</option><option>Baggage Fee Question</option><option>Schedule/Fare Help</option><option>Other Help</option></select></div><div class="input-group"><label>Route</label><select id="v24TicketRoute">${ROUTES.map(r=>`<option value="${r[0]}">${r[1]}</option>`).join('')}</select></div></div>
        <div class="grid2"><div class="input-group"><label>Passenger Last Name (optional)</label><input id="v24TicketName" placeholder="For faster search only"></div><div class="input-group"><label>Contact (optional)</label><input id="v24TicketContact" placeholder="Phone or email"></div></div>
        <button class="primary block" onclick="v24CreateTicket()">Generate Visit Ticket</button>
        <div id="v24TicketOut" style="margin-top:10px"></div>
      </div><div class="v24-bottom-space"></div>`;
  }

  window.v24CreateTicket = function(){
    const item = {id:uid('OJ-VISIT'), purpose:$('v24TicketPurpose')?.value || 'Help', route:$('v24TicketRoute')?.value || '', name:$('v24TicketName')?.value.trim() || '', contact:$('v24TicketContact')?.value.trim() || '', status:'Waiting', createdAt:nowPHT()};
    const all = tickets(); all.unshift(item); save(TICKET_KEY, all.slice(0,300)); log('Visit ticket created: '+item.id);
    const out = $('v24TicketOut'); if(out){ out.innerHTML = ticketHtml(item); drawMiniQr('v24TicketQR-'+item.id.replace(/[^A-Z0-9]/gi,''), item.id); }
    toast('Visit ticket generated.');
  };

  function ticketHtml(t){ const id = 'v24TicketQR-' + String(t.id).replace(/[^A-Z0-9]/gi,''); return `<div class="v24-ticket"><canvas id="${id}" width="120" height="120"></canvas><div><span class="v24-chip green">${esc(t.status)}</span><h3 style="margin:8px 0;color:#fff">${esc(t.id)}</h3><p class="muted">${esc(t.purpose)} • ${esc(routeLabel(t.route))}<br>${esc(mask(t.name)) || 'Passenger'} • ${esc(t.createdAt)}</p><button class="sm" onclick="navigator.clipboard?.writeText('${esc(t.id)}'); toast('Ticket copied.')">Copy Ticket No.</button></div></div>`; }

  function drawMiniQr(canvasId,text){
    const c = $(canvasId); if(!c) return; const ctx = c.getContext('2d'); const n=21, cell=Math.floor(c.width/n); ctx.fillStyle='#fff'; ctx.fillRect(0,0,c.width,c.height); let seed=0; for(let i=0;i<String(text).length;i++) seed=(seed*31+String(text).charCodeAt(i))>>>0;
    function bit(x,y){ seed=(seed*1664525+1013904223)>>>0; return ((seed+x*17+y*29) % 5) < 2; }
    function finder(x,y){ ctx.fillStyle='#111827'; ctx.fillRect(x*cell,y*cell,7*cell,7*cell); ctx.fillStyle='#fff'; ctx.fillRect((x+1)*cell,(y+1)*cell,5*cell,5*cell); ctx.fillStyle='#111827'; ctx.fillRect((x+2)*cell,(y+2)*cell,3*cell,3*cell); }
    finder(1,1); finder(13,1); finder(1,13); ctx.fillStyle='#111827'; for(let y=0;y<n;y++){ for(let x=0;x<n;x++){ if((x<9&&y<9)||(x>11&&y<9)||(x<9&&y>11)) continue; if(bit(x,y)) ctx.fillRect(x*cell,y*cell,cell,cell); } }
  }

  function renderOpsFlow(){
    const h=health(); const shift=load(SHIFT_KEY, defaultShift()); const active=openClaims().slice().sort((a,b)=>riskScore(b)-riskScore(a)).slice(0,12);
    ensureView('opsflow').innerHTML = `
      <div class="card v24-shell"><div class="v24-title"><div><h2>🧩 Daily Ops Flow Board</h2><small>For baggage staff and counter leads. Shows what needs action now.</small></div><span class="v24-chip ${h.urgent?'red':'green'}">${h.urgent? h.urgent+' urgent':'Stable'}</span></div><div class="v24-grid" style="margin-top:12px"><div class="v24-kpi"><b>${h.open}</b><span>Open Claims</span></div><div class="v24-kpi"><b>${h.missing}</b><span>Missing Info</span></div><div class="v24-kpi"><b>${tickets().filter(t=>t.status!=='Done').length}</b><span>Waiting Tickets</span></div><div class="v24-kpi"><b>${h.score}%</b><span>Readiness</span></div></div><div class="v24-meter"><span style="width:${h.score}%"></span></div></div>
      <div class="card"><div class="card-header">✅ Shift Checklist</div>${shift.tasks.map((t,i)=>`<label class="v24-row" style="cursor:pointer"><div><strong>${esc(t.label)}</strong><small>${esc(t.help)}</small></div><input type="checkbox" ${t.done?'checked':''} onchange="v24ToggleShift(${i},this.checked)"></label>`).join('')}<div class="v24-actions"><button class="primary block" onclick="v24ExportDailyPack()">Export Daily Pack</button><button class="accent block" onclick="v24ResetShift()">Reset Checklist</button></div></div>
      <div class="card"><div class="card-header">🎯 Priority Work Queue</div><div class="v24-sticky-search"><input id="v24OpsSearch" placeholder="Search active claims or tickets" oninput="v24FilterOps()"></div><div id="v24OpsRows">${opsRows(active)}</div></div>
      <div class="card"><div class="card-header">🎟 Recent Visit Tickets</div><div class="v24-mini-log">${ticketRows(tickets().slice(0,12))}</div></div><div class="v24-bottom-space"></div>`;
  }
  function defaultShift(){ return {date:todayPHT(),tasks:[{label:'Open counter and verify device time',help:'PHT clock, browser storage, camera permission.',done:false},{label:'Check pending urgent claims',help:'Prioritize critical damage, missing contact, and old claims.',done:false},{label:'Confirm export backup location',help:'Use approved device or shared drive.',done:false},{label:'Review route/schedule notices',help:'Make sure public info is up to date.',done:false},{label:'End-of-shift backup export',help:'Export CSV/JSON before turnover.',done:false}]}; }
  window.v24ToggleShift = function(i,done){ const s=load(SHIFT_KEY, defaultShift()); if(s.tasks[i]) s.tasks[i].done=!!done; save(SHIFT_KEY,s); log('Shift checklist updated.'); };
  window.v24ResetShift = function(){ save(SHIFT_KEY, defaultShift()); renderOpsFlow(); toast('Shift checklist reset.'); };
  function opsRows(rows){ return rows.length ? rows.map(c=>{ const r=riskScore(c); const cls=r>=65?'red':r>=40?'amber':'green'; return `<div class="v24-row"><div><strong>${esc(c.id||'No Claim ID')}</strong><small>${esc(c.type||'Claim')} • ${esc(c.routeLabel||routeLabel(c.route))} • ${esc(mask(c.lastName))} • Tag ${esc(c.tag||'missing')}</small></div><div style="text-align:right"><span class="v24-chip ${cls}">${r}%</span><br><button class="sm" onclick="v24MarkReview('${esc(c.id)}')">Review</button></div></div>`; }).join('') : '<p class="muted">No active claims.</p>'; }
  function ticketRows(rows){ return rows.length ? rows.map(t=>`<div class="v24-row"><div><strong>${esc(t.id)}</strong><small>${esc(t.purpose)} • ${esc(routeLabel(t.route))} • ${esc(mask(t.name))}</small></div><span class="v24-chip ${t.status==='Done'?'green':'amber'}">${esc(t.status)}</span></div>`).join('') : '<p class="muted">No visit tickets.</p>'; }
  window.v24FilterOps = function(){ const q=String($('v24OpsSearch')?.value||'').toLowerCase(); const rows=openClaims().filter(c=>`${c.id} ${c.tag} ${c.lastName} ${c.routeLabel} ${c.status} ${c.type}`.toLowerCase().includes(q)).sort((a,b)=>riskScore(b)-riskScore(a)).slice(0,20); const out=$('v24OpsRows'); if(out) out.innerHTML=opsRows(rows); };
  window.v24MarkReview = function(id){ const all=claims(); const c=all.find(x=>String(x.id)===String(id)); if(!c) return; c.status='Under Review'; c.updatedAt=nowPHT(); save(CLAIM_KEY,all); log('Claim moved to Under Review: '+id); renderOpsFlow(); toast('Claim marked Under Review.'); };

  function renderSOPCenter(){ const prog=sopProgress(); ensureView('sopcenter').innerHTML = `<div class="card v24-shell"><div class="v24-title"><div><h2>📘 SOP Assistant Center</h2><small>Step-by-step operating guide for port staff. Works offline after page is loaded.</small></div><span class="v24-chip green">Guided</span></div></div><div class="v24-grid2" style="margin-top:12px">${Object.entries(SOP).map(([k,s])=>`<div class="v24-service-card" onclick="v24OpenSOP('${k}')"><div class="ico">${s.icon}</div><div><b>${esc(s.title)}</b><small>${prog[k]?'Completed before':'Tap to open workflow'}</small></div></div>`).join('')}</div><div id="v24SopDetail" class="card" style="margin-top:12px"><p class="muted">Choose an SOP card to begin.</p></div><div class="v24-bottom-space"></div>`; }
  window.v24OpenSOP = function(key){ const s=SOP[key]; if(!s) return; const out=$('v24SopDetail'); if(!out) return; out.innerHTML = `<div class="card-header">${s.icon} ${esc(s.title)}</div>${s.steps.map((step,i)=>`<div class="v24-sop-step"><div class="num">${i+1}</div><div><strong>Step ${i+1}</strong><small>${esc(step)}</small></div></div>`).join('')}<div class="v24-actions"><button class="primary block" onclick="v24CompleteSOP('${key}')">Mark SOP Complete</button><button class="block" onclick="showView('servicehub')">Back to Service Hub</button></div>`; };
  window.v24CompleteSOP = function(key){ const p=sopProgress(); p[key]=nowPHT(); save(SOP_KEY,p); log('SOP completed: '+key); toast('SOP marked complete.'); renderSOPCenter(); };

  function renderFeedback(){
    ensureView('feedback').innerHTML = `<div class="card v24-shell"><div class="v24-title"><div><h2>💬 Passenger Feedback + Service Quality</h2><small>Local feedback capture for service improvement. Export with daily pack.</small></div><span class="v24-chip pink">Local</span></div></div><div class="card"><div class="grid2"><div class="input-group"><label>Rating</label><select id="v24Rate"><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Fair</option><option value="2">2 - Needs Improvement</option><option value="1">1 - Poor</option></select></div><div class="input-group"><label>Topic</label><select id="v24Topic"><option>Baggage</option><option>Schedule</option><option>Fare</option><option>Staff Assistance</option><option>Terminal Experience</option><option>Other</option></select></div></div><div class="input-group"><label>Comment</label><textarea id="v24Comment" rows="4" placeholder="Optional comment"></textarea></div><button class="primary block" onclick="v24SaveFeedback()">Save Feedback</button></div><div class="card"><div class="card-header">Recent Feedback</div><div id="v24FeedbackRows">${feedbackRows()}</div></div><div class="v24-bottom-space"></div>`;
  }
  window.v24SaveFeedback = function(){ const item={id:uid('FB'),rating:$('v24Rate')?.value||'5',topic:$('v24Topic')?.value||'Other',comment:$('v24Comment')?.value.trim()||'',createdAt:nowPHT()}; const rows=feedback(); rows.unshift(item); save(FEEDBACK_KEY, rows.slice(0,300)); log('Feedback saved: '+item.rating); renderFeedback(); toast('Feedback saved.'); };
  function feedbackRows(){ const rows=feedback().slice(0,12); return rows.length ? rows.map(f=>`<div class="v24-row"><div><strong>${'⭐'.repeat(Number(f.rating)||1)} ${esc(f.topic)}</strong><small>${esc(f.comment||'No comment')} • ${esc(f.createdAt)}</small></div><span class="v24-chip green">${esc(f.rating)}/5</span></div>`).join('') : '<p class="muted">No feedback recorded yet.</p>'; }

  window.v24ExportDailyPack = function(){
    const data = {version:VERSION, exportedAt:nowPHT(), claims:claims(), visitTickets:tickets(), feedback:feedback(), shift:load(SHIFT_KEY, defaultShift()), sopProgress:sopProgress(), opsLog:load(LOG_KEY, [])};
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='oceanjet_v24_daily_pack_'+todayPHT()+'.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),700); log('Daily pack exported.');
  };

  function decoratePortal(){
    const p=$('view-portal'); if(!p || $('v24PortalCard')) return; const h=health(); const card=document.createElement('div'); card.id='v24PortalCard'; card.className='card v24-shell'; card.innerHTML=`<div class="v24-title"><div><h2>✨ V24 Service Ops Layer</h2><small>Faster passenger service, staff workflow, SOP guidance, visit tickets, and feedback capture.</small></div><span class="v24-chip green">${h.score}% ready</span></div><div class="v24-actions"><button class="primary block" onclick="showView('servicehub')">Service Hub</button><button class="accent block" onclick="showView('opsflow')">Ops Flow</button><button class="block" onclick="showView('sopcenter')">SOP Guide</button><button class="block" onclick="showView('feedback')">Feedback</button></div>`; p.insertBefore(card,p.firstChild);
  }

  function patchDrawer(){
    const menu=$('drawerMenu'); if(!menu) return; const items=[['servicehub','🧭','Service Hub'],['opsflow','🧩','Ops Flow'],['sopcenter','📘','SOP Center'],['feedback','💬','Feedback']];
    items.reverse().forEach(([view,icon,label])=>{ if(!qs(`.drawer-item[data-view="${view}"]`,menu)){ const d=document.createElement('div'); d.className='drawer-item'; d.dataset.view=view; d.setAttribute('onclick',`navigate('${view}')`); d.innerHTML=`<i>${icon}</i> ${label}`; menu.insertBefore(d, menu.firstChild); } });
  }
  function showV24(name){
    qsa('.view').forEach(v=>v.classList.remove('active')); const v=ensureView(name); v.classList.add('active');
    if(name==='servicehub') renderServiceHub(); if(name==='opsflow') renderOpsFlow(); if(name==='sopcenter') renderSOPCenter(); if(name==='feedback') renderFeedback();
    qsa('#drawerMenu .drawer-item').forEach(el=>el.classList.toggle('active', el.dataset.view===name)); window.scrollTo({top:0,behavior:'smooth'});
  }
  function patchNavigation(){
    const oldShow=window.showView; if(oldShow && !oldShow.__v24Wrapped){ window.showView=showView=function(name){ if(['servicehub','opsflow','sopcenter','feedback'].includes(name)){ showV24(name); return; } const r=oldShow.apply(this, arguments); setTimeout(()=>{patchDrawer(); if(name==='portal') decoratePortal();},80); return r; }; window.showView.__v24Wrapped=true; }
    const oldBuild=window.buildDrawerMenu; if(oldBuild && !oldBuild.__v24Wrapped){ window.buildDrawerMenu=buildDrawerMenu=function(){ const r=oldBuild.apply(this, arguments); patchDrawer(); return r; }; window.buildDrawerMenu.__v24Wrapped=true; }
  }
  function boot(){
    try{
      document.body.classList.add('v24-mobile-polish'); ensureView('servicehub'); ensureView('opsflow'); ensureView('sopcenter'); ensureView('feedback'); patchNavigation(); if(typeof window.buildDrawerMenu==='function') window.buildDrawerMenu(); patchDrawer(); setTimeout(decoratePortal,700); log('V24 Service Ops booted.'); console.log(VERSION+' loaded');
    }catch(e){ console.error('V24 boot error', e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
})();
