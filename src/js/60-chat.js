/* ============================================================
   우리 가족 기록장 — family chat
   ============================================================ */
'use strict';

const CHAT_QUICK = ['다녀올게요!', '밥 먹자 🍚', '사랑해 ❤️', '잘 자 🌙', '오늘 고마워', '이따 봐요'];

function chatDayLabel(iso) {
  const d = new Date(iso);
  const k = keyOf(d);
  const t = todayKey();
  if (k === t) return '오늘';
  if (k === addDays(t, -1)) return '어제';
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${KO_DOW[d.getDay()]})`;
}

function renderChat(el) {
  const me = state.settings.chatProfile || 'mom';
  const locked = !!state.settings.deviceLock;
  const msgs = state.chat.slice().sort((a, b) => (a.at || '').localeCompare(b.at || ''));
  let lastDay = '';
  const body = msgs.map(msg => {
    if (msg.deleted) return '';
    const d = new Date(msg.at || Date.now());
    const dayKey = keyOf(d);
    let daySep = '';
    if (dayKey !== lastDay) {
      daySep = `<div class="chat-day"><span>${chatDayLabel(msg.at)}</span></div>`;
      lastDay = dayKey;
    }
    const mine = msg.by === me;
    const who = state.members[msg.by];
    let inner = '';
    if (msg.type === 'sticker') {
      inner = `<div class="bubble sticker">${stickerSVG(msg.sticker)}</div>`;
    } else if (msg.type === 'voice') {
      inner = `<div class="bubble voice" data-act="chat.playVoice" data-id="${msg.id}" role="button" aria-label="음성 메시지 재생">
        <span class="voice-play">▶</span>
        <span class="voice-wave">${Array.from({ length: 18 }, (_, i) => `<i style="height:${6 + ((i * 7) % 14)}px"></i>`).join('')}</span>
        <span class="voice-dur">0:${pad2(msg.sec || 5)}</span>
      </div>`;
    } else {
      inner = `<div class="bubble">${esc(msg.text)}</div>`;
    }
    const reaction = msg.reaction ? `<span class="chip" style="padding:1px 7px;font-size:11px;background:#FFF3F6;border-color:#F7DCE5;">${msg.reaction}</span>` : '';
    return `${daySep}
      <div class="msg${mine ? ' mine' : ''}">
        ${mine ? '' : avatarHTML(msg.by, 'xs')}
        <div class="msg-col">
          ${mine ? '' : `<div class="msg-who">${esc(who ? who.name : msg.by)} <span class="msg-time">${fmtClock(msg.at)}</span></div>`}
          ${inner}
          <div class="msg-actions">
            ${reaction}
            <button class="act-btn react${msg.reaction ? ' reacted' : ''}" data-act="chat.react" data-id="${msg.id}" aria-label="하트 반응" aria-pressed="${msg.reaction ? 'true' : 'false'}">${ICONS.heart}</button>
            <button class="act-btn" data-act="chat.del" data-id="${msg.id}" aria-label="삭제">✕</button>
            ${mine ? `<span class="msg-time">${fmtClock(msg.at)}</span>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="page-head">
      <h2>💬 우리 가족 채팅</h2>
      <p>${esc(memberList().map(m => m.name).join('·'))}가 말풍선과 스티커로 이야기해요</p>
    </div>
    <div class="chat-card">
      <div class="chat-top">
        <div class="chat-profile-row">
          ${MEMBER_ORDER.map(id => {
            const m = state.members[id];
            const active = id === me;
            return `<button class="profile-chip${active ? ' active' : ''}" data-act="chat.profile" data-member="${id}">
              ${charSVG(id)}<span>${esc(m.name)}</span>${active && locked ? '<span class="lockbadge">🔒</span>' : ''}
            </button>`;
          }).join('')}
        </div>
        <div class="chat-tools">
          <button class="tool-pill${locked ? ' on' : ''}" data-act="chat.lock">${locked ? '🔒 이 기기 잠금' : '🔓 잠금 풀림'}</button>
          <button class="tool-pill${state.settings.soundOn ? ' on' : ''}" data-act="chat.sound">${state.settings.soundOn ? '🔔 알림음 켜짐' : '🔕 알림음 꺼짐'}</button>
        </div>
        <div class="chat-lock-note">한 번 고르면 이 기기에 기억돼요 · 다음에 또 바꿀 필요 없어요</div>
      </div>
      <div class="chat-body" id="chatBody">
        ${body || emptyNote('첫 인사를 남겨 보세요 💌')}
      </div>
      <div class="quick-row">
        ${CHAT_QUICK.map(q => `<button class="quick" data-act="chat.quick" data-text="${esc(q)}">${esc(q)}</button>`).join('')}
      </div>
      ${ui.stickerTray ? `<div class="sticker-tray">
        ${STICKERS.map(s => `<button class="sticker-btn" data-act="chat.sticker" data-sticker="${s.id}" aria-label="${esc(s.label)} 스티커">${stickerSVG(s.id)}</button>`).join('')}
      </div>` : ''}
      <div class="composer">
        <button class="round-btn" data-act="chat.voice" aria-label="음성 메시지" title="음성 메시지">${ICONS.mic}</button>
        <button class="round-btn" data-act="chat.tray" aria-label="스티커" title="스티커" style="${ui.stickerTray ? 'background:#FFF3D9;border-color:#EFDCAF;' : ''}">🙂</button>
        <input type="text" id="chatInput" placeholder="${esc(mname(me))}로 보내기" aria-label="메시지 입력" />
        <button class="round-btn send" data-act="chat.send" aria-label="보내기">${ICONS.send}</button>
      </div>
    </div>`;
  const input = $('#chatInput');
  if (input && ui.chatDraft) input.value = ui.chatDraft;
  restoreChatScroll();
}

