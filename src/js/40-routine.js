/* ============================================================
   우리 가족 기록장 — routine + study plan + timer
   ============================================================ */
'use strict';

/* ---------- routine ---------- */
function routineView() {
  const day = routineOf();
  const totalDone = MEMBER_ORDER.reduce((s, id) => s + (day[id] || []).filter(x => x.done).length, 0);
  const totalAll = MEMBER_ORDER.reduce((s, id) => s + (day[id] || []).length, 0);
  const blocks = MEMBER_ORDER.map(id => memberBlockView(id, day[id] || [])).join('');
  return `
    <div class="page-head">
      <h2>✅ 오늘 할 일</h2>
      <p>${esc(memberList().map(m => m.name).join('·'))}가 각자 할 일을 체크해요 · 오늘 ${totalDone}/${totalAll}개 완료</p>
    </div>
    <div class="card" style="padding:14px 13px;">
      <div class="card-head">
        <div class="card-title">🗓️ 우리집 루틴</div>
        <button class="btn btn-sm" data-act="routine.add">+ 할 일 추가</button>
      </div>
      ${blocks}
    </div>
    ${studyCardView()}`;
}

function memberBlockView(id, tasks) {
  const m = state.members[id];
  const done = tasks.filter(t => t.done).length;
  const rows = tasks.length
    ? tasks.map(t => `
      <div class="task-row${t.done ? ' done' : ''}">
        <button class="check${t.done ? ' on' : ''}" data-act="routine.toggle" data-member="${id}" data-id="${t.id}"
          role="checkbox" aria-checked="${t.done ? 'true' : 'false'}" aria-label="${esc(t.text)} 완료"><span style="display:block;width:15px;height:15px;${t.done ? '' : 'opacity:0'}">${ICONS.check}</span></button>
        <div class="task-text">${esc(t.text)}</div>
        <div class="row-actions">
          <button class="mini-btn" data-act="routine.edit" data-member="${id}" data-id="${t.id}" aria-label="수정">${ICONS.pencil}</button>
          <button class="mini-btn del" data-act="routine.del" data-member="${id}" data-id="${t.id}" aria-label="삭제">${ICONS.x}</button>
        </div>
      </div>`).join('')
    : `<div class="meal-empty">아직 할 일이 없어요. 아래에서 추가해 보세요.</div>`;
  return `
    <div class="member-block ${id}">
      <div class="block-head">
        ${avatarHTML(id)}
        <div class="member-main">
          <div class="member-name">${esc(m.name)}</div>
          <div class="block-count"><b>${done}</b>/${tasks.length}개 완료</div>
        </div>
      </div>
      ${rows}
      <button class="add-row" data-act="routine.add" data-member="${id}">+ ${esc(m.name)} 할 일 추가</button>
    </div>`;
}

/* ---------- study plan ---------- */
function studyStats(id) {
  const items = studyItemsFor(id);
  const doneMap = studyDoneToday();
  const done = items.filter(it => doneMap[it.id]).length;
  return { items, doneMap, done, total: items.length };
}

function studyCardView() {
  const kidList = kids();
  let doneAll = 0, totalAll = 0;
  kidList.forEach(k => { const s = studyStats(k.id); doneAll += s.done; totalAll += s.total; });
  const pct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;
  const desc = totalAll
    ? `${esc(kidList.map(k => k.name).join('·'))}가 각자 할 공부를 체크해요 · 고정 항목은 매일 아침 자동으로 올라와요`
    : '공부 항목을 추가해 보세요';
  return `
    <div class="study-card">
      <div class="card-head" style="margin-bottom:2px;">
        <div class="card-title">📚 오늘의 공부 플랜</div>
      </div>
      <div class="study-desc">${desc} · 체크하면 정한 금액씩 용돈에 쌓여요</div>
      <div class="study-top-btns">
        <button class="btn" data-act="study.pinned">⚙️ 고정 항목</button>
        <button class="btn" data-act="study.add">+ 공부 추가</button>
      </div>
      <div class="progress-wrap">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-label">${doneAll} / ${totalAll} 완료</span>
      </div>
      ${timerBoxView()}
      ${kidList.map(k => studyKidView(k.id)).join('')}
    </div>`;
}

