// =====================================================
// ===== STATE =========================================
// =====================================================
let state = {
  points: 0,
  activeTheme: 'default',
  unlockedThemes: ['default', 'light'],
  checkedTasks: {},
  pointsHistory: {},
  themeUsage: {},
  lastThemeSet: null,
  shownRecaps: [],
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calView: 'month',
  currentRecapTab: 'monthly',
  currentStatsTab: 'activity',
  soundOn: true,
  customBgUnlocked: false,
  customBg: null,
  categoryIcons: {},
  unlockedBadges: [],
  bonusTask: null,
  notifications: {},
  bestStreak: 0,
  streakGoal: null,
  boost: null,
  customTasks: {},       // { taskId: { name, pts, cat, days? } } — user-added tasks
  customCategories: {},  // { catId: { label, icon } } — user-added categories
  deletedTasks: [],      // [taskId] — built-in tasks the user deleted
  deletedCategories: [], // [catId] — built-in categories the user deleted
};

// =====================================================
// ===== CONSTANTS =====================================
// =====================================================
const taskMeta = {
  'etude-1':   { name:'Réviser les cours',                     pts:5, cat:'Études',          timeMin:60  },
  'etude-2':   { name:'Faire les exercices de la semaine',     pts:3, cat:'Études',          timeMin:45  },
  'etude-3':   { name:"Réviser l'anglais sur Duolingo",        pts:2, cat:'Études',          timeMin:30  },
  'etude-4':   { name:'Réviser le code',                       pts:5, cat:'Études',          timeMin:60  },
  'musique-1': { name:'Pratiquer la set liste de Wayward Ship', pts:1, cat:'Musique',        timeMin:45  },
  'musique-2': { name:'Pratiquer le solo de Hail to the King', pts:1, cat:'Musique',         timeMin:30  },
  'musique-3': { name:'Faire un TikTok guitare',               pts:1, cat:'Musique',         timeMin:20  },
  'sante-1':   { name:'Faire une séance de sport',             pts:4, cat:'Sport & Santé',   timeMin:60, days:[1,2,3,4,5] },
  'sante-2':   { name:'Pratiquer le skate',                    pts:2, cat:'Sport & Santé',   timeMin:45  },
  'sante-3':   { name:'Prendre son traitement',                pts:5, cat:'Sport & Santé',   timeMin:5   },
  'sante-4':   { name:"S'entraîner au Rubik's cube",           pts:2, cat:'Sport & Santé',   timeMin:20  },
  'sante-5':   { name:"Boire 2L d'eau",                        pts:2, cat:'Sport & Santé',   timeMin:5   },
  'sante-6':   { name:'Manger 5 fruits et légumes',            pts:4, cat:'Sport & Santé',   timeMin:10  },
  'sante-7':   { name:'Se coucher avant minuit',               pts:3, cat:'Sport & Santé',   timeMin:5   },
  'lycee-1':   { name:'Aller au lycée',                        pts:3, cat:'Lycée',           timeMin:480, days:[1,2,3,4,5] },
  'jeux-1':    { name:'Ouvrir les boosters Pokémon',           pts:2, cat:'Jeux',            timeMin:15  },
  'jeux-2':    { name:'Jouer à Pokémon GO',                    pts:1, cat:'Jeux',            timeMin:20  },
  'jeux-3':    { name:'Jouer à Arknights',                     pts:1, cat:'Jeux',            timeMin:20  },
  'jeux-4':    { name:'Gagner 5 niveaux Fortnite',             pts:1, cat:'Jeux',            timeMin:60  },
  'jeux-5':    { name:'Gérer le royaume sur Sylvaris',         pts:2, cat:'Jeux',            timeMin:30  },
  'culture-1': { name:'Regarder un film ou série',             pts:2, cat:'Culture & Médias',timeMin:90  },
  'culture-2': { name:'Lire un livre',                         pts:4, cat:'Culture & Médias',timeMin:45  },
  'culture-3': { name:'Écouter de la musique',                 pts:2, cat:'Culture & Médias',timeMin:30  },
  'culture-4': { name:'Découvrir un nouvel artiste',           pts:2, cat:'Culture & Médias',timeMin:20  },
  'reseaux-1': { name:'Faire les flammes Snap',                pts:1, cat:'Réseaux sociaux', timeMin:5   },
  'reseaux-2': { name:'Faire le BeReal',                       pts:1, cat:'Réseaux sociaux', timeMin:5   },
  'reseaux-3': { name:'Garder la série Twitch',                pts:1, cat:'Réseaux sociaux', timeMin:60  },
};

const bonusPool = [
  { name:'Faire 10 pompes',        pts:3 },
  { name:'Boire 2L d\'eau',        pts:2 },
  { name:'Ranger sa chambre',      pts:3 },
  { name:'Appeler un ami',         pts:2 },
  { name:'Méditer 5 minutes',      pts:2 },
  { name:'Écrire dans un journal', pts:3 },
  { name:'Apprendre 5 mots de vocabulaire', pts:3 },
  { name:'Faire une promenade',    pts:2 },
  { name:'Dessiner quelque chose', pts:2 },
  { name:'Cuisiner un repas',      pts:3 },
];

const BADGES = [
  { id:'first_task',   icon:'🌱', name:'Premier pas',       desc:'Cocher ta première tâche',                         check: s => s.totalEver >= 1 },
  { id:'streak3',      icon:'🔥', name:'3 jours de feu',    desc:'3 jours consécutifs actifs',                       check: s => s.streak >= 3 },
  { id:'streak7',      icon:'💥', name:'Semaine parfaite',   desc:'7 jours consécutifs',                              check: s => s.streak >= 7 },
  { id:'streak30',     icon:'🌟', name:'Mois de légende',    desc:'30 jours consécutifs !',                           check: s => s.streak >= 30 },
  { id:'streak365',    icon:'🗓️', name:'Une année entière',  desc:'Garder une série de 365 jours — légendaire !',     check: s => s.streak >= 365 },
  { id:'pts100',       icon:'💰', name:'Centurion',          desc:'Gagner 100 points au total',                       check: s => s.allTimeEarned >= 100 },
  { id:'pts500',       icon:'💎', name:'Demi-millénaire',    desc:'500 points au total',                              check: s => s.allTimeEarned >= 500 },
  { id:'pts1000',      icon:'👑', name:'Millionnaire',       desc:'1000 points au total',                             check: s => s.allTimeEarned >= 1000 },
  { id:'tasks50',      icon:'🏅', name:'50 tâches',          desc:'50 tâches complétées',                             check: s => s.totalEver >= 50 },
  { id:'tasks100',     icon:'🎖️', name:'100 tâches',        desc:'100 tâches complétées',                            check: s => s.totalEver >= 100 },
  { id:'tasks200',     icon:'🏆', name:'200 tâches',         desc:'200 tâches accomplies',                            check: s => s.totalEver >= 200 },
  { id:'perfect_day',  icon:'🌈', name:'Journée parfaite',   desc:'Faire toutes les tâches disponibles en un jour !', check: s => s.perfectDay },
  { id:'early_bird',   icon:'🌅', name:'Lève-tôt',           desc:'Faire 5 tâches avant 7h du matin',                check: s => s.earlyBird },
  { id:'cat_full',     icon:'⭐', name:'Complétiste',        desc:'Finir toutes les tâches d\'une catégorie un jour', check: s => s.catFull },
  { id:'all_cats',     icon:'🎯', name:'Touche-à-tout',      desc:'Faire au moins 1 tâche dans 5+ catégories un jour',check: s => s.allCats },
  { id:'theme_buyer',  icon:'🎨', name:'Fashionista',        desc:'Acheter ton premier thème',                        check: s => s.themeBought },
  { id:'bonus_done',   icon:'⭐', name:'Chanceux',           desc:'Compléter 5 tâches bonus',                         check: s => s.bonusDone >= 5 },
  { id:'night_owl',    icon:'🦉', name:'Collectionneur',     desc:'Obtenir 10 badges',                                check: s => s.unlockedBadges >= 10 },
];

const themeCategories = [
  { id:'sobre', label:'🎨 Couleurs sobres', themes:[
    { id:'default', name:'Violet',  colors:['#7c5cfc','#16161d','#a78bfa'], price:0 },
    { id:'light',   name:'Clair',   colors:['#7c5cfc','#f5f5f0','#a78bfa'], price:0 },
    { id:'aurora',  name:'Aurora',  colors:['#00d4aa','#060b14','#00f5c4'], price:80 },
    { id:'sunset',  name:'Sunset',  colors:['#ff6b35','#140808','#ff9a5c'], price:120 },
    { id:'mint',    name:'Menthe',  colors:['#2ecc71','#081410','#54e894'], price:100 },
    { id:'rose',    name:'Rose',    colors:['#e91e8c','#140810','#f054a6'], price:150 },
    { id:'ocean',   name:'Océan',   colors:['#2196f3','#060d18','#52b0ff'], price:90 },
    { id:'gold',    name:'Or',      colors:['#f5c518','#100e04','#ffd84a'], price:200 },
    { id:'neon',    name:'Néon',    colors:['#ff2d78','#050508','#ff6ea8'], price:250 },
    { id:'slate',   name:'Ardoise', colors:['#64748b','#0e1117','#94a3b8'], price:70 },
    { id:'cherry',  name:'Cerise',  colors:['#dc143c','#12060a','#ff4060'], price:300 },
    { id:'cyber',   name:'Cyber',   colors:['#00ffcc','#020810','#40ffd8'], price:500 },
  ]},
  { id:'series', label:'🎬 Séries & Films', themes:[
    { id:'strangerthings',  name:'Stranger Things',      colors:['#cc0000','#0a0a14','#ff4444'], price:420, icon:'🔴', desc:'Le monde à l\'envers' },
    { id:'piratescaraibes', name:'Pirates des Caraïbes', colors:['#c8860a','#0d0a04','#f5c842'], price:450, icon:'🏴‍☠️', desc:'Yo Ho Ho' },
    { id:'mercredi',        name:'Mercredi',             colors:['#2a2a2a','#050505','#888888'], price:410, icon:'🖤', desc:'Sombre & gothique' },
    { id:'netflix',         name:'Netflix',              colors:['#e50914','#141414','#ff453a'], price:400, icon:'▶️', desc:'Série time' },
    { id:'starwars',        name:'Star Wars',            colors:['#ffe81f','#0d0d0d','#4da6ff'], price:480, icon:'⚔️', desc:'Que la Force soit avec toi' },
    { id:'avatar',          name:'Avatar',               colors:['#00b4d8','#020d10','#90e0ef'], price:460, icon:'🌊', desc:'Pandora' },
  ]},
  { id:'musicthemes', label:'🎸 Musique', themes:[
    { id:'metallica', name:'Metallica',              colors:['#c8a000','#080808','#f0c400'], price:430, icon:'🔥', desc:'Master of Puppets' },
    { id:'slipknot',  name:'Slipknot',               colors:['#cc2200','#050505','#ff3300'], price:440, icon:'🤘', desc:'(sic)' },
    { id:'bfmv',      name:'Bullet for My Valentine',colors:['#ff0040','#0a0006','#ff4488'], price:425, icon:'💔', desc:'Tears Don\'t Fall' },
    { id:'acdc',      name:'AC/DC',                  colors:['#ff6600','#0a0400','#ffaa00'], price:435, icon:'⚡', desc:'Highway to Hell' },
    { id:'avenged',   name:'Avenged Sevenfold',       colors:['#8800cc','#08000e','#cc44ff'], price:450, icon:'💀', desc:'Hail to the King' },
    { id:'nirvana',   name:'Nirvana',                 colors:['#ffee00','#04040a','#aaaaff'], price:415, icon:'🌀', desc:'Smells Like Teen Spirit' },
  ]},
  { id:'space', label:'🌌 Espace & Cosmos', themes:[
    { id:'cosmos',    name:'Cosmos',     colors:['#6c63ff','#04010f','#a89cff'], price:300, icon:'🌌', desc:'Aux confins de l\'univers' },
    { id:'nebula',    name:'Nébuleuse',  colors:['#ff6ec7','#0a0214','#ffaae6'], price:350, icon:'💫', desc:'Poussière d\'étoiles' },
    { id:'blackhole', name:'Trou noir',  colors:['#444cf7','#000005','#8890ff'], price:400, icon:'🕳️', desc:'Point de non-retour' },
    { id:'mars',      name:'Mars',       colors:['#e25822','#100402','#ff7043'], price:320, icon:'🔴', desc:'La planète rouge' },
    { id:'galaxy',    name:'Galaxie',    colors:['#00c6ff','#020a14','#80e8ff'], price:380, icon:'🌠', desc:'Milky Way' },
  ]},
  { id:'gaming', label:'🎮 Jeux Vidéo', themes:[
    { id:'minecraft', name:'Minecraft',  colors:['#5d8a3c','#1a1a0a','#8bc34a'], price:390, icon:'⛏️', desc:'Creuse & construis' },
    { id:'zelda',     name:'Zelda',      colors:['#f9a825','#060400','#ffd54f'], price:420, icon:'🗡️', desc:'It\'s dangerous to go alone' },
    { id:'gta',       name:'GTA',        colors:['#ff8f00','#050302','#ffb300'], price:410, icon:'🚗', desc:'Welcome to Los Santos' },
    { id:'cyberpunk', name:'Cyberpunk',  colors:['#fcee09','#030014','#ff2a6d'], price:460, icon:'🤖', desc:'Night City' },
    { id:'pokemon',   name:'Pokémon',    colors:['#ffcb05','#0a0800','#ff0000'], price:400, icon:'⚡', desc:'Attrapez-les tous !' },
  ]},
  { id:'nature', label:'🌿 Nature & Forêt', themes:[
    { id:'forest',    name:'Forêt',      colors:['#2d6a4f','#050e08','#52b788'], price:200, icon:'🌲', desc:'Profondeurs verdoyantes' },
    { id:'sakura',    name:'Sakura',     colors:['#ff85a1','#0f050a','#ffb3c6'], price:250, icon:'🌸', desc:'Fleurs de cerisier' },
    { id:'ocean2',    name:'Océan prof.',colors:['#0077b6','#010d14','#00b4d8'], price:220, icon:'🌊', desc:'Abysses bleues' },
    { id:'desert',    name:'Désert',     colors:['#e9c46a','#0e0b04','#f4a261'], price:210, icon:'🏜️', desc:'Sable et soleil' },
    { id:'arctic',    name:'Arctique',   colors:['#a8dadc','#030d10','#caf0f8'], price:230, icon:'🧊', desc:'Toundra glacée' },
  ]},
  { id:'halloween', label:'🎃 Halloween & Horreur', themes:[
    { id:'halloween', name:'Halloween',  colors:['#ff6b00','#080200','#ff9500'], price:300, icon:'🎃', desc:'Trick or treat !' },
    { id:'vampire',   name:'Vampire',    colors:['#8b0000','#060000','#cc0000'], price:350, icon:'🧛', desc:'La nuit des morts' },
    { id:'witch',     name:'Sorcière',   colors:['#6a0dad','#050008','#9b30ff'], price:320, icon:'🧙', desc:'Double, double, toil and trouble' },
    { id:'zombie',    name:'Zombie',     colors:['#4a7c59','#020804','#6dbf82'], price:280, icon:'🧟', desc:'Braaaains...' },
    { id:'ghost',     name:'Fantôme',    colors:['#b0c4de','#060810','#dce8f5'], price:260, icon:'👻', desc:'Boooo !' },
  ]},
];
const themes = themeCategories.flatMap(c => c.themes);

