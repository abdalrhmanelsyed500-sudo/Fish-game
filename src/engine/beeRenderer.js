// ─────────────────────────────────────────────────────────────
//  BEE RENDERER
//  Paints the meadow at 480×270, draws the bee on top, then
//  pushes the whole frame through the palette quantiser.
//  Also exports single frames, sprite sheets and GIFs at the
//  sprite's design resolution.
// ─────────────────────────────────────────────────────────────

import { drawBee } from '../art/bee.js';
import { PALETTE, BEE_PALETTE } from '../art/beePalette.js';
import { PixelPipeline } from './pixel.js';
import { sampleBee, blendPose, basePose, BEE_ANIMS } from './beeRig.js';
import { drawBeeWorld } from './beeScene.js';
import { encodeGIF } from './gif.js';

export const SCENE_W = 480;
export const SCENE_H = 270;
export const GROUND_Y = 222;

export const SPRITE_W = 280;
export const SPRITE_H = 268;
export const SPRITE_OX = 172;
export const SPRITE_OY = 240;

export const DESIGN_H = 150;
export const CHAR_PX = 130;           // character height inside the scene
const SCALE = CHAR_PX / DESIGN_H;     // 0.693…

const QUALITY = { dither: 6, alpha: 110 };

const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const MOTION = {
  idle: { vx: 0, air: 0 },
  walk: { vx: 26, air: 0 },
  run: { vx: 96, air: 0 },
  jump: { vx: 34, air: 1 },
  fall: { vx: 20, air: 1 },
  land: { vx: 0, air: 0 },
  fly: { vx: 40, air: 1 },
  sting: { vx: 0, air: 0 },
  hurt: { vx: -16, air: 0 },
};

export class BeeStudio {
  constructor() {
    this.buffer = document.createElement('canvas');
    this.buffer.width = SCENE_W;
    this.buffer.height = SCENE_H;
    this.ctx = this.buffer.getContext('2d', { willReadFrequently: true });
    this.pipe = new PixelPipeline(PALETTE);

    this.anim = 'idle';
    this.prevAnim = 'idle';
    this.blend = 1;
    this.time = 0;
    this.speed = 1;
    this.paused = false;
    this.zoom = 2;
    this.showWorld = true;
    this.showGrid = false;
    this.quality = { ...QUALITY };
    this.onFrame = null;
  }

  setAnimation(name) {
    if (!BEE_ANIMS[name] || name === this.anim) return;
    this.prevAnim = this.anim;
    this.anim = name;
    this.blend = 0;
    this.time = 0;
  }

  update(dt) {
    if (this.paused) return;
    this.time += dt * this.speed;
    if (this.blend < 1) this.blend = Math.min(1, this.blend + dt / 0.22);
  }

  pose() {
    const a = sampleBee(this.anim, this.time);
    if (this.blend >= 1) return a;
    const b = sampleBee(this.prevAnim, this.time);
    const t = this.blend * this.blend * (3 - 2 * this.blend);
    return blendPose(b, a, t);
  }

