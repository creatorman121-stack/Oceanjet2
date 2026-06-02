
const DB_KEY = 'off_baggage_v14';
const DEFAULT_DB = {
  slabs: {
    cebu_tagbilaran: { normal:[15,25,30], fragile:[30,45,65] },
    tagbilaran_cebu: { normal:[15,25,30], fragile:[30,45,65] },
    tagbilaran_dumaguete: { normal:[25,30,35], fragile:[40,55,75] },
    dumaguete_tagbilaran: { normal:[25,30,35], fragile:[40,55,75] },
    siquijor_dumaguete: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    dumaguete_siquijor: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    siquijor_tagbilaran: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    tagbilaran_siquijor: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    cebu_getafe: { normal:[10,20,25], fragile:[25,40,60] },
    getafe_cebu: { normal:[10,20,25], fragile:[25,40,60] },
    cebu_ormoc: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    ormoc_cebu: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    cebu_palompon: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    palompon_cebu: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    cebu_maasin: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    maasin_cebu: { normal:[20,27.5,32.5], fragile:[35,50,70] },
    maasin_surigao: { normal:[30,35,40], fragile:[50,65,85] },
    surigao_maasin: { normal:[30,35,40], fragile:[50,65,85] },
    bacolod_iloilo: { normal:[10,20,25], fragile:[25,40,60] },
    iloilo_bacolod: { normal:[10,20,25], fragile:[25,40,60] },
    calapan_batangas: { normal:[10,20,25], fragile:[25,40,60] },
    batangas_calapan: { normal:[10,20,25], fragile:[25,40,60] },
    cebu_dumaguete: { normal:[25,30,35], fragile:[40,55,75] },
    cebu_surigao: { normal:[30,35,40], fragile:[50,65,85] },
    cebu_siquijor: { normal:[20,27.5,32.5], fragile:[35,50,70] }
  },
  freeAllowance: { tourist:10, business:20 },
  paxFares: {
    cebu_tagbilaran: {'TC/OA':1000, 'BC':1560, 'ST':800, 'MI':500},
    tagbilaran_cebu: {'TC/OA':1000, 'BC':1560, 'ST':800, 'MI':500},
    tagbilaran_siquijor: {'TC/OA':1000, 'BC':1560, 'ST':800, 'MI':500},
    siquijor_tagbilaran: {'TC/OA':1000, 'BC':1560, 'ST':800, 'MI':500},
    tagbilaran_dumaguete: {'TC/OA':1170, 'BC':1820, 'ST':936, 'MI':585},
    dumaguete_tagbilaran: {'TC/OA':1170, 'BC':1820, 'ST':936, 'MI':585},
    dumaguete_siquijor: {'TC/OA':455, 'BC':754, 'ST':364, 'MI':227.5},
    siquijor_dumaguete: {'TC/OA':455, 'BC':754, 'ST':364, 'MI':227.5},
    iloilo_bacolod: {'TC/OA':700, 'BC':1000, 'ST':570, 'MI':350},
    bacolod_iloilo: {'TC/OA':700, 'BC':1000, 'ST':570, 'MI':350},
    cebu_getafe: {'TC/OA':585, 'BC':1040, 'ST':468, 'MI':292.5},
    getafe_cebu: {'TC/OA':585, 'BC':1040, 'ST':468, 'MI':292.5},
    cebu_ormoc: {'TC/OA':1430, 'BC':1950, 'ST':1144, 'MI':715},
    ormoc_cebu: {'TC/OA':1430, 'BC':1950, 'ST':1144, 'MI':715},
    cebu_palompon: {'TC/OA':1430, 'BC':1950, 'ST':1144, 'MI':715},
    palompon_cebu: {'TC/OA':1430, 'BC':1950, 'ST':1144, 'MI':715},
    cebu_maasin: {'TC/OA':1430, 'BC':1950, 'ST':1144, 'MI':715},
    maasin_cebu: {'TC/OA':1430, 'BC':1950, 'ST':1144, 'MI':715},
    maasin_surigao: {'TC/OA':1040, 'BC':1560, 'ST':832, 'MI':520},
    surigao_maasin: {'TC/OA':1040, 'BC':1560, 'ST':832, 'MI':520},
    calapan_batangas: {'TC/OA':600, 'BC':850, 'ST':480, 'MI':300},
    batangas_calapan: {'TC/OA':600, 'BC':850, 'ST':480, 'MI':300},
    cebu_dumaguete: {'TC/OA':1170, 'BC':1820, 'ST':936, 'MI':585},
    cebu_surigao: {'TC/OA':1040, 'BC':1560, 'ST':832, 'MI':520},
    cebu_siquijor: {'TC/OA':1000, 'BC':1560, 'ST':800, 'MI':500}
  },
  schedules: {
    cebu_tagbilaran: { title:'Cebu to Tagbilaran', travel:'2h', trips:[{dep:'5:10AM',vessel:'OJ 388',arr:'7:10AM',remarks:'Connects to Siquijor/Dumaguete'},{dep:'6:00AM',vessel:'OJ 988',arr:'8:00AM',remarks:''},{dep:'7:00AM',vessel:'OJ 588',arr:'9:00AM',remarks:''},{dep:'8:20AM',vessel:'OJ 788',arr:'10:20AM',remarks:'Connects to Dumaguete'},{dep:'9:20AM',vessel:'OJ 688',arr:'11:20AM',remarks:''},{dep:'10:40AM',vessel:'OJ 988',arr:'12:40PM',remarks:''},{dep:'11:40AM',vessel:'OJ 588',arr:'1:40PM',remarks:''},{dep:'12:20PM',vessel:'OJ 88',arr:'2:20PM',remarks:'Special Siquijor connection'},{dep:'1:00PM',vessel:'OJ 288',arr:'3:00PM',remarks:'Connects to Siquijor'},{dep:'2:00PM',vessel:'OJ 688',arr:'4:00PM',remarks:''},{dep:'3:20PM',vessel:'OJ 988',arr:'5:20PM',remarks:''},{dep:'4:20PM',vessel:'OJ 588',arr:'6:20PM',remarks:''},{dep:'5:40PM',vessel:'OJ 788',arr:'7:40PM',remarks:''},{dep:'6:40PM',vessel:'OJ 688',arr:'8:40PM',remarks:''}] },
    tagbilaran_cebu: { title:'Tagbilaran to Cebu', travel:'2h', trips:[{dep:'6:00am',vessel:'OJ 988',arr:'8:00am',remarks:''},{dep:'7:05am',vessel:'OJ 588',arr:'9:05am',remarks:''},{dep:'8:20am',vessel:'OJ 788',arr:'10:20am',remarks:''},{dep:'9:20am',vessel:'OJ 688',arr:'11:20am',remarks:''},{dep:'10:40am',vessel:'OJ 988',arr:'12:40pm',remarks:''},{dep:'11:40am',vessel:'OJ 588',arr:'1:40pm',remarks:''},{dep:'1:00pm',vessel:'OJ 288',arr:'3:00pm',remarks:''},{dep:'2:00pm',vessel:'OJ 688',arr:'4:00pm',remarks:''},{dep:'3:20pm',vessel:'OJ 988',arr:'5:20pm',remarks:''},{dep:'4:20pm',vessel:'OJ 588',arr:'6:20pm',remarks:''},{dep:'5:00pm',vessel:'OJ 588',arr:'7:00pm',remarks:''},{dep:'5:40pm',vessel:'OJ 788',arr:'7:40pm',remarks:''},{dep:'6:30pm',vessel:'OJ 688',arr:'8:30pm',remarks:''}] },
    tagbilaran_dumaguete: { title:'Tagbilaran to Dumaguete', travel:'2h', trips:[{dep:'10:40am',vessel:'OJ 388',arr:'12:40pm',remarks:''}] },
    dumaguete_tagbilaran: { title:'Dumaguete to Tagbilaran', travel:'2h', trips:[{dep:'1:00pm',vessel:'OJ 388',arr:'3:00pm',remarks:''}] },
    siquijor_dumaguete: { title:'Siquijor to Dumaguete', travel:'40m', trips:[{dep:'6:00am',vessel:'OJ 388',arr:'6:40am',remarks:''},{dep:'10:00am',vessel:'OJ 988',arr:'10:40am',remarks:''},{dep:'12:00pm',vessel:'OJ 588',arr:'12:40pm',remarks:''},{dep:'6:00pm',vessel:'OJ 788',arr:'6:40pm',remarks:''}] },
    dumaguete_siquijor: { title:'Dumaguete to Siquijor', travel:'40m', trips:[{dep:'7:20am',vessel:'OJ 388',arr:'8:00am',remarks:''},{dep:'11:00am',vessel:'OJ 988',arr:'11:40am',remarks:''},{dep:'1:00pm',vessel:'OJ 588',arr:'1:40pm',remarks:''},{dep:'7:10pm',vessel:'OJ 788',arr:'7:50pm',remarks:''}] },
    siquijor_tagbilaran: { title:'Siquijor to Tagbilaran', travel:'2h', trips:[{dep:'8:20am',vessel:'OJ 388',arr:'10:20am',remarks:''},{dep:'2:30pm',vessel:'OJ 988',arr:'4:30pm',remarks:''}] },
    tagbilaran_siquijor: { title:'Tagbilaran to Siquijor', travel:'2h', trips:[{dep:'7:30am',vessel:'OJ 388',arr:'9:30am',remarks:''},{dep:'3:20pm',vessel:'OJ 988',arr:'5:20pm',remarks:''}] },
    cebu_getafe: { title:'Cebu to Getafe', travel:'1h', trips:[{dep:'6:30AM',vessel:'OJ 10',arr:'7:30AM',remarks:''},{dep:'10:00AM',vessel:'OJ 10',arr:'11:00AM',remarks:''},{dep:'1:30PM',vessel:'OJ 10',arr:'2:30PM',remarks:''},{dep:'5:00PM',vessel:'OJ 10',arr:'6:00PM',remarks:''},{dep:'6:45PM',vessel:'OJ 02',arr:'7:45PM',remarks:''}] },
    getafe_cebu: { title:'Getafe to Cebu', travel:'1h 15m', trips:[{dep:'6:30am',vessel:'OJ 10',arr:'7:45am',remarks:''},{dep:'8:15am',vessel:'OJ 10',arr:'9:30am',remarks:''},{dep:'11:45am',vessel:'OJ 10',arr:'1:00pm',remarks:''},{dep:'3:15pm',vessel:'OJ 10',arr:'4:30pm',remarks:''},{dep:'6:45pm',vessel:'OJ 02',arr:'8:00pm',remarks:''}] },
    cebu_ormoc: { title:'Cebu to Ormoc', travel:'3h', trips:[{dep:'6:00AM',vessel:'OJ 8',arr:'9:00AM',remarks:''},{dep:'9:30AM',vessel:'OJ 168/OJ 188',arr:'12:30PM',remarks:''},{dep:'1:00PM',vessel:'OJ 8',arr:'4:00PM',remarks:''},{dep:'4:30PM',vessel:'OJ 168/OJ 188',arr:'7:30PM',remarks:''}] },
    ormoc_cebu: { title:'Ormoc to Cebu', travel:'3h', trips:[{dep:'6:00am',vessel:'OJ 8',arr:'9:00am',remarks:''},{dep:'9:30am',vessel:'OJ 168/OJ 188',arr:'12:30pm',remarks:''},{dep:'1:00pm',vessel:'OJ 8',arr:'4:00pm',remarks:''},{dep:'4:30pm',vessel:'OJ 168/OJ 188',arr:'7:30pm',remarks:''}] },
    cebu_palompon: { title:'Cebu to Palompon', travel:'3h', trips:[{dep:'10:00AM',vessel:'OJ 02',arr:'1:00PM',remarks:'Kalanggaman connection'},{dep:'1:30PM',vessel:'OJ 02',arr:'4:30PM',remarks:'Afternoon service'}] },
    palompon_cebu: { title:'Palompon to Cebu', travel:'3h', trips:[{dep:'1:30pm',vessel:'OJ 02',arr:'4:30pm',remarks:''}] },
    cebu_maasin: { title:'Cebu to Maasin', travel:'3h', trips:[{dep:'7:00am',vessel:'OJ 03',arr:'10:00am',remarks:''}] },
    maasin_cebu: { title:'Maasin to Cebu', travel:'3h', trips:[{dep:'3:30pm',vessel:'OJ 03',arr:'6:30pm',remarks:''}] },
    maasin_surigao: { title:'Maasin to Surigao', travel:'2h', trips:[{dep:'10:30am',vessel:'OJ 388',arr:'12:30pm',remarks:''}] },
    surigao_maasin: { title:'Surigao to Maasin', travel:'2h', trips:[{dep:'1:00pm',vessel:'OJ 388',arr:'3:00pm',remarks:''}] },
    bacolod_iloilo: { title:'Bacolod to Iloilo', travel:'1h', trips:[{dep:'5:45am',vessel:'OJ 388',arr:'6:45am',remarks:''},{dep:'8:50am',vessel:'OJ 988',arr:'9:50am',remarks:''},{dep:'1:00pm',vessel:'OJ 588',arr:'2:00pm',remarks:''},{dep:'4:00pm',vessel:'OJ 788',arr:'5:00pm',remarks:''}] },
    iloilo_bacolod: { title:'Iloilo to Bacolod', travel:'1h', trips:[{dep:'7:20am',vessel:'OJ 388',arr:'8:20am',remarks:''},{dep:'11:00am',vessel:'OJ 988',arr:'12:00pm',remarks:''},{dep:'2:30pm',vessel:'OJ 588',arr:'3:30pm',remarks:''},{dep:'5:30pm',vessel:'OJ 788',arr:'6:30pm',remarks:''}] },
    calapan_batangas: { title:'Calapan to Batangas', travel:'1h 10m', trips:[{dep:'5:50am',vessel:'OJ 388',arr:'7:00am',remarks:''},{dep:'9:20am',vessel:'OJ 988',arr:'10:30am',remarks:''},{dep:'12:40pm',vessel:'OJ 588',arr:'1:50pm',remarks:''},{dep:'4:00pm',vessel:'OJ 788',arr:'5:10pm',remarks:''}] },
    batangas_calapan: { title:'Batangas to Calapan', travel:'1h 10m', trips:[{dep:'7:40am',vessel:'OJ 388',arr:'8:50am',remarks:''},{dep:'11:00am',vessel:'OJ 988',arr:'12:10pm',remarks:''},{dep:'2:20pm',vessel:'OJ 588',arr:'3:30pm',remarks:''},{dep:'5:40pm',vessel:'OJ 788',arr:'6:50pm',remarks:''}] },
    cebu_dumaguete: { title:'Cebu to Dumaguete', travel:'4h 20m', trips:[{dep:'5:10AM',vessel:'OJ 388',arr:'9:30AM',remarks:'Via Tagbilaran'},{dep:'1:00PM',vessel:'OJ 288',arr:'5:20PM',remarks:'Via Tagbilaran'}] },
    cebu_surigao: { title:'Cebu to Surigao', travel:'5h 30m', trips:[{dep:'7:00AM',vessel:'OJ 03',arr:'12:30PM',remarks:'Via Maasin'}] },
    cebu_siquijor: { title:'Cebu to Siquijor', travel:'4h 20m', trips:[{dep:'6:00AM',vessel:'OJ 388 (via Tagb)',arr:'10:20AM',remarks:'Through Tagbilaran'},{dep:'1:00PM',vessel:'OJ 288 (via Tagb)',arr:'5:20PM',remarks:'Afternoon service'}] }
  },
  stats: { transactions:0, revenue:0, totalKg:0, topRoute:'', routeCounts:{} },
  comps: [],
  creds: { cashier:{u:'cashier',p:'cashier'}, supervisor:{u:'demo',p:'demo'} },
  history: [],
  darkMode: false,
  aiSettings: { apiKey: '', useAI: true }
};

