
(function(){
  'use strict';

  const V11_VERSION = 'v11-evidence-engine';
  const LS_KEY = 'oj_damage_master_v11_backup';
  const OLD_KEYS = ['oj_damage_master_v10','oj_damage_master_v9'];
  const IDB_NAME = 'OceanJetEvidenceEngineV11';
  const IDB_STORE = 'masterLog';
  const IDB_KEY = 'damageMaster';
  const DESTS = ['PALOMPON','GETAFE','SURIGAO','MAASIN','TAGBILARAN','SIQUIJOR','ORMOC','DUMAGUETE'];
  const DAMAGE_TYPES = ['Crack/Split','Broken Handle','Wheel Damage','Scratch/Scuff','Dent/Deformation','Torn Fabric','Zipper Damage','Wet Damage','Missing Part','Inspection','FRAGILE Tag','Other'];
  const PHOTO_ROLES = ['Claim Stub','Full Luggage View','Damage Close-up','Side Angle','Tag Photo','Before Release','Passenger Claim Form','Other'];
  const BAG_TYPES = ['Hard-shell suitcase','Soft fabric luggage','Backpack','Duffel bag','Box / carton','Plastic-wrapped baggage','Unknown baggage'];
  const COLORS = ['Black','Gray','Silver','Blue','Red','Brown','Green','White','Pink','Purple','Yellow','Orange','Mixed/Patterned','Unknown'];
  const qs = id => document.getElementById(id);
  const safe = v => String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const pht = () => new Date().toLocaleString('en-PH',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}) + ' PHT';
  const phtDate = () => new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Manila'});
  const phtTime = () => new Date().toLocaleTimeString('en-PH',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  const uid = prefix => prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,7).toUpperCase();
  const fallbackToast = msg => { if(typeof toast === 'function') toast(msg); else alert(msg); };

  let logCache = null;
  let idbReady = false;
  let scannerStream = null;
  let scannerTimer = null;
  let scannerState = 'stub';
  let workingCase = null;
  let lastFrameSmall = null;
  let stableTicks = 0;
  let lastAutoCapture = 0;
  let lastMetrics = null;
  let simulationTick = 0;

  function injectV11Styles(){
    if(qs('v11EvidenceStyles')) return;
    const style = document.createElement('style');
    style.id = 'v11EvidenceStyles';
    style.textContent = `
      .v11-shell{display:grid;gap:12px}.v11-hero{position:relative;overflow:hidden;border:1px solid rgba(45,212,191,.55);background:linear-gradient(135deg,rgba(2,6,23,.92),rgba(17,24,39,.78),rgba(88,28,135,.24));box-shadow:0 0 34px rgba(45,212,191,.16),inset 0 0 60px rgba(236,72,153,.08)}
      .v11-hero:before{content:'';position:absolute;inset:-70%;background:conic-gradient(from 90deg,transparent,rgba(20,184,166,.18),transparent,rgba(236,72,153,.17),transparent);animation:v11spin 14s linear infinite;pointer-events:none}.v11-hero>*{position:relative}@keyframes v11spin{to{transform:rotate(360deg)}}
      .v11-tabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:12px}.v11-tabs button{border-radius:14px;padding:9px 7px;font-size:.74rem}.v11-tabs button.active{background:linear-gradient(135deg,#14b8a6,#ec4899);color:#fff;border:0;box-shadow:0 0 22px rgba(45,212,191,.25)}
      .v11-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v11-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.v11-kpi{background:rgba(15,23,42,.68);border:1px solid rgba(45,212,191,.26);border-radius:18px;padding:14px 10px;text-align:center;box-shadow:inset 0 0 25px rgba(45,212,191,.05)}.v11-kpi strong{display:block;font-size:1.28rem;color:#67e8f9;text-shadow:0 0 14px rgba(45,212,191,.38)}.v11-kpi span{display:block;font-size:.62rem;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;font-weight:900}
      .v11-badge{font-size:.64rem;border:1px solid rgba(45,212,191,.42);color:#99f6e4;background:rgba(20,184,166,.08);border-radius:999px;padding:4px 8px;font-weight:900;display:inline-flex;align-items:center;gap:4px}.v11-badge.mag{border-color:rgba(236,72,153,.48);color:#f9a8d4;background:rgba(236,72,153,.1)}.v11-badge.warn{border-color:rgba(250,204,21,.52);color:#fde68a;background:rgba(250,204,21,.1)}.v11-badge.crit{border-color:rgba(248,113,113,.55);color:#fecaca;background:rgba(239,68,68,.12)}.v11-badge.lock{border-color:rgba(59,130,246,.55);color:#bfdbfe;background:rgba(59,130,246,.12)}
      .v11-cardgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v11-case{position:relative;overflow:hidden;background:rgba(15,23,42,.72);border:1px solid rgba(45,212,191,.24);border-radius:20px;padding:10px;box-shadow:0 14px 32px rgba(0,0,0,.26);cursor:pointer;transition:.24s}.v11-case:hover{transform:translateY(-4px);border-color:#2dd4bf;box-shadow:0 0 24px rgba(45,212,191,.2)}.v11-case.crit{border-color:rgba(248,113,113,.52)}.v11-thumb{height:130px;background:#020617 center/cover no-repeat;border:1px solid rgba(255,255,255,.08);border-radius:15px;margin-bottom:8px}.v11-title{font-weight:950;color:#ecfeff}.v11-meta{font-size:.74rem;color:var(--text2);margin-top:2px}.v11-badges{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
      .v11-scanner{position:relative;min-height:380px;background:#020617;border:1px solid rgba(45,212,191,.48);border-radius:22px;overflow:hidden;box-shadow:inset 0 0 42px rgba(45,212,191,.09)}.v11-video{width:100%;min-height:380px;object-fit:cover;display:block;background:linear-gradient(135deg,#020617,#111827)}.v11-hud{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at center,transparent 28%,rgba(0,0,0,.45) 68%)}.v11-frame{position:absolute;left:10%;right:10%;top:16%;bottom:17%;border:2px solid #ef4444;border-radius:24px;box-shadow:0 0 24px rgba(239,68,68,.42),0 0 0 999px rgba(0,0,0,.05);transition:.22s}.v11-frame.ready{border-color:#facc15;box-shadow:0 0 28px rgba(250,204,21,.5)}.v11-frame.locked{border-color:#2dd4bf;box-shadow:0 0 34px rgba(45,212,191,.85),inset 0 0 26px rgba(45,212,191,.16)}.v11-frame.captured{border-color:#ec4899;box-shadow:0 0 38px rgba(236,72,153,.9),inset 0 0 28px rgba(236,72,153,.18)}.v11-scanline{position:absolute;left:12%;right:12%;height:2px;top:20%;background:linear-gradient(90deg,transparent,#67e8f9,#f9a8d4,transparent);box-shadow:0 0 16px #2dd4bf;animation:v11scan 2.5s ease-in-out infinite}@keyframes v11scan{50%{top:78%}}
      .v11-topbar{position:absolute;left:14px;right:14px;top:14px;display:flex;align-items:center;justify-content:space-between;gap:7px}.v11-scanstatus{background:rgba(2,6,23,.78);backdrop-filter:blur(12px);border:1px solid rgba(45,212,191,.42);border-radius:999px;color:#d9ffff;font-size:.72rem;font-weight:950;padding:7px 10px}.v11-bottom{position:absolute;left:14px;right:14px;bottom:14px;background:rgba(2,6,23,.82);backdrop-filter:blur(14px);border:1px solid rgba(236,72,153,.35);border-radius:17px;padding:10px;font-size:.79rem}.v11-meter{height:8px;background:rgba(255,255,255,.1);border-radius:999px;overflow:hidden}.v11-meter span{display:block;height:100%;background:linear-gradient(90deg,#ef4444,#facc15,#14b8a6,#ec4899);width:0%}.v11-detectbar{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
      .v11-panel{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.72);backdrop-filter:blur(7px);display:flex;align-items:stretch;justify-content:flex-end}.v11-side{width:min(500px,100%);background:linear-gradient(180deg,rgba(2,6,23,.98),rgba(15,23,42,.98));border-left:1px solid rgba(45,212,191,.38);box-shadow:-18px 0 60px rgba(0,0,0,.6);padding:16px;overflow:auto}.v11-photos{display:flex;gap:8px;overflow-x:auto;padding:4px 0}.v11-photos img{width:128px;height:92px;object-fit:cover;border-radius:13px;border:1px solid rgba(45,212,191,.35)}.v11-photoitem{min-width:134px}.v11-photoitem select{margin-top:5px;font-size:.7rem;padding:6px}
      .v11-timeline{display:grid;gap:6px}.v11-timeline div{padding:8px 10px;background:rgba(255,255,255,.055);border-radius:11px;border-left:3px solid #2dd4bf;font-size:.76rem}.v11-checklist{display:grid;gap:6px}.v11-checklist div{display:flex;justify-content:space-between;padding:7px 9px;background:rgba(255,255,255,.05);border-radius:10px;font-size:.77rem}.v11-drop{border:1.5px dashed rgba(45,212,191,.55);border-radius:20px;padding:24px;text-align:center;background:rgba(45,212,191,.055);transition:.2s}.v11-drop.drag{background:rgba(236,72,153,.13);border-color:#ec4899}.v11-filter{display:flex;gap:7px;overflow:auto;margin:10px 0}.v11-filter input,.v11-filter select{min-width:145px}.v11-hidden{display:none!important}
      .v11-orbit{position:relative;height:310px;border-radius:22px;background:radial-gradient(circle at center,rgba(45,212,191,.18),transparent 28%),linear-gradient(135deg,rgba(15,23,42,.8),rgba(88,28,135,.16));border:1px solid rgba(45,212,191,.25);overflow:hidden}.v11-orbit:before{content:'';position:absolute;inset:14%;border:1px dashed rgba(45,212,191,.25);border-radius:999px}.v11-node{position:absolute;transform:translate(-50%,-50%);border:1px solid rgba(45,212,191,.42);background:rgba(2,6,23,.8);box-shadow:0 0 18px rgba(45,212,191,.16);border-radius:15px;padding:6px 8px;text-align:center;font-size:.66rem;font-weight:900;color:#d9ffff}.v11-center{left:50%;top:50%;font-size:.8rem;background:linear-gradient(135deg,#14b8a6,#ec4899);color:#fff;border:0}
      #v11Dock{position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:80;display:flex;gap:6px;background:rgba(2,6,23,.82);border:1px solid rgba(45,212,191,.28);border-radius:999px;padding:6px;backdrop-filter:blur(16px);box-shadow:0 0 30px rgba(45,212,191,.14)}#v11Dock button{border-radius:999px;padding:7px 10px;font-size:.72rem}.v11-old-hidden{display:none!important}
      @media(max-width:560px){.v11-tabs{grid-template-columns:repeat(2,1fr)}.v11-grid,.v11-grid3,.v11-cardgrid{grid-template-columns:1fr}.v11-scanner,.v11-video{min-height:430px}.v11-thumb{height:150px}#v11Dock{max-width:96vw;overflow:auto}.v11-topbar{flex-wrap:wrap}.v11-filter{display:grid;grid-template-columns:1fr 1fr}.v11-filter input,.v11-filter select{min-width:0}}
    `;
    document.head.appendChild(style);
  }

  function makeSvg(label, color, damage){
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="640" viewBox="0 0 920 640"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#020617"/><stop offset="1" stop-color="#111827"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect width="920" height="640" fill="url(#g)"/><g filter="url(#glow)"><rect x="185" y="118" width="550" height="385" rx="54" fill="${color}" stroke="#2dd4bf" stroke-width="8"/><rect x="305" y="80" width="310" height="62" rx="24" fill="none" stroke="#94a3b8" stroke-width="15"/><circle cx="310" cy="532" r="28" fill="#111827" stroke="#f472b6" stroke-width="8"/><circle cx="610" cy="532" r="28" fill="#111827" stroke="#f472b6" stroke-width="8"/><path d="M602 188 L696 244 L620 327 L720 418" fill="none" stroke="#ec4899" stroke-width="12" stroke-linecap="round"/><text x="460" y="305" text-anchor="middle" font-family="Arial" font-size="44" fill="#fff" font-weight="900">${safe(label)}</text><text x="460" y="358" text-anchor="middle" font-family="Arial" font-size="30" fill="#67e8f9">${safe(damage)}</text></g></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function seedCases(){
    const palette = ['#111827','#334155','#1d4ed8','#991b1b','#78350f','#065f46','#f8fafc','#7e22ce','#be123c','#0f172a'];
    const rows = [
      ['TAGBILARAN','OJ-10428','Black','Large','Hard-shell suitcase','Crack/Split','Critical'],
      ['ORMOC','OJ-28190','Blue','Medium','Hard-shell suitcase','Broken Handle','Moderate'],
      ['GETAFE','OJ-37011','Gray','Small','Soft fabric luggage','Wheel Damage','Moderate'],
      ['PALOMPON','OJ-44820','Red','Large','Hard-shell suitcase','Scratch/Scuff','Minor'],
      ['SURIGAO','OJ-59271','Brown','Oversized','Box / carton','Dent/Deformation','Moderate'],
      ['MAASIN','OJ-63092','Green','Medium','Soft fabric luggage','Torn Fabric','Moderate'],
      ['SIQUIJOR','OJ-74033','White','Small','Plastic-wrapped baggage','Zipper Damage','Moderate'],
      ['DUMAGUETE','OJ-88491','Purple','Large','Hard-shell suitcase','Wet Damage','Critical'],
      ['TAGBILARAN','OJ-91824','Pink','Medium','Duffel bag','FRAGILE Tag','Inspection'],
      ['ORMOC','OJ-99102','Black','Large','Hard-shell suitcase','Missing Part','Critical']
    ];
    return rows.map((r,i)=>{
      const c = {caseId:'OJ-DMG-'+String(i+1).padStart(6,'0'),batchId:'PRESEED-001',destination:r[0],tagNo:r[1],color:r[2],size:r[3],baggageType:r[4],damageType:r[5],aiSuggestion:r[5],aiConfidence:'Seeded demo',severity:r[6],status:i<3?'Under Review':'New',dateTaken:phtDate(),timeTaken:phtTime(),phtTimestamp:pht(),notes:`Pre-loaded dockside evidence sample for ${r[5].toLowerCase()}.`,photos:[{photoId:uid('P'),role:'Claim Stub',dataUrl:makeSvg(r[1],palette[i],r[0]),autoCaptured:false,hash:'seed-stub-'+i,quality:90,createdAt:pht()},{photoId:uid('P'),role:'Full Luggage View',dataUrl:makeSvg(r[1],palette[i],r[5]),autoCaptured:false,hash:'seed-full-'+i,quality:88,createdAt:pht()},{photoId:uid('P'),role:'Damage Close-up',dataUrl:makeSvg('CLOSE-UP',palette[i],r[5]),autoCaptured:false,hash:'seed-dmg-'+i,quality:86,createdAt:pht()}],locked:false,chainOfCustody:[]};
      c.evidenceScore = evidenceScore(c); c.summary = claimSummary(c); addCustody(c,'Pre-loaded sample evidence case'); return c;
    });
  }

  function defaultLog(){
    return {version:V11_VERSION,createdAt:pht(),lastUpdated:pht(),nextCaseSeq:11,nextBatchSeq:1,storageMode:'IndexedDB + localStorage backup',cases:seedCases(),batches:[{batchId:'PRESEED-001',createdAt:pht(),caseIds:Array.from({length:10},(_,i)=>'OJ-DMG-'+String(i+1).padStart(6,'0')),source:'embedded samples'}],settings:{staff:'Dock Staff',shift:'AM Shift',pier:'Cebu Pier 1',quality:.76,maxWidth:1200,autoSensitivity:72,autoCooldown:1800,scannerSimulation:true}};
  }

  function openDb(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)) return reject(new Error('IndexedDB not supported'));
      const req = indexedDB.open(IDB_NAME,1);
      req.onupgradeneeded = e => { const db=e.target.result; if(!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('IndexedDB open failed'));
    });
  }
  async function idbGet(){
    try{ const db=await openDb(); return await new Promise((resolve,reject)=>{ const tx=db.transaction(IDB_STORE,'readonly'); const req=tx.objectStore(IDB_STORE).get(IDB_KEY); req.onsuccess=()=>resolve(req.result||null); req.onerror=()=>reject(req.error); }); }catch(e){ idbReady=false; return null; }
  }
  async function idbSet(data){
    try{ const db=await openDb(); await new Promise((resolve,reject)=>{ const tx=db.transaction(IDB_STORE,'readwrite'); tx.objectStore(IDB_STORE).put(data,IDB_KEY); tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error); }); idbReady=true; }catch(e){ idbReady=false; }
  }
  function normalizeLog(data){
    const base = defaultLog();
    if(!data || !Array.isArray(data.cases)) return base;
    data.version = V11_VERSION; data.cases = data.cases.map((c,i)=>({
      caseId:c.caseId||('OJ-DMG-'+String(i+1).padStart(6,'0')), batchId:c.batchId||'MIGRATED', destination:DESTS.includes(c.destination)?c.destination:'TAGBILARAN', tagNo:c.tagNo||'', color:c.color||'Unknown', size:c.size||'Unknown', baggageType:c.baggageType||'Unknown baggage', damageType:c.damageType||c.aiSuggestion||'Inspection', aiSuggestion:c.aiSuggestion||c.damageType||'Inspection', aiConfidence:c.aiConfidence||'Migrated', severity:c.severity||severityFor(c.damageType||'Inspection'), status:c.status||'New', dateTaken:c.dateTaken||phtDate(), timeTaken:c.timeTaken||phtTime(), phtTimestamp:c.phtTimestamp||c.createdAt||pht(), notes:c.notes||'', photos:Array.isArray(c.photos)?c.photos:[], locked:!!c.locked, chainOfCustody:Array.isArray(c.chainOfCustody)?c.chainOfCustody:[], summary:c.summary||''
    }));
    data.cases.forEach(c=>{c.evidenceScore=evidenceScore(c); c.summary=claimSummary(c);});
    data.batches = Array.isArray(data.batches)?data.batches:[];
    data.settings = {...base.settings,...(data.settings||{})};
    data.nextCaseSeq = Math.max(Number(data.nextCaseSeq||0), ...data.cases.map(c=>parseInt(String(c.caseId).match(/(\d+)$/)?.[1]||'0')), 10) + 1;
    data.nextBatchSeq = Number(data.nextBatchSeq||1);
    data.storageMode = 'IndexedDB + localStorage backup';
    return data;
  }
  async function initLog(){
    let data = await idbGet();
    if(data){ idbReady=true; logCache=normalizeLog(data); backupLocal(logCache); return logCache; }
    try{ data = JSON.parse(localStorage.getItem(LS_KEY)||'null'); }catch(e){ data=null; }
    if(!data){ for(const k of OLD_KEYS){ try{ data=JSON.parse(localStorage.getItem(k)||'null'); if(data) break; }catch(e){} } }
    logCache = normalizeLog(data || defaultLog());
    saveLog(logCache);
    return logCache;
  }
  function log(){ if(!logCache) logCache=defaultLog(); return logCache; }
  function backupLocal(data){ try{ localStorage.setItem(LS_KEY, JSON.stringify(data)); }catch(e){ console.warn('localStorage backup failed',e); } }
  function saveLog(data){ data.version=V11_VERSION; data.lastUpdated=pht(); logCache=data; backupLocal(data); idbSet(data); }

  function addCustody(c,msg){ c.chainOfCustody = c.chainOfCustody || []; c.chainOfCustody.unshift(`${pht()} - ${msg}`); c.chainOfCustody = c.chainOfCustody.slice(0,60); }
  function severityFor(type){ if(/Crack|Split|Wet|Missing/i.test(type)) return 'Critical'; if(/Handle|Wheel|Dent|Torn|Zipper/i.test(type)) return 'Moderate'; if(/Scuff|Scratch|FRAGILE/i.test(type)) return 'Minor'; return 'Inspection'; }
  function evidenceScore(c){ let s=0; const roles=(c.photos||[]).map(p=>p.role||''); if(roles.some(r=>/stub|tag/i.test(r)))s+=18; if(roles.some(r=>/full/i.test(r)))s+=16; if(roles.some(r=>/damage/i.test(r)))s+=22; if(c.tagNo)s+=12; if(c.destination)s+=7; if(c.damageType)s+=9; if(c.color&&c.color!=='Unknown')s+=6; if(c.size&&c.size!=='Unknown')s+=4; if(c.baggageType&&c.baggageType!=='Unknown baggage')s+=4; if(c.notes)s+=7; if((c.photos||[]).length>=3)s+=5; return Math.min(100,s); }
  function checklist(c){ const roles=(c.photos||[]).map(p=>p.role||''); return [{label:'Claim stub / tag photo',ok:roles.some(r=>/stub|tag/i.test(r))},{label:'Full luggage view',ok:roles.some(r=>/full/i.test(r))},{label:'Damage close-up',ok:roles.some(r=>/damage/i.test(r))},{label:'Tag number entered',ok:!!c.tagNo},{label:'Destination selected',ok:!!c.destination},{label:'Damage type confirmed',ok:!!c.damageType},{label:'Color and size detected',ok:!!c.color&&c.color!=='Unknown'&&!!c.size&&c.size!=='Unknown'},{label:'Staff notes added',ok:!!c.notes}]; }
  function claimSummary(c){ return `Case ${c.caseId} records a ${String(c.color||'unknown').toLowerCase()} ${String(c.size||'unknown').toLowerCase()} ${String(c.baggageType||'baggage').toLowerCase()} tagged ${c.tagNo||'unconfirmed'} bound for ${c.destination||'UNSET'} with suspected ${c.damageType||'damage'} damage. Evidence includes ${(c.photos||[]).length} photo(s), captured/updated ${c.phtTimestamp||pht()}. Evidence score: ${evidenceScore(c)}%.`; }
  function stats(data=log()){ const cases=data.cases||[]; const byDest={},byType={},bySeverity={}; let photos=0,locked=0,crit=0,scoreSum=0; cases.forEach(c=>{byDest[c.destination]=(byDest[c.destination]||0)+1;byType[c.damageType]=(byType[c.damageType]||0)+1;bySeverity[c.severity]=(bySeverity[c.severity]||0)+1;photos+=(c.photos||[]).length;locked+=c.locked?1:0;crit+=c.severity==='Critical'?1:0;scoreSum+=evidenceScore(c);}); return {cases,byDest,byType,bySeverity,photos,locked,crit,avg:cases.length?Math.round(scoreSum/cases.length):0,topDest:topKey(byDest),topDamage:topKey(byType)}; }
  function topKey(obj){ let k='--',m=0; Object.entries(obj).forEach(([a,b])=>{if(b>m){k=a;m=b;}}); return k; }
  function estimateStorageBytes(){ try{return new Blob([JSON.stringify(log())]).size;}catch(e){return 0;} }
  function hashDataUrl(s){ let h=0; const str=String(s||'').slice(0,250000); for(let i=0;i<str.length;i++) h=((h<<5)-h+str.charCodeAt(i))|0; return 'H'+Math.abs(h).toString(16).toUpperCase(); }
  function download(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }

  function ensureViews(){
    let main = document.querySelector('.app main') || document.querySelector('main') || document.querySelector('.app') || document.body;
    if(!qs('view-damage')){ const v=document.createElement('div'); v.id='view-damage'; v.className='view'; main.appendChild(v); }
    if(!qs('view-command')){ const v=document.createElement('div'); v.id='view-command'; v.className='view'; main.appendChild(v); }
    document.querySelectorAll('#v9CleanDock,#v7Dock,#v8Dock,#v10Dock,.old-dock').forEach(x=>x.classList.add('v11-old-hidden'));
    if(!qs('v11Dock')){ const dock=document.createElement('div'); dock.id='v11Dock'; dock.innerHTML='<button onclick="showView(\'damage\')">🧳 Damage</button><button onclick="showView(\'command\')">🛰️ Command</button><button onclick="showView(\'calculator\')">🧮 Calc</button><button onclick="showView(\'dashboard\')">🏠 Home</button>'; document.body.appendChild(dock); }
  }
  function patchMenu(){
    const old = window.buildDrawerMenu || (typeof buildDrawerMenu==='function'?buildDrawerMenu:null);
    window.buildDrawerMenu = buildDrawerMenu = function(){
      const role = (typeof currentRole !== 'undefined') ? currentRole : null;
      const items = [
        {view:'dashboard',icon:'🏠',label:'Dashboard'},
        {view:'calculator',icon:'🧮',label:'Baggage Calc'},
        {view:'damage',icon:'🧳',label:'Baggage Damage Detector'},
        {view:'command',icon:'🛰️',label:'Command Center'},
        {view:'fares',icon:'💵',label:'Fares & Slabs'},
        {view:'schedules',icon:'🕐',label:'Schedules'},
        {view:'history',icon:'📋',label:'History'},
        {view:'map',icon:'🗺️',label:'Live Map'}
      ];
      if(role==='supervisor') items.push({view:'admin',icon:'🔐',label:'Admin Panel'});
      const seen=new Set();
      const menu=qs('drawerMenu');
      if(menu) menu.innerHTML = items.filter(i=>!seen.has(i.view)&&seen.add(i.view)).map(i=>`<div class="drawer-item" data-view="${i.view}" onclick="navigate('${i.view}')"><i>${i.icon}</i> ${i.label}</div>`).join('');
    };
    if(old && !window.__v11MenuOriginal) window.__v11MenuOriginal=old;
  }
  function patchShowView(){
    if(window.__v11ShowPatched) return; window.__v11ShowPatched=true;
    const old = window.showView || (typeof showView==='function'?showView:null);
    window.showView = showView = function(name){
      ensureViews();
      if(name==='damage'){ document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); qs('view-damage').classList.add('active'); document.querySelectorAll('.drawer-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='damage')); renderDamage('dashboard'); return; }
      if(name==='command'){ document.querySelectorAll('.view').forEach(v=>v.classList.remove('active')); qs('view-command').classList.add('active'); document.querySelectorAll('.drawer-item').forEach(x=>x.classList.toggle('active',x.dataset.view==='command')); renderCommandCenter(); return; }
      if(old) return old(name);
    };
  }

  window.renderDamage = function(tab='dashboard'){
    injectV11Styles(); ensureViews();
    const st = stats();
    qs('view-damage').innerHTML = `
      <div class="v11-shell">
        <div class="card v11-hero">
          <div class="card-header"><span>🧳 OCEAN JET // BAGGAGE DAMAGE DETECTOR V11</span><span class="v11-badge" id="v11Clock">-- PHT</span></div>
          <p class="muted">Hands-free AR evidence capture, claim stub traceability, color/size detection, append-only master log, and export-ready claims records.</p>
          <div class="v11-grid3" style="margin-top:12px"><div class="v11-kpi"><strong>${st.cases.length}</strong><span>Master cases</span></div><div class="v11-kpi"><strong>${st.crit}</strong><span>Critical</span></div><div class="v11-kpi"><strong>${st.avg}%</strong><span>Evidence avg</span></div></div>
          <div class="v11-tabs">
            <button id="v11tab-dashboard" onclick="damageTab('dashboard')">📊 Dashboard</button>
            <button id="v11tab-scanner" onclick="damageTab('scanner')">📷 AR Auto</button>
            <button id="v11tab-log" onclick="damageTab('log')">📋 Master Log</button>
            <button id="v11tab-batch" onclick="damageTab('batch')">📥 Batch</button>
            <button id="v11tab-export" onclick="damageTab('export')">📤 Export</button>
            <button id="v11tab-settings" onclick="damageTab('settings')">⚙️ Settings</button>
          </div>
        </div>
        <div id="v11DamageContent"></div>
      </div>`;
    tickV11Clock(); clearInterval(window.__v11ClockTimer); window.__v11ClockTimer=setInterval(tickV11Clock,1000);
    damageTab(tab);
  };
  window.damageTab = function(tab){
    ['dashboard','scanner','log','batch','export','settings'].forEach(t=>qs('v11tab-'+t)?.classList.toggle('active',t===tab));
    if(tab!=='scanner') stopScanner(false);
    const map={dashboard:renderDamageDashboard,scanner:renderScanner,log:renderMasterLog,batch:renderBatch,export:renderExport,settings:renderSettings};
    map[tab]?.();
  };
  function tickV11Clock(){ const el=qs('v11Clock'); if(el) el.textContent=new Date().toLocaleTimeString('en-PH',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})+' PHT'; }

  function renderDamageDashboard(){
    const data=log(),st=stats(data),bytes=estimateStorageBytes(),mb=(bytes/1024/1024).toFixed(2);
    const destRows=DESTS.map(d=>{const n=st.byDest[d]||0; const pct=Math.min(100,Math.max(4,Math.round(n/Math.max(1,st.cases.length)*100))); return `<div><div style="display:flex;justify-content:space-between;font-size:.78rem"><b>${d}</b><span>${n}</span></div><div class="v11-meter"><span style="width:${pct}%"></span></div></div>`}).join('');
    const sevRows=['Critical','Moderate','Minor','Inspection'].map(s=>`<span class="v11-badge ${s==='Critical'?'crit':s==='Moderate'?'warn':''}">${s}: ${st.bySeverity[s]||0}</span>`).join('');
    qs('v11DamageContent').innerHTML = `
      <div class="v11-grid">
        <div class="card glow"><div class="card-header">📡 Evidence Command Metrics</div><div class="v11-grid3"><div class="v11-kpi"><strong>${st.photos}</strong><span>Photos</span></div><div class="v11-kpi"><strong>${st.locked}</strong><span>Locked</span></div><div class="v11-kpi"><strong>${mb}MB</strong><span>Backup size</span></div></div><div class="v11-detectbar">${sevRows}</div><div class="trip-row" style="margin-top:10px"><b>Storage:</b> ${idbReady?'IndexedDB active':'localStorage fallback'} • Export JSON at shift end.</div></div>
        <div class="card"><div class="card-header">🧠 AI Claims Readiness</div><div class="v11-timeline"><div>${st.avg>=85?'Evidence quality is strong for claims review.':'Evidence quality needs improvement. Require claim stub, full luggage, and close-up.'}</div><div>${st.crit>0?st.crit+' critical case(s) need supervisor review.':'No critical evidence cluster detected.'}</div><div>Most affected destination: <b>${st.topDest}</b></div><div>Most common damage: <b>${st.topDamage}</b></div></div></div>
      </div>
      <div class="card"><div class="card-header"><span>🌐 Destination Risk Heatmap</span><button class="sm primary" onclick="damageTab('scanner')">Start AR Auto Capture</button></div><div style="display:grid;gap:9px">${destRows}</div></div>
      <div class="card"><div class="card-header">🔒 Evidence Engine Rules</div><div class="v11-grid3"><div class="trip-row"><b>Auto Capture</b><br><span class="muted">Captures only when stable, bright, sharp, and centered.</span></div><div class="trip-row"><b>Append-only</b><br><span class="muted">New batches add to the cumulative master log.</span></div><div class="trip-row"><b>No chat baggage fees</b><br><span class="muted">Baggage fee computation stays in official Baggage Calc tab.</span></div></div></div>`;
  }

  function renderScanner(){
    const s=log().settings||{};
    qs('v11DamageContent').innerHTML = `
      <div class="card glow">
        <div class="card-header"><span>📷 AR Auto Evidence Scanner</span><span class="v11-badge mag">Hands-free pilot</span></div>
        <div class="v11-scanner">
          <video id="v11Video" class="v11-video" autoplay playsinline muted></video><canvas id="v11Canvas" class="v11-hidden"></canvas>
          <div class="v11-hud"><div id="v11Frame" class="v11-frame"></div><div class="v11-scanline"></div><div class="v11-topbar"><span id="v11Phase" class="v11-scanstatus">READY</span><span id="v11Status" class="v11-scanstatus">Camera off</span></div><div class="v11-bottom"><div id="v11ScanText">Start camera. Point to claim stub/tag. The app auto-captures when the image is stable.</div><div class="v11-meter" style="margin-top:8px"><span id="v11QualityBar"></span></div><div class="v11-detectbar" id="v11DetectBar"></div></div></div>
        </div>
        <div class="grid2" style="margin-top:10px"><button class="primary block" onclick="startV11Scanner()">Start AR Auto Capture</button><button class="danger block" onclick="stopV11Scanner()">Stop</button></div>
        <div class="grid2" style="margin-top:8px"><div class="input-group"><label>Default Destination</label><select id="v11DefaultDest">${DESTS.map(d=>`<option>${d}</option>`).join('')}</select></div><div class="input-group"><label>Staff / Shift</label><input id="v11StaffInline" value="${safe(s.staff||'Dock Staff')}" oninput="saveInlineSettings()"></div></div>
        <button class="accent block" onclick="forceV11Capture()">Manual fallback capture if camera cannot lock</button>
        <div id="v11WorkingBox" class="trip-row" style="margin-top:10px">Workflow: Claim Stub → Full Baggage → Damage Close-up. Color, size, baggage type, and damage suggestion are filled automatically for staff confirmation.</div>
      </div>
      <div class="card"><div class="card-header">🎯 Auto-detected fields</div><div class="v11-grid3"><div class="trip-row"><b>Color</b><br><span class="muted">Dominant center-frame color.</span></div><div class="trip-row"><b>Size</b><br><span class="muted">Small, Medium, Large, Oversized based on frame coverage.</span></div><div class="trip-row"><b>Damage</b><br><span class="muted">Suggested only; staff confirms in Master Log.</span></div></div></div>`;
    setHud('READY','Camera off',0,'Start camera. Point to claim stub/tag.','');
  }
  window.saveInlineSettings=function(){ const data=log(); data.settings.staff=qs('v11StaffInline')?.value||data.settings.staff; saveLog(data); };
  window.startV11Scanner = async function(){
    stopScanner(false); scannerState='stub'; stableTicks=0; lastFrameSmall=null; lastAutoCapture=0;
    const data=log(),seq=data.nextCaseSeq++;
    workingCase={caseId:'OJ-DMG-'+String(seq).padStart(6,'0'),batchId:'AR-'+phtDate().replaceAll('-',''),destination:qs('v11DefaultDest')?.value||'TAGBILARAN',tagNo:'',color:'Unknown',size:'Unknown',baggageType:'Unknown baggage',damageType:'Inspection',aiSuggestion:'Inspection',aiConfidence:'Pending',severity:'Inspection',status:'New',dateTaken:phtDate(),timeTaken:phtTime(),phtTimestamp:pht(),notes:'AR auto-captured evidence. Staff must review and confirm before claim release.',photos:[],locked:false,chainOfCustody:[]};
    addCustody(workingCase,`AR Evidence Pilot started by ${data.settings.staff||'Dock Staff'} at ${data.settings.pier||'pier'}`); saveLog(data); updateWorkingBox();
    try{ scannerStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false}); const v=qs('v11Video'); v.srcObject=scannerStream; await v.play(); setHud('SCAN CLAIM STUB','Camera active',15,'Aim at claim stub/tag. Hold steady for automatic capture.',''); scannerTimer=setInterval(scanTick,260); }
    catch(e){ setHud('SIMULATION MODE','Camera unavailable',25,'Camera permission failed. Simulation mode is running for prototype testing.','warn'); scannerTimer=setInterval(simulationScanTick,520); }
  };
  window.stopV11Scanner = function(){ stopScanner(true); };
  function stopScanner(show=true){ if(scannerTimer){clearInterval(scannerTimer);scannerTimer=null;} if(scannerStream){scannerStream.getTracks().forEach(t=>t.stop());scannerStream=null;} const v=qs('v11Video'); if(v) v.srcObject=null; if(show) setHud('READY','Camera off',0,'Start camera. Point to claim stub/tag.',''); }
  function setHud(phase,status,quality,text,frameClass){ const f=qs('v11Frame'); if(f) f.className='v11-frame '+(frameClass||''); if(qs('v11Phase')) qs('v11Phase').textContent=phase; if(qs('v11Status')) qs('v11Status').textContent=status; if(qs('v11ScanText')) qs('v11ScanText').textContent=text; if(qs('v11QualityBar')) qs('v11QualityBar').style.width=Math.max(0,Math.min(100,quality))+'%'; }
  function setDetect(metrics){ const el=qs('v11DetectBar'); if(!el) return; el.innerHTML = `<span class="v11-badge">Color ${safe(metrics.color||'--')}</span><span class="v11-badge">Size ${safe(metrics.size||'--')}</span><span class="v11-badge mag">Coverage ${Math.round(metrics.coverage||0)}%</span><span class="v11-badge ${metrics.score>75?'':'warn'}">Quality ${Math.round(metrics.score||0)}%</span>`; }
  function scanTick(){
    const v=qs('v11Video'); if(!v || v.readyState<2 || !workingCase) return;
    const metrics=analyzeFrame(v); lastMetrics=metrics; setDetect(metrics);
    const ready=metrics.score >= (log().settings.autoSensitivity||72);
    if(ready) stableTicks++; else stableTicks=0;
    const phase=scannerState==='stub'?'SCAN CLAIM STUB':scannerState==='full'?'SCAN FULL BAGGAGE':scannerState==='damage'?'SCAN DAMAGE AREA':'CASE SAVED';
    const text=scannerState==='stub'?'Aim at claim stub/tag. The scanner waits for a stable, sharp frame.':scannerState==='full'?`Detected ${metrics.color} ${metrics.size}. Fill the luggage inside the frame.`:scannerState==='damage'?'Point at crack, handle, wheel, scratch, dent, torn fabric, zipper, wet damage, or missing part.':'Case saved.';
    setHud(phase, ready?'LOCKED - HOLD':'Searching / stabilizing', metrics.score, text, ready?'locked':metrics.score>50?'ready':'');
    if(stableTicks>=4 && Date.now()-lastAutoCapture>(log().settings.autoCooldown||1800)) captureAutoFrame();
  }
  function simulationScanTick(){ simulationTick++; const colors=['Black','Blue','Gray','Red','Silver','Brown']; const sizes=['Medium','Large','Large','Small']; lastMetrics={score:55+Math.min(42,simulationTick*8),brightness:72,sharpness:68,stability:82,color:colors[simulationTick%colors.length],coverage:48+simulationTick*6,size:sizes[simulationTick%sizes.length],texture:35+simulationTick*5}; setDetect(lastMetrics); const ready=lastMetrics.score>=75; const phase=scannerState==='stub'?'SCAN CLAIM STUB':scannerState==='full'?'SCAN FULL BAGGAGE':scannerState==='damage'?'SCAN DAMAGE AREA':'CASE SAVED'; setHud(phase,ready?'SIM LOCKED':'SIM SCANNING',lastMetrics.score,'Simulation mode: auto-capture will trigger like camera lock-on.',ready?'locked':'ready'); if(ready && Date.now()-lastAutoCapture>1200) captureAutoFrame(true); }
  window.forceV11Capture = function(){ if(!workingCase){fallbackToast('Start scanner first.'); return;} captureAutoFrame(!scannerStream); };
  async function captureAutoFrame(sim=false){
    if(!workingCase) return; lastAutoCapture=Date.now(); stableTicks=0; setHud('AUTO CAPTURING','CAPTURED ✓',100,'Frame captured and attached to the active evidence case.','captured'); beep();
    let dataUrl = sim ? makeSvg(scannerState.toUpperCase(), colorHex(lastMetrics?.color||'Black'), scannerState==='damage'?'DAMAGE':workingCase.tagNo||'CLAIM STUB') : captureVideoDataUrl();
    if(!dataUrl) dataUrl=makeSvg(scannerState.toUpperCase(), colorHex(lastMetrics?.color||'Black'), 'EVIDENCE');
    const role=scannerState==='stub'?'Claim Stub':scannerState==='full'?'Full Luggage View':'Damage Close-up';
    const photo={photoId:uid('P'),role,dataUrl,autoCaptured:true,hash:hashDataUrl(dataUrl),quality:Math.round(lastMetrics?.score||80),createdAt:pht()};
    workingCase.photos.push(photo);
    if(scannerState==='stub'){
      const code = !sim ? await tryBarcode(qs('v11Video')) : '';
      workingCase.tagNo = code || workingCase.tagNo || randomTagNo();
      const dup=findDuplicate(workingCase.tagNo);
      addCustody(workingCase, code?`Claim stub auto-captured; barcode/QR detected ${code}`:`Claim stub auto-captured; generated/confirmed tag ${workingCase.tagNo}`);
      if(dup) addCustody(workingCase,`Duplicate warning: existing case ${dup.caseId} has the same tag`);
      scannerState='full';
    }else if(scannerState==='full'){
      workingCase.color=lastMetrics?.color||'Unknown'; workingCase.size=lastMetrics?.size||'Unknown'; workingCase.baggageType=suggestBagType(lastMetrics); addCustody(workingCase,`Full luggage auto-captured; color ${workingCase.color}, size ${workingCase.size}, type ${workingCase.baggageType}`); scannerState='damage';
    }else if(scannerState==='damage'){
      const sug=suggestDamage(lastMetrics); workingCase.aiSuggestion=sug.type; workingCase.aiConfidence=sug.conf; workingCase.damageType=sug.type; workingCase.severity=severityFor(sug.type); workingCase.evidenceScore=evidenceScore(workingCase); workingCase.summary=claimSummary(workingCase); addCustody(workingCase,`Damage close-up auto-captured; suggested ${sug.type} (${sug.conf})`); finalizeCase(); scannerState='done'; stopScanner(false); setHud('CASE SAVED','RECORDED ✓',100,`${workingCase.caseId} saved to cumulative master log. Review in Master Log.`, 'locked');
    }
    updateWorkingBox();
  }
  function captureVideoDataUrl(){ const v=qs('v11Video'); if(!v || v.readyState<2) return ''; const maxW=log().settings.maxWidth||1200; const scale=Math.min(1,maxW/v.videoWidth); const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(v.videoWidth*scale)); c.height=Math.max(1,Math.round(v.videoHeight*scale)); const ctx=c.getContext('2d'); ctx.drawImage(v,0,0,c.width,c.height); return c.toDataURL('image/jpeg',log().settings.quality||.76); }
  function finalizeCase(){ const data=log(); const dup=findDuplicate(workingCase.tagNo); if(dup) addCustody(workingCase,`Possible duplicate tag found: ${dup.caseId}. Staff review required.`); data.cases.unshift(workingCase); if(!data.batches.find(b=>b.batchId===workingCase.batchId)) data.batches.unshift({batchId:workingCase.batchId,createdAt:pht(),caseIds:[workingCase.caseId],source:'AR auto capture'}); else data.batches.find(b=>b.batchId===workingCase.batchId).caseIds.push(workingCase.caseId); saveLog(data); fallbackToast(`${workingCase.caseId} saved to master log.`); }
  function updateWorkingBox(){ const box=qs('v11WorkingBox'); if(!box||!workingCase) return; const dup=findDuplicate(workingCase.tagNo); box.innerHTML=`<b>${workingCase.caseId}</b> • ${workingCase.destination} • Tag: <b>${workingCase.tagNo||'Scanning...'}</b>${dup?` <span class="v11-badge crit">Duplicate ${dup.caseId}</span>`:''}<br><span class="muted">Color: ${workingCase.color} • Size: ${workingCase.size} • Type: ${workingCase.baggageType} • Photos: ${workingCase.photos.length}</span><div class="v11-badges">${workingCase.photos.map(p=>`<span class="v11-badge mag">${p.role}</span>`).join('')}<span class="v11-badge">Score ${evidenceScore(workingCase)}%</span></div>`; }
  function randomTagNo(){ return 'OJ-' + Math.floor(10000+Math.random()*90000); }
  function findDuplicate(tag){ if(!tag) return null; return (log().cases||[]).find(c=>String(c.tagNo).toLowerCase()===String(tag).toLowerCase()); }
  async function tryBarcode(video){
    try{ if(!('BarcodeDetector' in window)) return ''; const detector=new BarcodeDetector({formats:['qr_code','code_128','code_39','ean_13','data_matrix']}); const results=await detector.detect(video); return results?.[0]?.rawValue || ''; }catch(e){ return ''; }
  }
  function beep(){ try{ navigator.vibrate?.(80); const A=window.AudioContext||window.webkitAudioContext; if(!A) return; const ctx=new A(); const o=ctx.createOscillator(); const g=ctx.createGain(); o.frequency.value=880; g.gain.value=.035; o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>{o.stop();ctx.close();},90); }catch(e){} }
  function colorHex(name){ return {Black:'#111827',Gray:'#64748b',Silver:'#cbd5e1',Blue:'#1d4ed8',Red:'#991b1b',Brown:'#78350f',Green:'#065f46',White:'#f8fafc',Pink:'#be185d',Purple:'#7e22ce',Yellow:'#ca8a04',Orange:'#c2410c'}[name] || '#334155'; }

  function analyzeFrame(video){
    const c=document.createElement('canvas'), w=160,h=120; c.width=w;c.height=h; const ctx=c.getContext('2d',{willReadFrequently:true}); ctx.drawImage(video,0,0,w,h); const img=ctx.getImageData(0,0,w,h).data;
    let bright=0,edges=0,diff=0,coverage=0,rs=0,gs=0,bs=0,count=0,centerCount=0;
    const startX=40,endX=120,startY=25,endY=95;
    for(let y=1;y<h-1;y+=2){ for(let x=1;x<w-1;x+=2){ const i=(y*w+x)*4; const r=img[i],g=img[i+1],b=img[i+2]; const lum=(r+g+b)/3; bright+=lum; count++; if(x>startX&&x<endX&&y>startY&&y<endY){rs+=r;gs+=g;bs+=b;centerCount++; if(lum>35&&lum<245) coverage++;} const i2=(y*w+x+1)*4; edges+=Math.abs(lum-((img[i2]+img[i2+1]+img[i2+2])/3)); }}
    bright=bright/count; edges=edges/count; const center=[rs/centerCount,gs/centerCount,bs/centerCount];
    if(lastFrame){ for(let i=0;i<img.length;i+=16) diff += Math.abs(img[i]-lastFrame[i]); diff = diff/(img.length/16); }
    lastFrameSmall = new Uint8ClampedArray(img); const stability = Math.max(0,100-diff*1.9); const sharpness=Math.min(100,edges*7.5); const covPct=Math.min(100,coverage/centerCount*100*1.8); const score=Math.round((Math.min(100,bright*1.15)*.22)+(sharpness*.24)+(stability*.34)+(Math.min(100,covPct)*.20));
    lastFrame=lastFrameSmall; return {score,brightness:Math.round(bright),sharpness:Math.round(sharpness),stability:Math.round(stability),coverage:covPct,color:classifyColor(center[0],center[1],center[2]),size:sizeFromCoverage(covPct),texture:Math.round(edges)};
  }
  function classifyColor(r,g,b){ const max=Math.max(r,g,b),min=Math.min(r,g,b); if(max<45) return 'Black'; if(min>215) return 'White'; if(max-min<22){ if(max>175)return 'Silver'; return 'Gray'; } if(r>g*1.25&&r>b*1.25) return r>180&&b>100?'Pink':'Red'; if(b>r*1.18&&b>g*1.12) return 'Blue'; if(g>r*1.1&&g>b*1.1) return 'Green'; if(r>120&&g>80&&b<75) return 'Brown'; if(r>160&&g>130&&b<80) return 'Yellow'; if(r>180&&g>95&&b<80) return 'Orange'; if(r>110&&b>120&&g<110) return 'Purple'; return 'Mixed/Patterned'; }
  function sizeFromCoverage(c){ if(c>82)return 'Oversized'; if(c>62)return 'Large'; if(c>38)return 'Medium'; return 'Small'; }
  function suggestBagType(m){ if(!m) return 'Unknown baggage'; if(m.coverage>85) return 'Box / carton'; if(m.texture>17 && /Gray|Brown|Green/.test(m.color)) return 'Soft fabric luggage'; if(/Black|Blue|Red|Silver|White|Purple|Pink/.test(m.color)) return 'Hard-shell suitcase'; return BAG_TYPES[Math.abs(Math.round((m.texture||1)+(m.coverage||1)))%BAG_TYPES.length]; }
  function suggestDamage(m){ const t=m?.texture||0,b=m?.brightness||60,c=m?.coverage||50; if(t>22&&c>55) return {type:'Crack/Split',conf:'Medium'}; if(t>18&&b<70) return {type:'Scratch/Scuff',conf:'Medium'}; if(c>78&&t<12) return {type:'Dent/Deformation',conf:'Low'}; if(t>16&&c<45) return {type:'Wheel Damage',conf:'Low'}; const arr=['Broken Handle','Torn Fabric','Zipper Damage','Wet Damage','Missing Part','Inspection']; return {type:arr[Math.abs(Math.round(t+b+c))%arr.length],conf:'Low'}; }

  function renderMasterLog(){
    const destOpts='<option value="ALL">All Destinations</option>'+DESTS.map(d=>`<option>${d}</option>`).join('');
    const typeOpts='<option value="ALL">All Damage Types</option>'+DAMAGE_TYPES.map(d=>`<option>${d}</option>`).join('');
    qs('v11DamageContent').innerHTML=`<div class="card glow"><div class="card-header"><span>📋 Cumulative Master Damage Log</span><span class="v11-badge">Append-only ON</span></div><div class="v11-filter"><input id="v11Search" placeholder="Search tag, destination, notes..." oninput="drawCaseCards()"><select id="v11DestFilter" onchange="drawCaseCards()">${destOpts}</select><select id="v11TypeFilter" onchange="drawCaseCards()">${typeOpts}</select><select id="v11SeverityFilter" onchange="drawCaseCards()"><option value="ALL">All Severity</option><option>Critical</option><option>Moderate</option><option>Minor</option><option>Inspection</option></select><button class="sm primary" onclick="damageTab('scanner')">AR Scan</button></div><div id="v11Cards" class="v11-cardgrid"></div></div>`; drawCaseCards(); }
  window.drawCaseCards=function(){
    const q=(qs('v11Search')?.value||'').toLowerCase(), df=qs('v11DestFilter')?.value||'ALL', tf=qs('v11TypeFilter')?.value||'ALL', sf=qs('v11SeverityFilter')?.value||'ALL';
    const rows=log().cases.filter(c=>(df==='ALL'||c.destination===df)&&(tf==='ALL'||c.damageType===tf)&&(sf==='ALL'||c.severity===sf)&&(!q||`${c.caseId} ${c.tagNo} ${c.destination} ${c.color} ${c.size} ${c.baggageType} ${c.damageType} ${c.notes}`.toLowerCase().includes(q)));
    const box=qs('v11Cards'); if(!box)return; box.innerHTML=rows.length?rows.map(c=>{const sev=c.severity==='Critical'?'crit':c.severity==='Moderate'?'warn':''; const thumb=(c.photos||[]).find(p=>/damage/i.test(p.role))?.dataUrl || c.photos?.[0]?.dataUrl || ''; return `<div class="v11-case ${c.severity==='Critical'?'crit':''}" onclick="openV11Case('${c.caseId}')"><div class="v11-thumb" style="background-image:url('${thumb}')"></div><div class="v11-title">${safe(c.caseId)} <span class="v11-badge mag">${c.photos?.length||0} photos</span></div><div class="v11-meta">${safe(c.destination)} • ${safe(c.tagNo||'NO TAG')} • ${safe(c.phtTimestamp||'')}</div><div class="v11-badges"><span class="v11-badge ${sev}">${safe(c.damageType)}</span><span class="v11-badge">${safe(c.color)}</span><span class="v11-badge">${safe(c.size)}</span><span class="v11-badge">${evidenceScore(c)}%</span>${c.locked?'<span class="v11-badge lock">LOCKED</span>':''}</div></div>`;}).join(''):'<p class="muted">No evidence cases match the current filters.</p>';
  };
  window.openV11Case=function(caseId){
    const c=log().cases.find(x=>x.caseId===caseId); if(!c)return;
    const destOpts=DESTS.map(d=>`<option ${c.destination===d?'selected':''}>${d}</option>`).join('');
    const typeOpts=DAMAGE_TYPES.map(d=>`<option ${c.damageType===d?'selected':''}>${d}</option>`).join('');
    const colorOpts=COLORS.map(d=>`<option ${c.color===d?'selected':''}>${d}</option>`).join('');
    const sizeOpts=['Small','Medium','Large','Oversized','Unknown'].map(d=>`<option ${c.size===d?'selected':''}>${d}</option>`).join('');
    const bagOpts=BAG_TYPES.map(d=>`<option ${c.baggageType===d?'selected':''}>${d}</option>`).join('');
    const roleOpts=r=>PHOTO_ROLES.map(x=>`<option ${r===x?'selected':''}>${x}</option>`).join('');
    const checks=checklist(c).map(x=>`<div><span>${x.ok?'✅':'⬜'} ${x.label}</span><b>${x.ok?'OK':'Missing'}</b></div>`).join('');
    const panel=document.createElement('div'); panel.className='v11-panel'; panel.id='v11Panel';
    panel.innerHTML=`<div class="v11-side"><div class="card-header"><span>🧾 Evidence Case ${safe(c.caseId)}</span><button class="sm" onclick="document.getElementById('v11Panel').remove()">✕</button></div><div class="v11-photos">${(c.photos||[]).map(p=>`<div class="v11-photoitem"><img src="${p.dataUrl}"><select onchange="renameV11Photo('${c.caseId}','${p.photoId}',this.value)">${roleOpts(p.role)}</select><span class="v11-badge">${safe(p.hash||'')}</span></div>`).join('')}</div><div class="v11-grid" style="margin-top:10px"><div class="input-group"><label>Destination</label><select id="eDest">${destOpts}</select></div><div class="input-group"><label>Tag No</label><input id="eTag" value="${safe(c.tagNo)}"></div><div class="input-group"><label>Color</label><select id="eColor">${colorOpts}</select></div><div class="input-group"><label>Size</label><select id="eSize">${sizeOpts}</select></div><div class="input-group"><label>Baggage Type</label><select id="eBagType">${bagOpts}</select></div><div class="input-group"><label>Damage Type</label><select id="eDamage">${typeOpts}</select></div><div class="input-group"><label>Status</label><select id="eStatus"><option ${c.status==='New'?'selected':''}>New</option><option ${c.status==='Under Review'?'selected':''}>Under Review</option><option ${c.status==='Claim Stub Issued'?'selected':''}>Claim Stub Issued</option><option ${c.status==='Escalated'?'selected':''}>Escalated</option><option ${c.status==='Resolved'?'selected':''}>Resolved</option><option ${c.status==='Rejected'?'selected':''}>Rejected</option></select></div><div class="input-group"><label>Severity</label><select id="eSeverity"><option ${c.severity==='Critical'?'selected':''}>Critical</option><option ${c.severity==='Moderate'?'selected':''}>Moderate</option><option ${c.severity==='Minor'?'selected':''}>Minor</option><option ${c.severity==='Inspection'?'selected':''}>Inspection</option></select></div></div><div class="input-group"><label>Notes</label><textarea id="eNotes" rows="4">${safe(c.notes)}</textarea></div><div class="trip-row"><b>Auto claim summary:</b><br>${safe(claimSummary(c))}</div><div class="card-header">Evidence Checklist • ${evidenceScore(c)}%</div><div class="v11-checklist">${checks}</div><div class="card-header" style="margin-top:12px">Chain of Custody</div><div class="v11-timeline">${(c.chainOfCustody||[]).map(x=>`<div>${safe(x)}</div>`).join('')}</div><div class="v11-grid" style="margin-top:12px"><button class="primary block" onclick="saveV11Case('${c.caseId}')">Save Case</button><button class="accent block" onclick="copyV11Summary('${c.caseId}')">Copy Summary</button><button class="${c.locked?'accent':'danger'} block" onclick="toggleV11Lock('${c.caseId}')">${c.locked?'Unlock Evidence':'Lock Evidence'}</button><button class="danger block" onclick="deleteV11Case('${c.caseId}')">Delete Case</button></div></div>`;
    document.body.appendChild(panel);
  };
  window.saveV11Case=function(caseId){ const data=log(),c=data.cases.find(x=>x.caseId===caseId); if(!c){fallbackToast('Case not found.');return;} if(c.locked){fallbackToast('Case is locked. Unlock first.');return;} c.destination=qs('eDest').value;c.tagNo=qs('eTag').value.trim();c.color=qs('eColor').value;c.size=qs('eSize').value;c.baggageType=qs('eBagType').value;c.damageType=qs('eDamage').value;c.status=qs('eStatus').value;c.severity=qs('eSeverity').value;c.notes=qs('eNotes').value.trim();c.evidenceScore=evidenceScore(c);c.summary=claimSummary(c);addCustody(c,'Case details edited and saved');saveLog(data);qs('v11Panel')?.remove();renderMasterLog();fallbackToast('Evidence case saved.'); };
  window.renameV11Photo=function(caseId,pid,role){ const data=log(),c=data.cases.find(x=>x.caseId===caseId),p=c?.photos?.find(x=>x.photoId===pid); if(p&&!c.locked){p.role=role;addCustody(c,`Photo ${pid} role changed to ${role}`);saveLog(data);} };
  window.toggleV11Lock=function(caseId){ const data=log(),c=data.cases.find(x=>x.caseId===caseId); if(c){c.locked=!c.locked;addCustody(c,c.locked?'Evidence integrity lock enabled':'Evidence unlocked by staff/supervisor');saveLog(data);qs('v11Panel')?.remove();renderMasterLog();} };
  window.deleteV11Case=function(caseId){ if(!confirm('Delete this evidence case from the master log?'))return; const data=log(); const c=data.cases.find(x=>x.caseId===caseId); if(c?.locked){fallbackToast('Locked case cannot be deleted. Unlock first.');return;} data.cases=data.cases.filter(x=>x.caseId!==caseId); saveLog(data); qs('v11Panel')?.remove(); renderMasterLog(); };
  window.copyV11Summary=function(caseId){ const c=log().cases.find(x=>x.caseId===caseId); if(!c)return; navigator.clipboard?.writeText(claimSummary(c)); fallbackToast('Claim summary copied.'); };

  function renderBatch(){
    qs('v11DamageContent').innerHTML=`<div class="card glow"><div class="card-header"><span>📥 Batch Upload Intake</span><span class="v11-badge">Auto-group every 2 photos</span></div><div id="v11Drop" class="v11-drop"><b>Drop photos here</b><br><span class="muted">or choose multiple images. Every 2 photos becomes one case and appends to the master log.</span><input id="v11Files" type="file" accept="image/*" multiple style="display:none" onchange="processV11Batch(this.files)"><br><button class="primary" style="margin-top:10px" onclick="document.getElementById('v11Files').click()">Choose Photos</button></div><div id="v11BatchResult" class="trip-row" style="margin-top:10px">No batch processed yet.</div></div>`;
    const dz=qs('v11Drop'); dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('drag')}); dz.addEventListener('dragleave',()=>dz.classList.remove('drag')); dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('drag');processV11Batch(e.dataTransfer.files);});
  }
  window.processV11Batch=async function(files){ const arr=[...files].filter(f=>f.type.startsWith('image/')); if(!arr.length){fallbackToast('No image files selected.');return;} const data=log(),settings=data.settings||{},urls=[]; qs('v11BatchResult').innerHTML='Compressing and grouping photos...'; for(const f of arr) urls.push(await compressImage(f,settings.maxWidth||1200,settings.quality||.76)); const batchId='BATCH-'+phtDate().replaceAll('-','')+'-'+String(data.nextBatchSeq++).padStart(3,'0'); const batch={batchId,createdAt:pht(),caseIds:[],source:'batch upload'}; for(let i=0;i<urls.length;i+=2){ const seq=data.nextCaseSeq++; const type=DAMAGE_TYPES[(i/2)%DAMAGE_TYPES.length]; const caseId='OJ-DMG-'+String(seq).padStart(6,'0'); const c={caseId,batchId,destination:DESTS[(i/2)%DESTS.length],tagNo:'',color:'Unknown',size:'Unknown',baggageType:'Unknown baggage',damageType:type,aiSuggestion:type,aiConfidence:'Batch default',severity:severityFor(type),status:'New',dateTaken:phtDate(),timeTaken:phtTime(),phtTimestamp:pht(),notes:'Batch-uploaded evidence. Staff must review fields, confirm tag number, color, size, and damage type.',photos:urls.slice(i,i+2).map((u,j)=>({photoId:uid('P'),role:j===0?'Full Luggage View':'Damage Close-up',dataUrl:u,autoCaptured:false,hash:hashDataUrl(u),quality:80,createdAt:pht()})),locked:false,chainOfCustody:[]}; c.evidenceScore=evidenceScore(c); c.summary=claimSummary(c); addCustody(c,`Batch intake created case with ${c.photos.length} photo(s)`); data.cases.unshift(c); batch.caseIds.push(caseId); } data.batches.unshift(batch); saveLog(data); qs('v11BatchResult').innerHTML=`<b>${batchId}</b><br>${batch.caseIds.length} case(s) appended to the cumulative master log.<br><button class="sm primary" onclick="damageTab('log')">Review cases</button>`; fallbackToast('Batch appended to master log.'); };
  function compressImage(file,maxW,quality){ return new Promise(resolve=>{ const r=new FileReader(); r.onload=()=>{ const img=new Image(); img.onload=()=>{ let w=img.width,h=img.height;if(w>maxW){h=Math.round(h*maxW/w);w=maxW;} const c=document.createElement('canvas'); c.width=w;c.height=h; const ctx=c.getContext('2d'); ctx.fillStyle='#020617'; ctx.fillRect(0,0,w,h); ctx.drawImage(img,0,0,w,h); resolve(c.toDataURL('image/jpeg',quality)); }; img.onerror=()=>resolve(r.result); img.src=r.result; }; r.readAsDataURL(file); }); }

  function renderExport(){ const st=stats(),size=(estimateStorageBytes()/1024/1024).toFixed(2); qs('v11DamageContent').innerHTML=`<div class="card glow"><div class="card-header">📤 Export, Backup & Storage</div><div class="v11-grid3"><div class="v11-kpi"><strong>${st.cases.length}</strong><span>Cases</span></div><div class="v11-kpi"><strong>${st.photos}</strong><span>Photos</span></div><div class="v11-kpi"><strong>${size}MB</strong><span>Backup size</span></div></div><div class="trip-row" style="margin-top:10px"><b>Storage mode:</b> ${idbReady?'IndexedDB active with localStorage backup':'localStorage fallback active'}<br>Export JSON for full backup with embedded photos. Export CSV for claims/insurance sheet.</div><div class="v11-grid"><button class="primary block" onclick="exportV11JSON()">Export JSON Backup</button><button class="accent block" onclick="exportV11CSV()">Export CSV Claims Sheet</button><button class="block" onclick="copyV11CSV()">Copy CSV</button><button class="danger block" onclick="resetV11Demo()">Reset Demo Damage Log</button></div></div>`; }
  function csvText(){ const headers=['caseId','batchId','destination','tagNo','color','baggageType','size','damageType','aiSuggestion','aiConfidence','severity','status','dateTaken','timeTaken','phtTimestamp','evidenceScore','photoCount','locked','summary','notes']; return headers.join(',')+'\n'+log().cases.map(c=>headers.map(h=>`"${String(h==='photoCount'?(c.photos?.length||0):h==='evidenceScore'?evidenceScore(c):h==='summary'?claimSummary(c):(c[h]??'')).replace(/"/g,'""')}"`).join(',')).join('\n'); }
  window.exportV11JSON=function(){ download(new Blob([JSON.stringify(log(),null,2)],{type:'application/json'}),'ocean_jet_v11_evidence_master_'+phtDate()+'.json'); };
  window.exportV11CSV=function(){ download(new Blob([csvText()],{type:'text/csv'}),'ocean_jet_v11_claims_'+phtDate()+'.csv'); };
  window.copyV11CSV=function(){ navigator.clipboard?.writeText(csvText()); fallbackToast('CSV copied.'); };
  window.resetV11Demo=function(){ if(!confirm('Reset damage evidence demo log?'))return; logCache=defaultLog(); saveLog(logCache); renderExport(); fallbackToast('V11 damage log reset.'); };

  function renderSettings(){ const s=log().settings||{}; qs('v11DamageContent').innerHTML=`<div class="card glow"><div class="card-header">⚙️ Damage Detector Settings</div><div class="v11-grid"><div class="input-group"><label>Staff Name</label><input id="setStaff" value="${safe(s.staff)}"></div><div class="input-group"><label>Shift</label><input id="setShift" value="${safe(s.shift)}"></div><div class="input-group"><label>Pier / Counter</label><input id="setPier" value="${safe(s.pier)}"></div><div class="input-group"><label>JPEG Quality 0.50 - 0.90</label><input id="setQuality" type="number" min="0.5" max="0.9" step="0.01" value="${safe(s.quality)}"></div><div class="input-group"><label>Max Photo Width</label><input id="setMax" type="number" min="700" max="1800" step="50" value="${safe(s.maxWidth)}"></div><div class="input-group"><label>Auto-capture Sensitivity</label><input id="setSensitivity" type="number" min="50" max="95" step="1" value="${safe(s.autoSensitivity)}"></div><div class="input-group"><label>Auto-capture Cooldown ms</label><input id="setCooldown" type="number" min="800" max="5000" step="100" value="${safe(s.autoCooldown)}"></div><div class="input-group"><label>Storage Backend</label><input disabled value="${idbReady?'IndexedDB active':'localStorage fallback'}"></div></div><button class="primary block" onclick="saveV11Settings()">Save Settings</button></div>`; }
  window.saveV11Settings=function(){ const data=log(); data.settings={...data.settings,staff:qs('setStaff').value,shift:qs('setShift').value,pier:qs('setPier').value,quality:+qs('setQuality').value||.76,maxWidth:+qs('setMax').value||1200,autoSensitivity:+qs('setSensitivity').value||72,autoCooldown:+qs('setCooldown').value||1800}; saveLog(data); fallbackToast('V11 settings saved.'); };

  window.renderCommandCenter=function(){ injectV11Styles(); ensureViews(); const st=stats(),rev=(()=>{try{return fmtPHP(DB.stats.revenue||0)}catch(e){return'₱0.00'}})(),kg=(()=>{try{return(DB.stats.totalKg||0)+'kg'}catch(e){return'0kg'}})(); qs('view-command').innerHTML=`<div class="card v11-hero"><div class="card-header"><span>🛰️ OCEAN JET // DIGITAL COMMAND CENTER V11</span><span class="v11-badge" id="v11CmdClock">-- PHT</span></div><p class="muted">Operations command view for official baggage calculation activity and damage evidence readiness.</p></div><div class="v11-grid3" style="margin-top:12px"><div class="v11-kpi"><strong>${st.cases.length}</strong><span>Damage cases</span></div><div class="v11-kpi"><strong>${st.crit}</strong><span>Critical claims</span></div><div class="v11-kpi"><strong>${st.avg}%</strong><span>Evidence avg</span></div><div class="v11-kpi"><strong>${st.photos}</strong><span>Evidence photos</span></div><div class="v11-kpi"><strong>${rev}</strong><span>Baggage revenue</span></div><div class="v11-kpi"><strong>${kg}</strong><span>Logged weight</span></div></div><div class="v11-grid" style="margin-top:12px"><div class="card"><div class="card-header">🌐 Route Evidence Pulse</div><div class="v11-orbit"><div class="v11-node v11-center">CEBU OPS</div>${DESTS.map((d,i)=>{const a=(i/DESTS.length)*Math.PI*2,x=50+Math.cos(a)*37,y=50+Math.sin(a)*37,n=st.byDest[d]||0;return`<div class="v11-node" style="left:${x}%;top:${y}%">${d}<br>${n}</div>`}).join('')}</div></div><div class="card"><div class="card-header">🚨 Claims Alerts</div><div class="v11-timeline"><div>${st.crit?st.crit+' critical evidence case(s) require supervisor review.':'No critical damage cluster detected.'}</div><div>${st.avg<85?'Evidence score below ideal. Capture stub + full luggage + damage close-up.':'Evidence quality is strong.'}</div><div>${estimateStorageBytes()>4.5*1024*1024?'Storage getting heavy. Export JSON backup soon.':'Storage level is acceptable.'}</div><div>Chatbot baggage calculation remains disabled. Use official Baggage Calc tab.</div></div></div></div><div class="card"><div class="card-header">⚓ Port Congestion Simulator</div><div class="v11-grid3">${['Baggage Counter','Claim Desk','Boarding Queue'].map((x,i)=>{const v=Math.min(100,Math.round(35+st.cases.length*1.5+st.crit*5+i*13));return`<div><b>${x}</b><div class="v11-meter" style="margin:6px 0"><span style="width:${v}%"></span></div><span class="muted">${v<55?'Low':v<78?'Moderate':'High'} load</span></div>`}).join('')}</div></div>`; tickCmd(); clearInterval(window.__v11CmdTimer); window.__v11CmdTimer=setInterval(tickCmd,1000); };
  function tickCmd(){ const el=qs('v11CmdClock'); if(el) el.textContent=new Date().toLocaleTimeString('en-PH',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true})+' PHT'; }

  function patchDashboard(){ if(window.__v11DashPatched || typeof buildDashboard!=='function') return; window.__v11DashPatched=true; const old=buildDashboard; window.buildDashboard=buildDashboard=function(){ old(); const v=qs('view-dashboard'); if(v&&!qs('v11DashEvidence')){ const st=stats(); v.insertAdjacentHTML('afterbegin',`<div class="card glow" id="v11DashEvidence"><div class="card-header"><span>🧳 V11 Evidence Engine Snapshot</span><button class="sm accent" onclick="showView('damage')">Open</button></div><div class="v11-grid3"><div class="v11-kpi"><strong>${st.cases.length}</strong><span>Damage cases</span></div><div class="v11-kpi"><strong>${st.crit}</strong><span>Critical</span></div><div class="v11-kpi"><strong>${st.avg}%</strong><span>Evidence</span></div></div></div>`); } }; }
  function patchAI(){ const old=window.aiOfflineRespond || (typeof aiOfflineRespond==='function'?aiOfflineRespond:null); window.aiOfflineRespond = aiOfflineRespond = function(q){ const s=String(q||'').toLowerCase(); if(/damage|claim|stub|crack|handle|wheel|scratch|dent|torn|zipper|wet|missing|evidence|detector|photo/.test(s)) return 'Open the Baggage Damage Detector tab. V11 supports hands-free AR auto-capture, claim stub evidence, color/size detection, duplicate tag warning, evidence score, locked cases, JSON backup, and CSV claims export.'; if(/(compute|calculate|how much|fee|price).*(kg|baggage|bag|luggage|cargo)|\b\d+\s*(pax|passenger).*\d+\s*(kg|kilo)|\d+\s*(kg|kilo).*(fare|fee|baggage)/.test(s)) return 'For clean records, I do not calculate baggage fees in chat. Please use the official Baggage Calc tab.'; return old?old(q):'I can guide you to Baggage Calc, Command Center, or Baggage Damage Detector.'; }; }

  async function boot(){ try{ injectV11Styles(); ensureViews(); patchMenu(); patchShowView(); await initLog(); patchDashboard(); patchAI(); if(typeof buildDrawerMenu==='function') buildDrawerMenu(); try{ DB.v11EvidenceEngine=V11_VERSION; saveDB(); }catch(e){} window.__OFF_PATCH_VERSION=V11_VERSION; }catch(e){ console.error('V11 Evidence Engine boot error',e); } }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
