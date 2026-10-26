// ─────────────────────────────────────────────────────────────
//  PIXEL PIPELINE
//  Everything is painted with the normal 2D canvas (smooth
//  gradients, soft brushes) at a small "logical" resolution,
//  then pushed through a palette quantiser with ordered
//  dithering.  That is what turns smooth vector painting into
//  authentic pixel art with a limited palette — and it means
//  the animation can be sub-pixel smooth while every frame
//  still reads as hand-placed pixels.
// ─────────────────────────────────────────────────────────────

import { PALETTE, hexToRgb } from '../art/palette.js';

const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];
const BAYER = new Float32Array(64);
for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) BAYER[y * 8 + x] = BAYER8[y][x] / 63 - 0.5;

function buildLUT(hexes) {
  const cols = hexes.map(hexToRgb);
  const lut = new Uint8Array(32768);
  for (let r = 0; r < 32; r++) {
    for (let g = 0; g < 32; g++) {
      for (let b = 0; b < 32; b++) {
        const R = r * 8 + 4, G = g * 8 + 4, B = b * 8 + 4;
        let best = 0, bestD = Infinity;
        for (let i = 0; i < cols.length; i++) {
          const c = cols[i];
          const dr = R - c[0], dg = G - c[1], db = B - c[2];
          // perceptual weighting: eyes are most sensitive to green
          const d = dr * dr * 0.30 + dg * dg * 0.59 + db * db * 0.11;
          if (d < bestD) { bestD = d; best = i; }
        }
        lut[(r << 10) | (g << 5) | b] = best;
      }
    }
  }
  const rgb = new Uint8Array(cols.length * 3);
  cols.forEach((c, i) => { rgb[i * 3] = c[0]; rgb[i * 3 + 1] = c[1]; rgb[i * 3 + 2] = c[2]; });
  return { lut, rgb, cols };
}

export class PixelPipeline {
  constructor(palette = PALETTE) {
    this.palette = palette;
    const { lut, rgb } = buildLUT(palette);
    this.lut = lut;
    this.rgb = rgb;
    this.cols = palette.map(hexToRgb);
  }

  /** Quantise the pixels of a 2d context in place. */
  quantize(ctx, w, h, { dither = 26, alpha = 110, preserveAlpha = false } = {}) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const { lut, rgb, cols } = this;
    for (let y = 0; y < h; y++) {
      const brow = (y & 7) << 3;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) << 2;
        const a = d[i + 3];
        if (a < alpha) {
          if (!preserveAlpha) d[i + 3] = 0;
          else d[i + 3] = a < alpha ? 0 : a;
          continue;
        }
        const off = BAYER[brow | (x & 7)] * dither;
        let r = d[i] + off, g = d[i + 1] + off, b = d[i + 2] + off;
        r = r < 0 ? 0 : r > 255 ? 255 : r;
        g = g < 0 ? 0 : g > 255 ? 255 : g;
        b = b < 0 ? 0 : b > 255 ? 255 : b;
        const idx = lut[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
        d[i] = rgb[idx * 3];
        d[i + 1] = rgb[idx * 3 + 1];
        d[i + 2] = rgb[idx * 3 + 2];
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /** Nearest palette colour — used for swatches and UI accents. */
  nearest(hex, paletteHex = this.palette) {
    const [r, g, b] = hexToRgb(hex);
    let best = 0, bestD = Infinity;
    paletteHex.forEach((h, i) => {
      const c = hexToRgb(h);
      const d = (r - c[0]) ** 2 * 0.3 + (g - c[1]) ** 2 * 0.59 + (b - c[2]) ** 2 * 0.11;
      if (d < bestD) { bestD = d; best = i; }
    });
    return paletteHex[best];
  }
}

// ── tiny drawing helpers ─────────────────────────────────────
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`;

export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Fill a path built by `build` with a linear gradient, then edge shade. */
export function gradFill(ctx, build, x0, y0, x1, y1, stops, extra) {
  ctx.save();
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  build(ctx);
  ctx.fillStyle = g;
  ctx.fill();
  if (extra) extra(ctx);
  ctx.restore();
}