const categories = {
  etude:   { total:4, label:'Études' },
  musique: { total:3, label:'Musique' },
  sante:   { total:7, label:'Sport & Santé' },
  lycee:   { total:1, label:'Lycée' },
  jeux:    { total:5, label:'Jeux' },
  culture: { total:4, label:'Culture & Médias' },
  reseaux: { total:3, label:'Réseaux sociaux' },
};

const defaultCatIcons = { etude:'📚', musique:'🎸', sante:'🏃', lycee:'🏫', jeux:'🎮', culture:'🎬', reseaux:'📱' };

// Returns merged taskMeta + customTasks minus deletedTasks
function getEffectiveTasks() {
  const deleted = state.deletedTasks || [];
  const result = {};
  Object.entries(taskMeta).forEach(([id, t]) => {
    if (!deleted.includes(id)) result[id] = { ...t };
  });
  Object.entries(state.customTasks || {}).forEach(([id, t]) => {
    result[id] = { ...t };
  });
  return result;
}

// Returns merged categories + customCategories minus deletedCategories
function getEffectiveCategories() {
  const deleted = state.deletedCategories || [];
  const result = {};
  Object.entries(categories).forEach(([id, c]) => {
    if (!deleted.includes(id)) result[id] = { ...c };
  });
  Object.entries(state.customCategories || {}).forEach(([id, c]) => {
    result[id] = { label: c.label, total: 0 };
  });
  // Recompute totals dynamically based on effective tasks
  const tasks = getEffectiveTasks();
  const dow = new Date().getDay();
  Object.keys(result).forEach(catId => {
    const catLabel = result[catId].label;
    const tasksInCat = Object.values(tasks).filter(t => {
      if (t.cat !== catLabel) return false;
      if (t.days && !t.days.includes(dow)) return false;
      return true;
    });
    result[catId].total = tasksInCat.length;
  });
  return result;
}
const EMOJI_OPTIONS = ['📚','🎸','⚡','🎮','🎬','📱','🏋️','🧠','🎯','🏆','🌟','🔥','💡','🎵','🎨','🏃','🧩','📖','✏️','🎲','🦁','🐉','🌈','⚔️','🛡️','🚀','💻','🎤','🎧','📸','🎃','👾','🌙','☀️','💫','🦋'];
const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const monthNamesShort = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const CUSTOM_BG_PRICE = 1000;

const BG_PRESETS = [
  { id:'grad1', css:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' },
  { id:'grad2', css:'linear-gradient(135deg,#0a0a0a,#1a0a0a,#2a0a0a)' },
  { id:'grad3', css:'linear-gradient(135deg,#000428,#004e92)' },
  { id:'grad4', css:'linear-gradient(135deg,#093028,#237a57)' },
  { id:'grad5', css:'linear-gradient(135deg,#200122,#6f0000)' },
  { id:'grad6', css:'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' },
];

// =====================================================
// ===== STORAGE =======================================
// =====================================================
function saveState() {
  try { localStorage.setItem('taskflow_v2', JSON.stringify(state)); } catch(e){}
}
function loadState() {
  try {
    const s = localStorage.getItem('taskflow_v2') || localStorage.getItem('taskflow_state');
    if (s) {
      const parsed = JSON.parse(s);
      // Merge carefully — don't overwrite with undefined/null for new fields
      Object.keys(parsed).forEach(k => {
        if (parsed[k] !== undefined) state[k] = parsed[k];
      });
    }
  } catch(e){}
}

// =====================================================
// ===== INIT ==========================================
// =====================================================
function init() {
  loadState();
  state.calYear = new Date().getFullYear();
  state.calMonth = new Date().getMonth();
  if (!state.unlockedBadges) state.unlockedBadges = [];
  if (!state.categoryIcons) state.categoryIcons = {};
  if (!state.notifications) state.notifications = {};
  if (!state.bonusTask) state.bonusTask = null;
  if (!state.shownRecaps) state.shownRecaps = [];
  if (!state.companion) state.companion = { animal:'dog', level:1, xp:0 };
  if (!state.companionSkins) state.companionSkins = [];

  applyTheme(state.activeTheme);
  applyCustomBg();
  if (!state.lastThemeSet) state.lastThemeSet = { themeId: state.activeTheme, timestamp: Date.now() };

  applyCategoryIcons();
  initBonusTask();
  rebuildTaskLists();
  restoreChecks();
  updatePoints();
  updateAllCounts();
  updateStreak();
  renderThemeGrid();
  renderShopGrid();
  renderCalendar();
  populateRecapSelectors();
  updateSoundBtn();
  checkAutoRecap();
  scheduleNotifications();
  initDailyBoost();
  renderStreakGoalBar();
  renderBoostBanner();
}

// =====================================================
// ===== DATE HELPERS ==================================
// =====================================================
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getMonthKey(y,m) { return `${y}-${String(m+1).padStart(2,'0')}`; }
function getDayKey(y,m,d) { return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

// =====================================================
// ===== RECURRING TASKS ===============================
// =====================================================
function applyRecurringVisibility() {
  const dow = new Date().getDay();
  document.querySelectorAll('.task-item[data-days]').forEach(item => {
    const days = item.dataset.days.split(',').map(Number);
    item.classList.toggle('weekend-hidden', !days.includes(dow));
  });
  // Hide lycée category entirely on weekends
  const lyceeCat = document.getElementById('cat-lycee');
  if (lyceeCat) {
    const isWeekend = dow === 0 || dow === 6;
    lyceeCat.style.display = isWeekend ? 'none' : '';
  }
}

// =====================================================
// ===== BONUS TASK ====================================
// =====================================================
function initBonusTask() {
  const today = getTodayKey();
  if (!state.bonusTask || state.bonusTask.date !== today) {
    const level = state.companion?.level || 1;
    const pool = getBonusPoolForLevel(level);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    state.bonusTask = { name: pick.name, pts: pick.pts, date: today, done: false };
    saveState();
  }
  renderBonusTask();
}

function renderBonusTask() {
  const card = document.getElementById('bonus-card');
  const nameEl = document.getElementById('bonus-task-name');
  const ptsEl = document.getElementById('bonus-pts-badge');
  const check = document.getElementById('bonus-check');
  if (!state.bonusTask) { card.style.display = 'none'; return; }
  card.style.display = '';
  nameEl.textContent = state.bonusTask.name;
  ptsEl.textContent = `+${state.bonusTask.pts} ✦`;
  check.checked = state.bonusTask.done;
  if (state.bonusTask.done) card.style.opacity = '0.5';
}

function handleBonusTask(cb) {
  if (!state.bonusTask || state.bonusTask.done) { cb.checked = true; return; }
  const today = getTodayKey();
  const now = new Date();
  const mk = getMonthKey(now.getFullYear(), now.getMonth());
  if (!state.pointsHistory[mk]) state.pointsHistory[mk] = { earned:0, spent:0 };
  if (cb.checked) {
    state.bonusTask.done = true;
    state.points += state.bonusTask.pts;
    state.pointsHistory[mk].earned += state.bonusTask.pts;
    if (!state.checkedTasks[today]) state.checkedTasks[today] = {};
    state.checkedTasks[today]['bonus'] = true;
    playSound('check');
    showToast(`⭐ Bonus +${state.bonusTask.pts} ✦ !`);
    if (!state.bonusDoneCount) state.bonusDoneCount = 0;
    state.bonusDoneCount++;
    document.getElementById('bonus-card').style.opacity = '0.5';
  }
  updatePoints(); updateStreak(); renderCalendar();
  checkBadges(); saveState();
}

// =====================================================
// ===== HANDLE TASK ===================================
// =====================================================
function handleTask(checkbox) {
  const item = checkbox.closest('.task-item');
  const taskId = item.dataset.task;
  const pts = parseInt(item.dataset.points);
  const cat = item.dataset.cat;
  const today = getTodayKey();
  const now = new Date();
  const mk = getMonthKey(now.getFullYear(), now.getMonth());

  if (!state.checkedTasks[today]) state.checkedTasks[today] = {};
  if (!state.pointsHistory[mk]) state.pointsHistory[mk] = { earned:0, spent:0 };

  // Block unchecking — tasks are irreversible for the day
  if (!checkbox.checked) {
    checkbox.checked = true;
    showToast('🔒 Tu ne peux pas décocher une tâche de la journée !');
    return;
  }

  // Already checked?
  if (state.checkedTasks[today][taskId]) return;

  // Apply boost
  const finalPts = applyBoost(pts);
  const boosted = finalPts > pts;

  state.checkedTasks[today][taskId] = true;
  state.points += finalPts;
  state.pointsHistory[mk].earned += finalPts;
  item.classList.add('done');
  checkbox.disabled = true;
  playSound('check');
  showToast(boosted
    ? `🚀 +${finalPts} ✦ (BOOST ${state.boost.type} !)` 
    : `+${finalPts} ✦ points gagnés !`);
  burstEffect(item);

  // Early bird: 5+ real tasks before 7:00
  const h = now.getHours();
  if (h < 7) {
    const realToday = Object.keys(state.checkedTasks[today]).filter(k => k !== 'bonus' && state.checkedTasks[today][k]);
    if (realToday.length >= 5) state._earlyBirdToday = true;
  }
  // Free treat at 5 tasks
  checkFreeTreat(today);
  // Category complete
  checkCategoryComplete(cat, today);

  updatePoints(); updateAllCounts(); updateStreak(); renderCalendar();
  checkBadges();

  // Check streak goal after updating streak
  checkStreakGoalReached();

  // Prompt goal if streak just hit 1 for first time
  const streak = getStreakCount();
  if (streak === 1 && !state.streakGoal) {
    setTimeout(() => checkStreakGoalOnFirstDay(), 600);
  }

  saveState();
  const moodEl = document.getElementById('companion-mood');
  if (moodEl) moodEl.textContent = getCompanionMood();
}

function checkCategoryComplete(cat, today) {
  const todayTasks = state.checkedTasks[today] || {};
  const items = [...document.querySelectorAll(`.task-item[data-cat="${cat}"]`)].filter(i => !i.classList.contains('weekend-hidden'));
  const total = items.length;
  const done = items.filter(i => {
    const tid = i.dataset.task;
    return todayTasks[tid];
  }).length;
  if (done === total && total > 0) {
    launchConfetti();
    showToast(`🎉 Catégorie complète !`);
    state._lastCatFull = true;
  }
}

function burstEffect(el) {
  el.style.transform = 'scale(1.04)';
  setTimeout(() => el.style.transform = '', 250);
}

function restoreChecks() {
  const today = getTodayKey();
  const todayTasks = state.checkedTasks[today] || {};
  document.querySelectorAll('.task-check').forEach(cb => {
    const item = cb.closest('.task-item');
    if (!item) return;
    const taskId = item.dataset.task;
    if (taskId && todayTasks[taskId]) {
      cb.checked = true;
      item.classList.add('done');
      cb.disabled = true;
    }
  });
  if (state.bonusTask?.done) {
    const bc = document.getElementById('bonus-check');
    if (bc) { bc.checked = true; bc.disabled = true; }
  }
}

// =====================================================
// ===== POINTS & COUNTS ===============================
// =====================================================
function updatePoints() {
  document.getElementById('points-display').textContent = state.points;
  const sp = document.getElementById('shop-points');
  if (sp) sp.textContent = state.points;
}

function updateAllCounts() {
  const today = getTodayKey();
  const todayTasks = state.checkedTasks[today] || {};
  // Get all unique cat IDs from DOM
  const catIds = new Set([...document.querySelectorAll('.task-item[data-cat]')].map(i => i.dataset.cat));
  catIds.forEach(cat => {
    const items = [...document.querySelectorAll(`.task-item[data-cat="${cat}"]`)].filter(i => !i.classList.contains('weekend-hidden'));
    const total = items.length;
    const done = items.filter(i => todayTasks[i.dataset.task]).length;
    const countEl = document.getElementById(`count-${cat}`);
    if (countEl) countEl.textContent = `${done}/${total}`;
    const fill = document.getElementById(`prog-${cat}`);
    if (fill) fill.style.width = `${total > 0 ? (done/total)*100 : 0}%`;
  });
  const totalToday = Object.keys(todayTasks).filter(k => k !== 'bonus' && todayTasks[k]).length;
  const el = document.getElementById('tasks-today');
  if (el) el.textContent = totalToday;
}

// =====================================================
// ===== STREAK ========================================
// =====================================================
// A day counts as "active" for streak only if 3+ real tasks done
function dayIsActive(key) {
  const tasks = state.checkedTasks[key] || {};
  return Object.keys(tasks).filter(k => k !== 'bonus' && tasks[k]).length >= 3;
}

function getStreakCount() {
  let streak = 0;
  const d = new Date();
  const todayKey = getTodayKey();
  const todayActive = dayIsActive(todayKey);
  if (!todayActive) d.setDate(d.getDate() - 1);
  while (true) {
    const key = getDayKey(d.getFullYear(), d.getMonth(), d.getDate());
    if (!dayIsActive(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
    if (streak > 3650) break;
  }
  if (todayActive) streak = Math.max(streak, 1);
  return streak;
}

function isSuperFlameDay() {
  const today = getTodayKey();
  const todayTasks = state.checkedTasks[today] || {};
  const dow = new Date().getDay();
  const allTasks = getEffectiveTasks();
  const available = Object.entries(allTasks).filter(([id, t]) => {
    if (t.days && !t.days.includes(dow)) return false;
    return true;
  });
  if (available.length === 0) return false;
  return available.every(([id]) => todayTasks[id]);
}

function updateStreak() {
  const s = getStreakCount();
  const superFlame = isSuperFlameDay();
  const flameEl = document.getElementById('streak-flame-icon');
  const countEl = document.getElementById('streak-count');
  if (flameEl) flameEl.textContent = superFlame ? '🌟' : '🔥';
  if (countEl) countEl.textContent = s;
  if (superFlame && flameEl) flameEl.classList.add('super-flame');
  else if (flameEl) flameEl.classList.remove('super-flame');
  if (s > (state.bestStreak || 0)) state.bestStreak = s;
  const bs = document.getElementById('best-streak-count');
  if (bs) bs.textContent = state.bestStreak || 0;
  renderStreakGoalBar();
  checkStreakGoalReached();
}

// =====================================================
// ===== TOGGLE CATEGORY ===============================
// =====================================================
function toggleCategory(cat) {
  const list = document.getElementById(`list-${cat}`);
  const chev = document.getElementById(`chev-${cat}`);
  list.classList.toggle('open');
  chev.classList.toggle('open');
}

// =====================================================
// ===== PANELS ========================================
// =====================================================
let currentPanel = null;
function showPanel(name) {
  if (currentPanel === name) { closePanel(); return; }
  closePanel(false);
  currentPanel = name;
  const el = document.getElementById(`panel-${name}`);
  if (!el) return;
  el.classList.add('open');
  document.getElementById('overlay').classList.add('visible');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`btn-${name}`);
  if (btn) btn.classList.add('active');
  if (name === 'shop') renderShopGrid();
  if (name === 'calendar') renderCalendar();
  if (name === 'recap') { populateRecapSelectors(); renderRecapPanel(); }
  if (name === 'stats') renderStatsPanel();
  if (name === 'sync') renderSyncPanel();
  if (name === 'theme') renderCustomBgSection();
  if (name === 'companion') renderCompanionPanel();
}
function closePanel(clearActive=true) {
  if (currentPanel) {
    const el = document.getElementById(`panel-${currentPanel}`);
    if (el) el.classList.remove('open');
    document.getElementById('overlay').classList.remove('visible');
    if (clearActive) { document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active')); currentPanel = null; }
  }
}

// =====================================================
// ===== SOUND =========================================
// =====================================================
function toggleSound() {
  state.soundOn = !state.soundOn;
  updateSoundBtn();
  saveState();
}
function updateSoundBtn() {
  const btn = document.getElementById('btn-sound');
  if (!btn) return;
  btn.textContent = state.soundOn ? '🔔' : '🔕';
  btn.classList.toggle('muted', !state.soundOn);
}
function playSound(type) {
  if (!state.soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'check') {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    } else if (type === 'badge') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    }
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e){}
}

// =====================================================
// ===== CONFETTI ======================================
// =====================================================
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = Array.from({length:80}, () => ({
    x: Math.random() * canvas.width,
    y: -10,
    r: Math.random() * 6 + 3,
    d: Math.random() * 3 + 1,
    color: `hsl(${Math.random()*360},90%,60%)`,
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0,
    tiltAngleIncremental: Math.random() * 0.07 + 0.05,
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.d + 1;
      p.x += Math.sin(frame/20) * 0.5;
      p.tilt = Math.sin(p.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt, p.y);
      ctx.lineTo(p.x + p.tilt + p.r * 0.5, p.y + p.r * 2);
      ctx.stroke();
    });
    frame++;
    if (frame < 90) requestAnimationFrame(draw);
    else { ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display = 'none'; }
  }
  draw();
  if (state.soundOn) {
    try {
      const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
      [523,659,784,1047].forEach((f,i) => {
        const o = ctx2.createOscillator(), g = ctx2.createGain();
        o.connect(g); g.connect(ctx2.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.1, ctx2.currentTime + i*0.12);
        g.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + i*0.12 + 0.3);
        o.start(ctx2.currentTime + i*0.12);
        o.stop(ctx2.currentTime + i*0.12 + 0.3);
      });
    } catch(e){}
  }
}

