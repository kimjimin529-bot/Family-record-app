/* ============================================================
   우리 가족 기록장 — inline SVG art (characters, stickers, icons)
   ============================================================ */
'use strict';

const INK = '#4A3A33';
const SW = 2.3;

/* ---------- characters ---------- */
function earsFor(look) {
  if (look === 'bunny') {
    return `
      <g>
        <ellipse cx="37" cy="21" rx="7.6" ry="19" transform="rotate(-9 37 21)" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
        <ellipse cx="37" cy="21" rx="3.4" ry="12.5" transform="rotate(-9 37 21)" fill="#FFD3DB"/>
        <ellipse cx="63" cy="21" rx="7.6" ry="19" transform="rotate(9 63 21)" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
        <ellipse cx="63" cy="21" rx="3.4" ry="12.5" transform="rotate(9 63 21)" fill="#FFD3DB"/>
      </g>`;
  }
  if (look === 'cat') {
    return `
      <g>
        <path d="M30.5 34 L26 12.5 L45.5 24.5 Z" fill="#fff" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
        <path d="M32.5 30.5 L30 19 L40.5 25.5 Z" fill="#FFD8DE"/>
        <path d="M69.5 34 L74 12.5 L54.5 24.5 Z" fill="#fff" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
        <path d="M67.5 30.5 L70 19 L59.5 25.5 Z" fill="#FFD8DE"/>
      </g>`;
  }
  return `
    <g>
      <circle cx="30.5" cy="26.5" r="9.4" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
      <circle cx="30.5" cy="26.5" r="4.3" fill="#FFE0D6"/>
      <circle cx="69.5" cy="26.5" r="9.4" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
      <circle cx="69.5" cy="26.5" r="4.3" fill="#FFE0D6"/>
    </g>`;
}

function itemFor(item) {
  if (item === 'carrot') {
    return `
      <g>
        <path d="M45.4 68.6c0-3.4 1.9-5.3 4.6-6.4 2.7 1.1 4.6 3 4.6 6.4" fill="#8CC98F" stroke="#5CA168" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M50 69.4c3.7 0 6.2 2.2 6.2 5.1 0 4.6-3.5 9.7-6.2 11.7-2.7-2-6.2-7.1-6.2-11.7 0-2.9 2.5-5.1 6.2-5.1z" fill="#F7A45C" stroke="#DB7F3C" stroke-width="1.7" stroke-linejoin="round"/>
        <path d="M47.4 76.5l1.6 2M52.6 76.5l-1.6 2M50 82.2v2.2" stroke="#DB7F3C" stroke-width="1.2" stroke-linecap="round"/>
      </g>`;
  }
  if (item === 'flower') {
    return `
      <g>
        <path d="M50 74v13" stroke="#8CC98F" stroke-width="2" stroke-linecap="round"/>
        <path d="M50 82c-3.4-.6-5.2-2.3-5.6-4.6 3 .2 4.8 1.8 5.6 4.6z" fill="#9ED4A1" stroke="#6DAF77" stroke-width="1.1" stroke-linejoin="round"/>
        <g stroke="#E9B7C9" stroke-width="1.4" fill="#FBD9E4">
          <circle cx="50" cy="66.4" r="3.4"/><circle cx="56.4" cy="70.4" r="3.4"/>
          <circle cx="54.2" cy="77.2" r="3.4"/><circle cx="45.8" cy="77.2" r="3.4"/>
          <circle cx="43.6" cy="70.4" r="3.4"/>
        </g>
        <circle cx="50" cy="72.4" r="3.2" fill="#FFD86B" stroke="#E9B94B" stroke-width="1.2"/>
      </g>`;
  }
  return `
    <g>
      <path d="M45.6 70.6c1.5-2.2 3-2.9 4.4-3 1.4.1 2.9.8 4.4 3" fill="#7FBE8B" stroke="#5CA168" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M50 70.8c4.7 0 7.6 2.9 7 6-.6 3.1-3.7 6.4-7 6.4s-6.4-3.3-7-6.4c-.6-3.1 2.3-6 7-6z" fill="#F98A9B" stroke="#E07084" stroke-width="1.6" stroke-linejoin="round"/>
      <g fill="#FFE9B0">
        <circle cx="47" cy="74.4" r=".9"/><circle cx="50" cy="73.2" r=".9"/><circle cx="53" cy="74.4" r=".9"/>
        <circle cx="48.6" cy="77.4" r=".9"/><circle cx="51.6" cy="77.4" r=".9"/>
      </g>
    </g>`;
}

