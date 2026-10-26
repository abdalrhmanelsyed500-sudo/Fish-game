// Export a contact sheet for every animation into docs/sheets/.
// usage: node tools/sheet.mjs [frames=8] [scale=1]
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { drawGuardian } from '../src/art/guardian.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { sampleAnimation, ANIMS, ANIM_LIST } from '../src/engine/rig.js';

const W = 320, H = 360;
const frames = Number(process.argv[2] || 8);
const scale = Number(process.argv[3] || 1);
const pipe = new PixelPipeline();
mkdirSync('docs/sheets', { recursive: true });

for (const key of ANIM_LIST) {
  const A = ANIMS[key];
  const cols = frames;
  const sheet = createCanvas(W * scale * cols, H * scale);
  const sx = sheet.getContext('2d');
  sx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) {
    const t = (i / frames) * A.duration;
    const cv = createCanvas(W, H);
    const ctx = cv.getContext('2d');
    drawGuardian(ctx, sampleAnimation(key, t), t);
    pipe.quantize(ctx, W, H, { dither: 7, alpha: 120 });
    sx.drawImage(cv, i * W * scale, 0, W * scale, H * scale);
  }
  const file = `docs/sheets/warden-${key}-${frames}f@${scale}x.png`;
  writeFileSync(file, sheet.toBuffer('image/png'));
  console.log('wrote', file);
}