// =====================================================
// ===== THEME USAGE TRACKING ==========================
// =====================================================
function recordThemeTime(newId) {
  if (!state.lastThemeSet) return;
  const elapsed = Date.now() - state.lastThemeSet.timestamp;
  const mins = Math.round(elapsed / 60000);
  if (mins > 0) {
    const d = new Date(state.lastThemeSet.timestamp);
    const mk = getMonthKey(d.getFullYear(), d.getMonth());
    if (!state.themeUsage[mk]) state.themeUsage[mk] = {};
    state.themeUsage[mk][state.lastThemeSet.themeId] = (state.themeUsage[mk][state.lastThemeSet.themeId]||0) + mins;
  }
  state.lastThemeSet = { themeId: newId, timestamp: Date.now() };
}

// =====================================================
// ===== THEMES ========================================
// =====================================================
// Accent color per theme (matches CSS)
const themeAccents = {
  default:'#7c5cfc', light:'#7c5cfc', aurora:'#00d4aa', sunset:'#ff6b35',
  mint:'#2ecc71', rose:'#e91e8c', ocean:'#2196f3', gold:'#f5c518',
  neon:'#ff2d78', slate:'#64748b', cherry:'#dc143c', cyber:'#00ffcc',
  strangerthings:'#cc0000', piratescaraibes:'#c8860a', mercredi:'#888888',
  netflix:'#e50914', starwars:'#ffe81f', avatar:'#00b4d8',
  metallica:'#c8a000', slipknot:'#cc2200', bfmv:'#ff0040',
  acdc:'#ff6600', avenged:'#8800cc', nirvana:'#ffee00',
  cosmos:'#6c63ff', nebula:'#ff6ec7', blackhole:'#444cf7', mars:'#e25822', galaxy:'#00c6ff',
  minecraft:'#5d8a3c', zelda:'#f9a825', gta:'#ff8f00', cyberpunk:'#fcee09', pokemon:'#ffcb05',
  forest:'#2d6a4f', sakura:'#ff85a1', ocean2:'#0077b6', desert:'#e9c46a', arctic:'#a8dadc',
  halloween:'#ff6b00', vampire:'#8b0000', witch:'#6a0dad', zombie:'#4a7c59', ghost:'#b0c4de',
};

