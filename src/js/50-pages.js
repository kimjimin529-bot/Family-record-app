/* ============================================================
   우리 가족 기록장 — meals / schedule / health / praise / allowance
   ============================================================ */
'use strict';

/* ---------- meals ---------- */
const MEAL_KINDS = [
  { key: 'breakfast', label: '아침', emoji: '🌅' },
  { key: 'lunch', label: '점심', emoji: '☀️' },
  { key: 'dinner', label: '저녁', emoji: '🌙' },
  { key: 'snack', label: '간식', emoji: '🍪' },
];
const MENU_IDEAS = [
  '김치볶음밥', '된장찌개', '계란말이', '불고기', '떡볶이', '잔치국수',
  '카레라이스', '치킨', '삼겹살', '미역국', '김밥', '우동', '돈가스',
];
const RANDOM_MENUS = [
  '오늘은 김치볶음밥 어때요? 🍚', '된장찌개에 계란말이 조합! 🥚', '따뜻한 잔치국수 한 그릇 🍜',
  '떡볶이에 튀김 곁들여요 🌶️', '불고기와 상추쌈 🥬', '카레라이스는 언제나 옳아요 🍛',
  '미역국에 소고기 무침 🥩', '아이들이 좋아하는 돈가스 🍱', '김밥 재료 준비해 볼까요 🌯',
  '우동에 유부초밥 🍥',
];

