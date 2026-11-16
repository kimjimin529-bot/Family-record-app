/* ============================================================
   우리 가족 기록장 — home page
   ============================================================ */
'use strict';

function weekStart(key) {
  const d = parseKey(key);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return keyOf(d);
}

function homeView() {
  return weatherCardView() + familyCardView() + stampCardView() + missionCardView();
}

/* ---------- family cards ---------- */
function familyCardView() {
  const rows = memberList().map(m => {
    const praiseCount = state.praise.filter(p => p.to === m.id).length;
    const second = m.allowance
      ? `🐷 ${won(balanceOf(m.id))}원`
      : `💌 칭찬 ${praiseCount}개`;
    return `
      <div class="member-row" data-act="member.open" data-member="${m.id}" role="button" tabindex="0">
        ${avatarHTML(m.id)}
        <div class="member-main">
          <div class="member-name">${esc(m.name)}</div>
          <div class="member-sub">${esc(m.traits || '')}</div>
        </div>
        <div class="member-stats">
          <span class="stat-line"><span class="emoji">${ICONS.star}</span><span class="star-count">${m.stars || 0}</span></span>
          <span class="stat-line money">${second}</span>
        </div>
      </div>`;
  }).join('');
  return `
    <div class="family-card">
      <div class="family-card-head">
        <div class="card-title">🐻 우리 가족</div>
        <button class="chip chip-soft" data-act="settings.members">꾸미기 ✏️</button>
      </div>
      <div class="member-list">${rows}</div>
    </div>`;
}

/* ---------- stamp board ---------- */
function stampCardView() {
  const id = state.settings.stampMember || 'choco';
  const m = state.members[id] || state.members.choco;
  const set = stampSet(id);
  const t = todayKey();
  const start = weekStart(t);
  const labels = ['월', '화', '수', '목', '금', '토', '일'];
  const cells = labels.map((lab, i) => {
    const k = addDays(start, i);
    const has = !!set[k];
    const isToday = k === t;
    const dowCls = i === 5 ? ' sat' : (i === 6 ? ' sun' : '');
    let inner = '';
    if (isToday) inner = charSVG(id, { mood: 'happy' });
    else if (has) inner = '<svg viewBox="0 0 24 24" width="16" height="16" fill="#F3C15B" aria-hidden="true"><path d="M12 2.6l2.7 5.9 6.4.8-4.7 4.4 1.2 6.3L12 16.9 6.4 20l1.2-6.3L2.9 9.3l6.4-.8z"/></svg>';
    return `<div class="day-cell">
      <div class="day-label${dowCls}">${lab}</div>
      <div class="day-slot${has ? ' has-stamp' : ''}${isToday ? ' today' : ''}${isToday && has ? ' is-stamped' : ''}"
           ${isToday ? 'data-act="stamp.today" role="button" aria-label="오늘 도장 찍기" title="오늘 도장 찍기"' : ''}>${inner}</div>
    </div>`;
  }).join('');

  const now = new Date();
  const monthCount = stampsInMonth(id, now.getFullYear(), now.getMonth());
  const stampedToday = !!set[t];
  const streak = streakOf(id);
  const pickable = MEMBER_ORDER.filter(x => state.members[x].allowance);

  return `
    <div class="stamp-card">
      <div class="stamp-head">
        <div class="stamp-title">🐭 ${esc(m.name)} 도장판</div>
        <span class="streak-pill">🔥 ${streak}일 연속</span>
      </div>
      <div class="stamp-desc">${esc(m.name)}가 그날 공부나 루틴을 하나라도 마치면 도장이 찍혀요</div>
      <div class="member-switch">
        ${pickable.map(k => `<button class="switch-chip${k === id ? ' active' : ''}" data-act="stamp.member" data-member="${k}">
          ${charSVG(k)}<span>${esc(state.members[k].name)}</span></button>`).join('')}
      </div>
      <div class="week-strip">${cells}</div>
      <div class="stamp-foot">
        <span class="chip chip-soft">이번 달 도장 ${monthCount}개 · ${stampedToday ? '오늘 찍음' : '오늘 아직'}</span>
        <button class="btn btn-sm" data-act="stamp.cal">📅 도장판 달력 보기</button>
      </div>
    </div>`;
}

/* ---------- mission ---------- */
function missionCardView() {
  const ms = missionOf();
  return `
    <div class="mission-card">
      <div class="card-head" style="margin-bottom:2px;">
        <div class="card-title">🎲 오늘의 가족 미션</div>
        <span class="chip chip-soft">함께 ${ms.count}번</span>
      </div>
      <div class="mission-emoji">${ms.emoji || '🥕'}</div>
      <div class="mission-text">${esc(ms.text)}</div>
      <div class="btn-row even">
        <button class="btn btn-primary" data-act="mission.done">✅ 다 같이 했어요</button>
        <button class="btn" data-act="mission.repick">🔄 다른 미션 뽑기</button>
      </div>
      <div class="mission-foot">가족이 다 함께 하는 미션이에요. 하루에 한 번 가볍게 해봐요!</div>
    </div>`;
}

/* ---------- stamp calendar sheet ---------- */
function openStampCalendar() {
  const id = state.settings.stampMember || 'choco';
  const m = state.members[id];
  const cur = ui.calCursor || new Date();
  const y = cur.getFullYear();
  const mo = cur.getMonth();
  ui.calCursor = new Date(y, mo, 1);
  const first = new Date(y, mo, 1);
  const startDow = (first.getDay() + 6) % 7;
  const days = new Date(y, mo + 1, 0).getDate();
  const set = stampSet(id);
  const t = todayKey();
  let cells = ['월', '화', '수', '목', '금', '토', '일'].map((d, i) => `<div class="dow${i === 5 ? ' sun' : (i === 6 ? ' sun' : '')}">${d}</div>`).join('');
  for (let i = 0; i < startDow; i++) cells += '<div class="d"></div>';
  for (let d = 1; d <= days; d++) {
    const k = keyOf(new Date(y, mo, d));
    const has = !!set[k];
    cells += `<div class="d${has ? ' stamped' : ''}${k === t ? ' today' : ''}">
      ${has ? `<span class="face">${charSVG(id, { mood: 'happy' })}</span>` : d}
    </div>`;
  }
  const count = stampsInMonth(id, y, mo);
  openSheet({
    title: `${m.name} 도장판 달력`,
    icon: '📅',
    body: `
      <div class="cal-head" style="padding:0;margin-bottom:6px;">
        <div class="cal-month">${y}년 ${mo + 1}월</div>
        <div class="cal-nav">
          <button class="mini-btn" data-act="stamp.calPrev" aria-label="이전 달">‹</button>
          <button class="mini-btn" data-act="stamp.calNext" aria-label="다음 달">›</button>
        </div>
      </div>
      <div class="mini-cal">${cells}</div>
      <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px;">
        <span class="chip chip-soft">이번 달 도장 ${count}개</span>
        <span class="chip chip-peach">🔥 ${streakOf(id)}일 연속</span>
      </div>
      <div class="hint">루틴이나 공부를 하나라도 마치면 그날 도장이 자동으로 찍혀요. 오늘 칸은 눌러서 직접 찍을 수도 있어요.</div>
      <div class="btn-row even" style="margin-top:12px;">
        <button class="btn btn-primary" data-act="stamp.calToday">오늘 도장 찍기</button>
      </div>`,
    actions: `<button class="btn" data-act="sheet.close">닫기</button>`,
  });
}