function updateFavicon() {
  const color = themeAccents[state.activeTheme] || '#7c5cfc';
  const useAnimal = state.faviconUseAnimal && state.companion?.animal;
  let inner;
  if (useAnimal) {
    const animal = COMPANION_ANIMALS.find(a => a.id === state.companion.animal);
    inner = `<rect width='100' height='100' rx='20' fill='${color}'/><text x='50' y='72' font-size='60' text-anchor='middle'>${animal?.emoji || '⚡'}</text>`;
  } else {
    inner = `<rect width='100' height='100' rx='20' fill='${color}'/><polygon points='58,8 28,54 48,54 42,92 72,46 52,46' fill='white'/>`;
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>${inner}</svg>`;
  let link = document.querySelector("link[rel='icon']");
  if (!link) { link = document.createElement('link'); link.rel = 'icon'; link.type = 'image/svg+xml'; document.head.appendChild(link); }
  link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function toggleFaviconAnimal() {
  state.faviconUseAnimal = !state.faviconUseAnimal;
  updateFavicon();
  saveState();
  renderCompanionPanel();
  showToast(state.faviconUseAnimal ? '🔖 Icône de l\'onglet mise à jour !' : '⚡ Icône remise à l\'éclair');
}

function applyTheme(id) {
  document.body.className = id === 'default' ? '' : `theme-${id}`;
  if (state.customBg) document.body.classList.add('has-custom-bg');
  state.activeTheme = id;
  updateFavicon();
}
function renderThemeGrid() {
  const grid = document.getElementById('theme-grid');
  grid.innerHTML = '';
  themeCategories.forEach(cat => {
    const lbl = document.createElement('div');
    lbl.className = 'theme-cat-label';
    lbl.textContent = cat.label;
    grid.appendChild(lbl);
    const row = document.createElement('div');
    row.className = 'theme-cat-row';
    cat.themes.forEach(t => {
      const owned = state.unlockedThemes.includes(t.id);
      const active = state.activeTheme === t.id;
      const card = document.createElement('div');
      card.className = `theme-card${active?' active':''}${!owned?' locked':''}`;
      card.style.background = `linear-gradient(135deg,${t.colors[1]} 0%,${t.colors[0]} 100%)`;
      if (!owned) {
        card.innerHTML = `<div class="theme-overlay"></div><div class="theme-lock">🔒</div><span class="theme-name">${t.price}✦</span>`;
      } else {
        const icon = t.icon ? `<span style="font-size:14px;position:relative;z-index:1">${t.icon}</span>` : '';
        card.innerHTML = `<div class="theme-overlay"></div>${icon}<span class="theme-name">${t.name}</span>`;
        card.onclick = () => { recordThemeTime(t.id); applyTheme(t.id); applyCustomBg(); saveState(); renderThemeGrid(); renderCalendar(); showToast(`Thème "${t.name}" !`); };
      }
      row.appendChild(card);
    });
    grid.appendChild(row);
  });
}

// ===== CUSTOM BACKGROUND =====
function renderCustomBgSection() {
  const priceEl = document.getElementById('custom-bg-price');
  const ctrl = document.getElementById('custom-bg-controls');
  if (!state.customBgUnlocked) {
    priceEl.textContent = `(${CUSTOM_BG_PRICE} ✦)`;
    ctrl.innerHTML = state.points >= CUSTOM_BG_PRICE
      ? `<button class="sync-btn" onclick="unlockCustomBg()">🔓 Débloquer pour ${CUSTOM_BG_PRICE} ✦</button>`
      : `<div class="custom-bg-locked">🔒 Il te faut ${CUSTOM_BG_PRICE} ✦ pour débloquer</div>`;
  } else {
    priceEl.textContent = '✓ Débloqué';
    ctrl.innerHTML = `<div class="bg-presets" id="bg-presets-list"></div><button class="sync-btn secondary" style="margin-top:8px" onclick="clearCustomBg()">Retirer le fond</button>`;
    const list = ctrl.querySelector('#bg-presets-list');
    BG_PRESETS.forEach(p => {
      const btn = document.createElement('div');
      btn.className = `bg-preset${state.customBg === p.id ? ' active' : ''}`;
      btn.style.background = p.css;
      btn.onclick = () => { state.customBg = p.id; applyCustomBg(); renderCustomBgSection(); saveState(); };
      list.appendChild(btn);
    });
  }
}
function unlockCustomBg() {
  if (state.points < CUSTOM_BG_PRICE) return;
  const now = new Date();
  const mk = getMonthKey(now.getFullYear(), now.getMonth());
  if (!state.pointsHistory[mk]) state.pointsHistory[mk] = { earned:0, spent:0 };
  state.pointsHistory[mk].spent += CUSTOM_BG_PRICE;
  state.points -= CUSTOM_BG_PRICE;
  state.customBgUnlocked = true;
  updatePoints(); saveState(); renderCustomBgSection(); showToast('🖼️ Fond perso débloqué !');
}
function clearCustomBg() {
  state.customBg = null; applyCustomBg(); renderCustomBgSection(); saveState();
}
function applyCustomBg() {
  if (state.customBg) {
    const p = BG_PRESETS.find(x => x.id === state.customBg);
    if (p) { document.documentElement.style.setProperty('--custom-bg', p.css); document.body.classList.add('has-custom-bg'); return; }
  }
  document.body.classList.remove('has-custom-bg');
}

// =====================================================
// ===== SHOP ==========================================
// =====================================================
function renderShopGrid() {
  const grid = document.getElementById('shop-grid');
  document.getElementById('shop-points').textContent = state.points;
  grid.innerHTML = '';
  themeCategories.forEach(cat => {
    const catThemes = cat.themes.filter(t => t.price > 0);
    if (!catThemes.length) return;
    const lbl = document.createElement('div');
    lbl.className = 'shop-cat-label';
    lbl.textContent = cat.label;
    grid.appendChild(lbl);
    catThemes.forEach(t => {
      const owned = state.unlockedThemes.includes(t.id);
      const canAfford = state.points >= t.price;
      const div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = `
        <div class="shop-preview" style="background:linear-gradient(135deg,${t.colors[1]},${t.colors[0]})">${t.icon||''}</div>
        <div class="shop-info"><div class="shop-name">${t.name}</div><div class="shop-price">${t.price} ✦${t.desc?` · <span style="color:var(--text3);font-size:10px">${t.desc}</span>`:''}</div></div>
        ${owned ? `<span class="shop-owned">✓ Possédé</span>` : `<button class="shop-buy-btn" ${canAfford?'':'disabled'} onclick="buyTheme('${t.id}',${t.price})">${canAfford?'Acheter':'Insuffisant'}</button>`}
      `;
      grid.appendChild(div);
    });
  });
}
function buyTheme(id, price) {
  if (state.points < price || state.unlockedThemes.includes(id)) return;
  const now = new Date();
  const mk = getMonthKey(now.getFullYear(), now.getMonth());
  if (!state.pointsHistory[mk]) state.pointsHistory[mk] = { earned:0, spent:0 };
  state.pointsHistory[mk].spent += price;
  state.points -= price;
  state.unlockedThemes.push(id);
  state._themeBought = true;
  updatePoints(); renderShopGrid(); renderThemeGrid(); checkBadges(); saveState();
  const t = themes.find(x => x.id === id);
  showToast(`🎨 "${t.name}" débloqué !`);
}

// =====================================================
// ===== CALENDAR ======================================
// =====================================================
function setCalView(v) {
  state.calView = v;
  document.getElementById('btn-cal-month').classList.toggle('active', v==='month');
  document.getElementById('btn-cal-week').classList.toggle('active', v==='week');
  document.getElementById('cal-year-btn-prev').style.display = v==='month' ? '' : 'none';
  document.getElementById('cal-year-btn-next').style.display = v==='month' ? '' : 'none';
  renderCalendar();
}
function changeMonth(dir) {
  state.calMonth += dir;
  if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
  if (state.calMonth < 0)  { state.calMonth = 11; state.calYear--; }
  renderCalendar();
}
function changeYear(dir) { state.calYear += dir; renderCalendar(); }

function renderCalendar() {
  if (state.calView === 'week') { renderWeekCalendar(); return; }
  const grid = document.getElementById('calendar-grid');
  grid.className = 'calendar-grid';
  document.getElementById('cal-label').textContent = `${monthNames[state.calMonth]} ${state.calYear}`;
  grid.innerHTML = '';
  dayNames.forEach(d => { const h = document.createElement('div'); h.className='cal-day-header'; h.textContent=d; grid.appendChild(h); });
  let sd = new Date(state.calYear, state.calMonth, 1).getDay();
  sd = sd===0?6:sd-1;
  for (let i=0;i<sd;i++) { const e=document.createElement('div'); e.className='cal-day empty'; grid.appendChild(e); }
  const dim = new Date(state.calYear, state.calMonth+1, 0).getDate();
  const td = new Date();
  for (let d=1;d<=dim;d++) {
    const key = getDayKey(state.calYear, state.calMonth, d);
    const tasks = state.checkedTasks[key] || {};
    const hasTask = dayIsActive(key);
    const isToday = d===td.getDate() && state.calMonth===td.getMonth() && state.calYear===td.getFullYear();
    const cell = document.createElement('div');
    cell.className = `cal-day${isToday?' today':''}${hasTask?' has-task':''}`;
    cell.innerHTML = hasTask ? `<span class="cal-flame">🔥</span><span class="cal-day-num">${d}</span>` : `${d}`;
    const yr=state.calYear, mn=state.calMonth, dy=d;
    cell.onclick = () => showDayDetail(yr,mn,dy);
    grid.appendChild(cell);
  }
}

function renderWeekCalendar() {
  const grid = document.getElementById('calendar-grid');
  grid.className = 'week-grid';
  // Get current week (Mon-Sun)
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  document.getElementById('cal-label').textContent = `Semaine du ${monday.getDate()} ${monthNamesShort[monday.getMonth()]}`;
  grid.innerHTML = '';
  for (let i=0;i<7;i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = getDayKey(d.getFullYear(), d.getMonth(), d.getDate());
    const tasks = state.checkedTasks[key] || {};
    const taskIds = Object.keys(tasks).filter(k => k!=='bonus' && tasks[k]);
    const isToday = d.toDateString() === today.toDateString();
    const col = document.createElement('div');
    col.className = 'week-day-col';
    col.innerHTML = `<div class="week-day-header${isToday?' today-h':''}">${dayNames[i]}<br>${d.getDate()}</div>
      <div class="week-day-card${isToday?' today-card':''}" onclick="showDayDetail(${d.getFullYear()},${d.getMonth()},${d.getDate()})">
        ${taskIds.length > 0 ? `<span class="week-flame">🔥</span><span class="week-day-tasks">${taskIds.length} tâche${taskIds.length>1?'s':''}</span>` : `<span class="week-day-tasks" style="margin-top:auto">—</span>`}
      </div>`;
    grid.appendChild(col);
  }
}

// ===== DAY DETAIL =====
function showDayDetail(year, month, day) {
  const key = getDayKey(year, month, day);
  const tasks = state.checkedTasks[key] || {};
  const modal = document.getElementById('day-modal');
  const title = document.getElementById('day-modal-title');
  const body = document.getElementById('day-modal-body');
  const dayName = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][new Date(year,month,day).getDay()];
  title.textContent = `${dayName} ${day} ${monthNamesShort[month]} ${year}`;
  const doneIds = Object.keys(tasks).filter(k => k!=='bonus' && tasks[k]);
  if (doneIds.length === 0) {
    body.innerHTML = `<div class="day-empty">😴 Aucune tâche ce jour-là</div>`;
  } else {
    body.innerHTML = doneIds.map(id => {
      const m = taskMeta[id];
      return `<div class="day-task-row"><span class="day-task-done">✅</span><span class="day-task-name">${m?.name||id}</span><span class="task-pts" style="font-size:11px">+${m?.pts||0} ✦</span></div>`;
    }).join('');
    if (tasks['bonus']) {
      body.innerHTML += `<div class="day-task-row"><span class="day-task-done">⭐</span><span class="day-task-name">Tâche bonus</span></div>`;
    }
  }
  modal.classList.add('show');
}
function closeDayModal() { document.getElementById('day-modal').classList.remove('show'); }

// =====================================================
// ===== EMOJI PICKER ==================================
// =====================================================
let _emojiTarget = null;
function openEmojiPicker(cat, e) {
  e.stopPropagation();
  _emojiTarget = cat;
  const picker = document.getElementById('emoji-picker');
  picker.innerHTML = EMOJI_OPTIONS.map(em => `<span class="emoji-opt" onclick="selectEmoji('${em}')">${em}</span>`).join('');
  const rect = e.target.getBoundingClientRect();
  picker.style.top = (rect.bottom + 6) + 'px';
  picker.style.left = rect.left + 'px';
  picker.classList.add('show');
}
function selectEmoji(em) {
  if (!_emojiTarget) return;
  state.categoryIcons[_emojiTarget] = em;
  applyCategoryIcons();
  document.getElementById('emoji-picker').classList.remove('show');
  saveState();
}
function applyCategoryIcons() {
  Object.keys(categories).forEach(cat => {
    const el = document.getElementById(`emoji-${cat}`);
    if (el) el.textContent = state.categoryIcons[cat] || defaultCatIcons[cat];
  });
}
document.addEventListener('click', e => {
  const picker = document.getElementById('emoji-picker');
  if (picker && !picker.contains(e.target) && !e.target.classList.contains('cat-emoji')) {
    picker.classList.remove('show');
  }
});

// =====================================================
// ===== BADGES ========================================
// =====================================================
function getBadgeStats() {
  const today = getTodayKey();
  const todayTasks = state.checkedTasks[today] || {};
  const todayRealTasks = Object.keys(todayTasks).filter(k => k !== 'bonus' && todayTasks[k]);

  let totalEver = 0;
  Object.values(state.checkedTasks).forEach(day => {
    totalEver += Object.keys(day).filter(k => k !== 'bonus' && day[k]).length;
  });
  let allTimeEarned = 0;
  Object.values(state.pointsHistory).forEach(m => { allTimeEarned += m.earned || 0; });

  // Perfect day: all available tasks done today
  const allTaskIds = Object.keys(taskMeta).filter(id => {
    const meta = taskMeta[id];
    if (!meta.days) return true;
    const dow = new Date().getDay();
    return meta.days.includes(dow);
  });
  const perfectDay = allTaskIds.length > 0 && allTaskIds.every(id => todayTasks[id]);

  // Early bird: 5+ real tasks before 7:00
  const earlyBird = state._earlyBirdToday || false;

  const catFull = state._lastCatFull || false;
  const todayCats = new Set(todayRealTasks.map(k => k.split('-')[0]));
  const allCats = todayCats.size >= 5;

  return {
    streak: getStreakCount(),
    totalEver, allTimeEarned, perfectDay, earlyBird, catFull, allCats,
    themeBought: state._themeBought || state.unlockedThemes.length > 2,
    bonusDone: state.bonusDoneCount || 0,
    unlockedBadges: state.unlockedBadges.length,
  };
}

function checkBadges() {
  const stats = getBadgeStats();
  let newBadge = false;
  BADGES.forEach(b => {
    if (!state.unlockedBadges.includes(b.id) && b.check(stats)) {
      state.unlockedBadges.push(b.id);
      newBadge = true;
      setTimeout(() => showBadgeModal(b), newBadge ? 500 : 1000);
    }
  });
  if (newBadge) saveState();
}

function showBadgeModal(badge) {
  document.getElementById('badge-modal-icon').textContent = badge.icon;
  document.getElementById('badge-modal-name').textContent = badge.name;
  document.getElementById('badge-modal-desc').textContent = badge.desc;
  document.getElementById('badge-modal').classList.add('show');
  playSound('badge');
}
function closeBadgeModal() { document.getElementById('badge-modal').classList.remove('show'); }

// =====================================================
// ===== STATS PANEL ===================================
// =====================================================
function switchStatsTab(tab) {
  state.currentStatsTab = tab;
  ['activity','cats','badges'].forEach(t => {
    document.getElementById(`tab-stats-${t}`).classList.toggle('active', t===tab);
  });
  renderStatsPanel();
}

function renderStatsPanel() {
  const content = document.getElementById('stats-content');
  if (!content) return;
  const tab = state.currentStatsTab;
  if (tab === 'activity') content.innerHTML = buildActivityHTML();
  else if (tab === 'cats') content.innerHTML = buildCatStatsHTML();
  else content.innerHTML = buildBadgesHTML();
  setTimeout(() => {
    content.querySelectorAll('.cat-stat-bar').forEach(b => {
      const w = b.dataset.w;
      b.style.width = '0%';
      requestAnimationFrame(() => { b.style.transition='width .8s ease'; b.style.width=w; });
    });
  }, 50);
}

function buildActivityHTML() {
  const today = new Date();
  const cells = [];
  for (let i=89; i>=0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getDayKey(d.getFullYear(), d.getMonth(), d.getDate());
    const tasks = state.checkedTasks[key] || {};
    const cnt = Object.keys(tasks).filter(k=>k!=='bonus'&&tasks[k]).length;
    const lvl = cnt===0?0:cnt<=2?1:cnt<=4?2:cnt<=6?3:4;
    cells.push({ key, cnt, lvl, date:`${d.getDate()} ${monthNamesShort[d.getMonth()]}` });
  }
  // Split into rows of 7
  const rows = [];
  for (let i=0; i<cells.length; i+=7) rows.push(cells.slice(i,i+7));

  // Best streak
  const streak = getStreakCount();
  const best = state.bestStreak||0;

  let html = `<div class="recap-section">
    <div class="recap-section-title">📅 Activité – 90 derniers jours</div>
    <div class="activity-graph">`;
  rows.forEach(row => {
    html += `<div class="activity-row">`;
    row.forEach(c => {
      html += `<div class="activity-cell lvl${c.lvl}" title="${c.date} · ${c.cnt} tâche${c.cnt>1?'s':''}"></div>`;
    });
    html += `</div>`;
  });
  html += `<div class="activity-legend">
    <span>Moins</span>
    ${[0,1,2,3,4].map(l=>`<div class="activity-legend-cell lvl${l}" style="background:${l===0?'var(--surface)':''};opacity:${l===0?1:1}"></div>`).join('')}
    <span>Plus</span>
  </div></div></div>`;

  html += `<div class="recap-section"><div class="recap-section-title">🏆 Records</div>
    <div class="recap-stat-grid">
      <div class="recap-stat"><div class="recap-stat-val">${streak}</div><div class="recap-stat-label">Série actuelle</div></div>
      <div class="recap-stat"><div class="recap-stat-val">${best}</div><div class="recap-stat-label">Meilleure série</div></div>
    </div>
  </div>`;
  return html;
}

function buildCatStatsHTML() {
  const catCount = {};
  Object.values(state.checkedTasks).forEach(day => {
    Object.keys(day).filter(k=>k!=='bonus'&&day[k]).forEach(tid => {
      const cat = tid.split('-')[0];
      catCount[cat] = (catCount[cat]||0)+1;
    });
  });
  const sorted = Object.entries(catCount).sort((a,b)=>b[1]-a[1]);
  const max = sorted[0]?.[1] || 1;
  let html = `<div class="recap-section"><div class="recap-section-title">📊 Tâches par catégorie (total)</div>`;
  if (sorted.length === 0) {
    html += `<div class="recap-empty">Aucune donnée encore</div>`;
  } else {
    sorted.forEach(([cat,cnt]) => {
      const pct = Math.round((cnt/max)*100);
      const icon = state.categoryIcons[cat] || defaultCatIcons[cat] || '📌';
      const label = categories[cat]?.label || cat;
      html += `<div class="cat-stat-row">
        <span class="cat-stat-name">${icon} ${label}</span>
        <div class="cat-stat-bar-wrap"><div class="cat-stat-bar" data-w="${pct}%" style="width:0%"></div></div>
        <span class="cat-stat-count">${cnt}</span>
      </div>`;
    });
  }
  html += `</div>`;
  return html;
}

function buildBadgesHTML() {
  let html = `<div class="badges-grid">`;
  BADGES.forEach(b => {
    const unlocked = state.unlockedBadges.includes(b.id);
    html += `<div class="badge-card${unlocked?' unlocked':' locked'}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    </div>`;
  });
  html += `</div>`;
  return html;
}

// =====================================================
// ===== NOTIFICATIONS =================================
// =====================================================
function scheduleNotifications() {
  if (!('Notification' in window)) return;
  // Request permission passively
}
function requestNotifPermission(taskId, taskName) {
  if (!('Notification' in window)) { showToast('Notifications non supportées'); return; }
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') {
      state.notifications[taskId] = true;
      saveState();
      renderSyncPanel();
      showToast(`🔔 Rappel activé pour "${taskName}"`);
    }
  });
}
function disableNotif(taskId) {
  delete state.notifications[taskId];
  saveState();
  renderSyncPanel();
}