function restoreChatScroll() {
  const box = document.getElementById('chatBody');
  if (!box) return;
  if (ui.chatScroll != null && ui.chatScroll > 0) box.scrollTop = ui.chatScroll;
  else box.scrollTop = box.scrollHeight;
}

function sendChatMessage(payload) {
  const me = state.settings.chatProfile || 'mom';
  const msg = Object.assign({ id: uid('ch'), by: me, at: new Date().toISOString() }, payload);
  state.chat.push(msg);
  save();
  ui.chatScroll = null;
  render();
  scrollChatToBottom();
  const input = $('#chatInput');
  if (input) input.focus({ preventScroll: true });
}

function scrollChatToBottom() {
  const box = document.getElementById('chatBody');
  if (box) box.scrollTop = box.scrollHeight;
}

let audioCtx = null;
function beep(freq, dur) {
  if (!state.settings.soundOn) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq || 720;
    g.gain.value = 0.05;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.12));
    o.stop(audioCtx.currentTime + (dur || 0.12) + 0.02);
  } catch (e) { /* 소리가 안 나도 괜찮아요 */ }
}

function playVoice(id) {
  const box = document.getElementById('chatBody');
  if (!box) return;
  const el = box.querySelector(`[data-id="${id}"]`);
  if (!el) return;
  const bars = $$('.voice-wave i', el);
  bars.forEach(b => b.classList.remove('on'));
  const msg = state.chat.find(m => m.id === id);
  const sec = msg ? msg.sec || 5 : 5;
  beep(520, 0.1);
  let i = 0;
  const step = Math.max(40, (sec * 1000) / Math.max(1, bars.length));
  const t = setInterval(() => {
    if (i >= bars.length) { clearInterval(t); return; }
    bars[i].classList.add('on');
    i++;
  }, step);
}

/* ---------- chat sheets ---------- */
function openChatProfileSwitch(nextId) {
  const next = state.members[nextId];
  const me = state.settings.chatProfile;
  if (nextId === me) return;
  const locked = !!state.settings.deviceLock;
  const apply = () => {
    state.settings.chatProfile = nextId;
    commit();
    toast(`이제 ${next.name}로 이야기해요`);
  };
  if (!locked) { apply(); return; }
  confirmSheet(
    '이 기기 사용자 바꾸기',
    `이 기기는 지금 ${mname(me)}(으)로 잠겨 있어요. ${next.name}(으)로 바꾸면 다음에 열 때도 ${next.name}으로 기록돼요. 바꿀까요?`,
    '바꿀게요',
    apply
  );
}