let DB = JSON.parse(localStorage.getItem(DB_KEY)) || {};
(function mergeDefaults() {
    for (let key of Object.keys(DEFAULT_DB)) {
        if (!(key in DB)) { DB[key] = DEFAULT_DB[key]; continue; }
        if (typeof DEFAULT_DB[key] === 'object' &&!Array.isArray(DEFAULT_DB[key])) {
            for (let subKey of Object.keys(DEFAULT_DB[key])) {
                if (!(subKey in DB[key])) DB[key][subKey] = DEFAULT_DB[key][subKey];
            }
        }
    }
})();
if (!DB.aiSettings) DB.aiSettings = { apiKey: '', useAI: true };
if (!DB.history) DB.history = [];
if (DB.darkMode === undefined) DB.darkMode = false;

const saveDB = () => localStorage.setItem(DB_KEY, JSON.stringify(DB));
const $ = id => document.getElementById(id);
const fmtPHP = n => '₱' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const safeId = str => str.replace(/[^a-zA-Z0-9]/g, '_');

function slabCost(E, rates) {
  const [r0, r1, r2] = rates;
  let t1 = Math.min(E, 10), rem = E - t1;
  let t2 = Math.min(Math.max(rem, 0), 30), rem2 = rem - t2;
  let t3 = Math.max(rem2, 0);
  return { t1, t2, t3, c1: t1*r0, c2: t2*r1, c3: t3*r2, total: t1*r0 + t2*r1 + t3*r2 };
}