// =====================================================
// ===== SYNC PANEL ====================================
// =====================================================
function safeEncode(obj) {
  return btoa(encodeURIComponent(JSON.stringify(obj)));
}
function safeDecode(str) {
  try { return JSON.parse(decodeURIComponent(atob(str))); } catch(e) { return JSON.parse(str); }
}

function renderSyncPanel() {
  const body = document.getElementById('sync-body');
  const exportData = {
    points: state.points,
    unlockedThemes: state.unlockedThemes,
    checkedTasks: state.checkedTasks,
    pointsHistory: state.pointsHistory,
    unlockedBadges: state.unlockedBadges,
    bestStreak: state.bestStreak,
    customBgUnlocked: state.customBgUnlocked,
    bonusDoneCount: state.bonusDoneCount,
    companion: state.companion,
    companionSkins: state.companionSkins,
  };
  let fullCode = '';
  try { fullCode = safeEncode(exportData); } catch(e) { fullCode = 'erreur-encodage'; }
  const preview = fullCode.slice(0, 60) + '…';

  body.innerHTML = `
    <div class="sync-section">
      <div class="sync-section-title">📤 Exporter mes données</div>
      <div class="sync-code" style="font-size:10px;word-break:break-all">${preview}</div>
      <button class="sync-btn" onclick="copySyncCode()">📋 Copier le code complet</button>
      <button class="sync-btn secondary" onclick="downloadSyncData()">💾 Télécharger (.json)</button>
    </div>
    <div class="sync-section">
      <div class="sync-section-title">📥 Importer des données</div>
      <textarea class="sync-input" id="sync-import-input" rows="3" placeholder="Colle ton code ici…"></textarea>
      <button class="sync-btn" onclick="importSyncData()">✅ Importer</button>
    </div>
    <div class="sync-section">
      <div class="sync-section-title">🔔 Rappels par tâche</div>
      ${Object.entries(taskMeta).slice(0, 8).map(([id, m]) => `
        <div class="sync-notif-row">
          <span class="sync-notif-name">${m.name}</span>
          <label class="toggle-switch">
            <input type="checkbox" ${state.notifications[id] ? 'checked' : ''} onchange="toggleNotif('${id}','${m.name}',this)"/>
            <span class="toggle-slider"></span>
          </label>
        </div>`).join('')}
    </div>
  `;
}

function copySyncCode() {
  const data = {
    points: state.points,
    unlockedThemes: state.unlockedThemes,
    checkedTasks: state.checkedTasks,
    pointsHistory: state.pointsHistory,
    unlockedBadges: state.unlockedBadges,
    bestStreak: state.bestStreak,
    customBgUnlocked: state.customBgUnlocked,
    bonusDoneCount: state.bonusDoneCount,
    companion: state.companion,
    companionSkins: state.companionSkins,
  };
  try {
    navigator.clipboard.writeText(safeEncode(data)).then(() => showToast('📋 Code copié !')).catch(() => showToast('Erreur copie'));
  } catch(e) { showToast('Erreur encodage'); }
}
function downloadSyncData() {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `taskflow-${getTodayKey()}.json`;
  a.click();
}
function importSyncData() {
  const input = document.getElementById('sync-import-input')?.value.trim();
  if (!input) return;
  try {
    const parsed = safeDecode(input);
    const allowed = ['points','unlockedThemes','checkedTasks','pointsHistory','unlockedBadges','bestStreak','customBgUnlocked','bonusDoneCount','themeUsage','categoryIcons','soundOn','customBg','companion','companionSkins'];
    allowed.forEach(k => { if (parsed[k] !== undefined) state[k] = parsed[k]; });
    saveState();
    location.reload();
  } catch(e) { showToast('❌ Code invalide'); }
}
function toggleNotif(id, name, cb) {
  if (cb.checked) requestNotifPermission(id, name);
  else disableNotif(id);
}

// =====================================================
// ===== RECAP ENGINE ==================================
// =====================================================
function computeMonthStats(year, month) {
  const mk = getMonthKey(year, month);
  const dim = new Date(year, month+1, 0).getDate();
  const today = new Date();
  const isCurrent = year===today.getFullYear() && month===today.getMonth();
  const lastDay = isCurrent ? today.getDate() : dim;
  let activeDays=0, missedDays=0, totalTasksDone=0, totalTimeMin=0;
  const taskCount={};
  for (let d=1;d<=lastDay;d++) {
    const key=getDayKey(year,month,d);
    const tasks=state.checkedTasks[key]||{};
    const tids=Object.keys(tasks).filter(k=>k!=='bonus'&&tasks[k]);
    if (tids.length>0) {
      activeDays++;
      tids.forEach(tid=>{ taskCount[tid]=(taskCount[tid]||0)+1; totalTasksDone++; totalTimeMin+=taskMeta[tid]?.timeMin||30; });
    } else missedDays++;
  }
  const ph=state.pointsHistory[mk]||{earned:0,spent:0};
  const tu=state.themeUsage[mk]||{};
  let favTheme=state.activeTheme, maxMin=0;
  Object.entries(tu).forEach(([tid,m])=>{ if(m>maxMin){maxMin=m;favTheme=tid;} });
  const taskRanked=Object.entries(taskCount).sort((a,b)=>b[1]-a[1]);
  const mostDone=taskRanked.slice(0,2).map(([id,cnt])=>({id,cnt,meta:taskMeta[id]}));
  const leastDone=[...taskRanked].sort((a,b)=>a[1]-b[1]).slice(0,2).map(([id,cnt])=>({id,cnt,meta:taskMeta[id]}));
  const neverDone=Object.keys(taskMeta).filter(id=>!taskCount[id]).map(id=>({id,meta:taskMeta[id]}));
  const maxTC=taskRanked[0]?.[1]||1;
  return { mk,year,month,dim,lastDay,isCurrent,activeDays,missedDays,totalTasksDone,totalTimeMin,earned:ph.earned,spent:ph.spent,favTheme,taskCount,taskRanked,mostDone,leastDone,neverDone,maxTaskCount:maxTC };
}

function deltaHTML(curr,prev,inv) {
  if(prev===null||prev===undefined||(prev===0&&curr===0)) return '';
  const diff=curr-prev;
  if(diff===0) return `<span class="recap-delta neutral">→ stable</span>`;
  const pos=inv?diff<0:diff>0;
  const cls=pos?'up':'down';
  const arr=diff>0?'▲':'▼';
  const sign=diff>0?'+':'';
  return `<span class="recap-delta ${cls}">${arr} ${sign}${diff} vs m. préc.</span>`;
}
function deltaPercentHTML(curr,prev) {
  if(!prev) return '';
  const pct=Math.round(((curr-prev)/prev)*100);
  if(pct===0) return `<span class="recap-delta neutral">→ stable</span>`;
  const cls=pct>0?'up':'down';
  return `<span class="recap-delta ${cls}">${pct>0?'▲':'▼'} ${pct>0?'+':''}${pct}% vs an préc.</span>`;
}

function getMonthComment(stats, prev) {
  const msgs=[];
  const rate=stats.lastDay>0?stats.activeDays/stats.lastDay:0;
  if(rate>=.9) msgs.push("🔥 Incroyable constance ! Tu es en mode machine ce mois-ci.");
  else if(rate>=.7) msgs.push("💪 Très bonne régularité ! Encore un effort pour atteindre 90%.");
  else if(rate>=.5) msgs.push("📈 La moitié des jours actifs — bonne base, vise les 70% !");
  else if(rate>=.3) msgs.push("😴 Mois calme... Une tâche par jour suffit pour tout changer !");
  else msgs.push("🌱 Peu d'activité ce mois. Commence petit, progresse grand !");
  if(stats.neverDone.length>0) msgs.push(`⚠️ Jamais faites : ${stats.neverDone.slice(0,2).map(t=>`"${t.meta?.name}"`).join(', ')}. Donne-leur une chance !`);
  if(prev&&prev.totalTasksDone>0) {
    if(stats.activeDays>prev.activeDays) msgs.push(`📅 +${stats.activeDays-prev.activeDays} jour(s) actifs vs ${monthNames[prev.month]} !`);
    if(stats.earned>prev.earned) msgs.push(`✦ +${stats.earned-prev.earned} pts de plus que le mois dernier !`);
  }
  if(stats.mostDone[0]) msgs.push(`⭐ Tâche fétiche : "${stats.mostDone[0].meta?.name}" (${stats.mostDone[0].cnt}x)`);
  const h=Math.round(stats.totalTimeMin/60);
  if(h>=10) msgs.push(`⏱️ ~${h}h de travail estimées ce mois !`);
  return msgs.slice(0,3).map(m=>`<div class="recap-comment">${m}</div>`).join('');
}

function buildMonthRecapHTML(stats, prev) {
  const th=themes.find(t=>t.id===stats.favTheme)||themes[0];
  const h=Math.floor(stats.totalTimeMin/60), m=stats.totalTimeMin%60;
  const ts=h>0?`${h}h${m>0?m+'min':''}`:m+'min';
  const p=prev&&(prev.totalTasksDone>0||prev.activeDays>0)?prev:null;
  let html='';
  html+=`<div class="recap-section"><div class="recap-section-title">📈 Statistiques</div><div class="recap-stat-grid">
    <div class="recap-stat"><div class="recap-stat-val">${stats.totalTasksDone}</div><div class="recap-stat-label">Tâches faites</div>${p?deltaHTML(stats.totalTasksDone,p.totalTasksDone,false):''}</div>
    <div class="recap-stat"><div class="recap-stat-val">${stats.activeDays}</div><div class="recap-stat-label">Jours actifs</div>${p?deltaHTML(stats.activeDays,p.activeDays,false):''}</div>
    <div class="recap-stat"><div class="recap-stat-val">${stats.missedDays}</div><div class="recap-stat-label">Jours manqués</div>${p?deltaHTML(stats.missedDays,p.missedDays,true):''}</div>
    <div class="recap-stat"><div class="recap-stat-val">${ts}</div><div class="recap-stat-label">Temps estimé</div></div>
  </div></div>`;
  html+=`<div class="recap-section"><div class="recap-section-title">✦ Points</div><div class="recap-stat-grid">
    <div class="recap-stat"><div class="recap-stat-val" style="color:var(--success)">${stats.earned}</div><div class="recap-stat-label">Gagnés</div>${p?deltaHTML(stats.earned,p.earned,false):''}</div>
    <div class="recap-stat"><div class="recap-stat-val" style="color:var(--danger)">${stats.spent}</div><div class="recap-stat-label">Dépensés</div>${p?deltaHTML(stats.spent,p.spent,true):''}</div>
  </div></div>`;
  html+=`<div class="recap-section"><div class="recap-section-title">🎨 Thème préféré</div><div class="recap-theme-badge"><div class="recap-theme-dot" style="background:linear-gradient(135deg,${th.colors[1]},${th.colors[0]})"></div><span class="recap-theme-name">${th.name}</span></div></div>`;
  if(stats.mostDone.length>0) {
    html+=`<div class="recap-section"><div class="recap-section-title">🏆 Plus faites</div>`;
    stats.mostDone.forEach(t=>{const pct=Math.round((t.cnt/stats.maxTaskCount)*100);html+=`<div class="recap-task-row"><span class="recap-task-name">${t.meta?.name||t.id}</span><span class="recap-task-count">${t.cnt}x</span><div class="recap-task-bar-wrap"><div class="recap-task-bar-fill" style="width:${pct}%"></div></div></div>`;});
    html+=`</div>`;
  }
  html+=`<div class="recap-section"><div class="recap-section-title">💤 Moins faites</div>`;
  (stats.neverDone.length>0?stats.neverDone.slice(0,3):stats.leastDone).forEach(t=>{
    const cnt=t.cnt||0;const pct=Math.round((cnt/stats.maxTaskCount)*100);
    html+=`<div class="recap-task-row"><span class="recap-task-name">${t.meta?.name||t.id}</span><span class="recap-task-count" ${cnt===0?'style="color:var(--danger)"':''}>${cnt}x</span><div class="recap-task-bar-wrap"><div class="recap-task-bar-fill" style="width:${pct}%"></div></div></div>`;
  });
  html+=`</div>`;
  const cmts=getMonthComment(stats,p);
  if(cmts) html+=`<div class="recap-section"><div class="recap-section-title">💬 Analyse</div>${cmts}</div>`;
  return html;
}

