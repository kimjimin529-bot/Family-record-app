/* ============================================================
   우리 가족 기록장 — core: utils, state, defaults, storage
   ============================================================ */
'use strict';

const LS_KEY = 'family-record-app.v1';
const APP_VERSION = 1;

/* ---------- tiny helpers ---------- */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
const pad2 = n => String(n).padStart(2, '0');
const uid = (p) => (p || 'id') + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const won = (n) => (Number(n) || 0).toLocaleString('ko-KR');

const keyOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const todayKey = () => keyOf(new Date());
const parseKey = (k) => { const p = String(k).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const KO_DOW = ['일', '월', '화', '수', '목', '금', '토'];
const fmtKoDate = (k) => { const d = parseKey(k); return `${d.getMonth() + 1}월 ${d.getDate()}일 ${KO_DOW[d.getDay()]}요일`; };
const fmtShort = (k) => { const d = parseKey(k); return `${d.getMonth() + 1}/${d.getDate()}`; };
const fmtClock = (iso) => {
  const d = new Date(iso);
  let h = d.getHours(); const m = pad2(d.getMinutes());
  const ap = h < 12 ? '오전' : '오후';
  h = h % 12; if (h === 0) h = 12;
  return `${ap} ${h}:${m}`;
};
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);

/* ---------- member meta ---------- */
const MEMBER_ORDER = ['choco', 'hodo', 'mom'];
const LOOKS = ['bear', 'bunny', 'cat'];
const LOOK_LABEL = { bear: '곰돌이', bunny: '토끼', cat: '고양이' };

function memberList() { return MEMBER_ORDER.map(id => state.members[id]).filter(Boolean); }
function kids() { return MEMBER_ORDER.filter(id => state.members[id] && state.members[id].allowance).map(id => state.members[id]); }
function mname(id) { const m = state.members[id]; return m ? m.name : id; }

