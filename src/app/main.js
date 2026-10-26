// ─────────────────────────────────────────────────────────────
//  Studio UI
// ─────────────────────────────────────────────────────────────

import { Studio, W, H } from '../engine/renderer.js';
import { ANIMS, ANIM_LIST } from '../engine/rig.js';
import { R } from '../art/palette.js';
import { encodeGIF } from '../engine/gif.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const studio = new Studio();

let looping = true;
let scrubLock = false;
let sheetFrames = 8;

// ── build the animation library ────────────────────────────
const animsEl = $('anims');
for (const key of ANIM_LIST) {
  const A = ANIMS[key];
  const b = document.createElement('button');
  b.className = 'anim' + (key === studio.anim ? ' active' : '');
  b.dataset.key = key;
  b.innerHTML = `
    <span class="len">${A.duration.toFixed(1)}ث</span>
    <b>${A.label}</b>
    <small>${A.en}</small>
    <span class="bar"><i></i></span>`;
  b.title = A.hint || '';
  b.addEventListener('click', () => selectAnim(key));
  animsEl.appendChild(b);
}

function selectAnim(key) {
  studio.setAnimation(key);
  studio.time = 0;
  for (const el of animsEl.children) el.classList.toggle('active', el.dataset.key === key);
  $('curAnim').textContent = ANIMS[key].label;
  $('durLabel').textContent = ANIMS[key].duration.toFixed(1) + ' ث';
  toast(`${ANIMS[key].label} — ${ANIMS[key].hint}`);
}

function stepAnim(dir) {
  const i = ANIM_LIST.indexOf(studio.anim);
  const n = (i + dir + ANIM_LIST.length) % ANIM_LIST.length;
  selectAnim(ANIM_LIST[n]);
}

// ── palette panel ──────────────────────────────────────────
const palBody = $('paletteBody');
const rampNames = {
  robe: 'ثوب الشعاب (13)',
  mint: 'صدر ولحية (8)',
  red: 'الجوهرة المرجانية (11)',
  gold: 'حاشية ذهبية (8)',
  purple: 'شريط القبعة (6)',
  scale: 'جلد حراشف (8)',
  boot: 'أحذية وجلد (6)',
  metal: 'وشاح ومعدن (7)',
};
for (const [k, colors] of Object.entries(R)) {
  const lbl = document.createElement('div');
  lbl.className = 'ramp-label';
  lbl.textContent = rampNames[k] || k;
  palBody.appendChild(lbl);
  const grid = document.createElement('div');
  grid.className = 'palette';
  colors.forEach((c) => {
    const i = document.createElement('i');
    i.style.background = c;
    i.title = c;
    grid.appendChild(i);
  });
  palBody.appendChild(grid);
}

// ── controls ───────────────────────────────────────────────
function bindRange(id, fn, fmt) {
  const el = $(id);
  const val = $(id + 'Val');
  const apply = () => {
    const v = Number(el.value);
    fn(v);
    if (val) val.textContent = fmt ? fmt(v) : v;
    const pct = ((v - el.min) / (el.max - el.min)) * 100;
    el.style.setProperty('--fill', pct + '%');
  };
  el.addEventListener('input', apply);
  apply();
}
bindRange('speed', (v) => (studio.speed = v / 100), (v) => (v / 100).toFixed(2) + '×');
bindRange('zoom', (v) => {
  studio.zoom = v;
  stage.width = Math.round(W * v);
  stage.height = Math.round(H * v);
  $('curZoom').textContent = v + '×';
}, (v) => v + '×');
bindRange('dither', (v) => (studio.quality.dither = v));

$('btnWorld').addEventListener('click', (e) => {
  studio.showWorld = !studio.showWorld;
  e.currentTarget.classList.toggle('on', studio.showWorld);
});
$('btnGrid').addEventListener('click', (e) => {
  studio.showGrid = !studio.showGrid;
  e.currentTarget.classList.toggle('on', studio.showGrid);
});
$('btnPause').addEventListener('click', (e) => {
  studio.paused = !studio.paused;
  e.currentTarget.textContent = studio.paused ? '▶' : '⏸';
  e.currentTarget.classList.toggle('on', studio.paused);
});
$('btnPrev').addEventListener('click', () => stepAnim(-1));
$('btnNext').addEventListener('click', () => stepAnim(1));
$('btnLoop').addEventListener('click', (e) => {
  looping = !looping;
  e.currentTarget.classList.toggle('on', looping);
});