function studyKidView(id) {
  const m = state.members[id];
  const s = studyStats(id);
  const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
  const rows = s.items.length ? s.items.map(it => {
    const done = !!s.doneMap[it.id];
    return `
      <div class="study-item${done ? ' done' : ''}">
        <button class="check${done ? ' on blue' : ''}" data-act="study.toggle" data-member="${id}" data-id="${it.id}"
          role="checkbox" aria-checked="${done ? 'true' : 'false'}" aria-label="${esc(it.title)} 완료"><span style="display:block;width:15px;height:15px;${done ? '' : 'opacity:0'}">${ICONS.check}</span></button>
        <div class="task-text" style="${done ? 'text-decoration:line-through;color:#B4A594' : ''};flex:1 1 110px;">${esc(it.title)}</div>
        ${it.tag ? `<span class="tag-pill">${esc(it.tag)}</span>` : ''}
        <span class="reward-pill">🪙 ${won(it.reward)}원</span>
        <div class="row-actions">
          <button class="pin-btn${it.pinned ? ' on' : ''}" data-act="study.pin" data-id="${it.id}" aria-label="고정 항목" title="${it.pinned ? '고정 항목 해제' : '매일 고정 항목으로'}">📌</button>
          <button class="mini-btn" data-act="study.edit" data-id="${it.id}" aria-label="수정">${ICONS.pencil}</button>
          <button class="mini-btn del" data-act="study.del" data-id="${it.id}" aria-label="삭제">${ICONS.x}</button>
        </div>
      </div>`;
  }).join('') : `<div class="meal-empty">오늘 공부할 항목이 없어요. '+ 공부 추가'로 넣어 보세요.</div>`;
  return `
    <div class="study-kid">
      <div class="study-kid-head">
        ${avatarHTML(id, 'sm')}
        <div class="member-main">
          <div class="member-name">${esc(m.name)}</div>
          <div class="block-count">${s.done}/${s.total}개 완료</div>
        </div>
        <span class="study-bal">🐷 ${won(balanceOf(id))}원</span>
      </div>
      <div class="study-progress">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-label" style="font-size:11.5px;">${s.done}/${s.total}</span>
      </div>
      ${rows}
    </div>`;
}

/* ---------- timer ---------- */
function timerBoxView() {
  const tm = state.timer;
  const isCount = tm.mode !== 'stop';
  return `
    <div class="timer-box">
      <div class="timer-tabs">
        <button class="timer-tab${isCount ? ' active' : ''}" data-act="timer.mode" data-mode="count">⏳ 남은 시간</button>
        <button class="timer-tab${!isCount ? ' active' : ''}" data-act="timer.mode" data-mode="stop">⏱️ 재는 시간</button>
      </div>
      <div class="timer-caption">${isCount ? `${tm.minutes}분 · 시작을 눌러요` : '공부한 시간을 재어 볼까요?'}</div>
      <div class="timer-display${isCount ? '' : ' small'}" id="timerDisplay">${timerText()}</div>
      <div class="timer-controls">
        <button class="btn btn-primary" data-act="${tm.running ? 'timer.pause' : 'timer.start'}">${tm.running ? '⏸ 일시정지' : '▶ 시작'}</button>
        <button class="btn" data-act="timer.reset">↺ 초기화</button>
      </div>
      ${isCount ? `
      <div class="timer-presets">
        ${[10, 20, 30].map(n => `<button class="preset${tm.minutes === n ? ' active' : ''}" data-act="timer.preset" data-min="${n}">${n}분</button>`).join('')}
      </div>
      <div class="custom-row">
        <input id="customMin" type="number" inputmode="numeric" min="1" max="180" placeholder="직접 분 맞추기" aria-label="분 직접 입력" />
        <button class="btn" data-act="timer.custom">분 맞추기</button>
      </div>` : ''}
      <div class="timer-status" id="timerStatus">${tm.running ? '공부 중이에요 ✏️' : '멈춰 있어요'}</div>
    </div>`;
}