/* ---------- default data ---------- */
function defaultState() {
  const t = todayKey();
  const y = addDays(t, -1);
  const y2 = addDays(t, -2);
  const y3 = addDays(t, -3);
  const nowIso = new Date().toISOString();
  const at = (dayOffset, h, mi) => {
    const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, mi, 0, 0); return d.toISOString();
  };

  const studyItems = [
    { id: 'st_a', member: 'choco', title: '받아쓰기 연습', tag: '10문제', reward: 100, pinned: true },
    { id: 'st_b', member: 'choco', title: '구구단 외우기', tag: '1~9단', reward: 100, pinned: true },
    { id: 'st_c', member: 'choco', title: '독서 노트 쓰기', tag: '1장', reward: 100, pinned: true },
    { id: 'st_d', member: 'choco', title: '수학 문제집', tag: '4장', reward: 100, pinned: false },
    { id: 'st_e', member: 'hodo', title: '한글 받아쓰기', tag: '5문제', reward: 50, pinned: true },
    { id: 'st_f', member: 'hodo', title: '숫자 쓰기 연습', tag: '2장', reward: 50, pinned: true },
    { id: 'st_g', member: 'hodo', title: '그림 일기', tag: '1장', reward: 100, pinned: false },
  ];
  const studyDone = { st_a: true, st_d: true, st_e: true };

  const tx = [];
  // 오늘 공부 적립 (미리 체크된 항목과 맞춰 둡니다)
  tx.push({ id: 'tx_s1', type: 'study', amount: 100, note: '받아쓰기 연습', date: t, itemId: 'st_a' });
  tx.push({ id: 'tx_s2', type: 'study', amount: 100, note: '수학 문제집', date: t, itemId: 'st_d' });
  tx.push({ id: 'tx_s3', type: 'study', amount: 100, note: '독서 노트 쓰기', date: y, itemId: 'st_c' });
  tx.push({ id: 'tx_s4', type: 'study', amount: 100, note: '구구단 외우기', date: y2, itemId: 'st_b' });
  tx.push({ id: 'tx_i1', type: 'in', amount: 1000, note: '할머니께 받은 용돈', date: y3 });
  tx.push({ id: 'tx_o1', type: 'out', amount: 1200, note: '문구점 공책', date: y3 });

  const hodoTx = [
    { id: 'tx_h1', type: 'study', amount: 50, note: '한글 받아쓰기', date: t, itemId: 'st_e' },
    { id: 'tx_h2', type: 'study', amount: 50, note: '숫자 쓰기 연습', date: y, itemId: 'st_f' },
    { id: 'tx_h3', type: 'out', amount: 500, note: '문구점 연필', date: y2 },
  ];

  const s = {
    version: APP_VERSION,
    createdAt: nowIso,
    updatedAt: nowIso,
    settings: {
      city: '서울',
      lat: 37.5665,
      lon: 126.978,
      soundOn: true,
      deviceLock: true,
      chatProfile: 'mom',
      page: 'home',
      stampMember: 'choco',
    },
    members: {
      choco: {
        id: 'choco', name: '초코하임', look: 'bear', item: 'strawberry',
        traits: '책 읽기를 좋아하는 곰돌이', stars: 7, goal: '새 자전거', allowance: true, start: 44200,
      },
      hodo: {
        id: 'hodo', name: '호돌이', look: 'bunny', item: 'carrot',
        traits: '하루 종일 신나는 토끼', stars: 4, goal: '블록 세트', allowance: true, start: 12000,
      },
      mom: {
        id: 'mom', name: '엄마', look: 'cat', item: 'flower',
        traits: '우리집 든든한 대장', stars: 2, goal: '', allowance: false, start: 0,
      },
    },
    routines: {
      [t]: {
        choco: [
          { id: 'r_c1', text: '책 30분 읽기', done: false },
          { id: 'r_c2', text: '내일 준비물 챙기기', done: true },
          { id: 'r_c3', text: '양치 3번 하기', done: false },
        ],
        hodo: [
          { id: 'r_h1', text: '장난감 정리하기', done: true },
          { id: 'r_h2', text: '받아쓰기 1번 쓰기', done: false },
          { id: 'r_h3', text: '신발 가지런히 놓기', done: false },
        ],
        mom: [
          { id: 'r_m1', text: '아침 스트레칭 10분', done: true },
          { id: 'r_m2', text: '초코하임 간식 챙기기', done: false },
          { id: 'r_m3', text: '저녁 준비하기', done: false },
        ],
      },
    },
    stamps: {
      choco: { [t]: true, [y]: true, [y2]: true, [y3]: true, [addDays(t, -5)]: true },
      hodo: { [y]: true, [y2]: true, [addDays(t, -4)]: true },
      mom: {},
    },
    missions: {
      [t]: { text: '저녁 준비 같이 돕기', emoji: '🥕', count: 0 },
    },
    study: { items: studyItems, done: { [t]: studyDone } },
    allowance: {
      choco: { start: 44200, tx: tx },
      hodo: { start: 12000, tx: hodoTx },
    },
    meals: {
      [t]: {
        breakfast: ['계란말이', '우유', '토스트'],
        lunch: ['김치볶음밥'],
        dinner: [],
        snack: ['귤'],
      },
    },
    schedule: [
      { id: 'ev_1', date: addDays(t, 2), title: '초코하임 소풍', member: 'choco', note: '도시락 준비' },
      { id: 'ev_2', date: addDays(t, 5), title: '할머니 생신', member: 'mom', note: '저녁 7시, 할머니 댁' },
      { id: 'ev_3', date: addDays(t, 9), title: '호돌이 태권도 승급심사', member: 'hodo', note: '도복 챙기기' },
    ],
    health: {
      [t]: {
        choco: { med: false, water: 3, mood: '좋아요', temp: '', memo: '' },
        hodo: { med: false, water: 2, mood: '좋아요', temp: '', memo: '' },
        mom: { med: true, water: 4, mood: '보통', temp: '', memo: '조금 피곤해요' },
      },
    },
    praise: [
      { id: 'pr_1', to: 'choco', text: '오늘 받아쓰기 100점! 정말 대단해요 ✏️', date: t, at: at(0, 15, 22) },
      { id: 'pr_2', to: 'hodo', text: '장난감을 스스로 정리했네요. 기특해요 🧸', date: y, at: at(-1, 19, 8) },
    ],
    chat: [
      { id: 'ch_1', by: 'mom', type: 'text', text: '오늘 다들 잘 잤어? ☀️', at: at(-1, 7, 40) },
      { id: 'ch_2', by: 'hodo', type: 'sticker', sticker: 'cheer', at: at(-1, 7, 52) },
      { id: 'ch_3', by: 'choco', type: 'text', text: '엄마! 나 오늘 받아쓰기 100점 맞았어!', at: at(0, 14, 2) },
      { id: 'ch_4', by: 'mom', type: 'text', text: '우와 우리 초코하임 최고다 👏 저녁에 맛있는 거 먹자!', at: at(0, 14, 5), reaction: '❤️' },
      { id: 'ch_5', by: 'hodo', type: 'voice', sec: 6, at: at(0, 15, 14) },
      { id: 'ch_6', by: 'mom', type: 'sticker', sticker: 'love', at: at(0, 16, 47) },
    ],
    weather: null,
    timer: { mode: 'count', minutes: 10, remaining: 600, running: false, endsAt: 0, startedAt: 0, elapsed: 0 },
  };
  return s;
}