let currentRole = null, chatContext = [];

function attemptLogin() {
  const u = $('loginUser').value.trim(), p = $('loginPass').value.trim();
  if (!u ||!p) return toast('Please enter credentials');
  const cashier = DB.creds.cashier, supervisor = DB.creds.supervisor;
  if (u === cashier.u && p === cashier.p) {
    currentRole = 'cashier';
    postLogin();
  } else if (u === supervisor.u && p === supervisor.p) {
    currentRole = 'supervisor';
    postLogin();
  } else {
    toast('Invalid username or password');
  }
}

function logout() {
  currentRole = null;
  chatContext = [];
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('loginOverlay').style.display = 'flex';
  $('roleBadge').textContent = '';
  $('drawerMenu').innerHTML = '';
}

function postLogin() {
  $('loginOverlay').style.display = 'none';
  $('roleBadge').textContent = currentRole === 'supervisor'? '👑 Supervisor' : '💼 Cashier';
  applyTheme();
  buildDrawerMenu();
  showView('dashboard');
}

function applyTheme() {
  document.body.classList.toggle('light-mode',!DB.darkMode);
  $('darkLightToggle').textContent = DB.darkMode? '🌙' : '☀️';
}
function toggleTheme() {
  DB.darkMode =!DB.darkMode; saveDB(); applyTheme();
}

function buildDrawerMenu() {
  const items = [
    { view:'dashboard', icon:'🏠', label:'Dashboard' },
    { view:'calculator', icon:'🧮', label:'Baggage Calc' },
    { view:'ar', icon:'📷', label:'AR Scanner' },
    { view:'map', icon:'🗺️', label:'Live Map' },
    { view:'fares', icon:'💵', label:'Fares & Slabs' },
    { view:'schedules', icon:'🕐', label:'Schedules' },
    { view:'history', icon:'📋', label:'History' },
    { view:'admin', icon:'🔐', label:'Admin' }
  ];
  if (currentRole === 'supervisor') {
    items.push({ view:'admin', icon:'⚙️', label:'Admin Panel' });
  }
  $('drawerMenu').innerHTML = items.map(i =>
    `<div class="drawer-item" data-view="${i.view}" onclick="navigate('${i.view}')"><i>${i.icon}</i> ${i.label}</div>`
  ).join('');
}

function toggleDrawer() {
  $('sideDrawer').classList.toggle('open');
  $('overlay').classList.toggle('show');
  $('hamburger').classList.toggle('open');
}
function closeDrawer() {
  $('sideDrawer').classList.remove('open');
  $('overlay').classList.remove('show');
  $('hamburger').classList.remove('open');
}
function navigate(view) { closeDrawer(); showView(view); }

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $(`view-${name}`).classList.add('active');
  document.querySelectorAll('.drawer-item').forEach(el => el.classList.remove('active'));
  const item = document.querySelector(`.drawer-item[data-view="${name}"]`);
  if (item) item.classList.add('active');
  switch (name) {
    case 'dashboard': buildDashboard(); break;
    case 'calculator': buildCalculator(); break;
    case 'fares': buildFares(); break;
    case 'schedules': buildSchedules(); break;
    case 'history': buildHistory(); break;
    case 'admin': buildAdmin(); break;
    case 'ar': buildAR(); break;
    case 'map': buildMap(); break;
  }
}

function buildDashboard() {
  $('view-dashboard').innerHTML = `
    <div class="grid2">
      <div class="stat-box"><div class="stat-value" id="statTrans">0</div><div class="stat-label">Transactions</div></div>
      <div class="stat-box"><div class="stat-value" id="statRev">₱0</div><div class="stat-label">Revenue</div></div>
      <div class="stat-box"><div class="stat-value" id="statKg">0kg</div><div class="stat-label">Total Weight</div></div>
      <div class="stat-box"><div class="stat-value" id="statTop">--</div><div class="stat-label">Top Route</div></div>
    </div>
    <div class="card" style="margin-top:12px"><div class="card-header">🤖 AI Load Predictor</div><div id="aiPredictor" style="font-size:0.85rem"></div></div>
    <div class="card" style="margin-top:12px"><div class="card-header">📊 Route Activity</div><canvas id="miniChart" width="300" height="100" style="width:100%"></canvas></div>
    <div class="card">
      <div class="card-header" style="justify-content:space-between">
        <span>🕐 Recent</span>
        <div class="search-bar" style="width:160px;margin:0"><input id="dashSearch" placeholder="Filter..." oninput="updateDashboard()"></div>
      </div>
      <div id="recentList"></div>
    </div>
  `;
  updateDashboard();
}

