// Render the full world + character composite to PNG (offline check).
// usage: node tools/scene-preview.mjs out.png [anim] [time] [scale]
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { drawGuardian } from '../src/art/guardian.js';
import { drawReefBackdrop, drawReefForeground } from '../src/engine/scene.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { sampleAnimation } from '../src/engine/rig.js';

const W = 320, H = 360;
const out = process.argv[2] || 'scene.png';
const anim = process.argv[3] || 'idle';
const time = Number(process.argv[4] || 0.9);
const scale = Number(process.argv[5] || 3);

const cv = createCanvas(W, H);
const ctx = cv.getContext('2d');
drawReefBackdrop(ctx, time * 3);
drawGuardian(ctx, sampleAnimation(anim, time), time * 3);
drawReefForeground(ctx, time * 3);
new PixelPipeline().quantize(ctx, W, H, { dither: 7, alpha: 120 });

const big = createCanvas(W * scale, H * scale);
const bx = big.getContext('2d');
bx.imageSmoothingEnabled = false;
bx.drawImage(cv, 0, 0, W * scale, H * scale);
writeFileSync(out, big.toBuffer('image/png'));
console.log('wrote', out);
