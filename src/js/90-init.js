/* ============================================================
   우리 가족 기록장 — settings, actions, events, init
   ============================================================ */
'use strict';

/* ---------- settings ---------- */
function openSettings() {
  const s = state.settings;
  openSheet({
    title: '설정',
    icon: '⚙️',
    body: `
      <div class="field">
        <label for="citySelect">우리집 도시 (날씨·미세먼지)</label>
        <select id="citySelect" data-role="city">
          ${CITIES.map(c => `<option value="${c.name}"${c.name === s.city ? ' selected' : ''}>${c.name}</option>`).join('')}
        </select>
      </div>
      <div class="opt-row">
        <div class="grow"><div class="opt-title">🔔 알림음</div><div class="opt-sub">채팅 알림음과 타이머 종료음을 들어요</div></div>
        <button class="switch${s.soundOn ? ' on' : ''}" data-act="settings.sound" aria-pressed="${s.soundOn ? 'true' : 'false'}"></button>
      </div>
      <div class="opt-row">
        <div class="grow"><div class="opt-title">🔒 이 기기 잠금</div><div class="opt-sub">채팅에서 고른 사용자를 이 기기에 기억해요</div></div>
        <button class="switch${s.deviceLock ? ' on' : ''}" data-act="settings.lock" aria-pressed="${s.deviceLock ? 'true' : 'false'}"></button>
      </div>
      <div class="hr-dash"></div>
      <button class="btn btn-block" data-act="settings.members">🐻 가족 이름 · 아바타 · 목표 꾸미기</button>
      <div class="hr-dash"></div>
      <div class="card-desc" style="margin-bottom:8px;">기록은 이 기기 브라우저에만 저장돼요. 폰을 바꾸거나 다른 기기와 함께 쓰려면 내보내기로 옮길 수 있어요.</div>
      <div class="btn-row even">
        <button class="btn" data-act="export.data">⬇️ 내보내기</button>
        <button class="btn" data-act="import.data">⬆️ 불러오기</button>
      </div>
      <button class="btn btn-block" data-act="reset.data" style="margin-top:8px;color:#B87C7C;">🧹 기록 초기화</button>
      <div class="hint">우리 가족 기록장 v${APP_VERSION} · 저장된 날 ${state.createdAt ? fmtKoDate(state.createdAt.slice(0, 10)) : '-'}부터</div>`,
    actions: `<button class="btn" data-act="sheet.close">닫기</button><button class="btn btn-primary" data-act="settings.saveCity">저장</button>`,
    onSubmit: () => applyCity(),
  });
}

function applyCity() {
  const sel = $('#citySelect');
  if (!sel) return;
  const city = CITIES.find(c => c.name === sel.value) || CITIES[0];
  if (city.name !== state.settings.city || city.lat !== state.settings.lat) {
    state.settings.city = city.name;
    state.settings.lat = city.lat;
    state.settings.lon = city.lon;
    state.weather = null;
    save();
    refreshWeather(true);
    toast(`${city.name} 날씨로 바꿨어요`);
  }
  render();
}

function openMembersSheet() {
  const rows = MEMBER_ORDER.map(id => {
    const m = state.members[id];
    return `
      <div style="margin-bottom:16px;">
        <div class="row-flex" style="margin-bottom:8px;">
          ${avatarHTML(id)}
          <div class="member-main">
            <div class="member-name">${esc(m.name)}</div>
            <div class="member-sub">별 ${m.stars || 0} · ${m.allowance ? '🐷 ' + won(balanceOf(id)) + '원' : '용돈 기록 없음'}</div>
          </div>
        </div>
        <div class="field"><label>이름</label><input type="text" data-mfield="name" data-member="${id}" value="${esc(m.name)}" /></div>
        <div class="field"><label>한 줄 소개</label><input type="text" data-mfield="traits" data-member="${id}" value="${esc(m.traits || '')}" placeholder="예) 책 읽기를 좋아하는 곰돌이" /></div>
        <div class="field-row">
          <div class="field"><label>아바타</label>
            <select data-mfield="look" data-member="${id}">
              ${LOOKS.map(l => `<option value="${l}"${m.look === l ? ' selected' : ''}>${LOOK_LABEL[l]}</option>`).join('')}
            </select>
          </div>
          <div class="field"><label>목표 (선택)</label><input type="text" data-mfield="goal" data-member="${id}" value="${esc(m.goal || '')}" placeholder="예) 새 자전거" /></div>
        </div>
        <div class="opt-row">
          <div class="grow"><div class="opt-title">용돈 · 공부 기록에 포함</div><div class="opt-sub">끄면 용돈기입장과 공부 플랜에서 빠져요</div></div>
          <button class="switch${m.allowance ? ' on' : ''}" data-act="toggle.check" aria-pressed="${m.allowance ? 'true' : 'false'}"></button>
          <input type="hidden" data-mfield="allowance" data-member="${id}" value="${m.allowance ? '1' : ''}" />
        </div>
      </div>`;
  }).join('');
  openSheet({
    title: '가족 꾸미기',
    icon: '🐻',
    body: `<div class="card-desc">이름과 아바타, 목표를 우리집에 맞게 바꿔 보세요.</div>${rows}`,
    actions: `<button class="btn" data-act="sheet.close">취소</button><button class="btn btn-primary" data-act="members.save">저장</button>`,
  });
}