function updateDashboard() {
  const s = DB.stats;
  $('statTrans').textContent = s.transactions;
  $('statRev').textContent = fmtPHP(s.revenue);
  $('statKg').textContent = s.totalKg + 'kg';
  $('statTop').textContent = s.topRoute || '--';
  const search = ($('dashSearch')?.value || '').toLowerCase();
  const rec = DB.comps.slice(-20).reverse().filter(c =>
  !search || c.route.toLowerCase().includes(search) || fmtPHP(c.total).includes(search)
  ).slice(0,5);
  $('recentList').innerHTML = rec.length? rec.map(c => `
    <div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:0.8rem">
      <span style="color:var(--accent)">${c.route.toUpperCase()}</span> | ${c.mode} | ${c.pax||1}pax | ${c.weight}kg → <b>${fmtPHP(c.total)}</b>
    </div>
  `).join('') : '<p style="color:var(--text3)">No matching transactions</p>';
  
  // AI Load Predictor
  const coreRoutes = ['cebu_tagbilaran','cebu_ormoc','cebu_palompon','cebu_dumaguete','cebu_surigao','cebu_siquijor'];
  const day = new Date().getDay();
  const isWeekend = day===0 || day===6;
  const mult = isWeekend ? 1.3 : 1.0;
  const preds = coreRoutes.map(k => {
    const sched = DB.schedules[k];
    const trips = sched ? sched.trips.length : 0;
    const base = trips * 28;
    const hist = DB.comps.filter(c => c.route===k).length;
    const score = Math.round((base + hist*5) * mult);
    return {k, name: k.split('_')[1].toUpperCase(), score, trips};
  }).sort((a,b)=>b.score-a.score).slice(0,3);
  const predEl = $('aiPredictor');
  if (predEl) {
    predEl.innerHTML = preds.map(p => {
      const pct = Math.min(100, Math.round(p.score/ (preds[0].score||1)*100));
      return `<div style="margin:6px 0"><div style="display:flex;justify-content:space-between"><b>${p.name}</b><span>${p.score} est. bags</span></div><div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--accent),#ff9f43)"></div></div><div style="font-size:0.7rem;color:var(--text3)">${p.trips} trips today • ${isWeekend?'Weekend boost':'Weekday'}</div></div>`;
    }).join('');
  }

  drawMiniChart();
}

function drawMiniChart() {
  const canvas = $('miniChart'); if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const counts = DB.stats.routeCounts || {};
  const routes = Object.keys(counts).sort((a,b) => counts[b]-counts[a]).slice(0,5);
  const values = routes.map(k => counts[k]);
  const max = Math.max(...values, 1);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const barW = (canvas.width / Math.max(routes.length,1)) - 8;
  routes.forEach((route, i) => {
    const h = (values[i]/max)*80;
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(i*(barW+8), 100-h, barW, h);
    ctx.font = '8px sans-serif'; ctx.fillStyle = '#edeffc';
    ctx.fillText(route.substring(0,5), i*(barW+8), 115);
  });
}

function buildCalculator() {
  $('view-calculator').innerHTML = `
    <div class="card glow">
      <div class="card-header">🧮 Baggage Calculator</div>
      <div class="input-group"><label>Route</label><select id="calcRoute">${['cebu_tagbilaran','cebu_ormoc','cebu_palompon','cebu_dumaguete','cebu_surigao','cebu_siquijor'].map(k => `<option value="${k}">${k.split('_')[1].toUpperCase()}</option>`).join('')}</select></div>
      <div class="input-group"><label>Mode</label><select id="calcMode"><option value="normal">Normal</option><option value="fragile">Fragile</option></select></div>
      <div id="normalFields">
        <div class="grid2">
          <div class="input-group"><label>Class</label><select id="calcClass"><option value="tourist">Tourist (10kg)</option><option value="business">Business (20kg)</option></select></div>
          <div class="input-group"><label>Passengers</label><input type="number" id="pax" value="1" min="1"></div>
        </div>
      <div class="input-group"><label>Total Weight (kg)</label><input type="number" id="weight" value="0" step="0.1" min="0"></div>
      <div class="input-group"><label>Rounding</label><select id="rounding"><option value="exact">Exact</option><option value="floor">Floor E (whole kg)</option></select></div>
      <button class="primary block" onclick="compute()">💳 Compute Fee</button>
      <button class="accent block" style="margin-top:6px" onclick="cashierAdjust()">💵 Smart Adjustment</button>
    </div>
    <div id="resultCard" class="card" style="display:none">
      <div class="result-banner"><div class="result-total" id="totalDisplay"></div><div id="perPaxDisplay" style="color:var(--text2);font-weight:600"></div></div>
      <div class="steps" id="stepsDisplay"></div>
    </div>
    <div class="receipt" id="receipt"></div>
  `;
  $('calcRoute').value = 'cebu_ormoc';
  $('calcMode').addEventListener('change', () => {
    const isFragile = $('calcMode').value === 'fragile'; const grid = $('normalFields').querySelector('.grid2'); if(grid) grid.style.display = isFragile ? 'none' : 'grid';
  });
}

function getCalcParams() {
  return {
    route: $('calcRoute').value,
    mode: $('calcMode').value,
    cls: $('calcClass').value,
    pax: parseInt($('pax').value)||1,
    weight: parseFloat($('weight').value)||0,
    rounding: $('rounding').value
  };
}

let lastReceiptText = '';

function compute(override = null) {
  const p = override || getCalcParams();
  const { route, mode, cls, pax, weight, rounding } = p;
  const free = mode === 'normal'? DB.freeAllowance[cls] : 0;
  const freeTotal = free * pax;
  let excess = weight - freeTotal;
  if (excess < 0) excess = 0;
  let E = mode === 'normal'? excess / pax : weight;
  if (rounding === 'floor') E = Math.floor(E);
  const slab = slabCost(E, DB.slabs[route][mode]);
  const perPax = slab.total;
  const total = mode === 'normal'? perPax * pax : perPax;

  const steps = [
    `Free: ${free}kg × ${pax}pax = ${freeTotal}kg`,
    `Excess: ${weight}kg → ${excess.toFixed(1)}kg`,
    `E/pax: ${excess.toFixed(1)} ÷ ${pax} = ${E.toFixed(2)}kg`
  ];
  if (slab.t1>0) steps.push(`Tier1: ${slab.t1.toFixed(1)}kg × ₱${DB.slabs[route][mode][0]} = ₱${slab.c1.toFixed(2)}`);
  if (slab.t2>0) steps.push(`Tier2: ${slab.t2.toFixed(1)}kg × ₱${DB.slabs[route][mode][1]} = ₱${slab.c2.toFixed(2)}`);
  if (slab.t3>0) steps.push(`Tier3: ${slab.t3.toFixed(1)}kg × ₱${DB.slabs[route][mode][2]} = ₱${slab.c3.toFixed(2)}`);
  steps.push(`Per pax: ₱${perPax.toFixed(2)}`);
  steps.push(`Total: ${fmtPHP(total)}`);

  $('totalDisplay').textContent = fmtPHP(total);
  $('perPaxDisplay').textContent = mode==='normal'? `₱${perPax.toFixed(2)} per passenger` : 'Fragile cargo';
  $('stepsDisplay').innerHTML = steps.map(s => `<div>• ${s}</div>`).join('');
  $('resultCard').style.display='block';

  const receiptHtml = `
    <div style="text-align:center;font-weight:bold;font-size:1rem;margin-bottom:6px">⛴ Ocean Fast Ferries</div>
    <div style="text-align:center;font-size:0.7rem;margin-bottom:8px">BAGGAGE FEE RECEIPT</div>
    <div>Route: <b>${route.toUpperCase()}</b></div><div>Mode: <b>${mode.toUpperCase()}</b></div>
    <div>${mode==='normal'?`Class: <b>${cls}</b> | Pax: <b>${pax}</b>`:`Fragile Cargo`}</div>
    <div>Weight: <b>${weight} kg</b></div>
    <hr style="margin:6px 0">${steps.map(s => `<div>${s}</div>`).join('')}<hr style="margin:6px 0">
    <div style="text-align:center;font-weight:bold;font-size:1.1rem">💵 TOTAL: ${fmtPHP(total)}</div>
    <div class="qr-code"></div>
    <div style="font-size:0.65rem;margin-top:6px;text-align:center">${new Date().toLocaleString()}</div>
  `;
  $('receipt').innerHTML = receiptHtml + `<div class="receipt-download-btn" onclick="downloadReceipt()">⬇</div>`;
  $('receipt').style.display = 'block';
  lastReceiptText = receiptHtml.replace(/<[^>]*>/g, '');

  if (!override) {
    DB.stats.transactions++; DB.stats.revenue+=total; DB.stats.totalKg+=weight;
    if (!DB.stats.routeCounts[route]) DB.stats.routeCounts[route]=0;
    DB.stats.routeCounts[route]++;
    let top='',max=0;
    for(let [k,v] of Object.entries(DB.stats.routeCounts)) if(v>max){max=v;top=k;}
    DB.stats.topRoute=top;
    DB.comps.push({route,mode,cls,pax,weight,total,time:new Date().toISOString()});
    DB.history.push({route,mode,cls,pax,weight,total,time:new Date().toISOString()});
    saveDB(); updateDashboard();
  }
}

