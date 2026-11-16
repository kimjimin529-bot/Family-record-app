/* ============================================================
   우리 가족 기록장 — UI shell: header, router, sheets, toast, weather
   ============================================================ */
'use strict';

const ui = {
  chatDraft: '',
  stickerTray: false,
  chatScroll: 0,
  calCursor: null,
  openSheet: null,
  sheetSubmit: null,
  timerTab: 'count',
};

const PAGES = ['home', 'routine', 'meals', 'schedule', 'health', 'praise', 'allowance', 'chat'];
const PAGE_LABEL = {
  home: '홈', routine: '루틴', meals: '식사', schedule: '일정',
  health: '건강', praise: '칭찬', allowance: '용돈', chat: '채팅',
};

/* ---------- toast ---------- */
function toast(msg) {
  const wrap = $('#toastWrap');
  if (!wrap) return;
  while (wrap.childElementCount >= 2) wrap.firstElementChild.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s ease, transform .3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 320);
  }, 1900);
}

/* ---------- sheets ---------- */
function closeSheet() {
  const root = $('#modalRoot');
  if (root) root.innerHTML = '';
  ui.openSheet = null;
  ui.sheetSubmit = null;
  document.body.style.overflow = '';
}

function openSheet(opts) {
  const o = opts || {};
  const root = $('#modalRoot');
  if (!root) return;
  root.innerHTML = `
    <div class="overlay" data-overlay="1">
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(o.title || '')}">
        <div class="sheet-grip"></div>
        <div class="sheet-head">
          <div class="sheet-title">${o.icon ? `<span>${o.icon}</span>` : ''}${esc(o.title || '')}</div>
          <button class="sheet-close" data-act="sheet.close" aria-label="닫기">✕</button>
        </div>
        <div class="sheet-body">${o.body || ''}</div>
        ${o.actions ? `<div class="sheet-actions">${o.actions}</div>` : ''}
      </div>
    </div>`;
  ui.openSheet = o;
  ui.sheetSubmit = o.onSubmit || null;
  document.body.style.overflow = 'hidden';
  const sheet = $('.sheet', root);
  if (sheet) sheet.scrollTop = 0;
  const first = $('input,textarea,select', root);
  if (first && o.focus !== false) setTimeout(() => { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }, 120);
}

/* generic form sheet
   fields: [{key,label,type,value,placeholder,options,rows,min,max,step,hint,required}] */
function formSheet(opts) {
  const o = opts || {};
  const fields = o.fields || [];
  const body = fields.map(f => {
    const id = 'f_' + f.key;
    if (f.type === 'select') {
      const opts2 = (f.options || []).map(op => {
        const val = typeof op === 'string' ? op : op.value;
        const lab = typeof op === 'string' ? op : op.label;
        return `<option value="${esc(val)}"${String(f.value) === String(val) ? ' selected' : ''}>${esc(lab)}</option>`;
      }).join('');
      return `<div class="field"><label for="${id}">${esc(f.label)}</label><select id="${id}" data-field="${esc(f.key)}">${opts2}</select></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="field"><label for="${id}">${esc(f.label)}</label><textarea id="${id}" data-field="${esc(f.key)}" rows="${f.rows || 3}" placeholder="${esc(f.placeholder || '')}">${esc(f.value || '')}</textarea>${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ''}</div>`;
    }
    if (f.type === 'checkbox') {
      return `<div class="opt-row"><div class="grow"><div class="opt-title">${esc(f.label)}</div>${f.hint ? `<div class="opt-sub">${esc(f.hint)}</div>` : ''}</div>
        <button class="switch${f.value ? ' on' : ''}" data-act="sheet.check" data-field="${esc(f.key)}" aria-pressed="${f.value ? 'true' : 'false'}"></button>
        <input type="hidden" data-field="${esc(f.key)}" value="${f.value ? '1' : ''}" /></div>`;
    }
    const extra = f.type === 'number' ? ` inputmode="numeric"` : '';
    return `<div class="field"><label for="${id}">${esc(f.label)}</label>
      <input id="${id}" type="${f.type || 'text'}" data-field="${esc(f.key)}" value="${esc(f.value == null ? '' : f.value)}"
        placeholder="${esc(f.placeholder || '')}"${extra}${f.min != null ? ` min="${f.min}"` : ''}${f.max != null ? ` max="${f.max}"` : ''}${f.step != null ? ` step="${f.step}"` : ''} />
      ${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ''}</div>`;
  }).join('');
  openSheet({
    title: o.title,
    icon: o.icon,
    body: (o.description ? `<div class="card-desc">${esc(o.description)}</div>` : '') + body,
    actions: `<button class="btn" data-act="sheet.close">취소</button><button class="btn btn-primary" data-act="sheet.submit">${esc(o.submitLabel || '저장')}</button>`,
    onSubmit: o.onSubmit,
  });
}

function readSheetValues(root) {
  const out = {};
  $$('[data-field]', root || document).forEach(el => {
    if (el.classList.contains('switch')) return;
    out[el.getAttribute('data-field')] = el.type === 'checkbox' ? el.checked : el.value;
  });
  return out;
}