function buildYearRecapHTML(year) {
  let totalTasks=0,totalActive=0,totalMissed=0,totalEarned=0,totalSpent=0,totalTime=0;
  const monthlyData=[],taskCountYear={},themeCountYear={};
  for(let m=0;m<12;m++){
    const s=computeMonthStats(year,m);monthlyData.push(s);
    totalTasks+=s.totalTasksDone;totalActive+=s.activeDays;totalMissed+=s.missedDays;
    totalEarned+=s.earned;totalSpent+=s.spent;totalTime+=s.totalTimeMin;
    Object.entries(s.taskCount).forEach(([id,cnt])=>{taskCountYear[id]=(taskCountYear[id]||0)+cnt;});
    const tu=state.themeUsage[s.mk]||{};
    Object.entries(tu).forEach(([tid,min])=>{themeCountYear[tid]=(themeCountYear[tid]||0)+min;});
  }
  if(totalTasks===0) return `<div class="recap-empty">😶 Aucune donnée pour ${year}.</div>`;
  const h=Math.floor(totalTime/60),m2=totalTime%60;
  const ts=h>0?`${h}h${m2>0?m2+'min':''}`:m2+'min';
  const bestM=monthlyData.reduce((a,b)=>a.totalTasksDone>b.totalTasksDone?a:b);
  const taskRY=Object.entries(taskCountYear).sort((a,b)=>b[1]-a[1]);
  const bestT=taskRY[0]?{id:taskRY[0][0],cnt:taskRY[0][1],meta:taskMeta[taskRY[0][0]]}:null;
  const neverY=Object.keys(taskMeta).filter(id=>!taskCountYear[id]).map(id=>taskMeta[id].name);
  let favTY=state.activeTheme,maxTM=0;
  Object.entries(themeCountYear).forEach(([tid,min])=>{if(min>maxTM){maxTM=min;favTY=tid;}});
  const favTD=themes.find(t=>t.id===favTY)||themes[0];
  let prevYE=0;for(let m=0;m<12;m++){prevYE+=(state.pointsHistory[getMonthKey(year-1,m)]||{earned:0}).earned;}
  let html=`<div style="font-family:var(--font-display);font-weight:800;font-size:18px;color:var(--text);margin-bottom:6px">🗓️ Bilan ${year}</div>`;
  html+=`<div class="recap-section"><div class="recap-section-title">📊 Vue d'ensemble</div><div class="recap-stat-grid">
    <div class="recap-stat"><div class="recap-stat-val">${totalTasks}</div><div class="recap-stat-label">Tâches totales</div></div>
    <div class="recap-stat"><div class="recap-stat-val">${totalActive}</div><div class="recap-stat-label">Jours actifs</div></div>
    <div class="recap-stat"><div class="recap-stat-val" style="color:var(--success)">${totalEarned}</div><div class="recap-stat-label">Points gagnés</div>${prevYE>0?deltaPercentHTML(totalEarned,prevYE):''}</div>
    <div class="recap-stat"><div class="recap-stat-val">${ts}</div><div class="recap-stat-label">Temps estimé</div></div>
  </div></div>`;
  html+=`<div class="recap-section"><div class="recap-section-title">📅 Par mois</div><div class="recap-year-month-grid">`;
  monthlyData.forEach(ms=>{html+=`<div class="recap-month-card"><div class="recap-month-card-name">${monthNamesShort[ms.month]}</div><div class="recap-month-card-val">${ms.totalTasksDone}</div><div class="recap-month-card-sub">${ms.activeDays}j 🔥</div></div>`;});
  html+=`</div></div>`;
  html+=`<div class="recap-section"><div class="recap-section-title">🏆 Records</div>`;
  if(bestT) html+=`<div class="recap-task-row"><span class="recap-task-name">⭐ Tâche signature : ${bestT.meta?.name}</span><span class="recap-task-count">${bestT.cnt}x</span></div>`;
  html+=`<div class="recap-task-row"><span class="recap-task-name">🔥 Meilleur mois : ${monthNames[bestM.month]}</span><span class="recap-task-count">${bestM.totalTasksDone}</span></div>`;
  if(neverY.length>0) html+=`<div class="recap-task-row"><span class="recap-task-name" style="color:var(--danger)">⚠️ Jamais faites : ${neverY.slice(0,3).join(', ')}</span></div>`;
  html+=`</div>`;
  html+=`<div class="recap-section"><div class="recap-section-title">🎨 Thème de l'année</div><div class="recap-theme-badge"><div class="recap-theme-dot" style="background:linear-gradient(135deg,${favTD.colors[1]},${favTD.colors[0]})"></div><span class="recap-theme-name">${favTD.name}</span></div></div>`;
  const rate=totalActive/365;
  const ycmts=[];
  if(rate>=.8) ycmts.push(`🏆 Année exceptionnelle ! ${Math.round(rate*100)}% des jours actifs !`);
  else if(rate>=.5) ycmts.push(`💪 Belle année — moitié des jours actifs, c'est une vraie discipline !`);
  else if(rate>=.3) ycmts.push(`📈 Année en construction. Continue à progresser !`);
  else ycmts.push(`🌱 Année calme. Commence petit l'an prochain — une tâche par jour suffit !`);
  if(totalEarned>500) ycmts.push(`✦ ${totalEarned} points ! Une belle collection d'efforts.`);
  if(bestT) ycmts.push(`⭐ "${bestT.meta?.name}" a été ta signature ${year} (${bestT.cnt}x) !`);
  html+=`<div class="recap-section"><div class="recap-section-title">💬 Bilan</div>${ycmts.map(c=>`<div class="recap-comment">${c}</div>`).join('')}</div>`;
  return html;
}

// ===== EXPORT IMAGE =====
function exportRecapImage() {
  const content = document.getElementById('recap-content');
  if (!content) return;
  showToast('📥 Capture en cours...');
  // Use html2canvas if available, else fallback
  if (window.html2canvas) {
    html2canvas(content, { backgroundColor: getComputedStyle(document.body).getPropertyValue('--bg2').trim() || '#16161d' }).then(canvas => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `taskflow-recap-${getTodayKey()}.png`;
      a.click();
    });
  } else {
    // Fallback: copy text
    showToast('💾 Exporte en JSON à la place');
    downloadSyncData();
  }
}

// ===== AUTO RECAP =====
function checkAutoRecap() {
  const today = new Date();
  if (today.getDate() <= 3) {
    let pm=today.getMonth()-1, py=today.getFullYear();
    if(pm<0){pm=11;py--;}
    const rk=`monthly-${getMonthKey(py,pm)}`;
    if(!state.shownRecaps.includes(rk)){
      const stats=computeMonthStats(py,pm);
      if(stats.totalTasksDone>0){
        setTimeout(()=>showAutoRecap('monthly',py,pm),900);
        state.shownRecaps.push(rk); saveState();
      }
    }
  }
  if(today.getMonth()===0&&today.getDate()<=3){
    const py=today.getFullYear()-1;
    const rk=`yearly-${py}`;
    if(!state.shownRecaps.includes(rk)){
      setTimeout(()=>showAutoRecap('yearly',py,null),2200);
      state.shownRecaps.push(rk); saveState();
    }
  }
}
function showAutoRecap(type,year,month) {
  const modal=document.getElementById('recap-modal');
  document.getElementById('recap-modal-title').textContent = type==='monthly'?`Récap — ${monthNames[month]} ${year}`:`Bilan ${year}`;
  const body=document.getElementById('recap-modal-body');
  if(type==='monthly'){
    const stats=computeMonthStats(year,month);
    let pm=month-1,py=year;if(pm<0){pm=11;py--;}
    body.innerHTML=buildMonthRecapHTML(stats,computeMonthStats(py,pm));
  } else { body.innerHTML=buildYearRecapHTML(year); }
  modal.classList.add('show');
  setTimeout(()=>animateRecapBars(body),120);
}
function closeRecapModal(){document.getElementById('recap-modal').classList.remove('show');}
function animateRecapBars(c){
  c.querySelectorAll('.recap-task-bar-fill').forEach(el=>{
    const w=el.style.width; el.style.width='0%'; el.style.transition='none';
    requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transition='width .9s ease';el.style.width=w;}));
  });
}

// ===== RECAP PANEL =====
function switchRecapTab(tab) {
  state.currentRecapTab=tab;
  document.getElementById('tab-monthly').classList.toggle('active',tab==='monthly');
  document.getElementById('tab-yearly').classList.toggle('active',tab==='yearly');
  document.getElementById('recap-selector-monthly').style.display=tab==='monthly'?'':'none';
  document.getElementById('recap-selector-yearly').style.display=tab==='yearly'?'':'none';
  renderRecapPanel();
}
function populateRecapSelectors() {
  const today=new Date();
  const ms=document.getElementById('recap-month-select');
  const ys=document.getElementById('recap-year-select');
  if(!ms||!ys) return;
  ms.innerHTML='';
  for(let i=0;i<24;i++){
    let m=today.getMonth()-i, y=today.getFullYear();
    while(m<0){m+=12;y--;}
    const o=document.createElement('option');o.value=`${y}-${m}`;o.textContent=`${monthNames[m]} ${y}`;ms.appendChild(o);
  }
  ys.innerHTML='';
  for(let y=today.getFullYear();y>=today.getFullYear()-5;y--){
    const o=document.createElement('option');o.value=y;o.textContent=y;ys.appendChild(o);
  }
}
function renderRecapPanel() {
  const content=document.getElementById('recap-content');
  if(!content) return;
  const tab=state.currentRecapTab;
  if(tab==='monthly'){
    const sel=document.getElementById('recap-month-select')?.value;if(!sel) return;
    const [y,m]=sel.split('-').map(Number);
    const stats=computeMonthStats(y,m);
    let pm=m-1,py=y;if(pm<0){pm=11;py--;}
    const prev=computeMonthStats(py,pm);
    if(stats.totalTasksDone===0&&stats.activeDays===0&&!stats.isCurrent){
      content.innerHTML=`<div class="recap-empty">😶 Aucune donnée pour ${monthNames[m]} ${y}.</div>`;return;
    }
    content.innerHTML=`<div style="font-family:var(--font-display);font-weight:800;font-size:16px;color:var(--text);margin-bottom:5px">${monthNames[m]} ${y}</div>`+buildMonthRecapHTML(stats,prev);
  } else {
    const y=parseInt(document.getElementById('recap-year-select')?.value||new Date().getFullYear());
    content.innerHTML=buildYearRecapHTML(y);
  }
  setTimeout(()=>animateRecapBars(content),60);
}

// =====================================================
// ===== TOAST =========================================
// =====================================================
let toastTimer;
function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}

// =====================================================
// ===== COMPANION =====================================
// =====================================================

const COMPANION_ANIMALS = [
  { id:'dog',   emoji:'🐶', name:'Chien',    price:0    },
  { id:'cat',   emoji:'🐱', name:'Chat',     price:500  },
  { id:'fox',   emoji:'🦊', name:'Renard',   price:500  },
  { id:'wolf',  emoji:'🐺', name:'Loup',     price:700  },
  { id:'shark', emoji:'🦈', name:'Requin',   price:800  },
  { id:'lion',  emoji:'🦁', name:'Lion',     price:900  },
  { id:'dragon',emoji:'🐉', name:'Dragon',   price:1000 },
  { id:'tiger', emoji:'🐯', name:'Tigre',    price:600  },
  { id:'unicorn',emoji:'🦄',name:'Licorne',  price:800  },
  { id:'eagle', emoji:'🦅', name:'Aigle',    price:700  },
  { id:'dino',  emoji:'🦖', name:'Dinosaure',price:750  },
  { id:'octopus',emoji:'🐙',name:'Pieuvre',  price:650  },
];

const TREATS = [
  { id:'croquette', icon:'🟤', name:'Croquette',       price:3,  xp:10  },
  { id:'biscuit',   icon:'🦴', name:'Biscuit',         price:5,  xp:18  },
  { id:'premium',   icon:'🥩', name:'Friandise premium',price:8,  xp:30  },
  { id:'meal',      icon:'🍖', name:'Repas complet',   price:10, xp:45  },
  { id:'cake',      icon:'🎂', name:'Gâteau spécial',  price:15, xp:80  },
  { id:'candy',     icon:'🍬', name:'Bonbon magique',  price:7,  xp:25  },
];

// XP needed to reach next level from current level
function xpForLevel(level) {
  return Math.floor(100 * level * Math.pow(1.15, level - 1));
}

// Bonus pool by level tier
const BONUS_BY_LEVEL = {
  0:  [ // lv 1-9
    {name:"Faire 10 pompes",pts:2},{name:"Boire 2L d'eau",pts:2},
    {name:"Ranger sa chambre",pts:3},{name:"Appeler un ami",pts:2},
    {name:"Méditer 5 minutes",pts:2},{name:"Écrire dans un journal",pts:3},
    {name:"Apprendre 5 mots",pts:3},{name:"Faire une promenade",pts:2},
    {name:"Dessiner quelque chose",pts:2},{name:"Cuisiner un repas",pts:3},
  ],
  10: [ // lv 10-19
    {name:"Faire 20 pompes",pts:4},{name:"Boire 2.5L d'eau",pts:4},
    {name:"Nettoyer une pièce entière",pts:4},{name:"Écrire une demi-page",pts:4},
    {name:"Apprendre 10 mots",pts:4},{name:"Marcher 30 min",pts:4},
    {name:"Faire 3 séries d'abdos",pts:4},{name:"Cuisiner un plat complet",pts:4},
  ],
  20: [ // lv 20-29
    {name:"Faire 30 pompes",pts:5},{name:"Courir 1km",pts:5},
    {name:"Écrire une page entière",pts:5},{name:"Apprendre 15 mots",pts:5},
    {name:"30 min de lecture",pts:5},{name:"Faire du sport 45 min",pts:5},
    {name:"Pratiquer la guitare 1h",pts:5},{name:"Résoudre 5 exercices de maths",pts:5},
  ],
  30: [ // lv 30-39
    {name:"Courir 2km",pts:6},{name:"Lire 50 pages",pts:6},
    {name:"1h de révision concentrée",pts:6},{name:"Faire 50 pompes",pts:6},
    {name:"Apprendre 20 nouveaux mots",pts:6},{name:"Écrire 2 pages",pts:6},
    {name:"Cuisiner un repas élaboré",pts:6},{name:"1h de pratique musicale",pts:6},
  ],
  40: [ // lv 40-49
    {name:"Courir 3km",pts:7},{name:"Lire 80 pages",pts:7},
    {name:"1h30 de révision sans pause",pts:7},{name:"Faire 100 abdos",pts:7},
    {name:"Apprendre 30 mots en une session",pts:7},{name:"Composer une courte mélodie",pts:7},
    {name:"Écrire 3 pages",pts:7},{name:"Faire une séance HIIT complète",pts:7},
  ],
  50: [ // lv 50-59
    {name:"Courir 5km",pts:8},{name:"Lire un nouveau livre entier",pts:8},
    {name:"2h de travail intensif",pts:8},{name:"Faire 200 pompes dans la journée",pts:8},
    {name:"Apprendre 50 mots",pts:8},{name:"Enregistrer une démo musicale",pts:8},
    {name:"Écrire 5 pages",pts:8},{name:"Nager 1km",pts:8},
  ],
  60: [ // lv 60-74
    {name:"Courir 7km",pts:9},{name:"Terminer 2 livres cette semaine",pts:9},
    {name:"3h de travail sans distraction",pts:9},{name:"Finir un chapitre de cours complet",pts:9},
    {name:"Composer une chanson entière",pts:9},{name:"Apprendre un solo de guitare",pts:9},
    {name:"Courir 1h sans s'arrêter",pts:9},{name:"Faire 500 abdos dans la journée",pts:9},
  ],
  75: [ // lv 75-99
    {name:"Courir 10km",pts:12},{name:"Finir un projet personnel",pts:12},
    {name:"Maîtriser un nouveau morceau complet",pts:12},{name:"Écrire un article de blog",pts:12},
    {name:"3h de sport intense",pts:12},{name:"Lire 200 pages en une journée",pts:12},
    {name:"Terminer un module de cours en ligne",pts:12},{name:"Courir un semi-marathon",pts:12},
  ],
  100: [ // lv 100
    {name:"🏆 Courir un marathon complet",pts:15},{name:"🏆 Écrire un chapitre de roman",pts:15},
    {name:"🏆 Composer et enregistrer une chanson",pts:15},{name:"🏆 Maîtriser une compétence entière",pts:15},
    {name:"🏆 Pratiquer 6h de sport dans la semaine",pts:15},{name:"🏆 Lire 3 livres en un mois",pts:15},
  ],
};

