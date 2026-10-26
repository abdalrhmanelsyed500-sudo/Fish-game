// Export the whole asset set at DOUBLE size for Google Drive delivery.
//   · sprite sheets  : 2x the current 1x sheets (each frame 640x720)
//   · stills         : 2x the current 3x renders (6x = 1920x2160)
//   · animated GIFs  : 2x (640x720)
// usage: node tools/drive-export.mjs
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { drawGuardian } from '../src/art/guardian.js';
import { drawReefBackdrop, drawReefForeground } from '../src/engine/scene.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { sampleAnimation, ANIMS, ANIM_LIST } from '../src/engine/rig.js';
import { encodeGIF } from '../src/engine/gif.js';

const W = 320, H = 360;
const OUT = 'docs/drive2x';
mkdirSync(OUT, { recursive: true });
const pipe = new PixelPipeline();

/** render one 320x360 pixel frame; optional world */
function frame(anim, t, world = false) {
  const cv = createCanvas(W, H);
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (world) drawReefBackdrop(ctx, t * 2);
  drawGuardian(ctx, sampleAnimation(anim, t), t * 2);
  if (world) drawReefForeground(ctx, t * 2);
  pipe.quantize(ctx, W, H, { dither: 7, alpha: 120 });
  return cv;
}

function upscale(src, scale) {
  const cv = createCanvas(src.width * scale, src.height * scale);
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, cv.width, cv.height);
  return cv;
}

// ── 1. doubled sprite sheets (8 frames, transparent) ───────
const SHEET_SCALE = 2;
const FRAMES = 8;
for (const key of ANIM_LIST) {
  const A = ANIMS[key];
  const sheet = createCanvas(W * SHEET_SCALE * FRAMES, H * SHEET_SCALE);
  const sx = sheet.getContext('2d');
  sx.imageSmoothingEnabled = false;
  for (let i = 0; i < FRAMES; i++) {
    const t = (i / FRAMES) * A.duration;
    sx.drawImage(frame(key, t), i * W * SHEET_SCALE, 0, W * SHEET_SCALE, H * SHEET_SCALE);
  }
  const file = `${OUT}/warden-${key}-8frames@2x.png`;
  writeFileSync(file, sheet.toBuffer('image/png'));
  console.log('sheet ', file, sheet.width + 'x' + sheet.height);
}

// ── 2. doubled stills (6x) ─────────────────────────────────
const STILL = 6;
const still = upscale(frame('idle', 0.45), STILL);
writeFileSync(`${OUT}/warden-character@6x.png`, still.toBuffer('image/png'));
console.log('still ', `${OUT}/warden-character@6x.png`, still.width + 'x' + still.height);

const hero = upscale(frame('idle', 1.35, true), STILL);
writeFileSync(`${OUT}/warden-reef-world@6x.png`, hero.toBuffer('image/png'));
console.log('hero  ', `${OUT}/warden-reef-world@6x.png`, hero.width + 'x' + hero.height);

// ── 3. doubled animated GIFs (2x) ──────────────────────────
for (const key of ['idle', 'roar', 'cast', 'walk']) {
  const A = ANIMS[key];
  const N = 20;
  const datas = [];
  for (let i = 0; i < N; i++) {
    const t = (i / N) * A.duration;
    const big = upscale(frame(key, t, key === 'idle'), 2);
    datas.push(big.getContext('2d').getImageData(0, 0, big.width, big.height));
  }
  const delay = Math.max(2, Math.round((A.duration / N) * 100));
  const gif = encodeGIF(datas, W * 2, H * 2, delay, true);
  writeFileSync(`${OUT}/warden-${key}@2x.gif`, gif);
  console.log('gif   ', `${OUT}/warden-${key}@2x.gif`, (gif.length / 1024).toFixed(0) + ' KB');
}

// ── 4. palette reference card (6x) ─────────────────────────
const { R } = await import('../src/art/palette.js');
const ramps = Object.entries(R);
const cell = 28, pad = 16, labelH = 26;
const cardW = pad * 2 + Math.max(...ramps.map(([, c]) => c.length)) * cell;
const cardH = pad * 2 + ramps.length * (cell + labelH);
const card = createCanvas(cardW, cardH);
const cc = card.getContext('2d');
cc.fillStyle = '#04101a';
cc.fillRect(0, 0, cardW, cardH);
ramps.forEach(([name, colors], r) => {
  const y = pad + r * (cell + labelH);
  cc.fillStyle = '#7ba3ab';
  cc.font = '12px sans-serif';
  cc.fillText(name, pad, y + 12);
  colors.forEach((c, i) => {
    cc.fillStyle = c;
    cc.fillRect(pad + i * cell, y + labelH - 12, cell - 2, cell - 4);
  });
});
writeFileSync(`${OUT}/palette-66@6x.png`, card.toBuffer('image/png'));
console.log('pal   ', `${OUT}/palette-66@6x.png`, cardW + 'x' + cardH);