/* ---------- storage ---------- */
let state = null;

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultState();
    return migrate(parsed);
  } catch (err) {
    console.warn('저장된 기록을 불러오지 못했어요.', err);
    return defaultState();
  }
}

function migrate(s) {
  const base = defaultState();
  s.version = s.version || 1;
  s.settings = Object.assign({}, base.settings, s.settings || {});
  s.members = s.members || base.members;
  MEMBER_ORDER.forEach(id => {
    s.members[id] = Object.assign({}, base.members[id], s.members[id] || {});
    s.members[id].id = id;
  });
  ['routines', 'stamps', 'missions', 'meals', 'health', 'allowance', 'study', 'praise', 'chat'].forEach(k => {
    if (!s[k] || typeof s[k] !== 'object') s[k] = base[k];
  });
  s.study.items = Array.isArray(s.study.items) ? s.study.items : base.study.items;
  s.study.done = s.study.done || {};
  s.schedule = Array.isArray(s.schedule) ? s.schedule : base.schedule;
  ['choco', 'hodo'].forEach(id => {
    if (!s.allowance[id]) s.allowance[id] = { start: 0, tx: [] };
    if (!Array.isArray(s.allowance[id].tx)) s.allowance[id].tx = [];
  });
  s.timer = Object.assign({}, base.timer, s.timer || {});
  s.version = APP_VERSION;
  return s;
}

let saveTimer = 0;
/* 동기화 준비 메모
   지금은 state 전체를 localStorage에만 저장합니다.
   나중에 Supabase/Firebase를 붙일 때는 이 save()에서 state를 서버로 push하고,
   load()에서 서버 값을 받아오면 화면 코드는 그대로 쓸 수 있어요.
   (state는 직렬화 가능한 순수 JSON이라 그대로 payload로 쓸 수 있습니다.) */
function save() {
  if (!state) return;
  state.updatedAt = new Date().toISOString();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('저장 공간이 부족해요.', err);
      toast('저장 공간이 부족해 기록을 저장하지 못했어요 😢');
    }
  }, 60);
}

function commit() { save(); render(); }

