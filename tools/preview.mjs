// Render a test frame (or a contact sheet of animation frames) to PNG.
// usage: node tools/preview.mjs out.png [scale] [anim] [frames] [cols]
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { drawGuardian } from '../src/art/guardian.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { baseRig, sampleAnimation, ANIMS } from '../src/engine/rig.js';

const W = 320, H = 360;
const out = process.argv[2] || 'preview.png';
const scale = Number(process.argv[3] || 2);
const anim = process.argv[4];
const frames = Number(process.argv[5] || 1);
const cols = Number(process.argv[6] || frames);

const pipe = new PixelPipeline();

function renderFrame(rig) {
  const cv = createCanvas(W, H);
  const ctx = cv.getContext('2d');
  drawGuardian(ctx, rig, 0);
  pipe.quantize(ctx, W, H, { dither: 7, alpha: 118 });
  return cv;
}

if (!anim || frames <= 1) {
  const cv = renderFrame(baseRig());
  const big = createCanvas(W * scale, H * scale);
  const bx = big.getContext('2d');
  bx.fillStyle = '#0a0f17';
  bx.fillRect(0, 0, big.width, big.height);
  bx.imageSmoothingEnabled = false;
  bx.drawImage(cv, 0, 0, W * scale, H * scale);
  writeFileSync(out, big.toBuffer('image/png'));
} else {
  const rows = Math.ceil(frames / cols);
  const sheet = createCanvas(W * cols, H * rows);
  const sx = sheet.getContext('2d');
  sx.fillStyle = '#0a0f17';
  sx.fillRect(0, 0, sheet.width, sheet.height);
  sx.imageSmoothingEnabled = false;
  const dur = (ANIMS[anim] || ANIMS.idle).duration;
  for (let i = 0; i < frames; i++) {
    const t = (i / frames) * dur;
    const cv = renderFrame(sampleAnimation(anim, t));
    sx.drawImage(cv, (i % cols) * W, Math.floor(i / cols) * H);
  }
  writeFileSync(out, sheet.toBuffer('image/png'));
}
console.log('wrote', out);