function submitSheet() {
  if (!ui.sheetSubmit) { closeSheet(); return; }
  const root = $('#modalRoot');
  const values = readSheetValues(root);
  const keep = ui.sheetSubmit(values, root);
  if (keep === false) return;
  closeSheet();
}

function confirmSheet(title, message, okLabel, onOk, danger) {
  openSheet({
    title: title,
    icon: '🐣',
    body: `<div class="card-desc" style="margin-bottom:2px;">${esc(message)}</div>`,
    actions: `<button class="btn" data-act="sheet.close">취소</button>
      <button class="btn ${danger ? 'btn-pink' : 'btn-primary'}" data-act="sheet.confirm">${esc(okLabel || '확인')}</button>`,
    onSubmit: () => { onOk(); },
  });
}

/* ---------- router ---------- */
function currentPage() { return state.settings.page || 'home'; }

function showPage(name, opts) {
  if (!PAGES.includes(name)) name = 'home';
  state.settings.page = name;
  save();
  render();
  const main = $('#pages');
  if (main && !(opts && opts.keepScroll)) window.scrollTo({ top: 0, behavior: 'auto' });
}

function render() {
  if (!state) return;
  renderHeader();
  renderNav();
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (!el) return;
    if (p === 'chat') { renderChat(el); return; }
    if (p === 'home') { el.innerHTML = homeView(); return; }
    if (p === 'routine') { el.innerHTML = routineView(); return; }
    if (p === 'meals') { el.innerHTML = mealsView(); return; }
    if (p === 'schedule') { el.innerHTML = scheduleView(); return; }
    if (p === 'health') { el.innerHTML = healthView(); return; }
    if (p === 'praise') { el.innerHTML = praiseView(); return; }
    if (p === 'allowance') { el.innerHTML = allowanceView(); return; }
  });
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('active', p === currentPage());
  });
  if (currentPage() === 'chat') restoreChatScroll();
}

/* ---------- header / nav ---------- */
function renderHeader() {
  const t = todayKey();
  const slot = $('#appHeader');
  if (!slot) return;
  slot.innerHTML = `
    <div class="brand">
      <div class="brand-badge">${charSVG('choco', { mood: 'happy' })}</div>
      <h1 class="brand-title">우리 가족 기록장</h1>
    </div>
    <div class="header-actions">
      <button class="icon-btn" data-act="settings.open" aria-label="설정">${ICONS.gear}</button>
      <button class="icon-btn" data-act="go.chat" aria-label="가족 채팅">${ICONS.chat}</button>
    </div>
    <div class="date-row">
      <div class="date-block">
        <div class="date-main">${fmtKoDate(t)}</div>
        <div class="date-sub">우리집의 포근한 하루</div>
      </div>
      <div class="header-pill"><span class="spark">✨</span> 오늘도 함께 기록해요</div>
    </div>`;
}

function renderNav() {
  const slot = $('#tabbar');
  if (!slot) return;
  if (slot.childElementCount === 8) {
    $$('.tab', slot).forEach(b => b.classList.toggle('active', b.dataset.page === currentPage()));
    return;
  }
  slot.innerHTML = PAGES.map(p => `
    <button class="tab${p === currentPage() ? ' active' : ''}" data-act="nav" data-page="${p}" aria-label="${PAGE_LABEL[p]}">
      ${ICONS[p]}<span>${PAGE_LABEL[p]}</span>
    </button>`).join('');
}

/* ---------- weather ---------- */
const CITIES = [
  { name: '서울', lat: 37.5665, lon: 126.978 },
  { name: '부산', lat: 35.1796, lon: 129.0756 },
  { name: '대구', lat: 35.8714, lon: 128.6014 },
  { name: '인천', lat: 37.4563, lon: 126.7052 },
  { name: '광주', lat: 35.1595, lon: 126.8526 },
  { name: '대전', lat: 36.3504, lon: 127.3845 },
  { name: '울산', lat: 35.5384, lon: 129.3114 },
  { name: '세종', lat: 36.48, lon: 127.289 },
  { name: '수원', lat: 37.2636, lon: 127.0286 },
  { name: '춘천', lat: 37.8813, lon: 127.7298 },
  { name: '청주', lat: 36.6424, lon: 127.489 },
  { name: '전주', lat: 35.8242, lon: 127.148 },
  { name: '포항', lat: 36.019, lon: 129.3435 },
  { name: '창원', lat: 35.2281, lon: 128.6811 },
  { name: '제주', lat: 33.4996, lon: 126.5312 },
  { name: '강릉', lat: 37.7519, lon: 128.8761 },
];

function weatherDesc(code) {
  const c = Number(code);
  if (c === 0) return '맑음';
  if (c === 1) return '대체로 맑음';
  if (c === 2) return '구름 조금';
  if (c === 3) return '흐림';
  if (c === 45 || c === 48) return '안개';
  if (c >= 51 && c <= 57) return '약한 이슬비';
  if (c >= 61 && c <= 67) return '비';
  if (c >= 71 && c <= 77) return '눈';
  if (c >= 80 && c <= 82) return '소나기';
  if (c >= 85 && c <= 86) return '눈 소나기';
  if (c >= 95) return '천둥번개';
  return '맑음';
}