function mealsView() {
  const meals = mealsOf();
  const cards = MEAL_KINDS.map(k => {
    const list = meals[k.key] || [];
    const items = list.length
      ? list.map((txt, i) => `<span class="meal-item">${esc(txt)}<button data-act="meal.del" data-kind="${k.key}" data-index="${i}" aria-label="${esc(txt)} 삭제">✕</button></span>`).join('')
      : '';
    return `
      <div class="meal-card ${k.key}">
        <div class="meal-head">
          <span style="font-size:17px;">${k.emoji}</span>
          <div class="meal-name">${k.label}</div>
          <span class="chip chip-soft" style="margin-left:auto;">${list.length}가지</span>
        </div>
        ${list.length ? `<div class="meal-list">${items}</div>` : `<div class="meal-empty">아직 기록이 없어요. 오늘은 무엇을 먹었나요?</div>`}
        <div class="meal-add">
          <input type="text" id="mealInput-${k.key}" data-role="meal-input" data-kind="${k.key}" placeholder="${k.label} 메뉴 추가" aria-label="${k.label} 메뉴 추가" />
          <button class="btn" data-act="meal.add" data-kind="${k.key}">추가</button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="page-head">
      <h2>🍚 오늘의 식사</h2>
      <p>${fmtKoDate(todayKey())} · 우리 가족이 무엇을 먹었는지 남겨 두세요</p>
    </div>
    <button class="btn btn-blue dice-btn" data-act="meal.random">🎲 오늘 뭐 먹지? 메뉴 추천받기</button>
    ${cards}
    <div class="card">
      <div class="card-title" style="margin-bottom:6px;">🍳 가족 메뉴 아이디어</div>
      <div class="card-desc" style="margin-bottom:8px;">메뉴를 누르면 어느 식사에 넣을지 골라요</div>
      <div class="suggest-row">
        ${MENU_IDEAS.map(m => `<button class="suggest" data-act="meal.idea" data-menu="${esc(m)}">${esc(m)}</button>`).join('')}
      </div>
    </div>`;
}

/* ---------- schedule ---------- */
const MEMBER_COLOR = { choco: 'chip-peach', hodo: 'chip-mint', mom: 'chip-pink' };

function scheduleView() {
  if (!ui.calCursor) ui.calCursor = new Date();
  const y = ui.calCursor.getFullYear();
  const mo = ui.calCursor.getMonth();
  const first = new Date(y, mo, 1);
  const startDow = (first.getDay() + 6) % 7;
  const days = new Date(y, mo + 1, 0).getDate();
  const t = todayKey();
  const byDate = {};
  state.schedule.forEach(ev => { (byDate[ev.date] = byDate[ev.date] || []).push(ev); });

  let cells = ['월', '화', '수', '목', '금', '토', '일']
    .map((d, i) => `<div class="cal-dow${i === 5 ? ' sun' : (i === 6 ? ' sun' : '')}">${d}</div>`).join('');
  for (let i = 0; i < startDow; i++) cells += '<div class="cal-cell other"></div>';
  for (let d = 1; d <= days; d++) {
    const k = keyOf(new Date(y, mo, d));
    const has = !!byDate[k];
    cells += `<div class="cal-cell${k === t ? ' today' : ''}${has ? ' has-event' : ''}" ${has ? `title="${esc(byDate[k].map(e => e.title).join(', '))}"` : ''}>
      <span>${d}</span>${has ? '<span class="cal-dot"></span>' : ''}
    </div>`;
  }

  const upcoming = state.schedule
    .filter(ev => ev.date >= t)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = state.schedule.filter(ev => ev.date < t).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);
  const rows = upcoming.length
    ? upcoming.map(eventRow).join('')
    : `<div class="empty-note">다가오는 일정이 없어요. 아래에서 추가해 보세요 🌷</div>`;

  return `
    <div class="page-head">
      <h2>📅 가족 일정</h2>
      <p>소풍, 병원, 할머니 댁 방문까지 한눈에 모아 봐요</p>
    </div>
    <div class="card cal-card">
      <div class="cal-head">
        <div class="cal-month">${y}년 ${mo + 1}월</div>
        <div class="cal-nav">
          <button class="mini-btn" data-act="cal.prev" aria-label="이전 달">‹</button>
          <button class="mini-btn" data-act="cal.next" aria-label="다음 달">›</button>
        </div>
      </div>
      <div class="cal-grid">${cells}</div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="card-title">🌷 다가오는 일정</div>
        <button class="btn btn-sm" data-act="event.add">+ 일정 추가</button>
      </div>
      ${rows}
      ${past.length ? `<div class="hr-dash"></div><div class="card-desc" style="margin-bottom:4px;">지난 일정</div>${past.map(eventRow).join('')}` : ''}
    </div>`;
}

function eventRow(ev) {
  const d = parseKey(ev.date);
  const m = state.members[ev.member];
  const dday = daysBetween(todayKey(), ev.date);
  const label = dday === 0 ? '오늘' : (dday > 0 ? `D-${dday}` : `D+${-dday}`);
  return `
    <div class="event-row">
      <div class="event-date"><div class="d">${d.getDate()}</div><div class="m">${d.getMonth() + 1}월</div></div>
      <div class="event-main">
        <div class="event-title">${esc(ev.title)}</div>
        <div class="event-meta">${label}${ev.note ? ' · ' + esc(ev.note) : ''}</div>
      </div>
      <div class="row-actions">
        ${m ? `<span class="chip ${MEMBER_COLOR[ev.member] || 'chip-soft'}" style="padding:3px 7px;font-size:10.5px;">${esc(m.name)}</span>` : ''}
        <button class="mini-btn del" data-act="event.del" data-id="${ev.id}" aria-label="삭제">${ICONS.x}</button>
      </div>
    </div>`;
}

/* ---------- health ---------- */
const MOODS = ['좋아요', '보통', '힘들어요'];

function healthView() {
  const day = healthOf();
  const cards = MEMBER_ORDER.map(id => {
    const m = state.members[id];
    const h = day[id];
    const dots = Array.from({ length: 8 }, (_, i) => `<span class="water-dot${i < h.water ? ' on' : ''}"></span>`).join('');
    return `
      <div class="health-card">
        <div class="health-head">
          ${avatarHTML(id, 'sm')}
          <div class="member-main">
            <div class="member-name" style="font-size:16.5px;">${esc(m.name)}</div>
            <div class="block-count">${h.med ? '약 챙겼어요 ✓' : '약 아직이에요'} · 물 ${h.water}잔</div>
          </div>
        </div>
        <div class="health-row">
          <span class="health-label">💊 약 챙기기</span>
          <button class="toggle-pill${h.med ? ' on' : ''}" data-act="health.med" data-member="${id}">${h.med ? '챙겼어요' : '아직'}</button>
        </div>
        <div class="health-row">
          <span class="health-label">💧 물 마시기</span>
          <div class="water-dots">${dots}</div>
          <button class="water-btn" data-act="health.water" data-member="${id}" data-delta="1" aria-label="물 한 잔 더">+</button>
          <button class="water-btn" data-act="health.water" data-member="${id}" data-delta="-1" aria-label="물 한 잔 빼기" style="background:#F7F2EA;border-color:#EDE3D2;color:#AC9880;">−</button>
        </div>
        <div class="health-row">
          <span class="health-label">🌤️ 컨디션</span>
          <div class="mood-chips">
            ${MOODS.map(md => `<button class="mood${h.mood === md ? ' on' : ''}" data-act="health.mood" data-member="${id}" data-mood="${md}">${md}</button>`).join('')}
          </div>
        </div>
        <div class="health-row">
          <span class="health-label">🌡️ 체온</span>
          <input class="temp-input" type="number" inputmode="decimal" step="0.1" min="34" max="42" value="${esc(h.temp || '')}" data-role="health-temp" data-member="${id}" placeholder="36.5" aria-label="체온" />
          <span class="tiny muted">℃</span>
          <span class="spacer"></span>
        </div>
        <textarea class="health-memo" data-role="health-memo" data-member="${id}" placeholder="오늘 컨디션이 어땠나요? (예: 조금 피곤해요)" aria-label="건강 메모">${esc(h.memo || '')}</textarea>
      </div>`;
  }).join('');
  const waterSum = MEMBER_ORDER.reduce((s, id) => s + (day[id] ? day[id].water : 0), 0);
  const medSum = MEMBER_ORDER.filter(id => day[id] && day[id].med).length;
  return `
    <div class="page-head">
      <h2>💗 오늘의 건강</h2>
      <p>약 챙기기부터 물 마시기까지, 우리 가족의 하루 건강을 살펴봐요</p>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin:0 2px 12px;">
      <span class="chip chip-mint">💧 오늘 물 ${waterSum}잔</span>
      <span class="chip chip-blue">💊 약 ${medSum}명 챙김</span>
    </div>
    ${cards}`;
}

/* ---------- praise ---------- */
const PRAISE_QUICK = [
  '오늘 정말 멋졌어요!', '엄마가 자랑스러워요', '끝까지 해냈네요 👏', '고마워요, 최고예요',
  '웃는 얼굴이 제일 예뻐요', '우리 ○○ 최고!',
];

function praiseView() {
  const sel = state.praiseDraftTo || 'choco';
  if (!ui.praiseDraft) ui.praiseDraft = '';
  const list = state.praise.slice().sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  const notes = list.length ? list.map(p => {
    const m = state.members[p.to];
    return `
      <div class="praise-note">
        ${avatarHTML(p.to, 'sm', 'happy')}
        <div class="praise-note-body">
          <div class="praise-note-text">${esc(p.text)}</div>
          <div class="praise-note-meta"><b>${esc(m ? m.name : p.to)}</b> · ${esc(fmtKoDate(p.date))} · 별 +1</div>
        </div>
        <button class="mini-btn del" data-act="praise.del" data-id="${p.id}" aria-label="삭제">${ICONS.x}</button>
      </div>`;
  }).join('') : `<div class="empty-note">아직 칭찬 기록이 없어요. 첫 칭찬을 남겨 보세요 🌟</div>`;

  return `
    <div class="page-head">
      <h2><span class="head-star">${ICONS.star}</span> 칭찬 한마디</h2>
      <p>칭찬을 보내면 그 사람 카드에 별이 하나 쌓여요</p>
    </div>
    <div class="praise-card">
      <div class="card-title" style="margin-bottom:2px;">💌 누구에게 칭찬할까요?</div>
      <div class="praise-picks">
        ${MEMBER_ORDER.map(id => {
          const m = state.members[id];
          return `<button class="pick${sel === id ? ' active' : ''}" data-act="praise.pick" data-member="${id}">
            ${charSVG(id)}<span>${esc(m.name)}</span></button>`;
        }).join('')}
      </div>
      <textarea class="praise-input" id="praiseText" placeholder="예) 오늘 동생 챙겨 줘서 고마워! 엄마가 다 봤어 💕" aria-label="칭찬 내용">${esc(ui.praiseDraft || '')}</textarea>
      <div class="praise-quick">
        ${PRAISE_QUICK.map(q => `<button class="chip chip-soft" data-act="praise.quick" data-text="${esc(q)}">${esc(q)}</button>`).join('')}
      </div>
      <button class="btn btn-pink btn-block" data-act="praise.send">${ICONS.star} 칭찬 보내기</button>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:10px;">🌟 우리 가족 칭찬 기록</div>
      ${notes}
    </div>`;
}

/* ---------- allowance ---------- */
function allowanceView() {
  const list = kids();
  const id = list.some(k => k.id === state.settings.allowKid) ? state.settings.allowKid : (list[0] && list[0].id);
  if (!id) return `<div class="card">용돈을 쓰는 가족이 없어요. 설정에서 '용돈'을 켜 주세요.</div>`;
  state.settings.allowKid = id;
  const m = state.members[id];
  const a = allowanceOf(id);
  const t = totalsOf(id);
  const bal = balanceOf(id);
  const goal = m.goal ? `<span class="chip chip-peach">🎯 ${esc(m.goal)}</span>` : '';

  const studyGroups = {};
  a.tx.filter(x => x.type === 'study').forEach(x => {
    (studyGroups[x.date] = studyGroups[x.date] || []).push(x);
  });
  const studyDays = Object.keys(studyGroups).sort((x, y) => y.localeCompare(x)).slice(0, 7);
  const daily = studyDays.length ? studyDays.map(d => {
    const items = studyGroups[d];
    const sum = items.reduce((s, x) => s + x.amount, 0);
    return `<div class="daily-row">
      <span class="d">${fmtKoDate(d)}${d === todayKey() ? ' <span class="chip chip-mint" style="padding:1px 6px;font-size:10px;">오늘</span>' : ''}</span>
      <span class="n">공부 완료 ${items.length}개 · +${won(sum)}원</span>
    </div>`;
  }).join('') : `<div class="empty-note">공부를 체크하면 하루 한 줄로 쌓여요</div>`;

  const recent = a.tx.slice().sort((x, y) => (y.date + (y.id || '')).localeCompare(x.date + (x.id || ''))).slice(0, 12);
  const txRows = recent.length ? recent.map(x => `
    <div class="tx-row">
      <span class="tx-what">${x.type === 'study' ? '📚 ' : (x.type === 'in' ? '➕ ' : '➖ ')}${esc(x.note || (x.type === 'in' ? '입금' : '사용'))}</span>
      <span class="tx-date">${fmtShort(x.date)}</span>
      <span class="tx-amount ${x.type}">${x.type === 'out' ? '-' : '+'}${won(x.amount)}원</span>
      ${x.type === 'study' ? '' : `<button class="mini-btn del" data-act="allow.txDel" data-id="${x.id}" aria-label="삭제" style="width:24px;height:24px;">${ICONS.x}</button>`}
    </div>`).join('') : `<div class="empty-note">아직 기록이 없어요</div>`;

  return `
    <div class="page-head">
      <h2>🐷 용돈기입장</h2>
      <p>공부를 끝낼 때마다 정한 금액(100원·50원)씩 쌓여요 · 돈은 여기에 적어요</p>
    </div>
    <div class="member-switch">
      ${list.map(k => `<button class="switch-chip${k.id === id ? ' active' : ''}" data-act="allow.member" data-member="${k.id}">
        ${charSVG(k.id)}<span>${esc(k.name)}</span></button>`).join('')}
    </div>
    <div class="allow-card">
      <div class="allow-hero">
        <div>
          <div class="allow-label">지금 모은 돈</div>
          <div class="allow-total">${won(bal)}<span style="font-size:18px;">원</span></div>
        </div>
        ${goal}
      </div>
      <div class="allow-pills">
        <span class="allow-pill">시작 금액 <b>${won(t.start)}원</b></span>
        <span class="allow-pill">공부 적립 <b>+${won(t.study)}원</b></span>
        <span class="allow-pill">입금 <b>+${won(t.in)}원</b></span>
        <span class="allow-pill">사용 <b>-${won(t.out)}원</b></span>
      </div>
      <div class="allow-field">
        <label for="startMoney">시작 금액(이미 모아 둔 돈)</label>
        <input id="startMoney" type="number" inputmode="numeric" value="${Number(a.start) || 0}" data-role="allow-start" data-member="${id}" />
      </div>
      <div class="divider-dash"></div>
      <div class="tx-form">
        <input type="number" inputmode="numeric" id="txAmount" placeholder="금액" aria-label="금액" />
        <input type="text" class="note" id="txNote" placeholder="무엇에 썼나요? (선택)" aria-label="메모" />
        <button class="btn btn-primary" data-act="allow.in">+ 입금</button>
        <button class="btn" data-act="allow.out">- 사용</button>
      </div>
      <div class="allow-sum" style="margin-top:12px;">
        <div class="allow-sum-row"><span>시작 금액</span><b>${won(t.start)}원</b></div>
        <div class="allow-sum-row"><span>공부 적립 합계</span><b>+${won(t.study)}원</b></div>
        <div class="allow-sum-row"><span>입금 합계</span><b>+${won(t.in)}원</b></div>
        <div class="allow-sum-row"><span>사용 합계</span><b>-${won(t.out)}원</b></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:2px;">📅 매일 공부 적립</div>
      <div class="card-desc">하루에 한 줄로 그날 총액만 보여요</div>
      <div class="daily-list">${daily}</div>
    </div>
    <div class="card">
      <div class="card-title" style="margin-bottom:6px;">🧾 최근 기록</div>
      <div class="tx-list">${txRows}</div>
    </div>`;
}