function getBonusPoolForLevel(level) {
  const tiers = [100, 75, 60, 50, 40, 30, 20, 10, 0];
  for (const t of tiers) { if (level >= t) return BONUS_BY_LEVEL[t]; }
  return BONUS_BY_LEVEL[0];
}

function getCompanionMood() {
  const today = getTodayKey();
  const todayTasks = state.checkedTasks[today] || {};
  const cnt = Object.keys(todayTasks).filter(k => k !== 'bonus' && todayTasks[k]).length;
  if (cnt === 0)   return "😴 J'attends que tu fasses quelque chose...";
  if (cnt <= 2)    return "🥱 C'est un début... allez !";
  if (cnt <= 4)    return "🙂 Bien, continue comme ça !";
  if (cnt <= 6)    return "😄 Je suis fier de toi !";
  if (cnt <= 9)    return "🤩 Tu déchires tout aujourd'hui !";
  return "🔥 LÉGENDAIRE. Je t'adore.";
}

function getXpTierClass(level) {
  if (level >= 100) return 'xp-tier-6';
  if (level >= 80)  return 'xp-tier-5';
  if (level >= 60)  return 'xp-tier-4';
  if (level >= 40)  return 'xp-tier-3';
  if (level >= 20)  return 'xp-tier-2';
  return 'xp-tier-1';
}

function renderCompanionPanel() {
  const body = document.getElementById('companion-body');
  if (!body) return;
  const c = state.companion || { animal:'dog', level:1, xp:0 };
  const animal = COMPANION_ANIMALS.find(a => a.id === c.animal) || COMPANION_ANIMALS[0];
  const level = c.level || 1;
  const xp = c.xp || 0;
  const xpNeeded = level >= 100 ? 999999 : xpForLevel(level);
  const xpPct = level >= 100 ? 100 : Math.min(100, Math.round((xp / xpNeeded) * 100));
  const tierClass = getXpTierClass(level);
  const mood = getCompanionMood();

  body.innerHTML = `
    <!-- STAGE -->
    <div class="companion-stage">
      <div class="companion-animal" id="companion-animal" onclick="petCompanion()">${animal.emoji}</div>
      <div class="companion-name">${animal.name}</div>
      <div class="companion-level-badge">Niveau ${level}</div>
      <button class="companion-favicon-btn${state.faviconUseAnimal ? ' active' : ''}" onclick="toggleFaviconAnimal()">
        ${state.faviconUseAnimal ? '⚡ Utiliser l\'éclair' : `${animal.emoji} Utiliser comme icône d'onglet`}
      </button>
      <div class="companion-mood" id="companion-mood">${mood}</div>
      <div class="companion-xp-area">
        <div class="companion-xp-label">
          <span>XP</span>
          <span>${level >= 100 ? 'MAX 🏆' : `${xp} / ${xpNeeded}`}</span>
        </div>
        <div class="companion-xp-track">
          <div class="companion-xp-fill ${tierClass}" id="companion-xp-fill" style="width:0%"></div>
        </div>
      </div>
    </div>

    <!-- FRIANDISES -->
    <div class="companion-section">
      <div class="companion-section-title">
        🍖 Friandises
        <span class="companion-pts-inline" id="companion-pts">${state.points} ✦</span>
      </div>
      <div class="treats-grid">
        ${TREATS.map(t => {
          const canAfford = state.points >= t.price;
          return `<div class="treat-card${canAfford?'':' cant-afford'}" onclick="feedTreat('${t.id}')">
            <span class="treat-icon">${t.icon}</span>
            <span class="treat-name">${t.name}</span>
            <span class="treat-xp">+${t.xp} XP</span>
            <span class="treat-price">${t.price} ✦</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- APPARENCES -->
    <div class="companion-section">
      <div class="companion-section-title">🎨 Apparences</div>
      <div class="skins-grid">
        ${COMPANION_ANIMALS.map(a => {
          const owned = a.price === 0 || (state.companionSkins || []).includes(a.id);
          const active = c.animal === a.id;
          return `<div class="skin-card${active?' active':''}${!owned?' locked':''}" onclick="selectSkin('${a.id}',${a.price})">
            <span class="skin-animal">${a.emoji}</span>
            <span class="skin-name">${a.name}</span>
            <span class="skin-price">${owned ? (active ? '✓ Actif' : 'Possédé') : a.price+' ✦'}</span>
          </div>`;
        }).join('')}
      </div>
    </div>
  `;

  // Animate XP bar after render
  setTimeout(() => {
    const fill = document.getElementById('companion-xp-fill');
    if (fill) fill.style.width = xpPct + '%';
  }, 80);
}

function feedTreat(treatId) {
  const treat = TREATS.find(t => t.id === treatId);
  if (!treat || state.points < treat.price) return;

  if (!state.companion) state.companion = { animal:'dog', level:1, xp:0 };
  const c = state.companion;

  // Deduct points
  const now = new Date();
  const mk = getMonthKey(now.getFullYear(), now.getMonth());
  if (!state.pointsHistory[mk]) state.pointsHistory[mk] = { earned:0, spent:0 };
  state.pointsHistory[mk].spent += treat.price;
  state.points -= treat.price;

  // Add XP
  c.xp = (c.xp || 0) + treat.xp;
  playSound('check');

  // Happy animation
  const animalEl = document.getElementById('companion-animal');
  if (animalEl) {
    animalEl.classList.remove('happy', 'levelup');
    void animalEl.offsetWidth;
    animalEl.classList.add('happy');
    setTimeout(() => animalEl.classList.remove('happy'), 700);
  }

  // Check level ups
  checkCompanionLevelUp();
  updatePoints();
  saveState();
  renderCompanionPanel();
  showToast(`${treat.icon} +${treat.xp} XP pour ton compagnon !`);
}

function checkCompanionLevelUp() {
  const c = state.companion;
  if (!c || c.level >= 100) return;
  let leveled = false;
  while (c.level < 100) {
    const needed = xpForLevel(c.level);
    if (c.xp >= needed) {
      c.xp -= needed;
      c.level++;
      leveled = true;
    } else break;
  }
  if (leveled) {
    // Level up animation + confetti
    const animalEl = document.getElementById('companion-animal');
    if (animalEl) {
      animalEl.classList.remove('happy', 'levelup');
      void animalEl.offsetWidth;
      animalEl.classList.add('levelup');
      setTimeout(() => animalEl.classList.remove('levelup'), 900);
    }
    launchConfetti();
    showToast(`🎉 Niveau ${c.level} atteint !`);
    // Update bonus pool for new level
    regenerateBonusIfNeeded();
  }
}

function regenerateBonusIfNeeded() {
  // Force regenerate bonus task to match new level
  state.bonusTask = null;
  initBonusTask();
}

function petCompanion() {
  const animalEl = document.getElementById('companion-animal');
  if (!animalEl) return;
  animalEl.classList.remove('happy');
  void animalEl.offsetWidth;
  animalEl.classList.add('happy');
  setTimeout(() => animalEl.classList.remove('happy'), 700);
  // Update mood display
  const moodEl = document.getElementById('companion-mood');
  if (moodEl) moodEl.textContent = getCompanionMood();
}

function selectSkin(animalId, price) {
  if (!state.companionSkins) state.companionSkins = [];
  const owned = price === 0 || state.companionSkins.includes(animalId);
  if (!owned) {
    if (state.points < price) { showToast('Pas assez de points !'); return; }
    const now = new Date();
    const mk = getMonthKey(now.getFullYear(), now.getMonth());
    if (!state.pointsHistory[mk]) state.pointsHistory[mk] = { earned:0, spent:0 };
    state.pointsHistory[mk].spent += price;
    state.points -= price;
    state.companionSkins.push(animalId);
    const a = COMPANION_ANIMALS.find(x => x.id === animalId);
    showToast(`🎉 ${a.emoji} ${a.name} débloqué !`);
    updatePoints();
  }
  if (!state.companion) state.companion = { animal:'dog', level:1, xp:0 };
  state.companion.animal = animalId;
  saveState();
  renderCompanionPanel();
}

// =====================================================
// ===== FREE DAILY TREAT ==============================
// =====================================================
function checkFreeTreat(today) {
  if (state.freeTreatClaimedDate === today) return;
  const tasks = state.checkedTasks[today] || {};
  const realCount = Object.keys(tasks).filter(k => k !== 'bonus' && tasks[k]).length;
  if (realCount >= 5) {
    state.freeTreatClaimedDate = today;
    if (!state.companion) state.companion = { animal:'dog', level:1, xp:0 };
    state.companion.xp = (state.companion.xp || 0) + 45; // equivalent repas complet
    checkCompanionLevelUp();
    saveState();
    showToast('🎁 Friandise gratuite offerte à ton compagnon ! (+45 XP)');
  }
}

// =====================================================
// ===== STREAK GOAL SYSTEM ============================
// =====================================================
const STREAK_GOALS = [
  { days:7,   reward:10,  label:'7 jours',   icon:'🔥' },
  { days:15,  reward:20,  label:'15 jours',  icon:'💥' },
  { days:30,  reward:30,  label:'30 jours',  icon:'🌟' },
  { days:60,  reward:50,  label:'60 jours',  icon:'👑' },
  { days:100, reward:75,  label:'100 jours', icon:'🏆' },
  { days:365, reward:150, label:'1 an',      icon:'🗓️' },
];

function checkStreakGoalOnFirstDay() {
  // Called when streak reaches exactly 1 (new streak started)
  if (!state.streakGoal) {
    openStreakGoalModal();
  }
}

function openStreakGoalModal() {
  const modal = document.getElementById('streak-goal-modal');
  if (!modal) return;
  modal.classList.add('open');
}

function closeStreakGoalModal() {
  const modal = document.getElementById('streak-goal-modal');
  if (modal) modal.classList.remove('open');
}

function selectStreakGoal(days, reward) {
  state.streakGoal = { days, reward, setAt: getStreakCount() };
  saveState();
  closeStreakGoalModal();
  showToast(`🎯 Objectif fixé : ${days} jours ! Récompense : +${reward} ✦`);
  renderStreakGoalBar();
}

function checkStreakGoalReached() {
  if (!state.streakGoal) return;
  const streak = getStreakCount();
  const goal = STREAK_GOALS.find(g => g.days === state.streakGoal.days);
  if (!goal) return;
  if (streak >= state.streakGoal.days) {
    // Give reward
    state.points += state.streakGoal.reward;
    const mk = getMonthKey(new Date().getFullYear(), new Date().getMonth());
    if (!state.pointsHistory[mk]) state.pointsHistory[mk] = { earned:0, spent:0 };
    state.pointsHistory[mk].earned += state.streakGoal.reward;
    updatePoints();
    showGoalReachedModal(goal);
    state.streakGoal = null;
    saveState();
    // After closing modal, prompt new goal
    setTimeout(() => openStreakGoalModal(), 2500);
  }
}

function showGoalReachedModal(goal) {
  const modal = document.getElementById('goal-reached-modal');
  if (!modal) return;
  document.getElementById('goal-reached-icon').textContent = goal.icon;
  document.getElementById('goal-reached-title').textContent = `Objectif ${goal.label} atteint !`;
  document.getElementById('goal-reached-reward').textContent = `+${goal.reward} ✦ récompense !`;
  modal.classList.add('open');
  playSound('badge');
  launchConfetti();
}

function closeGoalReachedModal() {
  const modal = document.getElementById('goal-reached-modal');
  if (modal) modal.classList.remove('open');
}

function renderStreakGoalBar() {
  const bar = document.getElementById('streak-goal-bar');
  if (!bar) return;
  if (!state.streakGoal) {
    bar.innerHTML = `<span class="streak-goal-empty" onclick="openStreakGoalModal()">🎯 Fixer un objectif de série</span>`;
    return;
  }
  const streak = getStreakCount();
  const pct = Math.min(100, Math.round((streak / state.streakGoal.days) * 100));
  const goal = STREAK_GOALS.find(g => g.days === state.streakGoal.days);
  bar.innerHTML = `
    <div class="streak-goal-info" onclick="openStreakGoalModal()">
      <span>${goal?.icon || '🎯'} Objectif : ${state.streakGoal.days} jours</span>
      <span class="streak-goal-reward">+${state.streakGoal.reward} ✦</span>
    </div>
    <div class="streak-goal-progress">
      <div class="streak-goal-fill" style="width:${pct}%"></div>
    </div>
    <div class="streak-goal-label">${streak} / ${state.streakGoal.days} jours (${pct}%)</div>
  `;
}

// =====================================================
// ===== BOOST SYSTEM ==================================
// =====================================================
function initDailyBoost() {
  const today = getTodayKey();
  if (!state.boost || state.boost.date !== today) {
    const startHour = 6 + Math.floor(Math.random() * 16);
    const startMin  = Math.floor(Math.random() * 60);
    const type = Math.random() < 0.5 ? 'x2' : '+50%';
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMin, 0);
    const end   = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    state.boost = { type, date: today, startTime: start.getTime(), endTime: end.getTime() };
    saveState();
  }
  renderBoostBanner();
  // Refresh every 10 seconds for accuracy
  setInterval(renderBoostBanner, 10000);
}

function isBoostActive() {
  if (!state.boost) return false;
  const now = Date.now();
  return now >= state.boost.startTime && now <= state.boost.endTime;
}

function getBoostMultiplier() {
  if (!isBoostActive()) return null;
  return state.boost.type;
}

function applyBoost(basePts) {
  const type = getBoostMultiplier();
  if (!type) return basePts;
  if (type === 'x2') return basePts * 2;
  if (type === '+50%') return basePts + Math.ceil(basePts * 0.5);
  return basePts;
}

function renderBoostBanner() {
  const banner = document.getElementById('boost-banner');
  if (!banner) return;

  if (!state.boost) { banner.className = 'boost-banner'; banner.innerHTML = ''; return; }

  const now = Date.now();
  const { startTime, endTime, type, date } = state.boost;
  const today = getTodayKey();

  // Wrong day
  if (date !== today) { banner.className = 'boost-banner'; banner.innerHTML = ''; return; }

  const startDate = new Date(startTime);
  const hh = String(startDate.getHours()).padStart(2,'0');
  const mm = String(startDate.getMinutes()).padStart(2,'0');
  const endDate = new Date(endTime);
  const hh2 = String(endDate.getHours()).padStart(2,'0');
  const mm2 = String(endDate.getMinutes()).padStart(2,'0');

  if (now < startTime) {
    // Upcoming
    const diffMs = startTime - now;
    const diffH  = Math.floor(diffMs / 3600000);
    const diffM  = Math.floor((diffMs % 3600000) / 60000);
    const timeStr = diffH > 0 ? `${diffH}h ${diffM}min` : `${diffM} min`;
    banner.className = 'boost-banner upcoming';
    banner.innerHTML = `⚡ Boost <strong>${type}</strong> aujourd'hui à <strong>${hh}:${mm}</strong> — dans ${timeStr}`;
  } else if (now <= endTime) {
    // Active
    const diffMs = endTime - now;
    const diffM  = Math.floor(diffMs / 60000);
    const diffS  = Math.floor((diffMs % 60000) / 1000);
    banner.className = 'boost-banner active';
    banner.innerHTML = `🚀 BOOST <strong>${type}</strong> ACTIF jusqu'à ${hh2}:${mm2} — encore <strong>${diffM}m ${diffS}s</strong> !`;
    setTimeout(renderBoostBanner, 1000);
  } else {
    // Ended
    banner.className = 'boost-banner ended';
    banner.innerHTML = `✅ Boost ${type} terminé aujourd'hui — reviens demain !`;
  }
}

// =====================================================
// ===== EDIT MODE =====================================
// =====================================================
let editMode = false;

function toggleEditMode() {
  editMode = !editMode;
  const btn = document.getElementById('btn-edit');
  if (btn) {
    btn.textContent = editMode ? '✅ Terminer' : '✏️ Éditer';
    btn.classList.toggle('active', editMode);
  }
  const addCatBtn = document.getElementById('add-cat-btn-container');
  if (addCatBtn) addCatBtn.style.display = editMode ? 'block' : 'none';
  rebuildTaskLists();
}

function rebuildTaskLists() {
  const today = getTodayKey();
  const todayTasks = state.checkedTasks[today] || {};
  const dow = new Date().getDay();
  const effTasks = getEffectiveTasks();
  const effCats = getEffectiveCategories();

  // Handle lycée visibility
  const lyceeCat = document.getElementById('cat-lycee');
  if (lyceeCat) lyceeCat.style.display = (dow === 0 || dow === 6) && !editMode ? 'none' : '';

  // Rebuild each category's task list
  Object.entries(effCats).forEach(([catId, catInfo]) => {
    const listEl = document.getElementById(`list-${catId}`);
    const catCard = document.getElementById(`cat-${catId}`);
    if (!listEl) return;

    // Get tasks for this category
    const catTasks = Object.entries(effTasks).filter(([id, t]) => {
      const catLabel = catInfo.label;
      return t.cat === catLabel;
    });

    listEl.innerHTML = '';

    catTasks.forEach(([taskId, task]) => {
      const isWeekendHidden = task.days && !task.days.includes(dow);
      const isDone = !!todayTasks[taskId];
      const item = document.createElement('div');
      item.className = `task-item${isDone ? ' done' : ''}${isWeekendHidden && !editMode ? ' weekend-hidden' : ''}`;
      item.dataset.task = taskId;
      item.dataset.points = task.pts;
      item.dataset.cat = catId;
      if (task.days) item.dataset.days = task.days.join(',');

      if (editMode) {
        const daysLabel = task.days ? task.days.map(d => ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][d]).join(',') : 'Tous les jours';
        item.innerHTML = `
          <div class="edit-task-row">
            <span class="edit-task-name">${task.name}</span>
            <div class="edit-task-controls">
              <span class="edit-pts-badge">+${task.pts} ✦</span>
              <span class="edit-days-badge" onclick="editTaskDays('${taskId}')" title="Modifier les jours">${daysLabel}</span>
              <button class="edit-btn-pts" onclick="editTaskPts('${taskId}')" title="Modifier les points">✦</button>
              <button class="edit-btn-rename" onclick="editTaskRename('${taskId}')" title="Renommer">✏️</button>
              <button class="edit-btn-delete" onclick="deleteTask('${taskId}')" title="Supprimer">🗑️</button>
            </div>
          </div>`;
      } else {
        const hasDaysBadge = task.days && !isWeekendHidden;
        item.innerHTML = `
          <label class="task-label">
            <input type="checkbox" class="task-check" onchange="handleTask(this)"${isDone ? ' checked disabled' : ''}/>
            <span class="custom-check"></span>
            <span class="task-name">${task.name}</span>
          </label>
          <div class="task-right">
            ${hasDaysBadge ? '<span class="task-badge-days">Lun–Ven</span>' : ''}
            <span class="task-pts">+${task.pts} ✦</span>
          </div>`;
      }
      listEl.appendChild(item);
    });

    // Add task button in edit mode
    if (editMode) {
      const addBtn = document.createElement('button');
      addBtn.className = 'edit-add-task-btn';
      addBtn.textContent = '+ Ajouter une tâche';
      addBtn.onclick = () => addTaskToCategory(catId, catInfo.label);
      listEl.appendChild(addBtn);

      // Delete category button (only for custom cats or if empty)
      const delCatBtn = document.getElementById(`del-cat-${catId}`);
      if (catCard && !document.getElementById(`del-cat-${catId}`)) {
        const hdr = catCard.querySelector('.category-header');
        if (hdr && !hdr.querySelector('.del-cat-btn')) {
          const b = document.createElement('button');
          b.className = 'del-cat-btn';
          b.title = 'Supprimer cette catégorie';
          b.textContent = '🗑️';
          b.onclick = (e) => { e.stopPropagation(); deleteCategory(catId); };
          hdr.appendChild(b);
        }
      }
    } else {
      // Remove delete cat buttons when exiting edit mode
      if (catCard) {
        catCard.querySelectorAll('.del-cat-btn').forEach(b => b.remove());
      }
    }
  });

  // Render custom categories not yet in DOM
  if (editMode) {
    const customCatIds = Object.keys(state.customCategories || {});
    customCatIds.forEach(catId => {
      if (!document.getElementById(`cat-${catId}`)) {
        insertCategoryCard(catId, state.customCategories[catId]);
      }
    });
  }

  updateAllCounts();
  applyRecurringVisibility();
}

function insertCategoryCard(catId, catInfo) {
  const main = document.getElementById('main-todo');
  const addCatBtn = document.getElementById('add-cat-btn-container');
  const card = document.createElement('div');
  card.className = 'category-card';
  card.id = `cat-${catId}`;
  const icon = (state.categoryIcons || {})[catId] || catInfo.icon || '📁';
  card.innerHTML = `
    <div class="category-header" onclick="toggleCategory('${catId}')">
      <div class="cat-title-area">
        <span class="cat-emoji" id="emoji-${catId}" onclick="openEmojiPicker('${catId}',event)">${icon}</span>
        <h2 class="cat-title">${catInfo.label}</h2>
        <span class="cat-count" id="count-${catId}">0/0</span>
      </div>
      <div class="cat-right">
        <div class="cat-progress-bar"><div class="cat-progress-fill" id="prog-${catId}"></div></div>
        <span class="chevron" id="chev-${catId}">▼</span>
      </div>
    </div>
    <div class="task-list open" id="list-${catId}"></div>`;
  if (addCatBtn) main.insertBefore(card, addCatBtn);
  else main.appendChild(card);
}

function addTaskToCategory(catId, catLabel) {
  const name = prompt('Nom de la tâche :');
  if (!name || !name.trim()) return;
  const ptsRaw = prompt('Points (1-20) :', '3');
  const pts = Math.max(1, Math.min(20, parseInt(ptsRaw) || 3));
  const daysRaw = prompt('Jours (1=Lun,2=Mar,3=Mer,4=Jeu,5=Ven,6=Sam,0=Dim)\nLaisse vide pour tous les jours.\nEx: 1,2,3,4,5 pour Lun-Ven', '');
  let days = null;
  if (daysRaw && daysRaw.trim()) {
    days = daysRaw.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 6);
    if (days.length === 0) days = null;
  }
  const taskId = `custom-${catId}-${Date.now()}`;
  if (!state.customTasks) state.customTasks = {};
  state.customTasks[taskId] = { name: name.trim(), pts, cat: catLabel, ...(days ? { days } : {}) };
  saveState();
  rebuildTaskLists();
}