function dustGrade(kind, v) {
  if (v == null || isNaN(v)) return null;
  if (kind === 'pm10') {
    if (v <= 30) return '좋음';
    if (v <= 80) return '보통';
    if (v <= 150) return '나쁨';
    return '매우 나쁨';
  }
  if (v <= 15) return '좋음';
  if (v <= 35) return '보통';
  if (v <= 75) return '나쁨';
  return '매우 나쁨';
}

function dustClass(grade) {
  if (grade === '좋음') return 'chip-mint';
  if (grade === '보통') return 'chip-soft';
  if (grade === '나쁨') return 'chip-peach';
  return 'chip-pink';
}

let weatherBusy = false;
async function refreshWeather(force) {
  const w = state.weather;
  if (!force && w && w.ts && Date.now() - w.ts < 1000 * 60 * 20) return;
  if (weatherBusy) return;
  weatherBusy = true;
  const lat = state.settings.lat;
  const lon = state.settings.lon;
  try {
    const [fRes, aRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FSeoul&forecast_days=1`),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5&timezone=Asia%2FSeoul`),
    ]);
    if (!fRes.ok) throw new Error('weather ' + fRes.status);
    const f = await fRes.json();
    let pm10 = null, pm25 = null;
    try {
      if (aRes && aRes.ok) {
        const a = await aRes.json();
        pm10 = a.current ? a.current.pm10 : null;
        pm25 = a.current ? a.current.pm2_5 : null;
      }
    } catch (e) { /* 대기질은 없어도 괜찮아요 */ }
    state.weather = {
      ok: true,
      city: state.settings.city,
      temp: Math.round(f.current.temperature_2m),
      code: f.current.weather_code,
      tmax: Math.round(f.daily.temperature_2m_max[0]),
      tmin: Math.round(f.daily.temperature_2m_min[0]),
      pm10: pm10 == null ? null : Math.round(pm10),
      pm25: pm25 == null ? null : Math.round(pm25),
      ts: Date.now(),
    };
    save();
  } catch (err) {
    console.warn('날씨를 불러오지 못했어요', err);
    state.weather = { ok: false, city: state.settings.city, ts: Date.now() };
    save();
  } finally {
    weatherBusy = false;
    if (currentPage() === 'home') render();
  }
}

function weatherCardView() {
  const w = state.weather;
  const city = state.settings.city;
  if (!w) {
    return `<div class="weather-card">
      <div class="weather-main">
        <div class="weather-icon">${weatherIcon(1, 32)}</div>
        <span class="weather-city">${esc(city)}</span>
        <span class="weather-desc">날씨를 불러오는 중…</span>
      </div>
      <div class="weather-row2"><span class="weather-note">잠시만 기다려 주세요 ☁️</span></div>
    </div>`;
  }
  if (!w.ok) {
    return `<div class="weather-card">
      <div class="weather-main">
        <div class="weather-icon">${weatherIcon(3, 32)}</div>
        <span class="weather-city">${esc(city)}</span>
        <span class="weather-desc">날씨를 불러오지 못했어요</span>
      </div>
      <div class="weather-row2">
        <span class="weather-note">인터넷이 연결되면 다시 보여드릴게요</span>
        <button class="link-btn" data-act="weather.retry" style="margin-left:auto;">다시 시도</button>
      </div>
    </div>`;
  }
  const g10 = dustGrade('pm10', w.pm10);
  const g25 = dustGrade('pm25', w.pm25);
  const bad = (g10 === '나쁨' || g10 === '매우 나쁨' || g25 === '나쁨' || g25 === '매우 나쁨');
  return `<div class="weather-card">
    <div class="weather-main">
      <div class="weather-icon">${weatherIcon(w.code, 32)}</div>
      <span class="weather-city">${esc(w.city || city)}</span>
      <span class="weather-temp">${w.temp}°</span>
      <span class="weather-desc">${weatherDesc(w.code)}</span>
      <span class="weather-range">최저 ${w.tmin}° · 최고 ${w.tmax}°</span>
    </div>
    <div class="weather-row2">
      ${g10 ? `<span class="chip ${dustClass(g10)}">미세먼지 ${g10}</span>` : ''}
      ${g25 ? `<span class="chip ${dustClass(g25)}">초미세먼지 ${g25}</span>` : ''}
      ${bad ? `<span class="mask-pill">😷 마스크 챙겨요</span>` : `<span class="mask-pill">🌿 공기 좋아요</span>`}
    </div>
  </div>`;
}

/* ---------- small shared bits ---------- */
function avatarHTML(id, size, mood) {
  return `<div class="avatar${size ? ' ' + size : ''}">${charSVG(id, { mood: mood || 'happy' })}</div>`;
}

function emptyNote(text) {
  return `<div class="empty-note">${text}</div>`;
}