/* ---------- daily getters ---------- */
function routineOf(dateKey) {
  const k = dateKey || todayKey();
  if (!state.routines[k]) state.routines[k] = { choco: [], hodo: [], mom: [] };
  const day = state.routines[k];
  MEMBER_ORDER.forEach(id => { if (!Array.isArray(day[id])) day[id] = []; });
  return day;
}
function mealsOf(dateKey) {
  const k = dateKey || todayKey();
  if (!state.meals[k]) state.meals[k] = { breakfast: [], lunch: [], dinner: [], snack: [] };
  return state.meals[k];
}
function healthOf(dateKey) {
  const k = dateKey || todayKey();
  if (!state.health[k]) state.health[k] = {};
  const day = state.health[k];
  MEMBER_ORDER.forEach(id => {
    if (!day[id]) day[id] = { med: false, water: 0, mood: '', temp: '', memo: '' };
    day[id] = Object.assign({ med: false, water: 0, mood: '', temp: '', memo: '' }, day[id]);
  });
  return day;
}
function missionOf(dateKey) {
  const k = dateKey || todayKey();
  if (!state.missions[k]) {
    const m = pickMission();
    state.missions[k] = { text: m.text, emoji: m.emoji, count: 0 };
  }
  return state.missions[k];
}
function studyDoneToday() {
  const t = todayKey();
  if (!state.study.done[t]) state.study.done[t] = {};
  return state.study.done[t];
}
function studyItemsFor(memberId, dateKey) {
  const dk = dateKey || todayKey();
  return state.study.items.filter(it => it.member === memberId && (it.pinned || !it.created || it.created === dk || it.pinnedToday));
}
function allowanceOf(id) {
  if (!state.allowance[id]) state.allowance[id] = { start: 0, tx: [] };
  if (!Array.isArray(state.allowance[id].tx)) state.allowance[id].tx = [];
  return state.allowance[id];
}
function balanceOf(id) {
  const a = allowanceOf(id);
  return a.tx.reduce((sum, t) => sum + (t.type === 'out' ? -t.amount : t.amount), Number(a.start) || 0);
}
function totalsOf(id) {
  const a = allowanceOf(id);
  const t = { start: Number(a.start) || 0, study: 0, in: 0, out: 0 };
  a.tx.forEach(x => { if (x.type === 'study') t.study += x.amount; else if (x.type === 'in') t.in += x.amount; else if (x.type === 'out') t.out += x.amount; });
  return t;
}
function stampSet(memberId) {
  if (!state.stamps[memberId]) state.stamps[memberId] = {};
  return state.stamps[memberId];
}
function stampToday(memberId, manual) {
  if (!state.members[memberId] || state.members[memberId].allowance === undefined) return false;
  const set = stampSet(memberId);
  const t = todayKey();
  if (set[t]) return false;
  set[t] = manual ? 'manual' : 'auto';
  return true;
}
function streakOf(memberId) {
  const set = stampSet(memberId);
  let d = todayKey();
  if (!set[d]) d = addDays(d, -1);
  let n = 0;
  while (set[d] && n < 400) { n++; d = addDays(d, -1); }
  return n;
}
function stampsInMonth(memberId, y, m) {
  const set = stampSet(memberId);
  return Object.keys(set).filter(k => {
    const d = parseKey(k);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
}

/* ---------- missions ---------- */
const MISSION_POOL = [
  { text: '저녁 준비 같이 돕기', emoji: '🥕' },
  { text: '식탁 함께 닦기', emoji: '🧽' },
  { text: '가족이랑 산책 20분', emoji: '🌳' },
  { text: '오늘 고마운 일 한 가지 말하기', emoji: '💬' },
  { text: '설거지 같이 하기', emoji: '🍽️' },
  { text: '빨래 개기 도와드리기', emoji: '🧺' },
  { text: '동생(형) 칭찬 한마디', emoji: '🌟' },
  { text: '가족 사진 한 장 찍기', emoji: '📸' },
  { text: '현관 신발 정리하기', emoji: '👟' },
  { text: '함께 보드게임 한 판', emoji: '🎲' },
  { text: '냉장고 정리 돕기', emoji: '🧊' },
  { text: '가족에게 손편지 쓰기', emoji: '💌' },
  { text: '화분에 물 주기', emoji: '🪴' },
  { text: '거실 먼지 털기', emoji: '🧹' },
  { text: '내일 입을 옷 함께 고르기', emoji: '👕' },
  { text: '가족 노래 한 곡 같이 부르기', emoji: '🎵' },
  { text: '강아지·식물 돌보기', emoji: '🐶' },
  { text: '오늘 하루 감사한 일 이야기하기', emoji: '🍀' },
  { text: '함께 과일 깎아 먹기', emoji: '🍎' },
  { text: '택배 상자 정리하기', emoji: '📦' },
];
let lastMissionPick = '';
function pickMission() {
  const cur = lastMissionPick;
  const pool = MISSION_POOL.filter(m => m.text !== cur);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  lastMissionPick = pick.text;
  return pick;
}

/* ---------- misc domain actions ---------- */
function addStars(id, n) {
  const m = state.members[id];
  if (!m) return;
  m.stars = Math.max(0, (Number(m.stars) || 0) + n);
}

function earnStudyAllowance(memberId, item) {
  if (!state.members[memberId] || !state.members[memberId].allowance) return;
  const a = allowanceOf(memberId);
  const t = todayKey();
  if (a.tx.some(x => x.type === 'study' && x.itemId === item.id && x.date === t)) return;
  a.tx.push({ id: uid('tx'), type: 'study', amount: Number(item.reward) || 0, note: item.title, date: t, itemId: item.id });
}
function unearnStudyAllowance(memberId, item) {
  const a = allowanceOf(memberId);
  const t = todayKey();
  a.tx = a.tx.filter(x => !(x.type === 'study' && x.itemId === item.id && x.date === t));
}