function downloadReceipt() {
  if (!lastReceiptText) return;
  const blob = new Blob([lastReceiptText], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ocean_receipt_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.txt`;
  a.click();
}

function cashierAdjust() {
  const p = getCalcParams();
  if (p.mode === 'fragile') {
    let w = p.weight;
    if (w <= 0) { toast('Enter weight first'); return; }
    for (let testW = Math.floor(w)-1; testW >= 0; testW--) {
      let slab = slabCost(testW, DB.slabs[p.route].fragile);
      let tot = slab.total;
      if (Math.abs(tot % 1) < 0.001 && tot > 0) {
        $('weight').value = testW;
        compute();
        toast(`Adjusted to ${testW}kg → ${fmtPHP(tot)}`);
        return;
      }
    }
    toast('No whole-peso total found for Fragile');
    return;
  }
  const free = DB.freeAllowance[p.cls] * p.pax;
  let excess = p.weight - free;
  if (excess <= 0) { toast('No excess to adjust'); return; }
  for (let e = Math.floor(excess)-1; e>=0; e--) {
    let testW = e + free;
    let E = e / p.pax;
    let slab = slabCost(E, DB.slabs[p.route].normal);
    let tot = slab.total * p.pax;
    if (Math.abs(tot % 1) < 0.001) {
      $('weight').value = testW;
      compute();
      toast(`Adjusted to ${testW}kg → ${fmtPHP(tot)}`);
      return;
    }
  }
  toast('No whole-peso total found');
}

function buildFares() {
  $('view-fares').innerHTML = `
    <div class="card glow">
      <div class="card-header">💵 Passenger Fares</div>
      <select id="fareRoute" onchange="renderFareTable()">${['cebu_tagbilaran','cebu_ormoc','cebu_palompon','cebu_dumaguete','cebu_surigao','cebu_siquijor'].map(r => `<option value="${r}">${r.split('_')[1].toUpperCase()}</option>`).join('')}</select>
      <div id="fareTable" style="margin-top:8px"></div>
    </div>
    <div class="card"><div class="card-header">📦 Slab Rates (per kg)</div><div id="slabDisplay"></div></div>
  `;
  renderFareTable();
  renderSlabDisplay();
}

function renderFareTable() {
  const key = $('fareRoute').value, data = DB.paxFares[key];
  if (!data) return;
  $('fareTable').innerHTML = `<table>${Object.entries(data).map(([cls,price]) => `<tr><td>${cls}</td><td style="text-align:right;font-weight:600">${price!=null?fmtPHP(price):'—'}</td></tr>`).join('')}</table>`;
}

function renderSlabDisplay() {
  $('slabDisplay').innerHTML = Object.entries(DB.slabs).map(([k,v]) => `<div style="margin-bottom:6px;padding:6px;background:var(--bg-surface);border-radius:8px"><b style="color:var(--accent)">${k.toUpperCase()}</b><br>Normal: ${v.normal.join(' / ')} &nbsp;|&nbsp; Fragile: ${v.fragile.join(' / ')}</div>`).join('');
}

function buildSchedules() {
  $('view-schedules').innerHTML = `
    <div class="card glow">
      <div class="card-header">🕐 Trip Schedules</div>
      <select id="schedRoute" onchange="renderSchedule()">${Object.entries(DB.schedules).filter(([k,v])=>v && v.title).map(([k,v]) => `<option value="${k}">${v.title}</option>`).join('')}</select>
      <div id="schedList"></div>
    </div>
  `;
  renderSchedule();
}

function renderSchedule() {
  const key = $('schedRoute').value, data = DB.schedules[key];
  if (!data) return;
  const fare = DB.paxFares[key];
  const fareHtml = fare ? `<div style="margin:8px 0;padding:8px;background:rgba(0,255,255,0.05);border:1px solid var(--border);border-radius:8px"><b>Fares:</b> Tourist ₱${fare['TC/OA']} | Business ₱${fare['BC']} | Student ₱${fare['ST']} | Minor ₱${fare['MI']}</div>` : '';
  const tripsHtml = data.trips.length? data.trips.map(t => `<div class="trip-row"><b>${t.dep}</b> → <b>${t.arr||''}</b> &nbsp;|&nbsp; ${t.vessel}${t.remarks?`<br><small style="color:var(--text3)">📌 ${t.remarks}</small>`:''}</div>`).join('') : '<p style="color:var(--text2)">No trips scheduled</p>';
  $('schedList').innerHTML = `
    <div style="color:var(--text3);margin-bottom:10px">⏱ Travel time: <b>${data.travel}</b></div>
    ${fareHtml}
    ${tripsHtml}
  `;
}

function buildHistory() {
  $('view-history').innerHTML = `
    <div class="card glow"><div class="card-header">📋 Transaction History</div>
      <div id="historyList" style="max-height:400px;overflow-y:auto;"></div>
      <button class="sm danger" style="margin-top:8px" onclick="clearHistory()">Clear All</button>
    </div>
  `;
  renderHistory();
}

function renderHistory() {
  const list = DB.history.slice().reverse();
  $('historyList').innerHTML = list.length? list.map(h => `
    <div style="padding:8px;margin:4px 0;background:var(--bg-surface);border-radius:10px;font-size:0.8rem">
      <span style="color:var(--accent)">${h.route.toUpperCase()}</span> | ${h.mode} | ${h.pax||'—'}pax | ${h.weight}kg → <b>${fmtPHP(h.total)}</b>
      <br><small style="color:var(--text3)">${new Date(h.time).toLocaleString()}</small>
    </div>`).join('') : '<p style="color:var(--text3)">No history yet</p>';
}

function clearHistory() {
  if (confirm('Delete all history?')) {
    DB.history = []; DB.comps = [];
    DB.stats = { transactions:0, revenue:0, totalKg:0, topRoute:'', routeCounts:{} };
    saveDB(); renderHistory(); updateDashboard(); toast('History cleared');
  }
}

function buildAdmin() {
  if(currentRole!=='supervisor'){ $('loginOverlay').style.display='flex'; toast('Supervisor login required'); return; }
  $('view-admin').innerHTML = `
    <div class="card glow">
      <div class="card-header">🛡 Supervisor Panel</div>
      <div class="grid2" style="margin-bottom:12px">
        <button class="accent sm block" onclick="showAdminView('routes')">Routes</button>
        <button class="accent sm block" onclick="showAdminView('pricing')">Pricing</button>
        <button class="accent sm block" onclick="showAdminView('analytics')">Analytics</button>
        <button class="accent sm block" onclick="showAdminView('settings')">Settings</button>
      </div>
      <div id="adminContent"></div>
    </div>
  `;
  showAdminView('routes');
}

function showAdminView(section) {
  const content = $('adminContent');
  if (section === 'routes') {
    content.innerHTML = `<div class="card-header">Route Management</div>` +
      Object.keys(DB.slabs).map(route => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:var(--bg-surface);border-radius:8px;margin-bottom:6px">
          <b>${route.toUpperCase()}</b>
          <div>
            <button class="sm" onclick="editRouteSlabs('${route}')">Edit Slabs</button>
            <button class="sm danger" onclick="removeRoute('${route}')">Delete</button>
          </div>
        </div>`).join('') +
      `<button class="sm primary block" onclick="addNewRoute()" style="margin-top:8px">➕ Add Route</button>`;
  } else if (section === 'pricing') {
    let html = '<div class="card-header">Pricing Editor</div>';
    for (let route of Object.keys(DB.paxFares)) {
      html += `<div style="margin-bottom:8px"><b>${route}</b>`;
      for (let cls of Object.keys(DB.paxFares[route])) {
        const uniqueId = safeId(`fare_${route}_${cls}`);
        html += `<div style="display:flex;gap:8px;align-items:center;margin:4px 0">
          <span style="width:60px">${cls}</span>
          <input type="number" id="${uniqueId}" value="${DB.paxFares[route][cls]}" step="0.01" style="flex:1;padding:6px;font-size:0.8rem">
        </div>`;
      }
      html += `</div>`;
    }
    html += `<button class="sm primary block" onclick="saveAllFares()">Save Fares</button>`;
    content.innerHTML = html;
  } else if (section === 'analytics') {
    const s = DB.stats;
    content.innerHTML = `
      <div class="card-header">Analytics</div>
      <p>Transactions: <b>${s.transactions}</b></p>
      <p>Revenue: <b>${fmtPHP(s.revenue)}</b></p>
      <p>Total Weight: <b>${s.totalKg} kg</b></p>
      <p>Top Route: <b>${s.topRoute || 'N/A'}</b></p>
      <p>Avg per txn: <b>${s.transactions>0?fmtPHP(s.revenue/s.transactions):'N/A'}</b></p>`;
  } else if (section === 'settings') {
    content.innerHTML = `
      <div class="card-header">⚙️ Settings</div>
      <div class="input-group" style="margin-top:8px">
        <label>🤖 Gemini API Key <small>(free from <a href="https://aistudio.google.com/apikey" target="_blank" style="color:var(--accent)">Google AI Studio</a>)</small></label>
        <div style="display:flex;gap:6px">
          <input type="password" id="apiKeyInput" value="${DB.aiSettings.apiKey||''}" placeholder="Paste API key here">
          <button class="primary sm" onclick="saveApiKey()">Save</button>
          <button class="danger sm" onclick="clearApiKey()">Clear</button>
        </div>
      </div>
      <div class="input-group" style="margin-top:12px">
        <label>Enable AI responses <small>(online required)</small></label>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
          <input type="checkbox" id="useAICheck" ${DB.aiSettings.useAI?'checked':''} onchange="toggleAI(this.checked)" style="width:auto;margin:0">
          <span>Use Gemini API when available</span>
        </label>
      </div>
      <hr style="margin:12px 0;border-color:var(--border)">
      <button class="primary block" onclick="exportDatabase()">📥 Export Backup</button>
      <label class="accent block" style="cursor:pointer;text-align:center;margin:8px 0;padding:10px;border-radius:10px">📤 Import Backup<input type="file" accept=".json" hidden onchange="importDatabase(event)"></label>
      <button class="block" onclick="changeCredentials()">🔑 Change Credentials</button>
      <button class="block danger" onclick="resetApp()">⚠️ Reset All Data</button>
    `;
  }
}