function faceFor(mood) {
  if (mood === 'sleep') {
    return `
      <g stroke="${INK}" stroke-width="1.9" stroke-linecap="round" fill="none">
        <path d="M34.6 52.4c1.4-1.8 3-2.7 4.6-2.7s3.2.9 4.6 2.7"/>
        <path d="M56.2 52.4c1.4-1.8 3-2.7 4.6-2.7s3.2.9 4.6 2.7"/>
      </g>
      <ellipse cx="28" cy="61" rx="6" ry="3.3" fill="#FFC2C8" opacity=".75"/>
      <ellipse cx="72" cy="61" rx="6" ry="3.3" fill="#FFC2C8" opacity=".75"/>
      <ellipse cx="50" cy="63.4" rx="2.2" ry="1.7" fill="${INK}" opacity=".85"/>`;
  }
  if (mood === 'cheer') {
    return `
      <g stroke="${INK}" stroke-width="2" stroke-linecap="round" fill="none">
        <path d="M34.4 53.6c1.4-2.4 3.2-3.6 5-3.6s3.6 1.2 5 3.6"/>
        <path d="M55.6 53.6c1.4-2.4 3.2-3.6 5-3.6s3.6 1.2 5 3.6"/>
      </g>
      <ellipse cx="27.5" cy="60" rx="6.2" ry="3.4" fill="#FFB9C2" opacity=".8"/>
      <ellipse cx="72.5" cy="60" rx="6.2" ry="3.4" fill="#FFB9C2" opacity=".8"/>
      <path d="M45.4 61.2c1.6 3.6 3 5.2 4.6 5.2s3-1.6 4.6-5.2c-1.6 1.4-3 2-4.6 2s-3-.6-4.6-2z" fill="#F58A97" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  return `
    <ellipse cx="38.4" cy="51.6" rx="3.5" ry="4.5" fill="${INK}"/>
    <circle cx="37.2" cy="49.8" r="1.2" fill="#fff"/>
    <ellipse cx="61.6" cy="51.6" rx="3.5" ry="4.5" fill="${INK}"/>
    <circle cx="60.4" cy="49.8" r="1.2" fill="#fff"/>
    <ellipse cx="27.6" cy="60" rx="6.2" ry="3.4" fill="#FFC2C8" opacity=".78"/>
    <ellipse cx="72.4" cy="60" rx="6.2" ry="3.4" fill="#FFC2C8" opacity=".78"/>
    <path d="M45.2 61.4q2.4 3.4 4.8 0 2.4 3.4 4.8 0" fill="none" stroke="${INK}" stroke-width="1.7" stroke-linecap="round"/>`;
}

function headExtras(look, item) {
  if (look === 'bunny') {
    return `<path d="M72 40c2.6-2.8 6.6-2 6.6 1.6 0 2.8-3.4 5-6.6 7-3.2-2-6.6-4.2-6.6-7 0-3.6 4-4.4 6.6-1.6z" fill="#FFB7C6" stroke="#F090A6" stroke-width="1.1"/>`;
  }
  if (look === 'cat') {
    return `<g transform="translate(72 30)">
      <circle cx="0" cy="0" r="2.4" fill="#F6C9DC"/><circle cx="4.4" cy="0" r="2.4" fill="#F6C9DC"/>
      <circle cx="2.2" cy="-2.6" r="2.4" fill="#F6C9DC"/><circle cx="2.2" cy="2.6" r="2.4" fill="#F6C9DC"/>
      <circle cx="2.2" cy="0" r="1.6" fill="#FFE39B"/>
    </g>`;
  }
  return `<g stroke="#F2C879" stroke-width="2" stroke-linecap="round">
    <path d="M76 26v6M73 29h6"/>
  </g>`;
}

function charArt(look, item, mood) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
    <ellipse cx="50" cy="90" rx="21" ry="4" fill="#E9DCC4" opacity=".55"/>
    ${earsFor(look)}
    <path d="M50 21C67.5 21 80 33.6 80 53.2 80 73.6 68.4 87 50 87 31.6 87 20 73.6 20 53.2 20 33.6 32.5 21 50 21Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
    <path d="M30 78.5c2.6 1.8 5.6 2.7 9 2.9" stroke="#F4EEDF" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    ${faceFor(mood || 'happy')}
    ${itemFor(item)}
    <ellipse cx="33.4" cy="78.6" rx="6.2" ry="4.6" transform="rotate(-14 33.4 78.6)" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
    <ellipse cx="66.6" cy="78.6" rx="6.2" ry="4.6" transform="rotate(14 66.6 78.6)" fill="#fff" stroke="${INK}" stroke-width="${SW}"/>
    ${headExtras(look, item)}
  </svg>`;
}

function charSVG(memberId, opts) {
  const o = opts || {};
  const m = (state && state.members && state.members[memberId]) || { look: 'bear', item: 'strawberry' };
  return charArt(o.look || m.look || 'bear', o.item || m.item || 'strawberry', o.mood || 'happy');
}

/* ---------- stickers ---------- */
const STICKERS = [
  { id: 'love', label: '사랑해', look: 'bunny', mood: 'happy', prop: 'heart', bg: '#FFF0F4' },
  { id: 'cheer', label: '최고야', look: 'bear', mood: 'cheer', prop: 'star', bg: '#FFF7E2' },
  { id: 'thanks', label: '고마워', look: 'cat', mood: 'happy', prop: 'flower', bg: '#F1F7EC' },
  { id: 'sleepy', label: '쿨쿨', look: 'bear', mood: 'sleep', prop: 'zzz', bg: '#F1F3FC' },
  { id: 'yummy', label: '맛있다', look: 'bunny', mood: 'cheer', prop: 'cake', bg: '#FFF3E6' },
  { id: 'proud', label: '뿌듯해', look: 'cat', mood: 'happy', prop: 'sparkle', bg: '#FDF1E7' },
  { id: 'hug', label: '안아줄게', look: 'bear', mood: 'happy', prop: 'hug', bg: '#FBEFF7' },
  { id: 'hi', label: '안녕', look: 'bunny', mood: 'cheer', prop: 'wave', bg: '#EFF8F1' },
];

function stickerProp(prop) {
  switch (prop) {
    case 'heart':
    case 'hug':
      return `<g transform="translate(95 26) rotate(-8) scale(1.05)">
        <path d="M0 13c-8.6-6-13-9.7-13-14.4 0-3.7 2.9-5.8 5.9-5.8 2.2 0 4.1 1.3 5 3.3.9-2 2.8-3.3 5-3.3 3 0 5.9 2.1 5.9 5.8C8.8 3.3 4.4 7 0 13Z"
          fill="#F97F97" stroke="#DF5F7C" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="-4" cy="-6" r="1.1" fill="#FFD3DC"/>
      </g>`;
    case 'star':
      return `<g transform="translate(96 26) rotate(8)">
        <path d="M0-13.5l4 8.2 9 1.2-6.5 6.2 1.6 8.9-8.1-4.3-8 4.3 1.5-8.9-6.5-6.2 9-1.2z"
          fill="#FFD35C" stroke="#E5AC33" stroke-width="1.5" stroke-linejoin="round"/>
      </g>
      <g stroke="#F2C169" stroke-width="2" stroke-linecap="round">
        <path d="M24 30v7M20.5 33.5h7"/><path d="M104 100v5M101.5 102.5h5"/>
      </g>`;
    case 'flower':
      return `<g transform="translate(96 28)">
        <g stroke="#E9B7C9" stroke-width="1.3" fill="#FBD9E4">
          <circle cx="0" cy="-5.4" r="3.6"/><circle cx="5.1" cy="-1.7" r="3.6"/><circle cx="3.2" cy="4.4" r="3.6"/>
          <circle cx="-3.2" cy="4.4" r="3.6"/><circle cx="-5.1" cy="-1.7" r="3.6"/>
        </g><circle cx="0" cy="0" r="3.2" fill="#FFD86B" stroke="#E9B94B" stroke-width="1.1"/>
      </g>`;
    case 'zzz':
      return `<g fill="#A3B7DD" font-family="'Jua',sans-serif" font-weight="700">
        <text x="86" y="32" font-size="13">z</text><text x="94" y="24" font-size="17">Z</text>
      </g>`;
    case 'cake':
      return `<g transform="translate(96 30)">
        <path d="M-12 7h24v-9a12 12 0 0 0-24 0z" fill="#FFD9E2" stroke="#E7A9B8" stroke-width="1.5"/>
        <path d="M-12 2h24" stroke="#E7A9B8" stroke-width="1.3"/>
        <path d="M0-9v-6" stroke="#C9A45C" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="0" cy="-17" r="2.4" fill="#FFC24B" stroke="#E9A531" stroke-width=".8"/>
      </g>`;
    case 'sparkle':
      return `<g fill="#F7C948" stroke="#E3AC2A" stroke-width=".9" stroke-linejoin="round">
        <path d="M96 19l2.4 5.8L104 27l-5.6 2.2L96 35l-2.4-5.8L88 27l5.6-2.2z"/>
        <path d="M22 86l1.7 4.1 4.3 1.9-4.3 1.9L22 98l-1.7-4.1L16 92l4.3-1.9z" opacity=".85"/>
      </g>`;
    case 'wave':
      return `<g stroke="#8FBE9B" stroke-width="2.4" stroke-linecap="round" fill="none">
        <path d="M100 34c2.6-3.2 3-6.4 1.4-9"/><path d="M107 37c3.2-3.8 3.6-7.8 2-11"/>
      </g>`;
    default:
      return '';
  }
}

function stickerSVG(kind) {
  const st = STICKERS.find(s => s.id === kind) || STICKERS[0];
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(st.label)} 스티커">
    <circle cx="60" cy="63" r="51" fill="${st.bg}" stroke="#EFE3CE" stroke-width="1.8" stroke-dasharray="3 6"/>
    <g transform="translate(16 16) scale(0.86)">
      <ellipse cx="50" cy="91" rx="20" ry="3.6" fill="#E9DCC4" opacity=".5"/>
      ${earsFor(st.look)}
      <path d="M50 21C67.5 21 80 33.6 80 53.2 80 73.6 68.4 87 50 87 31.6 87 20 73.6 20 53.2 20 33.6 32.5 21 50 21Z" fill="#FFFFFF" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
      ${faceFor(st.mood)}
      ${headExtras(st.look, '')}
    </g>
    ${stickerProp(st.prop)}
  </svg>`;
}

/* ---------- icons ---------- */
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.8 12 4l8 6.8V19a1.4 1.4 0 0 1-1.4 1.4H15v-5H9v5H5.4A1.4 1.4 0 0 1 4 19z"/></svg>',
  routine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.6" y="4.2" width="16.8" height="15.6" rx="3.4"/><path d="M7.6 12.2l2.8 2.8 5.6-5.8"/></svg>',
  meals: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.4 11.4h17.2a8.6 8.6 0 0 1-17.2 0z"/><path d="M8.4 7.8c0-1.4 1.2-2.4 2.4-3.4M13 7.8c0-1.2 1-2 2-2.8"/></svg>',
  schedule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.4" y="5.4" width="17.2" height="15" rx="3.2"/><path d="M8 3.4v3.6M16 3.4v3.6M3.4 10.4h17.2"/><circle cx="8.6" cy="14.6" r="1" fill="currentColor" stroke="none"/><circle cx="12.4" cy="14.6" r="1" fill="currentColor" stroke="none"/></svg>',
  health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.2S3.6 15.4 3.6 9.9A4.4 4.4 0 0 1 12 7.7a4.4 4.4 0 0 1 8.4 2.2c0 5.5-8.4 10.3-8.4 10.3z"/><path d="M7.6 12.4h2.2l1.2-2 1.6 3.4 1.2-1.4h2.2"/></svg>',
  praise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.8l2.5 5.2 5.7.8-4.2 4 1 5.7L12 16.8l-5 2.7 1-5.7-4.2-4 5.7-.8z"/></svg>',
  allowance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16.4 8.4c-.8-1.6-2.3-2.4-4.4-2.4-2.4 0-3.6 1.2-3.6 2.6 0 1.6 1.4 2.2 3.8 2.8 2.6.6 4 1.4 4 3.2 0 1.8-1.6 3.2-4.4 3.2-2.2 0-3.8-.9-4.6-2.6"/><path d="M12 3.6v16.8"/><path d="M6.4 6.6c-.6.6-1 1.4-1 2.4M17.6 14.6c0 1-.4 1.8-1 2.4" opacity=".5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.4 11.6c0 4.2-3.6 7.4-8.2 7.4-1 0-2-.2-2.9-.5l-4.5 1.6 1.5-3.7a7 7 0 0 1-1.7-4.8C4.6 7.4 8.2 4.2 12.8 4.2s7.6 3.2 7.6 7.4z"/><circle cx="9.6" cy="11.6" r=".9" fill="currentColor" stroke="none"/><circle cx="12.8" cy="11.6" r=".9" fill="currentColor" stroke="none"/><circle cx="16" cy="11.6" r=".9" fill="currentColor" stroke="none"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94a7.07 7.07 0 0 0 0-1.88l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.03 7.03 0 0 0-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.58.24-1.12.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.65 8.84a.5.5 0 0 0 .12.64l2.03 1.58a7.07 7.07 0 0 0 0 1.88l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.42.34.61.22l2.39-.96c.5.38 1.04.7 1.62.94l.36 2.54c.04.24.25.42.5.42h3.84c.25 0 .46-.18.5-.42l.36-2.54c.58-.24 1.12-.56 1.62-.94l2.39.96c.19.12.47.02.61-.22l1.92-3.32a.5.5 0 0 0-.12-.64zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6l2.9 6.2 6.8.85-5 4.7 1.3 6.7L12 17.9l-6 3.15 1.3-6.7-5-4.7 6.8-.85z" fill="#F6C344" stroke="#E0A72B" stroke-width="1.1" stroke-linejoin="round"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15.6 5.2l3.2 3.2-9.6 9.6-4 1 1-4z"/><path d="M14 6.8l3.2 3.2"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M12 5.5v13M5.5 12h13"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5v-4"/><path d="M8.4 3.8h7.2l-1 5.2 2.6 3.2H6.8l2.6-3.2z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21S3.5 15.6 3.5 9.9A4.9 4.9 0 0 1 12 7.1a4.9 4.9 0 0 1 8.5 2.8C20.5 15.6 12 21 12 21z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.6l4.4 4.4L19 7.4"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9.2" y="3.4" width="5.6" height="10.2" rx="2.8"/><path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0M12 17.6V21"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l16-7-6.4 15-2.6-6z"/></svg>',
};

/* ---------- weather icons ---------- */
function weatherIcon(code, size) {
  const s = size || 34;
  const c = Number(code);
  const wrap = (inner) => `<svg viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true">${inner}</svg>`;
  const sun = `<circle cx="24" cy="24" r="8.6" fill="#FBC93F"/><g stroke="#F5B921" stroke-width="2.6" stroke-linecap="round"><path d="M24 6.5v4M24 37.5v4M6.5 24h4M37.5 24h4M11.6 11.6l2.8 2.8M33.6 33.6l2.8 2.8M36.4 11.6l-2.8 2.8M14.4 33.6l-2.8 2.8"/></g>`;
  const cloud = (fill) => `<path d="M15 34h17.5a6.5 6.5 0 0 0 .6-13 8.6 8.6 0 0 0-16.4 1.6A5.7 5.7 0 0 0 15 34z" fill="${fill || '#FFF'}" stroke="#B9CBDE" stroke-width="1.6"/>`;
  if (c === 0) return wrap(sun);
  if (c === 1 || c === 2) return wrap(`<circle cx="30" cy="18" r="8" fill="#FBC93F"/><g stroke="#F5B921" stroke-width="2.2" stroke-linecap="round"><path d="M30 5v3M30 28v1M17 18h3M41 18h-1"/></g>${cloud('#FFFFFF')}`);
  if (c === 3) return wrap(cloud('#F2F6FA') + `<path d="M15 34h17.5a6.5 6.5 0 0 0 .6-13 8.6 8.6 0 0 0-16.4 1.6A5.7 5.7 0 0 0 15 34z" fill="none" stroke="#B9CBDE" stroke-width="1.6"/>`);
  if (c >= 45 && c <= 48) return wrap(`<g stroke="#C6D4E2" stroke-width="2.6" stroke-linecap="round"><path d="M10 18h28M8 24h32M10 30h28"/></g>`);
  if ((c >= 51 && c <= 67) || (c >= 80 && c <= 82)) return wrap(cloud('#F4F8FC') + `<g stroke="#7FB3E0" stroke-width="2.6" stroke-linecap="round"><path d="M17 37l-2 5M25 37l-2 5M33 37l-2 5"/></g>`);
  if (c >= 71 && c <= 77) return wrap(cloud('#F7FAFD') + `<g fill="#9DC9E8"><circle cx="17" cy="39" r="1.8"/><circle cx="25" cy="41" r="1.8"/><circle cx="33" cy="39" r="1.8"/></g>`);
  if (c >= 95) return wrap(cloud('#E9EEF5') + `<path d="M26 34l-6 8h5l-2 6 7-9h-5z" fill="#F5B921" stroke="#E5A414" stroke-width="1"/>`);
  return wrap(sun);
}
