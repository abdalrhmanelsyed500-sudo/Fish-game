// Render the bee on its own (transparent) — single frames or a strip.
//   node tools/bee-preview.mjs out.png <anim> <frames> <scale> [startT] [stepT]
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { drawBee } from '../src/art/bee.js';
import { BEE_PALETTE } from '../src/art/beePalette.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { sampleBee, BEE_ANIMS } from '../src/engine/beeRig.js';

const W = 280, H = 268;      // logical frame
const OX = 172, OY = 240;    // ground point
const QUALITY = { dither: 6, alpha: 110 };

export function drawBeeFrame(ctx, anim, t) {
  const p = sampleBee(anim, t);
  ctx.save();
  ctx.translate(OX, OY);
  drawBee(ctx, p);
  ctx.restore();
}

const [, , out = 'bee.png', anim = 'idle', framesArg = '1', scaleArg = '2', startArg = '0.4', stepArg] = process.argv;
const frames = Number(framesArg);
const scale = Number(scaleArg);
const A = BEE_ANIMS[anim] ?? BEE_ANIMS.idle;
const step = stepArg ? Number(stepArg) : A.duration / frames;
const t0 = Number(startArg);
const pipe = new PixelPipeline(BEE_PALETTE);

const big = createCanvas(W * scale * frames, H * scale);
const bx = big.getContext('2d');
bx.imageSmoothingEnabled = false;

for (let i = 0; i < frames; i++) {
  const cv = createCanvas(W, H);
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  drawBeeFrame(ctx, anim, t0 + i * step);
  pipe.quantize(ctx, W, H, QUALITY);
  bx.drawImage(cv, i * W * scale, 0, W * scale, H * scale);
}

writeFileSync(out, big.toBuffer('image/png'));
console.log(`${out}  ${big.width}x${big.height}  anim=${anim} frames=${frames} t0=${t0}`);
