// ─────────────────────────────────────────────────────────────
//  RENDERER
//  Paints character + world at 320×360, pushes every frame through
//  the palette quantiser, then blits it pixel-perfect to screen.
//  All motion is analytic (t → rig), so playback is frame-rate
//  independent and export is deterministic.
// ─────────────────────────────────────────────────────────────

import { drawGuardian } from '../art/guardian.js';
import { PixelPipeline } from './pixel.js';
import { baseRig, sampleAnimation, ANIMS, blendRig, lerp } from './rig.js';
import { drawReefBackdrop, drawReefForeground } from './scene.js';

export const W = 320;
export const H = 360;

export class Studio {
  constructor() {
    this.buffer = document.createElement('canvas');
    this.buffer.width = W;
    this.buffer.height = H;
    this.ctx = this.buffer.getContext('2d', { willReadFrequently: true });
    this.pipe = new PixelPipeline();

    this.anim = 'idle';
    this.prevAnim = 'idle';
    this.blend = 1;          // 0 → 1 crossfade between animations
    this.blendTime = 0.45;
    this.time = 0;
    this.speed = 1;
    this.paused = false;
    this.zoom = 2;
    this.showWorld = true;
    this.showGrid = false;
    this.showPalette = true;
    this.quality = { dither: 7, alpha: 120 };
    this.rig = baseRig();
    this.frameCb = null;
  }

  setAnimation(name) {
    if (name === this.anim) return;
    this.prevAnim = this.anim;
    this.anim = name;
    this.blend = 0;
  }

  /** advance the clock (seconds) */
  update(dt) {
    if (this.paused) return;
    this.time += dt * this.speed;
    if (this.blend < 1) this.blend = Math.min(1, this.blend + dt / this.blendTime);
  }

  sample() {
    const a = sampleAnimation(this.anim, this.time);
    if (this.blend >= 1) return a;
    const b = sampleAnimation(this.prevAnim, this.time);
    const t = this.blend * this.blend * (3 - 2 * this.blend);
    return blendRig(b, a, t);
  }

  /** draw one frame into the internal buffer (pre-quantise) */
  paint() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    if (this.showWorld) drawReefBackdrop(ctx, this.time);
    const rig = this.sample();
    this.rig = rig;
    drawGuardian(ctx, rig, this.time);
    if (this.showWorld) drawReefForeground(ctx, this.time);
    this.pipe.quantize(ctx, W, H, this.quality);
  }

  /** paint + blit to a visible canvas */
  render(target) {
    this.paint();
    const dctx = target.getContext('2d');
    dctx.imageSmoothingEnabled = false;
    dctx.clearRect(0, 0, target.width, target.height);
    dctx.drawImage(this.buffer, 0, 0, target.width, target.height);
    if (this.showGrid) this.drawGrid(dctx, target);
  }

  drawGrid(dctx, target) {
    const px = target.width / W;
    dctx.save();
    dctx.globalAlpha = 0.18;
    dctx.strokeStyle = '#8fe8e0';
    dctx.lineWidth = 1;
    if (px > 3) {
      for (let x = 0; x <= W; x += 16) {
        dctx.beginPath();
        dctx.moveTo(x * px, 0);
        dctx.lineTo(x * px, target.height);
        dctx.stroke();
      }
      for (let y = 0; y <= H; y += 16) {
        dctx.beginPath();
        dctx.moveTo(0, y * px);
        dctx.lineTo(target.width, y * px);
        dctx.stroke();
      }
    }
    dctx.restore();
  }

  /** Render a frame into a fresh canvas at 1× (for exports). */
  exportFrame(anim, time, { world = false } = {}) {
    const cv = document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const prev = { anim: this.anim, time: this.time, world: this.showWorld };
    this.ctx.clearRect(0, 0, W, H);
    if (world) drawReefBackdrop(this.ctx, time);
    drawGuardian(this.ctx, sampleAnimation(anim, time), time);
    if (world) drawReefForeground(this.ctx, time);
    this.pipe.quantize(this.ctx, W, H, this.quality);
    ctx.drawImage(this.buffer, 0, 0);
    Object.assign(this, { anim: prev.anim, time: prev.time, showWorld: prev.world });
    return cv;
  }

  /** Build a sprite sheet for one animation. */
  exportSheet(anim, { frames = 8, cols = 8, scale = 1, world = false } = {}) {
    const A = ANIMS[anim] || ANIMS.idle;
    const rows = Math.ceil(frames / cols);
    const cw = Math.round(W * scale);
    const ch = Math.round(H * scale);
    const sheet = document.createElement('canvas');
    sheet.width = cw * cols;
    sheet.height = ch * rows;
    const sctx = sheet.getContext('2d');
    sctx.imageSmoothingEnabled = false;
    sctx.fillStyle = world ? '#061a26' : 'rgba(0,0,0,0)';
    if (world) sctx.fillRect(0, 0, sheet.width, sheet.height);
    for (let i = 0; i < frames; i++) {
      const t = (i / frames) * A.duration;
      const f = this.exportFrame(anim, t, { world });
      sctx.drawImage(f, (i % cols) * cw, Math.floor(i / cols) * ch, cw, ch);
    }
    return sheet;
  }
}