const scrub = $('scrub');
scrub.addEventListener('input', () => {
  scrubLock = true;
  const A = ANIMS[studio.anim];
  studio.time = (Number(scrub.value) / 1000) * A.duration;
});
scrub.addEventListener('change', () => (scrubLock = false));

for (const [id, n] of [['sheetFrames8', 8], ['sheetFrames12', 12], ['sheetFrames16', 16]]) {
  $(id).addEventListener('click', () => {
    sheetFrames = n;
    ['sheetFrames8', 'sheetFrames12', 'sheetFrames16'].forEach((x) =>
      $(x).classList.toggle('on', x === id));
  });
}

function download(canvas, name) {
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}

$('btnSheet').addEventListener('click', () => {
  const A = ANIMS[studio.anim];
  const sheet = studio.exportSheet(studio.anim, { frames: sheetFrames, cols: sheetFrames, scale: 2 });
  download(sheet, `warden-${studio.anim}-${sheetFrames}f@2x.png`);
  toast(`تم تصدير ${sheetFrames} إطارات من «${A.label}»`);
});

$('btnFrame').addEventListener('click', () => {
  const f = studio.exportFrame(studio.anim, studio.time, { world: studio.showWorld });
  const big = document.createElement('canvas');
  big.width = W * 4;
  big.height = H * 4;
  const c = big.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(f, 0, 0, big.width, big.height);
  download(big, `warden-${studio.anim}-frame.png`);
  toast('تم تصدير الإطار الحالي بدقّة 4×');
});

$('btnGif').addEventListener('click', () => {
  const A = ANIMS[studio.anim];
  const frames = 20;
  const datas = [];
  const ctx2 = document.createElement('canvas').getContext('2d');
  for (let i = 0; i < frames; i++) {
    const t = (i / frames) * A.duration;
    const f = studio.exportFrame(studio.anim, t, { world: studio.showWorld });
    ctx2.clearRect(0, 0, W, H);
    ctx2.drawImage(f, 0, 0);
    datas.push(ctx2.getImageData(0, 0, W, H));
  }
  const delay = Math.max(2, Math.round((A.duration / frames) * 100));
  const gif = encodeGIF(datas, W, H, delay, true);
  const blob = new Blob([gif], { type: 'image/gif' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `warden-${studio.anim}.gif`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(`تم تصدير GIF متحرك (${frames} إطارًا · ${delay * 10}ms)`);
});

// ── toast ──────────────────────────────────────────────────
let toastT;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2200);
}

// ── keyboard ───────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    $('btnPause').click();
  } else if (e.code === 'ArrowRight') stepAnim(1);
  else if (e.code === 'ArrowLeft') stepAnim(-1);
  else if (e.key === 'g' || e.key === 'G') $('btnGrid').click();
  else if (e.key === 'w' || e.key === 'W') $('btnWorld').click();
});

// ── main loop ──────────────────────────────────────────────
let last = performance.now();
let fpsAcc = 0;
let fpsFrames = 0;
const fpsEl = $('fps');
const timeEl = $('curTime');

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  studio.update(dt);

  const A = ANIMS[studio.anim];
  if (!studio.paused && looping && studio.time > A.duration) studio.time -= A.duration;

  studio.render(stage);

  if (!scrubLock) scrub.value = Math.round(((studio.time % A.duration) / A.duration) * 1000);
  timeEl.textContent = (studio.time % A.duration).toFixed(2);

  // per-animation progress bar
  const active = animsEl.querySelector('.anim.active .bar i');
  if (active) active.style.width = ((studio.time % A.duration) / A.duration) * 100 + '%';

  fpsAcc += dt;
  fpsFrames++;
  if (fpsAcc > 0.4) {
    fpsEl.textContent = Math.round(fpsFrames / fpsAcc);
    fpsAcc = 0;
    fpsFrames = 0;
  }
  requestAnimationFrame(frame);
}

// ── boot ───────────────────────────────────────────────────
$('durLabel').textContent = ANIMS[studio.anim].duration.toFixed(1) + ' ث';
$('curZoom').textContent = '2×';
requestAnimationFrame((t) => {
  last = t;
  frame(t);
});