function editRouteSlabs(route) {
  const s = DB.slabs[route];
  const overlay = document.createElement('div'); overlay.className='modal-overlay';
  overlay.innerHTML = `<div class="modal">
    <h3>Edit Slabs: ${route.toUpperCase()}</h3>
    <div class="grid2">
      <div class="input-group"><label>Normal 1-10kg</label><input id="n0" type="number" value="${s.normal[0]}" step="0.01"></div>
      <div class="input-group"><label>Normal 11-40kg</label><input id="n1" type="number" value="${s.normal[1]}" step="0.01"></div>
      <div class="input-group"><label>Normal 41+kg</label><input id="n2" type="number" value="${s.normal[2]}" step="0.01"></div>
      <div class="input-group"><label>Fragile 1-10kg</label><input id="f0" type="number" value="${s.fragile[0]}" step="0.01"></div>
      <div class="input-group"><label>Fragile 11-40kg</label><input id="f1" type="number" value="${s.fragile[1]}" step="0.01"></div>
      <div class="input-group"><label>Fragile 41+kg</label><input id="f2" type="number" value="${s.fragile[2]}" step="0.01"></div>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px"><button class="primary sm" id="saveSlabBtn">Save</button><button class="sm" onclick="this.closest('.modal-overlay').remove()">Cancel</button></div>
  </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#saveSlabBtn').onclick = () => {
    DB.slabs[route] = {
      normal: [+overlay.querySelector('#n0').value, +overlay.querySelector('#n1').value, +overlay.querySelector('#n2').value],
      fragile: [+overlay.querySelector('#f0').value, +overlay.querySelector('#f1').value, +overlay.querySelector('#f2').value]
    };
    saveDB(); toast('Slabs updated'); overlay.remove();
  };
}

function removeRoute(route) {
  if (confirm(`Delete route "${route}"?`)) {
    delete DB.slabs[route]; delete DB.schedules[route]; delete DB.paxFares[route];
    saveDB(); showAdminView('routes'); toast('Route removed');
  }
}

function addNewRoute() {
  const name = prompt('Enter new route key (e.g., "cebu-bohol")');
  if (!name) return;
  const key = name.toLowerCase().trim();
  if (DB.slabs[key]) return toast('Route already exists');
  DB.slabs[key] = { normal:[0,0,0], fragile:[0,0,0] };
  DB.schedules[key] = { title:name, travel:'?', trips:[] };
  DB.paxFares[key] = { 'TC/OA':0, 'BC':0, 'ST':0, 'MI':0 };
  saveDB(); showAdminView('routes'); toast('Route added');
}

function saveAllFares() {
  for (let route of Object.keys(DB.paxFares)) {
    for (let cls of Object.keys(DB.paxFares[route])) {
      const uniqueId = safeId(`fare_${route}_${cls}`);
      const inp = document.getElementById(uniqueId);
      if (inp) DB.paxFares[route][cls] = parseFloat(inp.value) || 0;
    }
  }
  saveDB(); toast('Fares saved');
}

function changeCredentials() {
  const role = prompt('Change credentials for (cashier/supervisor)?', 'supervisor');
  if (!role ||!['cashier','supervisor'].includes(role)) return;
  const u = prompt(`New ${role} username`, DB.creds[role]?.u || '');
  const p = prompt(`New ${role} password`, DB.creds[role]?.p || '');
  if (!u ||!p) return;
  DB.creds[role] = { u, p }; saveDB(); toast('Credentials updated');
}

function exportDatabase() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type:'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `ocean_ferries_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

function importDatabase(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.slabs) throw new Error('Invalid');
      Object.assign(DB, data); saveDB(); toast('Restored'); location.reload();
    } catch { toast('Invalid file'); }
  };
  reader.readAsText(file);
}