function deleteTask(taskId) {
  if (!confirm('Supprimer cette tâche ?')) return;
  if (taskMeta[taskId]) {
    if (!state.deletedTasks) state.deletedTasks = [];
    state.deletedTasks.push(taskId);
  } else {
    delete state.customTasks[taskId];
  }
  saveState();
  rebuildTaskLists();
}

function editTaskRename(taskId) {
  const tasks = getEffectiveTasks();
  const current = tasks[taskId]?.name || '';
  const newName = prompt('Nouveau nom :', current);
  if (!newName || !newName.trim()) return;
  if (taskMeta[taskId]) {
    if (!state.customTasks) state.customTasks = {};
    // Store override
    state.customTasks[`override-${taskId}`] = { ...taskMeta[taskId], name: newName.trim(), _overrideFor: taskId };
    // Actually modify taskMeta in-memory too
    taskMeta[taskId].name = newName.trim();
  } else if (state.customTasks[taskId]) {
    state.customTasks[taskId].name = newName.trim();
  }
  saveState();
  rebuildTaskLists();
}

function editTaskPts(taskId) {
  const tasks = getEffectiveTasks();
  const current = tasks[taskId]?.pts || 1;
  const newPts = prompt('Nouveau nombre de points (1-20) :', current);
  const pts = Math.max(1, Math.min(20, parseInt(newPts) || current));
  if (taskMeta[taskId]) taskMeta[taskId].pts = pts;
  if (state.customTasks[taskId]) state.customTasks[taskId].pts = pts;
  saveState();
  rebuildTaskLists();
}

function editTaskDays(taskId) {
  const tasks = getEffectiveTasks();
  const current = tasks[taskId]?.days;
  const currentStr = current ? current.join(',') : '';
  const daysRaw = prompt(
    'Jours d\'apparition :\n1=Lun, 2=Mar, 3=Mer, 4=Jeu, 5=Ven, 6=Sam, 0=Dim\nLaisse vide pour tous les jours.\nEx: 1,2,3,4,5 pour Lun–Ven',
    currentStr
  );
  if (daysRaw === null) return;
  let days = null;
  if (daysRaw.trim()) {
    days = daysRaw.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 0 && n <= 6);
    if (days.length === 0) days = null;
  }
  if (taskMeta[taskId]) taskMeta[taskId].days = days || undefined;
  if (state.customTasks[taskId]) state.customTasks[taskId].days = days || undefined;
  saveState();
  rebuildTaskLists();
}

function addNewCategory() {
  const label = prompt('Nom de la catégorie :');
  if (!label || !label.trim()) return;
  const catId = `cat-custom-${Date.now()}`;
  if (!state.customCategories) state.customCategories = {};
  state.customCategories[catId] = { label: label.trim(), icon: '📁' };
  saveState();
  rebuildTaskLists();
  // Open the new category
  const listEl = document.getElementById(`list-${catId}`);
  if (listEl) listEl.classList.add('open');
}

function deleteCategory(catId) {
  const effTasks = getEffectiveTasks();
  const effCats = getEffectiveCategories();
  const catLabel = effCats[catId]?.label;
  const tasksInCat = Object.keys(effTasks).filter(id => effTasks[id].cat === catLabel);
  const msg = tasksInCat.length > 0
    ? `Supprimer la catégorie "${catLabel}" et ses ${tasksInCat.length} tâche(s) ?`
    : `Supprimer la catégorie "${catLabel}" ?`;
  if (!confirm(msg)) return;
  // Delete all tasks in category
  tasksInCat.forEach(id => {
    if (taskMeta[id]) {
      if (!state.deletedTasks) state.deletedTasks = [];
      if (!state.deletedTasks.includes(id)) state.deletedTasks.push(id);
    } else {
      delete state.customTasks[id];
    }
  });
  // Delete category
  if (categories[catId]) {
    if (!state.deletedCategories) state.deletedCategories = [];
    state.deletedCategories.push(catId);
  } else {
    delete state.customCategories[catId];
  }
  // Remove from DOM
  const card = document.getElementById(`cat-${catId}`);
  if (card) card.remove();
  saveState();
  rebuildTaskLists();
}

// =====================================================
// ===== START =========================================
// =====================================================
init();