  /** full scene paint (world + character + weather) into the buffer ctx */
  paint() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, SCENE_W, SCENE_H);

    if (this.showWorld) drawBeeWorld(ctx, SCENE_W, SCENE_H, this.time, { groundY: GROUND_Y });
    else {
      ctx.fillStyle = '#1b1830';
      ctx.fillRect(0, 0, SCENE_W, SCENE_H);
    }

    const p = this.pose();
    const air = MOTION[this.anim]?.air ?? 0;
    const lift = Math.max(0, -(p.y ?? 0)) * SCALE;

    // contact shadow — softens and shrinks as the bee leaves the ground
    const sx = 176;
    const shadowW = 30 * (1 - Math.min(0.55, lift / 90));
    ctx.save();
    ctx.globalAlpha = 0.34 * (1 - Math.min(0.7, lift / 110));
    const sg = ctx.createRadialGradient(sx, GROUND_Y + 1, 1, sx, GROUND_Y + 1, shadowW);
    sg.addColorStop(0, 'rgba(24,16,34,0.95)');
    sg.addColorStop(1, 'rgba(24,16,34,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(sx, GROUND_Y + 1.5, shadowW, shadowW * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // dust at the footfalls
    if (!air && (this.anim === 'walk' || this.anim === 'run' || this.anim === 'land')) {
      const rate = this.anim === 'run' ? 26 : 15;
      for (let i = 0; i < 8; i++) {
        const ph = ((this.time * rate + i * 0.37) % 1);
        const life = 1 - ph;
        const side = i % 2 ? 1 : -1;
        const dx = side * (4 + ph * 13);
        const dy = -ph * 3.4;
        const r = (1.6 + ph * 2.6) * life;
        ctx.globalAlpha = 0.4 * life;
        ctx.fillStyle = i % 3 ? '#6a6046' : '#8a7d5c';
        ctx.beginPath();
        ctx.ellipse(sx + dx, GROUND_Y + 2 + dy, r, r * 0.72, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // the bee
    ctx.save();
    ctx.translate(sx, GROUND_Y + 2);
    ctx.scale(SCALE, SCALE);
    drawBee(ctx, p);
    ctx.restore();

    // dust kicked up by the sting
    if (this.anim === 'sting') {
      const u = (this.time % BEE_ANIMS.sting.duration) / BEE_ANIMS.sting.duration;
      if (u > 0.4 && u < 0.9) {
        const k = (u - 0.4) / 0.5;
        for (let i = 0; i < 5; i++) {
          const a = -0.6 + i * 0.28;
          const d = 6 + k * 22;
          ctx.globalAlpha = (1 - k) * 0.5;
          ctx.fillStyle = '#a08a5a';
          ctx.beginPath();
          ctx.arc(sx + 16 + Math.cos(a) * d, GROUND_Y - 20 + Math.sin(a) * d * 0.5, 1.6 + k * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    }

    if (this.showGrid) this.grid();
    this.pipe.quantize(ctx, SCENE_W, SCENE_H, this.quality);
  }

  grid() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = '#9adfe6';
    ctx.lineWidth = 1;
    for (let x = 0; x <= SCENE_W; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, SCENE_H);
      ctx.stroke();
    }
    for (let y = 0; y <= SCENE_H; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(SCENE_W, y + 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** draw buffer → display canvas (nearest neighbour, integer zoom) */
  render(display) {
    this.paint();
    const z = this.zoom;
    if (display.width !== SCENE_W * z) display.width = SCENE_W * z;
    if (display.height !== SCENE_H * z) display.height = SCENE_H * z;
    const dctx = display.getContext('2d');
    dctx.imageSmoothingEnabled = false;
    dctx.clearRect(0, 0, display.width, display.height);
    dctx.drawImage(this.buffer, 0, 0, SCENE_W * z, SCENE_H * z);
    if (this.onFrame) this.onFrame(this);
  }
}

// ── sprite export helpers (design resolution, transparent) ──
const spritePipe = new PixelPipeline(BEE_PALETTE);

export function spriteFrame(anim, t, scale = 1) {
  const cv = document.createElement('canvas');
  cv.width = SPRITE_W;
  cv.height = SPRITE_H;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.save();
  ctx.translate(SPRITE_OX, SPRITE_OY);
  drawBee(ctx, sampleBee(anim, t));
  ctx.restore();
  spritePipe.quantize(ctx, SPRITE_W, SPRITE_H, QUALITY);

  if (scale === 1) return cv;
  const big = document.createElement('canvas');
  big.width = SPRITE_W * scale;
  big.height = SPRITE_H * scale;
  const bx = big.getContext('2d');
  bx.imageSmoothingEnabled = false;
  bx.drawImage(cv, 0, 0, big.width, big.height);
  return big;
}

export function spriteSheet(anim, frames = 8, scale = 1, phases = null) {
  const cv = document.createElement('canvas');
  cv.width = SPRITE_W * scale * frames;
  cv.height = SPRITE_H * scale;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const A = BEE_ANIMS[anim];
  for (let i = 0; i < frames; i++) {
    const t = phases ? phases[i] : (i / frames) * A.duration;
    ctx.drawImage(spriteFrame(anim, t, scale), i * SPRITE_W * scale, 0);
  }
  return cv;
}

export function spriteGIF(anim, frames = 16, scale = 2, overrideDelay = null) {
  const A = BEE_ANIMS[anim];
  const datas = [];
  for (let i = 0; i < frames; i++) {
    const t = (i / frames) * A.duration;
    const cv = spriteFrame(anim, t, scale);
    datas.push(cv.getContext('2d').getImageData(0, 0, cv.width, cv.height));
  }
  const delay = overrideDelay ?? Math.max(2, Math.round((A.duration / frames) * 100));
  return encodeGIF(datas, SPRITE_W * scale, SPRITE_H * scale, delay, true);
}

export { basePose };
