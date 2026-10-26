// ─────────────────────────────────────────────────────────────
//  BEE APP — UI wiring for the platformer character studio
// ─────────────────────────────────────────────────────────────
import {
  BeeStudio, SCENE_W, SCENE_H, spriteFrame, spriteSheet, spriteGIF,
} from '../engine/beeRenderer.js';
import { BEE_ANIMS, BEE_ANIM_LIST } from '../engine/beeRig.js';
import { PALETTE } from '../art/beePalette.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage');
const stripCv = $('strip');
const studio = new BeeStudio();
const toastEl = $('toast');

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
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

// ── animation buttons ──────────────────────────────────────
const grid = $('animGrid');
for (const key of BEE_ANIM_LIST) {
  const A = BEE_ANIMS[key];
  const b = document.createElement('button');
  b.className = 'anim' + (key === studio.anim ? ' on' : '');
  b.dataset.anim = key;
  b.innerHTML = `<b>${A.label} <span style="opacity:.55;font-size:10px">${key}</span></b><span>${A.hint} · ${A.duration.toFixed(2)}s</span>`;
  b.addEventListener('click', () => selectAnim(key));
  grid.appendChild(b);
}

function selectAnim(key) {
  if (!BEE_ANIMS[key]) return;
  studio.setAnimation(key);
  studio.paused = false;
  $('btnPlay').textContent = '⏸ إيقاف';
  document.querySelectorAll('.anim').forEach((el) => el.classList.toggle('on', el.dataset.anim === key));
  $('animName').textContent = key;
  drawStrip();
}

// ── frame strip ────────────────────────────────────────────
function drawStrip() {
  const frames = 8;
  const sheet = spriteSheet(studio.anim, frames, 1);
  const ctx = stripCv.getContext('2d');
  if (stripCv.width !== sheet.width) stripCv.width = sheet.width;
  if (stripCv.height !== sheet.height) stripCv.height = sheet.height;
  ctx.clearRect(0, 0, stripCv.width, stripCv.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sheet, 0, 0);
  // frame separators
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = '#f2bb4a';
  ctx.lineWidth = 1;
  for (let i = 1; i < frames; i++) {
    ctx.beginPath();
    ctx.moveTo(i * sheet.width / frames + 0.5, 0);
    ctx.lineTo(i * sheet.width / frames + 0.5, sheet.height);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// ── controls ───────────────────────────────────────────────
$('speed').addEventListener('input', (e) => {
  studio.speed = Number(e.target.value);
  $('speedOut').textContent = studio.speed.toFixed(2) + '×';
});
$('zoom').addEventListener('input', (e) => {
  studio.zoom = Number(e.target.value);
  $('zoomOut').textContent = studio.zoom + '×';
  $('zoomLabel').textContent = studio.zoom + '×';
});
$('dither').addEventListener('input', (e) => {
  studio.quality.dither = Number(e.target.value);
  $('ditherOut').textContent = e.target.value;
});
$('btnWorld').addEventListener('click', () => {
  studio.showWorld = !studio.showWorld;
  $('btnWorld').classList.toggle('on', studio.showWorld);
});
$('btnGrid').addEventListener('click', () => {
  studio.showGrid = !studio.showGrid;
  $('btnGrid').classList.toggle('on', studio.showGrid);
});
$('btnPlay').addEventListener('click', () => {
  studio.paused = !studio.paused;
  $('btnPlay').textContent = studio.paused ? '▶ تشغيل' : '⏸ إيقاف';
});
$('btnPauseAll').addEventListener('click', () => {
  studio.time = 0;
  studio.paused = false;
  $('btnPlay').textContent = '⏸ إيقاف';
});
$('btnPrev').addEventListener('click', () => {
  const i = BEE_ANIM_LIST.indexOf(studio.anim);
  selectAnim(BEE_ANIM_LIST[(i - 1 + BEE_ANIM_LIST.length) % BEE_ANIM_LIST.length]);
});
$('btnNext').addEventListener('click', () => {
  const i = BEE_ANIM_LIST.indexOf(studio.anim);
  selectAnim(BEE_ANIM_LIST[(i + 1) % BEE_ANIM_LIST.length]);
});

// ── exports ────────────────────────────────────────────────
$('btnSheet').addEventListener('click', () => {
  const cv = spriteSheet(studio.anim, 8, 2);
  download(cv, `bee-${studio.anim}-8frames@2x.png`);
  toast(`شريحة ${studio.anim} · 8 إطارات · ${cv.width}×${cv.height}`);
});
$('btnFrame').addEventListener('click', () => {
  const cv = spriteFrame(studio.anim, studio.time, 4);
  download(cv, `bee-${studio.anim}-frame@4x.png`);
  toast(`إطار واحد · ${cv.width}×${cv.height}`);
});
$('btnGif').addEventListener('click', () => {
  const blob = spriteGIF(studio.anim, 20, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `bee-${studio.anim}@2x.gif`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(`GIF ${studio.anim} · 20 إطارًا · ${(blob.size / 1024).toFixed(0)} KB`);
});
$('btnShot').addEventListener('click', () => {
  studio.paint();
  const cv = document.createElement('canvas');
  cv.width = SCENE_W * 2;
  cv.height = SCENE_H * 2;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(studio.buffer, 0, 0, cv.width, cv.height);
  download(cv, `bee-world-${studio.anim}@2x.png`);
  toast('لقطة المشهد @2×');
});

// ── palette swatches ───────────────────────────────────────
const sw = $('swatches');
for (const hex of PALETTE) {
  const d = document.createElement('span');
  d.className = 'sw';
  d.style.background = hex;
  d.title = hex;
  sw.appendChild(d);
}
$('palCount').textContent = PALETTE.length + ' لونًا';
$('palPill').textContent = PALETTE.length + ' لونًا';
$('animCount').textContent = BEE_ANIM_LIST.length;

// ── keyboard ───────────────────────────────────────────────
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.code === 'Space') {
    e.preventDefault();
    $('btnPlay').click();
  } else if (e.code === 'ArrowLeft') {
    $('btnNext').click();
  } else if (e.code === 'ArrowRight') {
    $('btnPrev').click();
  } else if (e.key.toLowerCase() === 'g') {
    $('btnGrid').click();
  } else if (e.key.toLowerCase() === 'w') {
    $('btnWorld').click();
  }
});

// ── render loop ────────────────────────────────────────────
let last = performance.now();
let fpsAcc = 0, fpsN = 0;

studio.onFrame = (s) => {
  $('timePill').textContent = `t ${s.time.toFixed(2)}s`;
};

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  studio.update(dt);
  studio.render(stage);

  fpsAcc += dt; fpsN++;
  if (fpsAcc > 0.5) {
    $('fps').textContent = Math.round(fpsN / fpsAcc);
    fpsAcc = 0; fpsN = 0;
  }
  requestAnimationFrame(loop);
}

// first paint
studio.render(stage);
drawStrip();
requestAnimationFrame(loop);

// debug hook (used by tools/smoke-bee.mjs)
window.__bee = { studio, selectAnim, spriteFrame, spriteSheet, spriteGIF, SCENE_W, SCENE_H };