function resetApp() {
  if (confirm('⚠️ Erase all data?')) {
    if (confirm('FINAL WARNING!')) {
      localStorage.removeItem(DB_KEY); setTimeout(() => location.reload(), 500);
    }
  }
}

function saveApiKey() {
  DB.aiSettings.apiKey = $('apiKeyInput').value.trim();
  saveDB();
  toast('API key saved');
}

function clearApiKey() {
  DB.aiSettings.apiKey = '';
  $('apiKeyInput').value = '';
  saveDB();
  toast('API key removed');
}

function toggleAI(state) {
  DB.aiSettings.useAI = state;
  saveDB();
  toast(state? 'AI enabled' : 'Using offline rules only');
}

function toggleChat() { $('chatPanel').classList.toggle('open'); }

function addChatMsg(who, text) {
  const div = document.createElement('div');
  div.className = `chat-bubble ${who}`;
  div.textContent = text;
  $('chatBody').appendChild(div);
  div.scrollIntoView(false);
}

function showLoading() {
  const div = document.createElement('div');
  div.className = 'loading-dot';
  div.innerHTML = '<span></span><span></span>';
  $('chatBody').appendChild(div);
  div.scrollIntoView(false);
  return div;
}

function removeLoading(div) { if (div) div.remove(); }

async function sendAIChat() {
  const q = $('chatInput').value.trim();
  if (!q) return;
  addChatMsg('user', q);
  $('chatInput').value = '';
  $('sendBtn').disabled = true;

  let response = '';
  const useAPI = DB.aiSettings.useAI && DB.aiSettings.apiKey && navigator.onLine;

  if (useAPI) {
    const loading = showLoading();
    try {
      response = await fetchGeminiResponse(q, chatContext);
      removeLoading(loading);
      if (!response) response = aiOfflineRespond(q);
    } catch {
      removeLoading(loading);
      response = aiOfflineRespond(q);
    }
  } else {
    response = aiOfflineRespond(q);
  }

  addChatMsg('bot', response);
  chatContext.push({ role:'user', content:q });
  chatContext.push({ role:'assistant', content:response });
  $('sendBtn').disabled = false;
}

async function fetchGeminiResponse(query, context) {
  const apiKey = DB.aiSettings.apiKey;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const systemPrompt = `You are the official AI assistant for Ocean Fast Ferries (Cebu, Philippines).
Routes: Tagbilaran, Ormoc, Palompon, Dumaguete, Surigao, Getafe, Siquijor.
Baggage slabs: ${JSON.stringify(DB.slabs)}. Passenger fares: ${JSON.stringify(DB.paxFares)}.
Answer in a friendly, helpful tone. Always compute baggage fees using the slab rates if asked.
If you don't know something, say you'll connect to a human agent. Keep replies short.`;
  const recentContext = context.slice(-6).map(c => `${c.role}: ${c.content}`).join('\n');
  const body = {
    contents: [{ parts: [{ text: `${systemPrompt}\n\nPrevious chat:\n${recentContext}\nUser: ${query}` }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 512 }
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text? text.trim() : null;
  } catch {
    return null;
  }
}

function aiOfflineRespond(q) {
  const ql = q.toLowerCase();
  if (/^(hi|hello|hey)/i.test(ql)) return "Hello! 👋 I'm the Ocean Fast Ferries genius AI. Ask me anything about baggage, fares, schedules, connections, or even tourist tips.";
  if (/thank(s| you)/i.test(ql)) return "You're very welcome! 😊 Need anything else?";
  if (/bye|good night|see you/i.test(ql)) return "Safe travels! ⛴ Goodbye!";
  if (ql.includes('help') || ql.includes('what can you')) return "I can:\n• Compute baggage fees (e.g., 'Price 2 pax 45kg Ormoc')\n• Show passenger fares\n• Display trip schedules\n• Explain connections (e.g., Cebu→Siquijor)\n• Tourist info\nJust ask naturally!";
  let calcMatch = q.match(/(\d+)\s*(?:pax|passengers?)?\s*(\d+\.?\d*)\s*(?:kg|kilos?)?\s*([a-zA-Z\s-]+)/i);
  if (!calcMatch) calcMatch = q.match(/(?:compute|calculate|how much|cost|price|fee)\s+(?:for\s+)?(\d+)\s*(?:pax|passengers?)?\s*(\d+\.?\d*)\s*(?:kg|kilos?)?\s*([a-zA-Z\s-]+)/i);
  if (calcMatch &&!isNaN(+calcMatch[1]) &&!isNaN(+calcMatch[2])) {
    const pax = +calcMatch[1], kg = +calcMatch[2], rw = calcMatch[3].toLowerCase().trim();
    const route = Object.keys(DB.slabs).find(r => rw.includes(r) || r.includes(rw));
    if (!route) return `I don't recognize route "${rw}". Available: ${Object.keys(DB.slabs).join(', ')}.`;
    const free = DB.freeAllowance.tourist;
    const excess = Math.max(0, kg - free*pax);
    const E = excess/pax;
    const total = slabCost(E, DB.slabs[route].normal).total * pax;
    return `📊 Normal baggage ${route.toUpperCase()}:\nPassengers: ${pax}\nWeight: ${kg}kg\nFree (tourist): ${free}kg×${pax}=${free*pax}kg\nExcess: ${excess.toFixed(1)}kg\nExcess/pax: ${E.toFixed(2)}kg\n\n💵 Total fee: ${fmtPHP(total)}`;
  }
  if (/\b(fare|ticket|price|cost)\b/i.test(q)) {
    for (let routeName of Object.keys(DB.paxFares)) {
      const simple = routeName.replace(/[^a-z ]/gi,' ').toLowerCase().trim();
      if (q.includes(simple) || simple.split(' ').some(w => q.includes(w))) {
        let cls = 'TC/OA';
        if (/business|bc/i.test(q)) cls='BC';
        else if (/student|st/i.test(q)) cls='ST';
        else if (/military|mi/i.test(q)) cls='MI';
        const price = DB.paxFares[routeName][cls];
        if (price) return `Passenger fare ${routeName} (${cls}): ${fmtPHP(price)}`;
      }
    }
    return "Passenger fares (Tourist/TC):\n• Tagbilaran ₱1,000\n• Ormoc/Palompon ₱1,430\n• Dumaguete ₱2,170\n• Surigao ₱2,470\n• Getafe ₱585\n• Siquijor ₱1,200\nAsk for Business, Student, Military.";
  }
  if (/\b(schedule|trip|depart|time|vessel)\b/i.test(q)) {
    for (let routeKey of Object.keys(DB.schedules)) {
      if (q.includes(routeKey) || q.includes(DB.schedules[routeKey].title.toLowerCase())) {
        const sched = DB.schedules[routeKey];
        if (!sched.trips.length) return `No scheduled trips for ${sched.title} yet.`;
        return sched.trips.slice(0,6).map(t => `🕐 ${t.dep} → ${t.arr} (${t.vessel})${t.remarks?' - '+t.remarks:''}`).join('\n');
      }
    }
    return "Schedules available for: Tagbilaran, Ormoc, Getafe, Siquijor. Which route?";
  }
  if (/siquijor/i.test(q)) {
    if (q.includes('how to get') || q.includes('connection') || q.includes('go to')) {
      return "⛴ Cebu to Siquijor:\n• Direct ferry: OJ 788 (9:30 AM & 5:40 PM) - approx 3.5h\n• Via Tagbilaran: many trips, then connecting ferry (Tagbilaran→Siquijor, approx 1.5h). Total travel ~3.5h.\nFare (passenger) starts at ₱1,200.";
    }
    return "Siquijor route is available! Direct and via Tagbilaran. Fares start at ₱1,200 (Tourist). Ask for more details.";
  }
  if (/(free|allowance|free kg)/i.test(q)) return "Tourist: 10kg free per pax.\nBusiness: 20kg free per pax.";
  if (/(routes|destinations|where do you go)/i.test(q)) return "We sail to: Tagbilaran, Ormoc, Palompon, Dumaguete, Surigao, Getafe, and Siquijor.";
  if (/(ocean fast|about|company)/i.test(q)) return "Ocean Fast Ferries operates fast craft services in the Visayas region, connecting Cebu to major islands with reliable schedules. Baggage Pro is our intelligent management system.";
  if (/slab|rate per kg/i.test(q)) {
    let resp = "Slab rates (per kg) for normal baggage:\n";
    Object.entries(DB.slabs).forEach(([k,v])=> resp += `${k.toUpperCase()}: ${v.normal[0]} / ${v.normal[1]} / ${v.normal[2]}\n`);
    return resp;
  }
  return "I'm not sure how to answer that. Try:\n• 'Price 2 pax 30kg Tagbilaran'\n• 'Siquijor schedule'\n• 'Business fare to Ormoc'\n• 'Free allowance'\n• 'Help'";
}

function startVoice() {
  if (!('webkitSpeechRecognition' in window) &&!('SpeechRecognition' in window)) return toast('Voice input not supported on this device. Please use text.');
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new Recognition(); recognition.lang = 'en-US';
  recognition.onresult = (e) => { $('chatInput').value = e.results[0][0].transcript; sendAIChat(); };
  recognition.start();
}

function toast(msg) {
  const el = document.createElement('div'); el.className='toast'; el.textContent=msg;
  document.body.appendChild(el); setTimeout(()=>el.remove(),2500);
}

function updateDynamicBackground(){
    const h = new Date().getHours();
    let bg = '#070b19';
    if(h >= 5 && h < 8) bg = '#1a0f2e';
    else if(h >= 8 && h < 17) bg = '#0a1f3a';
    else if(h >= 17 && h < 19) bg = '#2e1a0f';
    document.documentElement.style.setProperty('--bg-base', bg);
}
updateDynamicBackground();
setInterval(updateDynamicBackground, 60000);

let touchStartX = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
});
document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    if(touchStartX < 50 && diff > 80) toggleDrawer();
    if(touchStartX > 200 && diff < -80) closeDrawer();
});