function saveMembers() {
  MEMBER_ORDER.forEach(id => {
    const m = state.members[id];
    const nameEl = document.querySelector(`[data-mfield="name"][data-member="${id}"]`);
    if (!nameEl) return;
    const name = nameEl.value.trim();
    if (name) m.name = name;
    const traits = document.querySelector(`[data-mfield="traits"][data-member="${id}"]`);
    if (traits) m.traits = traits.value.trim();
    const look = document.querySelector(`[data-mfield="look"][data-member="${id}"]`);
    if (look) m.look = look.value;
    const goal = document.querySelector(`[data-mfield="goal"][data-member="${id}"]`);
    if (goal) m.goal = goal.value.trim();
    const al = document.querySelector(`[data-mfield="allowance"][data-member="${id}"]`);
    if (al) m.allowance = al.value === '1';
  });
  commit();
  toast('가족 정보를 저장했어요');
  closeSheet();
}

function openMemberQuick(id) {
  const m = state.members[id];
  const t = todayKey();
  const day = routineOf();
  const tasks = day[id] || [];
  const done = tasks.filter(x => x.done).length;
  const studyS = m.allowance ? studyStats(id) : null;
  openSheet({
    title: m.name,
    icon: '🐣',
    body: `
      <div class="row-flex" style="gap:12px;margin-bottom:12px;">
        ${avatarHTML(id)}
        <div>
          <div class="member-name" style="font-size:20px;">${esc(m.name)}</div>
          <div class="member-sub">${esc(m.traits || '')}</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
        <span class="chip chip-soft">별 ${m.stars || 0}개</span>
        ${m.allowance ? `<span class="chip chip-peach">🐷 ${won(balanceOf(id))}원</span>` : ''}
        <span class="chip chip-mint">🔥 ${streakOf(id)}일 연속</span>
        <span class="chip chip-blue">✅ 오늘 ${done}/${tasks.length}</span>
        ${studyS ? `<span class="chip chip-lav">📚 공부 ${studyS.done}/${studyS.total}</span>` : ''}
      </div>
      ${m.goal ? `<div class="card-desc">🎯 목표: ${esc(m.goal)}${m.allowance ? ` (${Math.min(100, Math.round((balanceOf(id) / 50000) * 100))}% 정도 모았어요)` : ''}</div>` : ''}
      <div class="btn-row even" style="margin-top:6px;">
        <button class="btn" data-act="member.praise" data-member="${id}">⭐ 칭찬하기</button>
        <button class="btn" data-act="member.routine" data-member="${id}">✅ 할 일 보기</button>
      </div>`,
    actions: `<button class="btn" data-act="sheet.close">닫기</button><button class="btn btn-primary" data-act="member.edit" data-member="${id}">꾸미기</button>`,
  });
}

