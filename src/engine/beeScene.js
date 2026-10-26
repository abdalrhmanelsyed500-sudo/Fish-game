// ─────────────────────────────────────────────────────────────
//  BEE WORLD — a twilight meadow built for a side-view
//  platformer: three parallax bands, a mossy ground shelf, two
//  floating islands, pollen and fireflies.  Painted smooth,
//  quantised with the character so both share one palette.
// ─────────────────────────────────────────────────────────────

import { B } from '../art/beePalette.js';

const SKY = B.sky, HILL = B.hill, GRASS = B.grass, STONE = B.stone, LEAF = B.leaf, GLOW = B.glow, DUSK = B.dusk, RIM = B.rim;

const TAU = Math.PI * 2;
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const hash2 = (x, y) => hash(x * 57.3 + y * 131.7);
const lerp = (a, b, t) => a + (b - a) * t;

// ── sky ─────────────────────────────────────────────────────
function drawSky(ctx, W, H, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, SKY[0]);
  g.addColorStop(0.24, SKY[1]);
  g.addColorStop(0.44, SKY[2]);
  g.addColorStop(0.62, SKY[4]);
  g.addColorStop(0.78, SKY[7]);
  g.addColorStop(0.9, SKY[8]);
  g.addColorStop(1, SKY[9]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // moon
  const mx = W * 0.74, my = H * 0.29, mr = 19;
  const halo = ctx.createRadialGradient(mx, my, mr * 0.4, mx, my, mr * 6.5);
  halo.addColorStop(0, 'rgba(255,242,205,0.55)');
  halo.addColorStop(0.35, 'rgba(240,207,104,0.16)');
  halo.addColorStop(1, 'rgba(240,207,104,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(mx - mr * 7, my - mr * 7, mr * 14, mr * 14);

  const mg = ctx.createRadialGradient(mx - 5, my - 6, 1, mx, my, mr);
  mg.addColorStop(0, '#fffdf2');
  mg.addColorStop(0.55, '#f6e9c4');
  mg.addColorStop(1, '#d8bd93');
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, TAU);
  ctx.fillStyle = mg;
  ctx.fill();
  // craters
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = '#8f7a5c';
  for (let i = 0; i < 6; i++) {
    const a = hash(i * 3.1) * TAU, r = hash(i * 5.7) * mr * 0.68;
    ctx.beginPath();
    ctx.arc(mx + Math.cos(a) * r, my + Math.sin(a) * r, 1.6 + hash(i * 9.2) * 3.4, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // long clouds
  for (let i = 0; i < 5; i++) {
    const y = 26 + i * 15 + Math.sin(t * 0.12 + i) * 1.4;
    const w = 120 + hash(i * 2.3) * 190;
    const x = ((hash(i * 4.4) * (W + 260) + t * (4 + i * 1.8)) % (W + 260)) - 130;
    ctx.globalAlpha = 0.16 + i * 0.02;
    ctx.fillStyle = i % 2 ? DUSK[3] : DUSK[5];
    ctx.beginPath();
    ctx.ellipse(x, y, w * 0.5, 3.2 + i * 0.55, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + w * 0.18, y + 2.4, w * 0.3, 2.1, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── distant ridges ──────────────────────────────────────────
function ridge(ctx, W, baseY, amp, seed, color, rim) {
  ctx.beginPath();
  ctx.moveTo(-10, baseY + 60);
  for (let x = -10; x <= W + 10; x += 8) {
    const y = baseY - Math.abs(Math.sin(x * 0.013 + seed) * amp)
      - Math.sin(x * 0.031 + seed * 2.7) * amp * 0.34
      - Math.sin(x * 0.007 + seed) * amp * 0.6;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W + 10, baseY + 60);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  if (rim) {
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    for (let x = -10; x <= W + 10; x += 8) {
      const y = baseY - Math.abs(Math.sin(x * 0.013 + seed) * amp)
        - Math.sin(x * 0.031 + seed * 2.7) * amp * 0.34
        - Math.sin(x * 0.007 + seed) * amp * 0.6;
      x === -10 ? ctx.moveTo(x, y + 1.6) : ctx.lineTo(x, y + 1.6);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// ── giant mushrooms / flowers for scale ─────────────────────
function mushroom(ctx, x, y, h, w, capCol, stemCol) {
  ctx.save();
  // stem
  const sg = ctx.createLinearGradient(x - w * 0.22, 0, x + w * 0.22, 0);
  sg.addColorStop(0, stemCol[1]);
  sg.addColorStop(0.55, stemCol[3]);
  sg.addColorStop(1, stemCol[1]);
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.14, y);
  ctx.quadraticCurveTo(x - w * 0.09, y - h * 0.5, x - w * 0.12, y - h * 0.72);
  ctx.lineTo(x + w * 0.13, y - h * 0.72);
  ctx.quadraticCurveTo(x + w * 0.10, y - h * 0.45, x + w * 0.16, y);
  ctx.closePath();
  ctx.fill();

  // gills under the cap
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = capCol[1];
  ctx.beginPath();
  ctx.ellipse(x, y - h * 0.72, w * 0.44, 2.2, 0, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  // domed cap
  const cg = ctx.createLinearGradient(x, y - h * 1.18, x, y - h * 0.68);
  cg.addColorStop(0, capCol[6]);
  cg.addColorStop(0.4, capCol[4]);
  cg.addColorStop(1, capCol[2]);
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.5, y - h * 0.7);
  ctx.bezierCurveTo(x - w * 0.46, y - h * 1.16, x - w * 0.16, y - h * 1.24, x, y - h * 1.23);
  ctx.bezierCurveTo(x + w * 0.18, y - h * 1.22, x + w * 0.46, y - h * 1.13, x + w * 0.5, y - h * 0.7);
  ctx.quadraticCurveTo(x, y - h * 0.62, x - w * 0.5, y - h * 0.7);
  ctx.closePath();
  ctx.fill();
  // rim light
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = capCol[5];
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - w * 0.44, y - h * 0.9);
  ctx.quadraticCurveTo(x - w * 0.1, y - h * 1.16, x + w * 0.34, y - h * 0.98);
  ctx.stroke();
  // spots
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = capCol[6];
  for (let i = 0; i < 5; i++) {
    const u = (hash(i * 7.3 + x) - 0.5) * 0.8;
    const v = hash(i * 3.9 + y) * 0.3;
    ctx.beginPath();
    ctx.ellipse(x + u * w * 0.6, y - h * (1.12 - v), 1.2 + hash(i) * 1.5, 0.9, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── floating island ─────────────────────────────────────────
function island(ctx, x, y, w, t, tiltDeg = 0, seed = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((tiltDeg * Math.PI) / 180);
  const pts = [];
  const N = 9;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const px = (u - 0.5) * w * (1 - Math.pow(Math.abs(u - 0.5) * 2, 2) * 0.34)
      + (hash(seed + i * 9.7) - 0.5) * 3.2;
    const depth = w * (0.62 + hash(seed + i * 2.7) * 0.26) * Math.sin(u * Math.PI) ** 0.62;
    pts.push([px, depth]);
  }

  // rock mass, jagged bottom
  ctx.beginPath();
  ctx.moveTo(-w * 0.52, -1);
  ctx.lineTo(w * 0.52, -1);
  for (let i = N; i >= 0; i--) {
    const [px, depth] = pts[i];
    const jitter = i % 2 ? 1 : -1;
    ctx.lineTo(px + jitter * hash(seed + i * 5.1) * 2.2, depth * (0.82 + hash(seed + i) * 0.3));
  }
  ctx.closePath();
  const rg = ctx.createLinearGradient(0, 0, 0, w * 0.9);
  rg.addColorStop(0, STONE[3]);
  rg.addColorStop(0.38, STONE[2]);
  rg.addColorStop(1, STONE[0]);
  ctx.fillStyle = rg;
  ctx.fill();

  // strata + cracks inside the rock
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-w * 0.52, -1);
  ctx.lineTo(w * 0.52, -1);
  for (let i = N; i >= 0; i--) {
    const [px, depth] = pts[i];
    ctx.lineTo(px, depth);
  }
  ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = STONE[1];
  for (let i = 0; i < 3; i++) {
    const yy = w * (0.1 + i * 0.13);
    ctx.lineWidth = 1.2 + i * 0.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.6, yy);
    ctx.quadraticCurveTo(-w * 0.1, yy + 3.2, w * 0.6, yy - 1.4);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = STONE[0];
  for (let i = 0; i < 4; i++) {
    const xx = (hash(seed + i * 3.3) - 0.5) * w * 0.8;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xx, 2);
    ctx.quadraticCurveTo(xx + 2.4, w * 0.12, xx - 1.6, w * 0.22);
    ctx.stroke();
  }
  ctx.restore();

  // grass shelf with an overhanging lip
  ctx.beginPath();
  ctx.moveTo(-w * 0.54, 1.5);
  ctx.quadraticCurveTo(-w * 0.26, -6.6, 0, -6.2);
  ctx.quadraticCurveTo(w * 0.28, -6.8, w * 0.54, 1.2);
  ctx.quadraticCurveTo(w * 0.24, 3.4, 0, 3.2);
  ctx.quadraticCurveTo(-w * 0.26, 3.4, -w * 0.54, 1.5);
  ctx.closePath();
  const gg = ctx.createLinearGradient(0, -8, 0, 5);
  gg.addColorStop(0, GRASS[5]);
  gg.addColorStop(0.45, GRASS[4]);
  gg.addColorStop(0.85, LEAF[2]);
  gg.addColorStop(1, LEAF[0]);
  ctx.fillStyle = gg;
  ctx.fill();

  // drips of moss hanging off the lip
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 7; i++) {
    const u = -0.46 + (i / 6) * 0.92;
    const dx = u * w;
    const len = 2.5 + hash(seed + i * 6.1) * 7;
    ctx.fillStyle = i % 3 ? LEAF[1] : LEAF[2];
    ctx.beginPath();
    ctx.ellipse(dx, 2.2 + len * 0.4, 1.5 + hash(i) * 1.2, len * 0.55, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // grass blades
  ctx.save();
  ctx.strokeStyle = GRASS[5];
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const bx = (-0.46 + (i / 11) * 0.92) * w;
    const hgt = 3.0 + hash(i * 3.7 + seed) * 6.4;
    const sway = Math.sin(t * 1.2 + i * 0.7 + seed) * 1.5;
    ctx.lineWidth = 1.15;
    ctx.strokeStyle = i % 3 ? GRASS[5] : GRASS[4];
    ctx.beginPath();
    ctx.moveTo(bx, -4.6);
    ctx.quadraticCurveTo(bx + sway * 0.5, -4.6 - hgt * 0.6, bx + sway, -4.6 - hgt);
    ctx.stroke();
  }
  ctx.restore();

  // hanging roots
  ctx.globalAlpha = 0.55;
  for (let i = 0; i < 3; i++) {
    const rx = (-0.22 + i * 0.22) * w;
    ctx.strokeStyle = i % 2 ? STONE[1] : LEAF[0];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx, w * 0.16);
    ctx.quadraticCurveTo(rx + 3, w * 0.3, rx - 1.5, w * 0.46 + hash(i) * 6);
    ctx.stroke();
    // a leaf on the vine
    ctx.fillStyle = LEAF[1];
    ctx.beginPath();
    ctx.ellipse(rx - 1.2, w * 0.42 + hash(i) * 6, 2.4, 1.3, 0.5, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── main ────────────────────────────────────────────────────
export function drawBeeWorld(ctx, W, H, t, { groundY = 222, timeScale = 1 } = {}) {
  const T = t * timeScale;
  drawSky(ctx, W, H, T);

  // far ridges
  ridge(ctx, W, H * 0.60, 26, 1.7, HILL[1], null);
  ridge(ctx, W, H * 0.68, 20, 4.1, HILL[2], null);

  // mid hills
  ridge(ctx, W, H * 0.76, 14, 7.3, HILL[3], null);

  // horizon mushrooms, small and pale
  mushroom(ctx, 44, groundY - 30, 26, 22, LEAF, HILL);
  mushroom(ctx, W - 62, groundY - 34, 34, 26, LEAF, HILL);
  mushroom(ctx, W * 0.42, groundY - 22, 18, 16, LEAF, HILL);

  // light shafts from the moon
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const x = W * 0.62 + i * 34;
    const sg = ctx.createLinearGradient(x, 0, x - 70, H * 0.86);
    sg.addColorStop(0, 'rgba(255,238,196,0.055)');
    sg.addColorStop(0.45, 'rgba(255,228,170,0.028)');
    sg.addColorStop(1, 'rgba(255,225,160,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(x - 6, 0);
    ctx.lineTo(x + 22, 0);
    ctx.lineTo(x - 104, H * 0.92);
    ctx.lineTo(x - 152, H * 0.92);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // floating platforms
  island(ctx, 82, groundY - 96, 54, T, -3, 2.1);
  island(ctx, 366, groundY - 132, 42, T, 2.4, 5.7);
  island(ctx, 232, groundY - 170, 30, T, -1.2, 8.3);

  // ground shelf
  const gh = H - groundY;
  const soil = ctx.createLinearGradient(0, groundY, 0, H);
  soil.addColorStop(0, STONE[4]);
  soil.addColorStop(0.22, STONE[3]);
  soil.addColorStop(0.62, STONE[2]);
  soil.addColorStop(1, STONE[1]);
  ctx.fillStyle = soil;
  ctx.fillRect(0, groundY, W, gh);

  // strata
  ctx.save();
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 4; i++) {
    const yy = groundY + 12 + i * 15;
    ctx.strokeStyle = i % 2 ? STONE[1] : STONE[5];
    ctx.lineWidth = 1 + (i === 1 ? 1 : 0);
    ctx.beginPath();
    ctx.moveTo(-4, yy + Math.sin(i) * 2);
    for (let x = 0; x <= W; x += 24) {
      ctx.lineTo(x, yy + Math.sin(x * 0.011 + i * 1.7) * 4.4);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // mossy top
  const moss = ctx.createLinearGradient(0, groundY - 7, 0, groundY + 9);
  moss.addColorStop(0, GRASS[5]);
  moss.addColorStop(0.35, GRASS[4]);
  moss.addColorStop(0.8, GRASS[2]);
  moss.addColorStop(1, GRASS[1]);
  ctx.beginPath();
  ctx.moveTo(-4, groundY + 9);
  for (let x = -4; x <= W + 4; x += 6) {
    const y = groundY - 1.5 + Math.sin(x * 0.07) * 1.1 + Math.sin(x * 0.021 + 1.4) * 1.6;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W + 4, groundY + 11);
  ctx.closePath();
  ctx.fillStyle = moss;
  ctx.fill();

  // soil speckle + pebbles
  for (let i = 0; i < 240; i++) {
    const x = hash2(i * 1.7, 3) * W;
    const y = groundY + 8 + hash2(i * 3.1, 9) * (gh - 8);
    ctx.globalAlpha = 0.14 + hash(i * 5.3) * 0.2;
    ctx.fillStyle = hash(i * 7.7) > 0.5 ? STONE[4] : STONE[0];
    const s = 1 + hash(i * 9.1) * 1.6;
    ctx.fillRect(x, y, s, s);
  }
  ctx.globalAlpha = 1;

  // grass clumps on the shelf — irregular tufts, not a hedge
  ctx.save();
  ctx.lineCap = 'round';
  for (let c = 0; c < 20; c++) {
    const cx = hash(c * 3.9 + 0.7) * W;
    const n = 3 + Math.floor(hash(c * 5.3) * 4);
    const baseH = 4 + hash(c * 7.1) * 9;
    const tone = [GRASS[5], GRASS[4], GRASS[3], LEAF[3]][c % 4];
    for (let i = 0; i < n; i++) {
      const spread = (i / (n - 1) - 0.5) * 9;
      const hgt = baseH * (0.55 + hash(c * 11.3 + i) * 0.75);
      const sway = Math.sin(T * 1.25 + c * 0.6 + i * 0.4) * (1.2 + hgt * 0.14);
      ctx.strokeStyle = i === 0 ? GRASS[3] : tone;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.moveTo(cx + spread * 0.4, groundY + 1.0);
      ctx.quadraticCurveTo(cx + spread + sway * 0.4, groundY - hgt * 0.6, cx + spread + sway, groundY - hgt);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // small stones + clover on the shelf
  for (let i = 0; i < 12; i++) {
    const x = hash(i * 4.3 + 2) * W;
    const y = groundY + 4 + hash(i * 8.9) * 8;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = i % 3 ? STONE[3] : STONE[4];
    ctx.beginPath();
    ctx.ellipse(x, y, 1.6 + hash(i) * 2.4, 1.2 + hash(i * 2) * 1.6, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // foreground foliage: big, dark, out of focus — frames the shot
  ctx.save();
  const leafAt = (x, y, len, wob, tone, flip) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(wob + (flip ? Math.PI : 0));
    ctx.fillStyle = tone;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.25, -len * 0.42, len * 0.72, -len * 0.5, len, -len * 0.06);
    ctx.bezierCurveTo(len * 0.68, len * 0.3, len * 0.24, len * 0.24, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = LEAF[3];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(len * 0.06, -len * 0.02);
    ctx.quadraticCurveTo(len * 0.5, -len * 0.16, len * 0.94, -len * 0.06);
    ctx.stroke();
    ctx.restore();
  };
  const sway = Math.sin(T * 0.8) * 2.2;
  leafAt(-14, H - 26, 84 + sway, -0.5, LEAF[0], false);
  leafAt(-6, H - 4, 104 + sway, -0.16, LEAF[1], false);
  leafAt(16, H + 12, 70, -0.9, LEAF[0], false);
  leafAt(W + 12, H - 30, 78 - sway, -2.6, LEAF[0], false);
  leafAt(W + 4, H - 6, 96 - sway, -3.0, LEAF[1], false);
  leafAt(W - 22, H + 14, 64, -2.3, LEAF[0], false);
  // a couple of grass tufts breaking the bottom frame
  for (let i = 0; i < 9; i++) {
    const x = hash(i * 4.7 + 3) * W;
    const hgt = 12 + hash(i * 6.3) * 26;
    const sw2 = Math.sin(T * 1.05 + i) * 3.2;
    ctx.strokeStyle = i % 2 ? LEAF[1] : LEAF[2];
    ctx.lineWidth = 2.0 + hash(i) * 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, H + 4);
    ctx.quadraticCurveTo(x + sw2 * 0.5, H - hgt * 0.6, x + sw2, H - hgt);
    ctx.stroke();
  }
  ctx.restore();

  // unified grade: cool shadow at the edges
  const vg = ctx.createRadialGradient(W * 0.46, H * 0.44, H * 0.28, W * 0.5, H * 0.5, H * 0.95);
  vg.addColorStop(0, 'rgba(20,14,38,0)');
  vg.addColorStop(1, 'rgba(16,10,32,0.55)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // pollen / fireflies
  for (let i = 0; i < 26; i++) {
    const baseX = hash(i * 2.9 + 1) * W;
    const speed = 4 + hash(i * 5.1) * 10;
    const y = H * 0.95 - ((T * speed + hash(i * 7.7) * H * 1.4) % (H * 1.1));
    const x = baseX + Math.sin(T * 0.9 + i * 1.7) * 12;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(T * 2.2 + i));
    const r = i % 5 === 0 ? 2.2 : 1.1;
    ctx.globalAlpha = 0.35 + tw * 0.55;
    ctx.fillStyle = i % 5 === 0 ? GLOW[4] : GLOW[3];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    if (i % 5 === 0) {
      ctx.globalAlpha = 0.18 * tw;
      ctx.beginPath();
      ctx.arc(x, y, r * 3.4, 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
