// Offline check: render animation frames, encode a GIF, write it out.
// usage: node tools/gif-test.mjs out.gif [anim] [frames]
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { drawGuardian } from '../src/art/guardian.js';
import { drawReefBackdrop, drawReefForeground } from '../src/engine/scene.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { sampleAnimation, ANIMS } from '../src/engine/rig.js';
import { encodeGIF } from '../src/engine/gif.js';

const W = 320, H = 360;
const out = process.argv[2] || 'test.gif';
const anim = process.argv[3] || 'idle';
const frames = Number(process.argv[4] || 16);
const world = process.argv[5] !== 'noWorld';

const cv = createCanvas(W, H);
const ctx = cv.getContext('2d', { willReadFrequently: true });
const pipe = new PixelPipeline();
const A = ANIMS[anim] || ANIMS.idle;
const datas = [];

for (let i = 0; i < frames; i++) {
  const t = (i / frames) * A.duration;
  ctx.clearRect(0, 0, W, H);
  if (world) drawReefBackdrop(ctx, t * 2);
  drawGuardian(ctx, sampleAnimation(anim, t), t * 2);
  if (world) drawReefForeground(ctx, t * 2);
  pipe.quantize(ctx, W, H, { dither: 7, alpha: 120 });
  datas.push(ctx.getImageData(0, 0, W, H));
}

const delay = Math.max(2, Math.round((A.duration / frames) * 100));
const gif = encodeGIF(datas, W, H, delay);
writeFileSync(out, gif);
console.log('wrote', out, gif.length, 'bytes', frames, 'frames', delay, 'cs delay');