/* ---------- export / import / reset ---------- */
function exportData() {
  try {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `우리가족기록장-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast('기록 파일을 내려받았어요 ⬇️');
  } catch (err) {
    toast('내보내지 못했어요 😢');
  }
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      if (!parsed || !parsed.members || !parsed.settings) throw new Error('형식이 달라요');
      confirmSheet('기록 불러오기', '지금 이 기기에 있는 기록을 불러온 파일로 바꿀까요? 지금 기록은 사라져요.', '불러올게요', () => {
        state = migrate(parsed);
        save();
        render();
        toast('기록을 불러왔어요 ⬆️');
      });
    } catch (err) {
      toast('우리 가족 기록장 파일이 아니에요 😢');
    }
  };
  reader.readAsText(file);
}

function resetData() {
  confirmSheet('기록 초기화', '이 기기의 모든 기록이 사라지고 처음 샘플로 돌아가요. 계속할까요?', '초기화', () => {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    state = defaultState();
    save();
    render();
    toast('처음 상태로 돌아왔어요');
  }, true);
}

/* ---------- routine sheets ---------- */
function openRoutineAdd(memberId) {
  formSheet({
    title: '할 일 추가',
    icon: '✅',
    fields: [
      { key: 'member', label: '누구 할 일', type: 'select', value: memberId || 'choco', options: memberList().map(m => ({ value: m.id, label: m.name })) },
      { key: 'text', label: '할 일', type: 'text', placeholder: '예) 책 30분 읽기' },
    ],
    submitLabel: '추가',
    onSubmit: (v) => {
      if (!v.text || !v.text.trim()) { toast('할 일을 적어 주세요'); return false; }
      routineOf()[v.member].push({ id: uid('r'), text: v.text.trim(), done: false });
      commit();
      toast('할 일을 추가했어요');
    },
  });
}

function openRoutineEdit(memberId, id) {
  const day = routineOf();
  const task = (day[memberId] || []).find(t => t.id === id);
  if (!task) return;
  formSheet({
    title: '할 일 수정',
    icon: '✏️',
    fields: [
      { key: 'member', label: '누구 할 일', type: 'select', value: memberId, options: memberList().map(m => ({ value: m.id, label: m.name })) },
      { key: 'text', label: '할 일', type: 'text', value: task.text },
    ],
    submitLabel: '저장',
    onSubmit: (v) => {
      if (!v.text || !v.text.trim()) { toast('할 일을 적어 주세요'); return false; }
      task.text = v.text.trim();
      if (v.member !== memberId) {
        day[memberId] = day[memberId].filter(t => t.id !== id);
        day[v.member].push(task);
      }
      commit();
      toast('수정했어요');
    },
  });
}

/* ---------- events sheet ---------- */
function openEventAdd() {
  formSheet({
    title: '일정 추가',
    icon: '📅',
    fields: [
      { key: 'title', label: '일정', type: 'text', placeholder: '예) 초코하임 소풍' },
      { key: 'date', label: '날짜', type: 'date', value: todayKey() },
      { key: 'member', label: '누구 일정', type: 'select', value: 'choco', options: MEMBER_ORDER.map(id => ({ value: id, label: state.members[id].name })) },
      { key: 'note', label: '메모 (선택)', type: 'text', placeholder: '예) 도시락 준비' },
    ],
    submitLabel: '추가',
    onSubmit: (v) => {
      if (!v.title || !v.title.trim()) { toast('일정 이름을 적어 주세요'); return false; }
      if (!v.date) { toast('날짜를 골라 주세요'); return false; }
      state.schedule.push({ id: uid('ev'), date: v.date, title: v.title.trim(), member: v.member, note: (v.note || '').trim() });
      commit();
      toast('일정을 추가했어요');
    },
  });
}

/* ---------- meals ---------- */
function addMeal(kind) {
  const input = document.getElementById('mealInput-' + kind);
  if (!input) return;
  const val = input.value.trim();
  if (!val) { input.focus(); return; }
  mealsOf()[kind].push(val);
  input.value = '';
  ui.chatScroll = null;
  commit();
  const again = document.getElementById('mealInput-' + kind);
  if (again) again.focus();
}

function openMenuPick(menu) {
  openSheet({
    title: '어느 식사에 넣을까요?',
    icon: '🍽️',
    body: `<div class="card-desc">'${esc(menu)}'을(를) 오늘 식사에 넣어요.</div>
      <div class="btn-row even" style="flex-wrap:wrap;">
        ${MEAL_KINDS.map(k => `<button class="btn" data-act="meal.ideaAdd" data-menu="${esc(menu)}" data-kind="${k.key}">${k.emoji} ${k.label}</button>`).join('')}
      </div>`,
    actions: `<button class="btn" data-act="sheet.close">닫기</button>`,
  });
}

/* ---------- praise ---------- */
function sendPraise() {
  const box = document.getElementById('praiseText');
  const text = box ? box.value.trim() : '';
  if (!text) { toast('칭찬 내용을 적어 주세요 💌'); if (box) box.focus(); return; }
  const to = state.praiseDraftTo || 'choco';
  state.praise.push({ id: uid('pr'), to: to, text: text, date: todayKey(), at: new Date().toISOString() });
  addStars(to, 1);
  ui.praiseDraft = '';
  commit();
  toast(`${mname(to)}에게 칭찬을 보냈어요 · 별 +1 ⭐`);
}

/* ---------- allowance ---------- */
function addTx(type) {
  const amountEl = document.getElementById('txAmount');
  const noteEl = document.getElementById('txNote');
  const amount = Math.abs(Number(amountEl && amountEl.value));
  if (!amount) { toast('금액을 적어 주세요'); if (amountEl) amountEl.focus(); return; }
  const id = state.settings.allowKid || 'choco';
  const a = allowanceOf(id);
  a.tx.push({ id: uid('tx'), type: type, amount: amount, note: (noteEl && noteEl.value.trim()) || (type === 'in' ? '입금' : '사용'), date: todayKey() });
  commit();
  toast(type === 'in' ? `+${won(amount)}원 입금했어요` : `-${won(amount)}원 사용으로 적었어요`);
}

/* ---------- generic helpers ---------- */
function toggleSwitch(btn) {
  if (!btn) return false;
  btn.classList.toggle('on');
  const on = btn.classList.contains('on');
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  const hidden = btn.parentElement && btn.parentElement.querySelector('input[type="hidden"]');
  if (hidden) hidden.value = on ? '1' : '';
  return on;
}

function sendFromComposer() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) { input.focus(); return; }
  ui.chatDraft = '';
  input.value = '';
  sendChatMessage({ type: 'text', text: text });
  const after = document.getElementById('chatInput');
  if (after) after.focus({ preventScroll: true });
}

/* ---------- event wiring ---------- */
function bindEvents() {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (e.target.hasAttribute && e.target.hasAttribute('data-overlay')) { closeSheet(); return; }
    if (!el) return;
    const act = el.getAttribute('data-act');
    const d = el.dataset;
    const id = d.id;
    const member = d.member;
    playTap();

    switch (act) {
      /* nav & sheets */
      case 'nav': showPage(d.page); break;
      case 'go.chat': showPage('chat'); break;
      case 'sheet.close': closeSheet(); break;
      case 'sheet.submit': submitSheet(); break;
      case 'sheet.confirm': if (ui.sheetSubmit) submitSheet(); else closeSheet(); break;
      case 'sheet.check': toggleSwitch(el); break;
      case 'toggle.check': toggleSwitch(el); break;
      case 'settings.open': openSettings(); break;
      case 'settings.saveCity': applyCity(); closeSheet(); break;
      case 'settings.sound': {
        state.settings.soundOn = toggleSwitch(el);
        if (state.settings.soundOn) beep(760, 0.12);
        save();
        break;
      }
      case 'settings.lock': {
        state.settings.deviceLock = toggleSwitch(el);
        save();
        if (state.settings.page === 'chat') render();
        break;
      }
      case 'settings.members': closeSheet(); setTimeout(openMembersSheet, 60); break;
      case 'members.save': saveMembers(); break;

      /* weather */
      case 'weather.retry': state.weather = null; refreshWeather(true); render(); break;

      /* home */
      case 'member.open': openMemberQuick(member); break;
      case 'member.edit': closeSheet(); setTimeout(() => openMembersSheet(), 80); break;
      case 'member.praise': closeSheet(); state.praiseDraftTo = member; ui.praiseDraft = ''; showPage('praise'); break;
      case 'member.routine': closeSheet(); showPage('routine'); break;

      case 'stamp.member': state.settings.stampMember = member; commit(); break;
      case 'stamp.today': {
        const sid = state.settings.stampMember || 'choco';
        if (stampToday(sid, true)) { commit(); toast('오늘 도장을 찍었어요 🐾'); }
        else toast('오늘은 이미 도장을 찍었어요');
        break;
      }
      case 'stamp.cal': ui.calCursor = new Date(); openStampCalendar(); break;
      case 'stamp.calPrev': {
        const c = ui.calCursor || new Date();
        ui.calCursor = new Date(c.getFullYear(), c.getMonth() - 1, 1);
        openStampCalendar(); break;
      }
      case 'stamp.calNext': {
        const c2 = ui.calCursor || new Date();
        ui.calCursor = new Date(c2.getFullYear(), c2.getMonth() + 1, 1);
        openStampCalendar(); break;
      }
      case 'stamp.calToday': {
        const sid2 = state.settings.stampMember || 'choco';
        stampToday(sid2, true);
        commit();
        openStampCalendar();
        toast('오늘 도장을 찍었어요 🐾');
        break;
      }

      case 'mission.done': {
        const ms = missionOf();
        ms.count = (ms.count || 0) + 1;
        MEMBER_ORDER.forEach(x => addStars(x, 1));
        commit();
        toast('가족 미션 완료! 모두에게 별 1개 ⭐');
        beep(880, 0.14);
        break;
      }
      case 'mission.repick': {
        const ms2 = missionOf();
        const nm = pickMission();
        ms2.text = nm.text; ms2.emoji = nm.emoji;
        commit();
        toast('새 미션을 뽑았어요 🎲');
        break;
      }

      /* routine */
      case 'routine.add': openRoutineAdd(member); break;
      case 'routine.toggle': {
        const day = routineOf();
        const task = (day[member] || []).find(t => t.id === id);
        if (!task) break;
        task.done = !task.done;
        let stamped = false;
        if (task.done) {
          stamped = stampToday(member, false);
          addStars(member, 1);
        }
        commit();
        if (task.done) toast(stamped ? '해냈어요! 도장도 찍혔어요 🐾' : '해냈어요! 별 +1 ⭐');
        if (task.done) beep(820, 0.1);
        break;
      }
      case 'routine.edit': openRoutineEdit(member, id); break;
      case 'routine.del': {
        const day2 = routineOf();
        const t2 = (day2[member] || []).find(t => t.id === id);
        confirmSheet('할 일 삭제', `'${t2 ? t2.text : '이 할 일'}'을(를) 지울까요?`, '지우기', () => {
          day2[member] = day2[member].filter(t => t.id !== id);
          commit();
          toast('지웠어요');
        }, true);
        break;
      }

      /* study */
      case 'study.add': {
        const fromSheet = el.closest('.sheet');
        if (fromSheet) closeSheet();
        setTimeout(() => openStudyAdd(member || (state.settings.studyMember || 'choco')), 60);
        break;
      }
      case 'study.pinned': openPinnedManager(); break;
      case 'study.pin': {
        const it = state.study.items.find(x => x.id === id);
        if (!it) break;
        it.pinned = !it.pinned;
        commit();
        toast(it.pinned ? '매일 올라오는 고정 항목이에요 📌' : '오늘만 하는 공부로 바꿨어요');
        break;
      }
      case 'study.pinFromSheet': {
        const it2 = state.study.items.find(x => x.id === id);
        if (!it2) break;
        it2.pinned = !it2.pinned;
        save();
        openPinnedManager();
        break;
      }
      case 'study.delFromSheet': {
        state.study.items = state.study.items.filter(x => x.id !== id);
        save();
        openPinnedManager();
        break;
      }
      case 'study.toggle': {
        const it3 = state.study.items.find(x => x.id === id);
        if (!it3) break;
        const doneMap = studyDoneToday();
        const willDone = !doneMap[id];
        if (willDone) {
          doneMap[id] = true;
          earnStudyAllowance(it3.member, it3);
          const stamped2 = stampToday(it3.member, false);
          addStars(it3.member, 1);
          commit();
          toast(`${it3.reward ? won(it3.reward) + '원 적립! ' : ''}${stamped2 ? '도장도 찍혔어요 ' : ''}⭐`);
          beep(880, 0.12);
        } else {
          delete doneMap[id];
          unearnStudyAllowance(it3.member, it3);
          commit();
          toast('체크를 풀었어요');
        }
        break;
      }
      case 'study.edit': openStudyEdit(id); break;
      case 'study.del': {
        const it4 = state.study.items.find(x => x.id === id);
        confirmSheet('공부 삭제', `'${it4 ? it4.title : '이 공부'}'을(를) 지울까요?`, '지우기', () => {
          state.study.items = state.study.items.filter(x => x.id !== id);
          Object.keys(state.study.done).forEach(k => { delete state.study.done[k][id]; });
          commit();
          toast('지웠어요');
        }, true);
        break;
      }

      /* timer */
      case 'timer.mode': {
        state.timer.mode = d.mode === 'stop' ? 'stop' : 'count';
        state.timer.running = false;
        state.timer.endsAt = 0;
        state.timer.startedAt = 0;
        if (state.timer.mode === 'count') state.timer.remaining = (state.timer.minutes || 10) * 60;
        save(); render();
        break;
      }
      case 'timer.start': timerStart(); break;
      case 'timer.pause': timerPause(); break;
      case 'timer.reset': timerReset(); break;
      case 'timer.preset': setTimerMinutes(Number(d.min) || 10); break;
      case 'timer.custom': {
        const inp = document.getElementById('customMin');
        const n = Number(inp && inp.value);
        if (!n) { toast('분을 적어 주세요'); break; }
        setTimerMinutes(n);
        toast(`${n}분으로 맞췄어요`);
        break;
      }

      /* meals */
      case 'meal.add': addMeal(d.kind); break;
      case 'meal.del': {
        const meals = mealsOf();
        meals[d.kind].splice(Number(d.index), 1);
        commit();
        break;
      }
      case 'meal.idea': openMenuPick(d.menu); break;
      case 'meal.ideaAdd': {
        mealsOf()[d.kind].push(d.menu);
        commit();
        closeSheet();
        toast(`${d.menu} 넣었어요 🍽️`);
        break;
      }
      case 'meal.random': toast(RANDOM_MENUS[Math.floor(Math.random() * RANDOM_MENUS.length)]); break;

      /* schedule */
      case 'cal.prev': {
        const c = ui.calCursor || new Date();
        ui.calCursor = new Date(c.getFullYear(), c.getMonth() - 1, 1);
        render(); break;
      }
      case 'cal.next': {
        const c = ui.calCursor || new Date();
        ui.calCursor = new Date(c.getFullYear(), c.getMonth() + 1, 1);
        render(); break;
      }
      case 'event.add': openEventAdd(); break;
      case 'event.del': {
        const ev = state.schedule.find(x => x.id === id);
        confirmSheet('일정 삭제', `'${ev ? ev.title : '이 일정'}'을(를) 지울까요?`, '지우기', () => {
          state.schedule = state.schedule.filter(x => x.id !== id);
          commit();
          toast('지웠어요');
        }, true);
        break;
      }

      /* health */
      case 'health.med': {
        const day3 = healthOf();
        day3[member].med = !day3[member].med;
        commit();
        break;
      }
      case 'health.water': {
        const day4 = healthOf();
        const delta = Number(d.delta) || 1;
        day4[member].water = clamp((Number(day4[member].water) || 0) + delta, 0, 8);
        commit();
        break;
      }
      case 'health.mood': {
        const day5 = healthOf();
        day5[member].mood = d.mood;
        commit();
        break;
      }

      /* praise */
      case 'praise.pick': {
        ui.praiseDraft = (document.getElementById('praiseText') || {}).value || '';
        state.praiseDraftTo = member;
        render();
        break;
      }
      case 'praise.quick': {
        const box = document.getElementById('praiseText');
        if (box) {
          const q = d.text.replace('○○', mname(state.praiseDraftTo || 'choco'));
          box.value = (box.value ? box.value + ' ' : '') + q;
          ui.praiseDraft = box.value;
          box.focus();
        }
        break;
      }
      case 'praise.send': sendPraise(); break;
      case 'praise.del': {
        confirmSheet('칭찬 삭제', '이 칭찬 기록을 지울까요? (별은 그대로예요)', '지우기', () => {
          state.praise = state.praise.filter(x => x.id !== id);
          commit();
          toast('지웠어요');
        }, true);
        break;
      }

      /* allowance */
      case 'allow.member': state.settings.allowKid = member; commit(); break;
      case 'allow.in': addTx('in'); break;
      case 'allow.out': addTx('out'); break;
      case 'allow.txDel': {
        const kid = state.settings.allowKid || 'choco';
        const a = allowanceOf(kid);
        a.tx = a.tx.filter(x => x.id !== id);
        commit();
        toast('기록을 지웠어요');
        break;
      }

      /* chat */
      case 'chat.profile': openChatProfileSwitch(member); break;
      case 'chat.lock': {
        state.settings.deviceLock = !state.settings.deviceLock;
        commit();
        toast(state.settings.deviceLock ? '이 기기에 지금 사용자를 기억할게요 🔒' : '기기 잠금을 풀었어요');
        break;
      }
      case 'chat.sound': {
        state.settings.soundOn = !state.settings.soundOn;
        commit();
        if (state.settings.soundOn) beep(760, 0.12);
        toast(state.settings.soundOn ? '알림음을 켰어요 🔔' : '알림음을 껐어요 🔕');
        break;
      }
      case 'chat.send': sendFromComposer(); break;
      case 'chat.quick': sendChatMessage({ type: 'text', text: d.text }); break;
      case 'chat.sticker': {
        ui.stickerTray = false;
        sendChatMessage({ type: 'sticker', sticker: d.sticker });
        break;
      }
      case 'chat.tray': {
        ui.stickerTray = !ui.stickerTray;
        render();
        break;
      }
      case 'chat.react': {
        const msg = state.chat.find(m => m.id === id);
        if (!msg) break;
        msg.reaction = msg.reaction ? '' : '❤️';
        commit();
        break;
      }
      case 'chat.del': {
        confirmSheet('메시지 삭제', '이 메시지를 지울까요?', '지우기', () => {
          state.chat = state.chat.filter(m => m.id !== id);
          commit();
          toast('지웠어요');
        }, true);
        break;
      }
      case 'chat.voice': {
        sendChatMessage({ type: 'voice', sec: 3 + Math.floor(Math.random() * 7) });
        toast('음성 메시지를 남겼어요 🎙️');
        break;
      }
      case 'chat.playVoice': {
        playVoice(id);
        break;
      }

      /* data */
      case 'export.data': exportData(); break;
      case 'import.data': {
        const f = document.getElementById('importFile');
        if (f) f.click();
        break;
      }
      case 'reset.data': resetData(); break;
      default: break;
    }
  });

  window.addEventListener('beforeunload', () => { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'chatInput') ui.chatDraft = e.target.value;
    if (e.target.id === 'praiseText') ui.praiseDraft = e.target.value;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target) {
      if (e.target.id === 'chatInput') { e.preventDefault(); sendFromComposer(); return; }
      if (e.target.dataset && e.target.dataset.role === 'meal-input') { e.preventDefault(); addMeal(e.target.dataset.kind); return; }
      if (e.target.id === 'customMin') { e.preventDefault(); const n = Number(e.target.value); if (n) { setTimerMinutes(n); toast(n + '분으로 맞췄어요'); } return; }
    }
    if (e.key === 'Escape') closeSheet();
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (!t || !t.dataset) return;
    if (t.dataset.role === 'allow-start') {
      const kid = state.settings.allowKid || 'choco';
      const v = Math.max(0, Number(t.value) || 0);
      if (v !== Number(allowanceOf(kid).start)) {
        allowanceOf(kid).start = v;
        save();
        render();
        toast('시작 금액을 저장했어요');
      } else {
        t.value = v;
      }
    }
    if (t.dataset.role === 'health-memo') {
      healthOf()[t.dataset.member].memo = t.value.slice(0, 200);
      save();
    }
    if (t.dataset.role === 'health-temp') {
      healthOf()[t.dataset.member].temp = t.value;
      save();
    }
    if (t.id === 'importFile') {
      importData(t.files && t.files[0]);
      t.value = '';
    }
  });

  document.addEventListener('scroll', (e) => {
    if (e.target && e.target.id === 'chatBody') {
      const box = e.target;
      const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 24;
      ui.chatScroll = atBottom ? null : box.scrollTop;
    }
  }, true);

  window.addEventListener('storage', (e) => {
    if (e.key !== LS_KEY || !e.newValue) return;
    try {
      state = migrate(JSON.parse(e.newValue));
      render();
      if (state.settings.soundOn && currentPage() === 'chat') beep(700, 0.09);
    } catch (err) { /* 무시 */ }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') render();
  });
}

/* subtle tap sound */
let lastTap = 0;
function playTap() {
  if (!state || !state.settings || !state.settings.soundOn) return;
  const now = Date.now();
  if (now - lastTap < 90) return;
  lastTap = now;
  // 아주 작은 나무 두드리는 소리 (너무 잦으면 조용히)
}

/* ---------- init ---------- */
function init() {
  state = load();
  if (!state.settings.page || !PAGES.includes(state.settings.page)) state.settings.page = 'home';
  if (!state.praiseDraftTo) state.praiseDraftTo = 'choco';
  if (!ui.calCursor) ui.calCursor = new Date();
  bindEvents();
  render();
  startTicker();
  refreshWeather();
  setInterval(() => {
    if (todayKey() !== state.__bootDay) {
      render();
    }
  }, 60000);
  state.__bootDay = todayKey();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