function timerText() {
  const tm = state.timer;
  const sec = tm.mode === 'stop'
    ? Math.max(0, Math.floor(liveElapsed() / 1000))
    : Math.max(0, Math.ceil(liveRemaining() / 1000));
  if (tm.mode === 'stop' && sec >= 3600) {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return `${h}:${pad2(m)}:${pad2(s)}`;
  }
  return `${pad2(Math.floor(sec / 60))}:${pad2(sec % 60)}`;
}

function liveRemaining() {
  const tm = state.timer;
  if (tm.running && tm.endsAt) return Math.max(0, tm.endsAt - Date.now());
  return Math.max(0, tm.remaining * 1000);
}
function liveElapsed() {
  const tm = state.timer;
  if (tm.running && tm.startedAt) return Math.max(0, Date.now() - tm.startedAt);
  return Math.max(0, tm.elapsed || 0);
}

let tickTimer = 0;
function startTicker() {
  if (tickTimer) return;
  tickTimer = setInterval(tick, 500);
}
function tick() {
  const tm = state.timer;
  if (!tm.running) {
    const el = document.getElementById('timerDisplay');
    if (el) el.textContent = timerText();
    return;
  }
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = timerText();
  if (tm.mode !== 'stop' && liveRemaining() <= 0) {
    tm.running = false;
    tm.remaining = 0;
    tm.endsAt = 0;
    save();
    const st = document.getElementById('timerStatus');
    if (st) st.textContent = '다 됐어요! 잘했어요 🎉';
    beep(660, 0.14); setTimeout(() => beep(880, 0.18), 180);
    toast('공부 시간 끝! 정말 잘했어요 🎉');
  }
}

function timerStart() {
  const tm = state.timer;
  if (tm.mode === 'stop') {
    tm.startedAt = Date.now() - (tm.elapsed || 0);
  } else {
    if (!tm.remaining || tm.remaining <= 0) tm.remaining = tm.minutes * 60;
    tm.endsAt = Date.now() + tm.remaining * 1000;
  }
  tm.running = true;
  save();
  startTicker();
  render();
}
function timerPause() {
  const tm = state.timer;
  if (tm.mode === 'stop') tm.elapsed = liveElapsed();
  else tm.remaining = Math.max(0, Math.ceil(liveRemaining() / 1000));
  tm.running = false;
  tm.endsAt = 0;
  tm.startedAt = 0;
  save();
  render();
}
function timerReset() {
  const tm = state.timer;
  tm.running = false;
  tm.endsAt = 0;
  tm.startedAt = 0;
  tm.elapsed = 0;
  tm.remaining = (tm.minutes || 10) * 60;
  save();
  render();
}
function setTimerMinutes(n) {
  const tm = state.timer;
  tm.minutes = clamp(Math.round(n) || 10, 1, 180);
  tm.mode = 'count';
  tm.running = false;
  tm.remaining = tm.minutes * 60;
  tm.endsAt = 0;
  save();
  render();
}

