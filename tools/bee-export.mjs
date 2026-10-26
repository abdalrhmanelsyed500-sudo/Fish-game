// Build every Bee deliverable into docs/bee/:
//   · one 8-frame strip per animation @2× (4480×536)
//   · the full 9-animation contact sheet @1×
//   · GIFs for idle / walk / fly / sting @2×
//   · the platformer world still @3×
//   · the palette card
//   node tools/bee-export.mjs
import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { drawBee } from '../src/art/bee.js';
import { BEE_PALETTE, PALETTE } from '../src/art/beePalette.js';
import { PixelPipeline } from '../src/engine/pixel.js';
import { sampleBee, BEE_ANIMS, BEE_ANIM_LIST } from '../src/engine/beeRig.js';
import { drawBeeWorld } from '../src/engine/beeScene.js';
import { encodeGIF } from '../src/engine/gif.js';

const OUT = 'docs/bee';
mkdirSync(OUT, { recursive: true });

const SW = 280, SH = 268, SOX = 172, SOY = 240;  // sprite frame
const QUALITY = { dither: 6, alpha: 110 };
const charPipe = new PixelPipeline(BEE_PALETTE);
const worldPipe = new PixelPipeline(PALETTE);

function sprite(anim, t) {
  const cv = createCanvas(SW, SH);
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.save();
  ctx.translate(SOX, SOY);
  drawBee(ctx, sampleBee(anim, t));
  ctx.restore();
  charPipe.quantize(ctx, SW, SH, QUALITY);
  return cv;
}

function up(cv, k) {
  const out = createCanvas(cv.width * k, cv.height * k);
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, 0, 0, out.width, out.height);
  return out;
}

// 1. per-animation strips @2×
for (const key of BEE_ANIM_LIST) {
  const A = BEE_ANIMS[key];
  const frames = 8;
  const sheet = createCanvas(SW * 2 * frames, SH * 2);
  const sx = sheet.getContext('2d');
  sx.imageSmoothingEnabled = false;
  for (let i = 0; i < frames; i++) {
    const t = (i / frames) * A.duration;
    sx.drawImage(up(sprite(key, t), 2), i * SW * 2, 0);
  }
  writeFileSync(`${OUT}/bee-${key}-8f@2x.png`, sheet.toBuffer('image/png'));
  console.log('strip  ', `${OUT}/bee-${key}-8f@2x.png`, `${sheet.width}x${sheet.height}`);
}

// 2. full contact sheet @1×
{
  const frames = 8;
  const sheet = createCanvas(SW * frames, SH * BEE_ANIM_LIST.length);
  const sx = sheet.getContext('2d');
  sx.imageSmoothingEnabled = false;
  BEE_ANIM_LIST.forEach((key, r) => {
    const A = BEE_ANIMS[key];
    for (let i = 0; i < frames; i++) {
      const t = (i / frames) * A.duration;
      sx.drawImage(sprite(key, t), i * SW, r * SH);
    }
  });
  // row separators
  sx.globalAlpha = 0.18;
  sx.strokeStyle = '#f2bb4a';
  for (let r = 1; r < BEE_ANIM_LIST.length; r++) {
    sx.beginPath();
    sx.moveTo(0, r * SH + 0.5);
    sx.lineTo(sheet.width, r * SH + 0.5);
    sx.stroke();
  }
  sx.globalAlpha = 1;
  writeFileSync(`${OUT}/bee-all-anims.png`, sheet.toBuffer('image/png'));
  console.log('sheet  ', `${OUT}/bee-all-anims.png`, `${sheet.width}x${sheet.height}`);
}

// 3. GIFs @2×
for (const key of ['idle', 'walk', 'fly', 'sting']) {
  const A = BEE_ANIMS[key];
  const N = 20;
  const datas = [];
  for (let i = 0; i < N; i++) {
    const cv = up(sprite(key, (i / N) * A.duration), 2);
    datas.push(cv.getContext('2d').getImageData(0, 0, cv.width, cv.height));
  }
  const delay = Math.max(2, Math.round((A.duration / N) * 100));
  const gif = encodeGIF(datas, SW * 2, SH * 2, delay, true);
  writeFileSync(`${OUT}/bee-${key}@2x.gif`, gif);
  console.log('gif    ', `${OUT}/bee-${key}@2x.gif`, `${(gif.length / 1024).toFixed(0)} KB`, `${delay}cs`);
}

// 4. world still @3×
{
  const W = 480, H = 270, GY = 222, CHAR = 130, DESIGN = 150;
  const buf = createCanvas(W, H);
  const ctx = buf.getContext('2d', { willReadFrequently: true });
  drawBeeWorld(ctx, W, H, 1.25, { groundY: GY });
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
  ctx.scale(CHAR / DESIGN, CHAR / DESIGN);
  drawBee(ctx, sampleBee('idle', 1.25));
  ctx.restore();
  worldPipe.quantize(ctx, W, H, QUALITY);
  const big = up(buf, 3);
  writeFileSync(`${OUT}/bee-world@3x.png`, big.toBuffer('image/png'));
  console.log('world  ', `${OUT}/bee-world@3x.png`, `${big.width}x${big.height}`);
}

// 5. palette card
{
  const ramps = Object.entries({ honey: BEE_PALETTE.slice(0, 10), stripe: BEE_PALETTE.slice(10, 15), wing: BEE_PALETTE.slice(15, 25), skin: BEE_PALETTE.slice(25, 35), limb: BEE_PALETTE.slice(35, 42), gold: BEE_PALETTE.slice(42, 49), rim: BEE_PALETTE.slice(49) });
  const cell = 26, pad = 14, labelH = 22;
  const cw = pad * 2 + Math.max(...ramps.map(([, c]) => c.length)) * cell;
  const ch = pad * 2 + ramps.length * (cell + labelH);
  const card = createCanvas(cw, ch);
  const c = card.getContext('2d');
  c.fillStyle = '#171325';
  c.fillRect(0, 0, cw, ch);
  c.fillStyle = '#a79bb6';
  c.font = '11px sans-serif';
  ramps.forEach(([name, colors], r) => {
    const y = pad + r * (cell + labelH);
    c.fillStyle = '#a79bb6';
    c.fillText(name, pad, y + 10);
    colors.forEach((hex, i) => {
      c.fillStyle = hex;
      c.fillRect(pad + i * cell, y + labelH - 10, cell - 2, cell - 4);
    });
  });
  writeFileSync(`${OUT}/bee-palette.png`, card.toBuffer('image/png'));
  console.log('palette', `${OUT}/bee-palette.png`, `${cw}x${ch}`);
}