/* AR Scanner */
let arStream = null, arModel = null, arRunning = false;
async function buildAR(){
  $('view-ar').innerHTML = `
    <div class="card glow">
      <div class="card-header">📷 AR Baggage Scanner</div>
      <div class="ar-wrap">
        <video id="arVideo" class="ar-video" autoplay playsinline muted></video>
        <div id="arOverlay" class="ar-overlay"></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="primary sm block" onclick="startAR()">Start Camera</button>
        <button class="sm block" onclick="stopAR()">Stop</button>
      </div>
      <div id="arStatus" style="margin-top:8px;font-size:0.8rem;color:var(--text2)">Point camera at bags. AI will outline suitcases/backpacks.</div><div style="margin-top:8px;font-size:0.75rem;color:var(--text3)">If camera is blocked in embed, <a href="ar_scanner_standalone.html" target="_blank" style="color:var(--accent);text-decoration:underline">open standalone scanner</a>.</div>
    </div>
  `;
}
async function startAR(){
  try{
    arStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    const v = $('arVideo');
    v.srcObject = arStream;
    await v.play();
    if(!arModel) arModel = await cocoSsd.load();
    arRunning = true;
    toast('AR scanner active');
    arLoop();
  }catch(e){ console.error(e); if(window.top!==window.self){ toast('Camera blocked in embed'); $('arStatus').innerHTML='Camera access denied in iframe. <a href="ar_scanner_standalone.html" target="_blank" style="color:var(--accent);text-decoration:underline">Open standalone scanner</a>'; } else { toast('Camera access denied. Please allow permission.'); } }
}
function stopAR(){
  arRunning = false;
  if(arStream){ arStream.getTracks().forEach(t=>t.stop()); arStream=null; }
  $('arOverlay').innerHTML='';
}
async function arLoop(){
  if(!arRunning) return;
  const v = $('arVideo');
  const overlay = $('arOverlay');
  if(v.readyState===4 && arModel){
    const preds = await arModel.detect(v);
    overlay.innerHTML='';
    const vw = v.videoWidth, vh = v.videoHeight;
    const rect = v.getBoundingClientRect();
    const scaleX = rect.width / vw;
    const scaleY = rect.height / vh;
    preds.filter(p=>['suitcase','backpack','handbag'].includes(p.class)).forEach(p=>{
      const [x,y,w,h] = p.bbox;
      const box = document.createElement('div');
      box.className='ar-box';
      box.style.left = (x*scaleX)+'px';
      box.style.top = (y*scaleY)+'px';
      box.style.width = (w*scaleX)+'px';
      box.style.height = (h*scaleY)+'px';
      const label = document.createElement('div');
      label.className='ar-label';
      const estKg = Math.max(5, Math.round((w*h)/(vw*vh)*80));
      label.textContent = `${p.class} ~${estKg}kg`;
      box.appendChild(label);
      overlay.appendChild(box);
    });
    $('arStatus').textContent = preds.length? `Detected ${preds.length} object(s)` : 'Scanning...';
  }
  requestAnimationFrame(arLoop);
}

/* Live Map */
let map, vesselMarkers=[];
function buildMap(){
  $('view-map').innerHTML = `
    <div class="card glow">
      <div class="card-header">🗺️ Live Vessel Tracking</div>
      <div id="liveMap"></div>
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text2)">Simulated real-time positions. Updates every 3s.</div>
    </div>
  `;
  setTimeout(initMap,100);
}
function initMap(){
  if(map) return;
  map = L.map('liveMap',{zoomControl:false}).setView([10.3,124.0],7);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'©OpenStreetMap'}).addTo(map);
  const vessels = [
    {name:'OJ 388', route:'Cebu-Tagbilaran', lat:10.0, lng:123.9},
    {name:'OJ 788', route:'Cebu-Siquijor', lat:9.8, lng:123.5},
    {name:'OJ 8', route:'Cebu-Ormoc', lat:10.8, lng:124.6}
  ];
  vesselMarkers = vessels.map(v=>{
    const m = L.circleMarker([v.lat,v.lng],{radius:8,color:'#f43f5e',fillColor:'#fb923c',fillOpacity:0.9}).addTo(map);
    m.bindPopup(`<b>${v.name}</b><br>${v.route}<br>ETA: ${Math.floor(Math.random()*60)+20} min`);
    return {...v, marker:m};
  });
  setInterval(()=>{
    vesselMarkers.forEach(v=>{
      v.lat += (Math.random()-0.5)*0.02;
      v.lng += (Math.random()-0.5)*0.02;
      v.marker.setLatLng([v.lat,v.lng]);
    });
  },3000);
}

setInterval(()=>{ const c = $('clock'); if(c) c.textContent = new Date().toLocaleTimeString('en-PH',{hour12:true,hour:'2-digit',minute:'2-digit'}); },1000);
applyTheme();
// Login remains enabled. Use cashier/cashier or demo/demo.