/* ---------- study sheets ---------- */
function openStudyAdd(memberId) {
  const kidList = kids();
  formSheet({
    title: '공부 추가',
    icon: '📚',
    fields: [
      { key: 'member', label: '누구 공부', type: 'select', value: memberId || (kidList[0] && kidList[0].id), options: kidList.map(k => ({ value: k.id, label: k.name })) },
      { key: 'title', label: '무엇을 하나요', type: 'text', placeholder: '예) 받아쓰기 연습' },
      { key: 'tag', label: '분량 (선택)', type: 'text', placeholder: '예) 10문제, 4장' },
      { key: 'reward', label: '한 번에 쌓이는 용돈', type: 'number', value: 100, min: 0, step: 10, hint: '체크하면 이 금액이 용돈기입장에 쌓여요' },
      { key: 'pinned', label: '매일 고정 항목으로', type: 'checkbox', value: false, hint: '매일 아침 자동으로 올라와요' },
    ],
    submitLabel: '추가',
    onSubmit: (v) => {
      if (!v.title || !v.title.trim()) { toast('공부 이름을 적어 주세요'); return false; }
      state.study.items.push({
        id: uid('st'), member: v.member, title: v.title.trim(), tag: (v.tag || '').trim(),
        reward: Math.max(0, Number(v.reward) || 0), pinned: v.pinned === '1' || v.pinned === true,
        date: todayKey(),
      });
      commit();
      toast('공부 항목을 추가했어요 ✏️');
    },
  });
}

function openStudyEdit(id) {
  const it = state.study.items.find(x => x.id === id);
  if (!it) return;
  const kidList = kids();
  formSheet({
    title: '공부 수정',
    icon: '✏️',
    fields: [
      { key: 'member', label: '누구 공부', type: 'select', value: it.member, options: kidList.map(k => ({ value: k.id, label: k.name })) },
      { key: 'title', label: '무엇을 하나요', type: 'text', value: it.title },
      { key: 'tag', label: '분량 (선택)', type: 'text', value: it.tag || '' },
      { key: 'reward', label: '한 번에 쌓이는 용돈', type: 'number', value: it.reward, min: 0, step: 10 },
      { key: 'pinned', label: '매일 고정 항목으로', type: 'checkbox', value: !!it.pinned },
    ],
    submitLabel: '저장',
    onSubmit: (v) => {
      if (!v.title || !v.title.trim()) { toast('공부 이름을 적어 주세요'); return false; }
      it.member = v.member; it.title = v.title.trim(); it.tag = (v.tag || '').trim();
      it.reward = Math.max(0, Number(v.reward) || 0); it.pinned = v.pinned === '1' || v.pinned === true;
      commit();
      toast('수정했어요');
    },
  });
}

function openPinnedManager() {
  const groups = kids().map(k => {
    const items = state.study.items.filter(it => it.member === k.id);
    const rows = items.length ? items.map(it => `
      <div class="opt-row">
        ${avatarHTML(k.id, 'xs')}
        <div class="grow">
          <div class="opt-title">${esc(it.title)} ${it.tag ? `<span class="tag-pill">${esc(it.tag)}</span>` : ''}</div>
          <div class="opt-sub">🪙 ${won(it.reward)}원 · ${it.pinned ? '매일 올라옴' : '오늘만'}</div>
        </div>
        <button class="switch${it.pinned ? ' on' : ''}" data-act="study.pinFromSheet" data-id="${it.id}" aria-label="고정 항목 전환"></button>
        <button class="mini-btn del" data-act="study.delFromSheet" data-id="${it.id}" aria-label="삭제">${ICONS.x}</button>
      </div>`).join('') : `<div class="meal-empty">등록된 공부가 없어요.</div>`;
    return `<div style="margin-bottom:12px;">
      <div class="row-flex" style="margin-bottom:4px;">${avatarHTML(k.id, 'xs')}<b style="font-size:13.5px;">${esc(k.name)}</b></div>
      ${rows}
    </div>`;
  }).join('');
  openSheet({
    title: '고정 항목 관리',
    icon: '⚙️',
    body: `<div class="card-desc">고정 항목으로 켜 두면 매일 아침 자동으로 올라와요.</div>${groups}
      <button class="btn btn-block" data-act="study.add">+ 공부 추가</button>`,
    actions: `<button class="btn btn-primary" data-act="sheet.close">다 했어요</button>`,
  });
}
