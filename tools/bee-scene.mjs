// Render the bee platformer scene headlessly.
//   node tools/bee-scene.mjs out.png <anim> <t> <scale>
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
import { drawBee } from '../src/art/bee.js';
import { PALETTE } from '../src/art/beePalette.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { sampleBee } from '../src/engine/beeRig.js';
import { drawBeeWorld } from '../src/engine/beeScene.js';

const [, , out = 'bee-scene.png', anim = 'idle', tArg = '0.4', scaleArg = '2'] = process.argv;
const t = Number(tArg);
const scale = Number(scaleArg);
const W = 480, H = 270, GY = 222;
const CHAR = 130, DESIGN = 150;
const k = CHAR / DESIGN;

const buf = createCanvas(W, H);
const ctx = buf.getContext('2d', { willReadFrequently: true });
drawBeeWorld(ctx, W, H, t, { groundY: GY });

// contact shadow
const sg = ctx.createRadialGradient(176, GY + 1, 1, 176, GY + 1, 36);
sg.addColorStop(0, 'rgba(24,16,34,0.95)');
sg.addColorStop(1, 'rgba(24,16,34,0)');
ctx.globalAlpha = 0.34;
ctx.fillStyle = sg;
ctx.beginPath();
ctx.ellipse(176, GY + 1.5, 36, 10, 0, 0, Math.PI * 2);
ctx.fill();
ctx.globalAlpha = 1;

ctx.save();
ctx.translate(176, GY + 2);
ctx.scale(k, k);
drawBee(ctx, sampleBee(anim, t));
ctx.restore();

new PixelPipeline(PALETTE).quantize(ctx, W, H, { dither: 6, alpha: 110 });

const big = createCanvas(W * scale, H * scale);
const bx = big.getContext('2d');
bx.imageSmoothingEnabled = false;
bx.drawImage(buf, 0, 0, big.width, big.height);
writeFileSync(out, big.toBuffer('image/png'));
console.log(`${out} ${big.width}x${big.height} anim=${anim} t=${t}`);
