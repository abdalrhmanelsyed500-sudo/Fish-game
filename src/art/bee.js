// ─────────────────────────────────────────────────────────────
//  BEE — a tall, mournful bee-person in a honey costume.
//  Side / three-quarter view for a platformer, drawn in a
//  design space where the feet sit at (0,0) and the crown at
//  y = -150 (antennae reach -176).  Everything is filled with
//  smooth gradients and then palette-quantised, so the result
//  reads as hand-placed pixels.
//
//  IMPORTANT (art direction): there are NO black outlines.
//  Silhouettes are defined by value + temperature only:
//  a warm honey shadow on the inside, a cool lilac rim on the
//  back edge.  Nothing darker than the stripe ramp is used on
//  a border.
// ─────────────────────────────────────────────────────────────

import { B } from './beePalette.js';

const HONEY = B.honey;
const STRIPE = B.stripe;
const WING = B.wing;
const SKIN = B.skin;
const LIMB = B.limb;
const GOLD = B.gold;
const RIM = B.rim;

const TAU = Math.PI * 2;
const D = Math.PI / 180;

// ── deterministic noise (same speckle every frame) ──────────
function hash(n) {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// ── tiny path helpers ──────────────────────────────────────
const ell = (ctx, x, y, rx, ry, rot = 0) => {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.2, rx), Math.max(0.2, ry), rot, 0, TAU);
};

function fillRamp(ctx, ramp, stops, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [p, i] of stops) g.addColorStop(p, ramp[i] ?? ramp[ramp.length - 1]);
  ctx.fillStyle = g;
  ctx.fill();
}

/** tapered capsule path (limb) */
function taper(ctx, x1, y1, x2, y2, r1, r2) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.arc(x1, y1, Math.max(0.3, r1), a + Math.PI / 2, a + Math.PI * 1.5, false);
  ctx.arc(x2, y2, Math.max(0.3, r2), a - Math.PI / 2, a + Math.PI / 2, false);
  ctx.closePath();
}

/** draw a limb with volume: cross-axis gradient + lit streak */
function limb(ctx, x1, y1, x2, y2, r1, r2, ramp, { base = 0.62, spread = 0.42, lit = true, shade = 1 } = {}) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const rm = Math.max(r1, r2);
  const a = Math.max(0, base - spread) * shade;
  const b = Math.min(1, base + spread) * shade;
  const g = ctx.createLinearGradient(
    (x1 + x2) / 2 + nx * rm, (y1 + y2) / 2 + ny * rm,
    (x1 + x2) / 2 - nx * rm, (y1 + y2) / 2 - ny * rm,
  );
  const pick = (f) => ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(f * (ramp.length - 1))))];
  g.addColorStop(0, pick(a));
  g.addColorStop(0.42, pick((a + b) / 2 + 0.06));
  g.addColorStop(1, pick(b));
  taper(ctx, x1, y1, x2, y2, r1, r2);
  ctx.fillStyle = g;
  ctx.fill();

  if (lit) {
    // specular sheen on the lit edge
    const s = 0.55;
    const mx1 = x1 + nx * r1 * s, my1 = y1 + ny * r1 * s;
    const mx2 = x2 + nx * r2 * s, my2 = y2 + ny * r2 * s;
    ctx.save();
    ctx.globalAlpha = 0.5;
    taper(ctx, mx1, my1, mx2, my2, Math.max(0.6, r1 * 0.3), Math.max(0.5, r2 * 0.3));
    ctx.fillStyle = pick(Math.min(1, b + 0.18));
    ctx.fill();
    ctx.restore();
  }
}

// ═══════════════════════════════════════════════════════════
//  WINGS
// ═══════════════════════════════════════════════════════════

function wingPath(ctx, rx, ry, len, wid, ang, curl = 1) {
  const tx = rx + Math.cos(ang) * len;
  const ty = ry + Math.sin(ang) * len;
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  const w = wid * 0.5;
  const b1x = rx + Math.cos(ang) * len * 0.36, b1y = ry + Math.sin(ang) * len * 0.36;
  const b2x = rx + Math.cos(ang) * len * 0.76, b2y = ry + Math.sin(ang) * len * 0.76;
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  // leading edge — full bulge
  ctx.bezierCurveTo(
    b1x + nx * w * 1.02 * curl, b1y + ny * w * 1.02 * curl,
    b2x + nx * w * 0.94, b2y + ny * w * 0.94,
    tx, ty,
  );
  // trailing edge — slightly less, rounded tip
  ctx.bezierCurveTo(
    b2x - nx * w * 0.82, b2y - ny * w * 0.82,
    b1x - nx * w * 0.66, b1y - ny * w * 0.66,
    rx, ry,
  );
  ctx.closePath();
}

function drawWing(ctx, opts) {
  const {
    rx, ry, len, wid, ang, seed, ghost = 0, near = true,
  } = opts;
  const alpha = near ? 1 : 0.94;
  ctx.save();
  ctx.globalAlpha = alpha;

  // soft motion ghosts (fast flap)
  if (ghost > 0.02) {
    ctx.save();
    ctx.globalAlpha = 0.26 * ghost;
    wingPath(ctx, rx, ry, len, wid, ang + 0.20 * ghost);
    ctx.fillStyle = WING[3];
    ctx.fill();
    ctx.globalAlpha = 0.18 * ghost;
    wingPath(ctx, rx, ry, len, wid, ang - 0.26 * ghost);
    ctx.fill();
    ctx.restore();
  }

  // membrane
  wingPath(ctx, rx, ry, len, wid, ang);
  const cx = rx + Math.cos(ang) * len * 0.5;
  const cy = ry + Math.sin(ang) * len * 0.5;
  const g = ctx.createLinearGradient(
    cx + Math.cos(ang + 1.4) * wid * 0.6, cy + Math.sin(ang + 1.4) * wid * 0.6,
    cx - Math.cos(ang + 1.4) * wid * 0.6, cy - Math.sin(ang + 1.4) * wid * 0.6,
  );
  const lift = near ? -0.4 : -1.6;
  g.addColorStop(0, WING[Math.round(5.2 + lift)]);
  g.addColorStop(0.3, WING[Math.round(6.6 + lift)]);
  g.addColorStop(0.66, WING[Math.round(4.2 + lift)]);
  g.addColorStop(1, WING[Math.round(2.2 + lift)]);
  ctx.fillStyle = g;
  ctx.fill();

  // membrane stipple — the fuzzy, grainy look of the reference
  ctx.save();
  wingPath(ctx, rx, ry, len, wid, ang);
  ctx.clip();
  const dots = Math.round(len * wid * 0.22);
  for (let i = 0; i < dots; i++) {
    const u = hash(seed + i * 1.7);
    const v = hash(seed + i * 3.3 + 11);
    const px = rx + Math.cos(ang) * len * u + (-Math.sin(ang)) * wid * (v - 0.5) * 1.7;
    const py = ry + Math.sin(ang) * len * u + Math.cos(ang) * wid * (v - 0.5) * 1.7;
    const t = hash(seed + i * 5.1 + 3);
    ctx.fillStyle = t > 0.55 ? WING[near ? 8 : 5] : WING[near ? 2 : 1];
    ctx.globalAlpha = 0.2 + t * 0.35;
    const s = 0.8 + hash(seed + i * 7.9) * 1.7;
    ctx.fillRect(px, py, s, s);
  }
  ctx.restore();

  // veins — thin, slightly darker, no outline
  ctx.save();
  wingPath(ctx, rx, ry, len, wid, ang);
  ctx.clip();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = WING[near ? 4 : 2];
  for (let v = 0; v < 4; v++) {
    const spread = (v / 3 - 0.5) * wid * 0.52;
    const ex = rx + Math.cos(ang) * len * (0.74 + hash(seed + v) * 0.2);
    const ey = ry + Math.sin(ang) * len * (0.74 + hash(seed + v) * 0.2);
    ctx.lineWidth = v === 0 ? 1.5 : 0.9;
    ctx.beginPath();
    ctx.moveTo(rx + Math.cos(ang) * len * 0.14, ry + Math.sin(ang) * len * 0.14);
    ctx.quadraticCurveTo(
      rx + Math.cos(ang) * len * 0.5 - Math.sin(ang) * spread * 0.7,
      ry + Math.sin(ang) * len * 0.5 + Math.cos(ang) * spread * 0.7,
      ex - Math.sin(ang) * spread * 0.3, ey + Math.cos(ang) * spread * 0.3,
    );
    ctx.stroke();
  }
  ctx.restore();

  // fuzzy, two-step soft edge along the leading curve (kills any hard border)
  ctx.save();
  wingPath(ctx, rx, ry, len, wid, ang);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = WING[near ? 8 : 6];
  ctx.globalAlpha = 0.45;
  ctx.stroke();
  ctx.restore();

  // shoulder tuft (hides the root joint)
  ell(ctx, rx, ry, 3.4, 3.0, ang);
  ctx.fillStyle = HONEY[2];
  ctx.fill();
  ell(ctx, rx - 0.5, ry - 0.5, 1.9, 1.6, ang);
  ctx.fillStyle = HONEY[4];
  ctx.fill();

  ctx.restore();
}

function drawWings(ctx, p) {
  const spread = p.wingSpread ?? 0;
  const flap = p.wingFlap ?? 0;
  const ghost = Math.min(1, Math.abs(p.wingSpeed ?? 0) / 9);

  // far wing — angled down/back so the pair reads as depth
  drawWing(ctx, {
    rx: -13.5, ry: -94,
    len: 70 + spread * 54,
    wid: 33 + spread * 16,
    ang: (-126 + spread * -4 + flap * 0.5 + Math.sin(p.wingPhase ?? 0) * 0.06) * D,
    seed: 7.3,
    ghost,
    near: false,
  });

  // near wing — the hero wing
  drawWing(ctx, {
    rx: -11, ry: -98,
    len: 78 + spread * 60,
    wid: 38 + spread * 18,
    ang: (-150 + spread * -12 + flap + Math.sin(p.wingPhase ?? 0) * 0.08) * D,
    seed: 3.1,
    ghost,
    near: true,
  });
}

// ═══════════════════════════════════════════════════════════
//  LEGS
// ═══════════════════════════════════════════════════════════

function drawLeg(ctx, p, side) {
  const far = side === 'far';
  const rot = far ? (p.legFarRot ?? 0) : (p.legNearRot ?? 0);
  const knee = far ? (p.kneeFar ?? 0) : (p.kneeNear ?? 0);
  const footA = far ? (p.footFar ?? 0) : (p.footNear ?? 0);
  const hipX = far ? -6.0 : 4.2;
  const hipY = -58;
  const L1 = 27, L2 = 25;
  const shade = far ? 0.74 : 1;

  const a1 = rot * D;
  const kx = hipX + Math.sin(a1) * L1;
  const ky = hipY + Math.cos(a1) * L1;
  const a2 = (rot + knee) * D;
  const ax = kx + Math.sin(a2) * L2;
  const ay = ky + Math.cos(a2) * L2;

  ctx.save();
  if (far) ctx.globalAlpha = 0.95;

  // thigh + shin
  limb(ctx, hipX, hipY, kx, ky, 4.1, 3.1, LIMB, { base: 0.6, spread: 0.4, shade });
  limb(ctx, kx, ky - 0.4, ax, ay, 3.0, 2.1, LIMB, { base: 0.56, spread: 0.4, shade });

  // knee / ankle joints — soft, no line
  ctx.save();
  ctx.globalAlpha = 0.55;
  ell(ctx, kx, ky, 3.2, 2.6, a1);
  ctx.fillStyle = LIMB[far ? 2 : 4];
  ctx.fill();
  ctx.globalAlpha = 0.4;
  ell(ctx, ax, ay, 2.2, 1.9);
  ctx.fillStyle = LIMB[far ? 1 : 3];
  ctx.fill();
  ctx.restore();
  // knee highlight
  if (!far) {
    ctx.globalAlpha = 0.5;
    ell(ctx, kx + 1.2, ky - 0.9, 1.0, 1.3, a1);
    ctx.fillStyle = LIMB[6];
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // foot: a small rounded wedge pointing forward
  const fa = (a2 + footA * D) * 1;
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(fa * 0.35);
  const fx = Math.cos(fa) * 5.4;
  const fy = Math.sin(fa) * 5.4;
  const g = ctx.createLinearGradient(0, -3, 0, 3);
  g.addColorStop(0, LIMB[Math.round((far ? 4 : 6) * shade)]);
  g.addColorStop(0.55, LIMB[Math.round((far ? 3 : 5) * shade)]);
  g.addColorStop(1, LIMB[Math.round((far ? 1 : 2.6) * shade)]);
  ctx.beginPath();
  ctx.moveTo(-3.8, -2.4);
  ctx.quadraticCurveTo(fx * 1.2, fy - 3.8, fx * 1.5 + 1.4, fy + 0.4);
  ctx.quadraticCurveTo(fx * 1.32, fy + 3.0, 0, 3.0);
  ctx.quadraticCurveTo(-4.6, 2.6, -3.8, -2.4);
  ctx.closePath();
  ctx.fillStyle = g;
  ctx.fill();
  // toe crease
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = LIMB[far ? 1 : 2];
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(fx * 0.55, fy - 1.2);
  ctx.quadraticCurveTo(fx * 0.85, fy + 0.6, fx * 0.62, fy + 2.1);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
//  ARMS
// ═══════════════════════════════════════════════════════════

function drawArm(ctx, p, side) {
  const far = side === 'far';
  const shoulderRot = far ? (p.armFarRot ?? 0) : (p.armNearRot ?? 0);
  const elbowRot = far ? (p.elbowFar ?? 0) : (p.elbowNear ?? 0);
  const handRot = far ? (p.handFarRot ?? 0) : (p.handNearRot ?? 0);
  const sx = far ? -8.0 : 15.5;
  const sy = -94;
  const L1 = 20, L2 = 19;
  const shade = far ? 0.72 : 1;

  const a1 = (shoulderRot + (far ? 8 : 13)) * D;
  const ex = sx + Math.sin(a1) * L1;
  const ey = sy + Math.cos(a1) * L1;
  const a2 = (shoulderRot + elbowRot + 6) * D;
  const hx = ex + Math.sin(a2) * L2;
  const hy = ey + Math.cos(a2) * L2;

  ctx.save();
  if (far) ctx.globalAlpha = 0.94;

  // shoulder cap
  ell(ctx, sx, sy, 5.8, 5.6, a1);
  ctx.fillStyle = HONEY[far ? 2 : 4];
  ctx.fill();

  // contact shadow on the body, so the sleeve reads in front of the abdomen
  if (!far) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = HONEY[0];
    ctx.lineWidth = 9.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx - 1.0, sy + 1.4);
    ctx.quadraticCurveTo(ex - 0.7, ey + 1.2, hx - 0.5, hy + 1.2);
    ctx.stroke();
    ctx.restore();
  }

  // sleeve: wide at the shoulder, gathered at the cuff
  limb(ctx, sx, sy, ex, ey, 5.2, 3.6, HONEY, { base: 0.64, spread: 0.38, shade });
  limb(ctx, ex, ey, hx, hy, 3.2, 2.5, HONEY, { base: 0.58, spread: 0.4, shade });

  // cuff band (a fold of fabric, not an outline)
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(a2);
  ctx.beginPath();
  ctx.ellipse(0, -1.0, 2.7, 1.4, 0, 0, TAU);
  ctx.fillStyle = HONEY[far ? 2 : 4];
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -1.8, 2.4, 0.95, 0, 0, TAU);
  ctx.fillStyle = HONEY[far ? 4 : 7];
  ctx.globalAlpha = 0.55;
  ctx.fill();
  ctx.restore();

  // soft elbow wrinkle
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = HONEY[far ? 1 : 2];
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(ex, ey, 3.4, a2 - 1.1, a2 + 1.3);
  ctx.stroke();
  ctx.restore();

  // hand — small, three stubby fingers, sage grey like the reference
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(a2 + handRot * D);
  const hg = ctx.createLinearGradient(-3, -4, 3, 4);
  hg.addColorStop(0, SKIN[Math.round(8.4 * shade)]);
  hg.addColorStop(0.55, SKIN[Math.round(6.4 * shade)]);
  hg.addColorStop(1, SKIN[Math.round(4 * shade)]);
  ctx.beginPath();
  ctx.ellipse(0, 1.3, 3.2, 4.0, 0, 0, TAU);
  ctx.fillStyle = hg;
  ctx.fill();
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 1.9, 4.6 + Math.abs(i) * 0.4, 1.1, 2.0, i * 0.16, 0, TAU);
    ctx.fillStyle = SKIN[Math.round((i === 0 ? 6 : 5) * shade)];
    ctx.fill();
  }
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = SKIN[Math.round(2 * shade)];
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-2.4, 3.4);
  ctx.quadraticCurveTo(0, 4.6, 2.2, 3.4);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
//  BODY
// ═══════════════════════════════════════════════════════════

function abdomenPath(ctx, p) {
  const sq = p.abdomenSquash ?? 1;
  const st = p.abdomenStretch ?? 1;
  ctx.save();
  ctx.translate(0, -50);
  ctx.rotate((p.abdomenRot ?? 0) * D);
  ctx.scale(1 / st, st);
  ctx.translate(0, 50);
  ctx.beginPath();
  // top (waist) → front belly → bottom → stinger → back
  ctx.moveTo(-16, -104);
  ctx.bezierCurveTo(-24, -96, -27, -84, -26.5, -72);
  ctx.bezierCurveTo(-26, -60, -23.5, -52.5, -18, -47.5);
  ctx.bezierCurveTo(-13, -43.5, -8, -42.5, -5.2, -44.2); // stinger root
  ctx.lineTo(-8.4, -47.2);
  ctx.bezierCurveTo(2, -48.5, 12, -50.5, 17.5, -56);
  ctx.bezierCurveTo(23, -62, 23.5, -76, 21.5, -87);
  ctx.bezierCurveTo(20, -95, 17.5, -101, 14, -104);
  ctx.closePath();
  ctx.restore();
}

function drawAbdomen(ctx, p) {
  const sq = p.abdomenSquash ?? 1;
  ctx.save();

  // silhouette shadow just under the waist (no outline, just value)
  abdomenPath(ctx, p);
  fillRamp(ctx, HONEY, [[0, 3], [0.45, 5], [1, 2]], -26, -104, 22, -44);

  // clip everything else to the abdomen
  ctx.save();
  abdomenPath(ctx, p);
  ctx.clip();

  // volume: cool back edge, warm front
  const g = ctx.createLinearGradient(-26, -80, 23, -80);
  g.addColorStop(0, HONEY[2]);
  g.addColorStop(0.22, HONEY[3]);
  g.addColorStop(0.55, HONEY[5]);
  g.addColorStop(0.82, HONEY[6]);
  g.addColorStop(1, HONEY[4]);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = g;
  ctx.fillRect(-30, -108, 56, 70);
  ctx.restore();

  // ── stripes ───────────────────────────────────────────────
  ctx.save();
  abdomenPath(ctx, p);
  ctx.clip();
  const bands = 6;
  for (let i = 0; i < bands; i++) {
    const t = i / bands;
    const y = -99.5 + i * 8.6;
    const depth = 1 - Math.pow(Math.abs(t - 0.52) * 1.7, 2); // wider in the middle
    const sag = 1.6 + depth * 2.2;
    // dark band body
    ctx.beginPath();
    ctx.moveTo(-30, y);
    ctx.quadraticCurveTo(0, y + sag, 30, y - 0.6);
    ctx.lineTo(30, y + 4.4 + sag * 0.55);
    ctx.quadraticCurveTo(0, y + sag + 5.1, -30, y + 5.2);
    ctx.closePath();
    const bg = ctx.createLinearGradient(-26, 0, 26, 0);
    bg.addColorStop(0, STRIPE[1]);
    bg.addColorStop(0.42, STRIPE[2]);
    bg.addColorStop(0.78, STRIPE[3]);
    bg.addColorStop(1, STRIPE[1]);
    ctx.fillStyle = bg;
    ctx.fill();
    // lit lip on the top of each band (reads as a rounded chitin ridge)
    ctx.beginPath();
    ctx.moveTo(-30, y + 0.2);
    ctx.quadraticCurveTo(0, y + sag + 0.2, 30, y - 0.4);
    ctx.lineTo(30, y + 1.5);
    ctx.quadraticCurveTo(0, y + sag + 1.5, -30, y + 1.7);
    ctx.closePath();
    ctx.fillStyle = HONEY[7];
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    // thin shadow under the band
    ctx.beginPath();
    ctx.moveTo(-30, y + 4.9 + sag * 0.55);
    ctx.quadraticCurveTo(0, y + sag + 5.6, 30, y + 5.4);
    ctx.lineTo(30, y + 6.4);
    ctx.quadraticCurveTo(0, y + sag + 6.6, -30, y + 5.9);
    ctx.closePath();
    ctx.fillStyle = HONEY[1];
    ctx.globalAlpha = 0.45;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // stipple of chitin freckles on the yellow bands
  for (let i = 0; i < 90; i++) {
    const x = (hash(i * 2.3) - 0.5) * 48;
    const y = -102 + hash(i * 4.7) * 56;
    ctx.globalAlpha = 0.18 + hash(i * 8.1) * 0.16;
    ctx.fillStyle = hash(i * 9.4) > 0.5 ? HONEY[7] : HONEY[2];
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;

  // bottom bounce light — warm reflected from the floor
  const bl = ctx.createLinearGradient(0, -62, 0, -44);
  bl.addColorStop(0, 'rgba(0,0,0,0)');
  bl.addColorStop(1, B.dusk[4]);
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = bl;
  ctx.fillRect(-30, -62, 56, 20);
  ctx.globalAlpha = 1;

  ctx.restore();

  // cool rim along the spine
  ctx.save();
  abdomenPath(ctx, p);
  ctx.clip();
  ctx.globalAlpha = 0.30;
  ctx.strokeStyle = RIM[1];
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-15, -103);
  ctx.bezierCurveTo(-24, -94, -27.5, -82, -26, -70);
  ctx.bezierCurveTo(-25, -60, -22, -53, -17, -48.5);
  ctx.stroke();
  ctx.restore();

  // stinger — a real tapered cone with a warm edge, not a hairline
  ctx.save();
  const tipX = -19.5, tipY = -37.0;
  const sg2 = ctx.createLinearGradient(-8, -47, tipX, tipY);
  sg2.addColorStop(0, STRIPE[1]);
  sg2.addColorStop(0.55, STRIPE[2]);
  sg2.addColorStop(1, STRIPE[0]);
  ctx.beginPath();
  ctx.moveTo(-6.2, -48.2);
  ctx.quadraticCurveTo(-12.6, -46.4, tipX, tipY);
  ctx.quadraticCurveTo(-12.0, -41.0, -6.6, -43.6);
  ctx.quadraticCurveTo(-5.6, -46.0, -6.2, -48.2);
  ctx.closePath();
  ctx.fillStyle = sg2;
  ctx.fill();
  // warm highlight along the top of the cone
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = HONEY[3];
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-7.2, -47.6);
  ctx.quadraticCurveTo(-12.4, -45.8, -18.4, -38.0);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function torsoPath(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(-15, -99);
  ctx.bezierCurveTo(-19.6, -103, -21.4, -109, -20.6, -116);
  ctx.bezierCurveTo(-19.8, -125, -18.2, -134, -13.6, -141);
  ctx.bezierCurveTo(-9.2, -146.8, -3.4, -149.2, 2.4, -148.8);
  ctx.bezierCurveTo(9.4, -148.6, 16.0, -144.6, 19.2, -138.4);
  ctx.bezierCurveTo(22.2, -132.2, 22.4, -123.6, 21.2, -116.6);
  ctx.bezierCurveTo(20.4, -112, 20.0, -105.6, 16.8, -100.2);
  ctx.bezierCurveTo(11, -95.5, -8, -95.2, -15, -99);
  ctx.closePath();
}

function drawTorso(ctx, p) {
  ctx.save();

  torsoPath(ctx, p);
  fillRamp(ctx, HONEY, [[0, 2], [0.35, 4], [0.75, 6], [1, 5]], -22, -150, 24, -98);

  ctx.save();
  torsoPath(ctx, p);
  ctx.clip();

  // broad key light from the upper front
  const g = ctx.createRadialGradient(12, -140, 4, 4, -126, 44);
  g.addColorStop(0, HONEY[8]);
  g.addColorStop(0.45, HONEY[7]);
  g.addColorStop(0.8, HONEY[6]);
  g.addColorStop(1, HONEY[4]);
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = g;
  ctx.fillRect(-26, -154, 54, 60);
  ctx.globalAlpha = 1;

  // fabric folds — soft, curved, never outlined
  const folds = [
    { y: -101.5, w: 1.5, a: 0.34, curve: 3.2 },
    { y: -108, w: 1.1, a: 0.24, curve: -2.4 },
    { y: -120, w: 0.9, a: 0.18, curve: 2.0 },
    { y: -136.5, w: 0.8, a: 0.14, curve: -1.6 },
  ];
  for (const f of folds) {
    ctx.beginPath();
    ctx.moveTo(-21, f.y);
    ctx.quadraticCurveTo(1, f.y + f.curve, 20, f.y - 1);
    ctx.lineWidth = f.w;
    ctx.strokeStyle = HONEY[2];
    ctx.globalAlpha = f.a;
    ctx.stroke();
    ctx.globalAlpha = f.a * 0.7;
    ctx.translate(0, 0.9);
    ctx.strokeStyle = HONEY[7];
    ctx.stroke();
    ctx.translate(0, -0.9);
    ctx.globalAlpha = 1;
  }

  // side shadow where the arm meets the body
  const sg = ctx.createLinearGradient(-21, 0, -6, 0);
  sg.addColorStop(0, HONEY[3]);
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = sg;
  ctx.fillRect(-22, -112, 16, 15);
  ctx.globalAlpha = 1;

  // collar: one soft fold where the hood meets the shoulders
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = HONEY[2];
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-17, -103.5);
  ctx.quadraticCurveTo(1, -99.6, 18.0, -104.2);
  ctx.stroke();
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = HONEY[8];
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-16, -104.8);
  ctx.quadraticCurveTo(1, -100.9, 17.0, -105.4);
  ctx.stroke();
  ctx.restore();

  // waist seam
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = HONEY[1];
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-17, -101.5);
  ctx.quadraticCurveTo(0, -99, 17.5, -102);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // warm underside bounce
  const bl = ctx.createLinearGradient(0, -112, 0, -97);
  bl.addColorStop(0, 'rgba(0,0,0,0)');
  bl.addColorStop(1, B.dusk[5]);
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = bl;
  ctx.fillRect(-24, -112, 50, 16);
  ctx.globalAlpha = 1;

  ctx.restore();

  // cool rim on the back edge — this is what replaces an outline
  ctx.save();
  torsoPath(ctx, p);
  ctx.clip();
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = RIM[1];
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-15, -100);
  ctx.bezierCurveTo(-21, -105, -22.8, -112, -21.8, -119);
  ctx.bezierCurveTo(-20.8, -128, -18.6, -137.5, -13.6, -144.4);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
//  HEAD
// ═══════════════════════════════════════════════════════════

function drawAntennae(ctx, p, back) {
  const sway = p.antennaSway ?? 0;
  const spring = p.antennaSpring ?? 0;
  const baseX = back ? -4 : 5;
  const baseY = back ? -147.5 : -148.5;
  const bend = back ? -0.55 : 0.35;
  const len = back ? 27 : 29;
  const a = (bend * 30 + sway * 16 + spring * 22 + (back ? -4 : 3)) * D;

  const x1 = baseX + Math.sin(a) * len * 0.42;
  const y1 = baseY - len * 0.46;
  const x2 = x1 + Math.sin(a * 1.5) * len * 0.4;
  const y2 = y1 - len * 0.5;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = STRIPE[back ? 1 : 2];
  ctx.lineWidth = back ? 2.0 : 2.4;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.quadraticCurveTo(x1, y1, x2, y2);
  ctx.stroke();
  // lit edge of the stalk
  ctx.strokeStyle = STRIPE[back ? 2 : 4];
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(baseX + 0.9, baseY);
  ctx.quadraticCurveTo(x1 + 0.9, y1, x2 + 0.6, y2 + 0.4);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // gold bead
  const r = back ? 3.1 : 3.7;
  const bg = ctx.createRadialGradient(x2 + r * 0.35, y2 - r * 0.4, r * 0.15, x2, y2, r * 1.25);
  bg.addColorStop(0, GOLD[6]);
  bg.addColorStop(0.4, GOLD[5]);
  bg.addColorStop(0.75, GOLD[3]);
  bg.addColorStop(1, GOLD[1]);
  ctx.beginPath();
  ctx.arc(x2, y2, r, 0, TAU);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(x2 - r * 0.32, y2 - r * 0.35, r * 0.34, 0, TAU);
  ctx.fillStyle = GOLD[6];
  ctx.fill();
  ctx.restore();
}

function drawFace(ctx, p) {
  const open = p.eyeOpen ?? 1;
  const lookX = p.eyeLookX ?? 0.3;
  const lookY = p.eyeLookY ?? 0;
  const mouth = p.mouth ?? 0.12;
  const brow = p.brow ?? 0.35;

  const FX = 3.9, FY = -127.6, FRX = 18.2, FRY = 20.0, FROT = -6 * D;

  // ── face plate ────────────────────────────────────────────
  // Hood shadow: a crescent that hugs the top + back of the opening.
  ctx.save();
  ell(ctx, FX, FY, FRX, FRY, FROT);
  ctx.clip();
  const topShade = ctx.createLinearGradient(-4, -150, 8, -120);
  topShade.addColorStop(0, HONEY[1]);
  topShade.addColorStop(0.45, HONEY[2]);
  topShade.addColorStop(1, HONEY[4]);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = topShade;
  ctx.fillRect(-18, -152, 40, 34);
  ctx.globalAlpha = 1;
  ctx.restore();

  // skin
  ctx.save();
  ell(ctx, FX, FY, FRX, FRY, FROT);
  const fg = ctx.createLinearGradient(-8, -148, 18, -108);
  fg.addColorStop(0, SKIN[4]);
  fg.addColorStop(0.22, SKIN[6]);
  fg.addColorStop(0.55, SKIN[8]);
  fg.addColorStop(0.85, SKIN[9]);
  fg.addColorStop(1, SKIN[8]);
  ctx.fillStyle = fg;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ell(ctx, FX, FY, FRX, FRY, FROT);
  ctx.clip();

  // soft shadow cast by the hood rim onto the forehead
  const tg = ctx.createLinearGradient(0, -150, 0, -130);
  tg.addColorStop(0, SKIN[3]);
  tg.addColorStop(0.55, SKIN[5]);
  tg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = tg;
  ctx.fillRect(-16, -150, 40, 24);
  ctx.globalAlpha = 1;

  // cheekbone light (front / right)
  const cg = ctx.createRadialGradient(13.5, -125.5, 1, 13.5, -125.5, 10);
  cg.addColorStop(0, SKIN[9]);
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = cg;
  ctx.fillRect(3, -136, 20, 20);
  ctx.globalAlpha = 1;

  // ── eyes ──────────────────────────────────────────────────
  const eyes = [
    { x: -1.8, y: -131.4, rx: 5.9, ry: 6.8, far: true },
    { x: 11.6, y: -131.8, rx: 6.2, ry: 7.1, far: false },
  ];
  for (const e of eyes) {
    const far = e.far;
    const sh = far ? 0.9 : 1;

    // socket: a soft, warm shadow only — no ring
    const sg = ctx.createRadialGradient(e.x + 0.6, e.y + 1.2, 0.5, e.x, e.y, e.rx * 2.0);
    sg.addColorStop(0, SKIN[3]);
    sg.addColorStop(0.55, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = sg;
    ctx.fillRect(e.x - 12, e.y - 12, 24, 24);
    ctx.globalAlpha = 1;

    // sclera — warm bone, slightly darker than the lit cheek
    ell(ctx, e.x, e.y, e.rx, e.ry * open, 0);
    ctx.fillStyle = SKIN[Math.round(8.4 * sh)];
    ctx.fill();

    // inner shadow at the top of the eyeball
    ctx.save();
    ell(ctx, e.x, e.y, e.rx, e.ry * open, 0);
    ctx.clip();
    const eg = ctx.createLinearGradient(0, e.y - e.ry, 0, e.y + e.ry * 0.4);
    eg.addColorStop(0, SKIN[4]);
    eg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = eg;
    ctx.fillRect(e.x - 8, e.y - 8, 16, 10);
    ctx.globalAlpha = 1;
    ctx.restore();

    // iris + pupil
    const ix = e.x + lookX * 2.2;
    const iy = e.y + lookY * 1.6 + (1 - open) * 0.6 + 0.4;
    ell(ctx, ix, iy, 4.2, 4.5, 0);
    ctx.fillStyle = WING[2];
    ctx.fill();
    ell(ctx, ix + 0.1, iy + 0.3, 2.7, 2.9, 0);
    ctx.fillStyle = WING[1];
    ctx.fill();
    ell(ctx, ix + 0.2, iy + 0.5, 1.5, 1.6, 0);
    ctx.fillStyle = STRIPE[1];
    ctx.fill();
    // catchlight, upper left
    ctx.globalAlpha = 0.95;
    ell(ctx, ix - 1.35, iy - 1.55, 1.0, 1.1, 0);
    ctx.fillStyle = SKIN[9];
    ctx.fill();
    ctx.globalAlpha = 1;

    // heavy upper lid — the reference's tired, half-lidded stare
    const lid = 0.3 + (1 - open) * 0.55;
    ctx.save();
    ell(ctx, e.x, e.y, e.rx, e.ry * open, 0);
    ctx.clip();
    ctx.beginPath();
    ctx.ellipse(e.x, e.y - e.ry * open * (1 - lid), e.rx * 1.25, e.ry * open * lid, 0.02, 0, TAU);
    ctx.fillStyle = SKIN[Math.round(4.6 * sh)];
    ctx.fill();
    // lid crease
    ctx.strokeStyle = SKIN[Math.round(3.2 * sh)];
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(e.x, e.y - e.ry * open * (1 - lid) + 0.5, e.rx * 1.03, e.ry * open * lid, 0.02, Math.PI * 0.05, Math.PI * 0.95);
    ctx.stroke();
    ctx.restore();

    // lash line (skin-dark, NOT black)
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = SKIN[Math.round(1.9 * sh)];
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.ellipse(e.x, e.y, e.rx, e.ry * open, 0, Math.PI * 1.02, Math.PI * 1.98);
    ctx.stroke();

    // lower lash + under-eye bag
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(e.x + 0.2, e.y + 0.7, e.rx * 0.9, e.ry * open * 0.97, 0, Math.PI * 0.16, Math.PI * 0.84);
    ctx.stroke();
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(e.x + 0.3, e.y + 2.6, e.rx * 0.82, e.ry * 0.48, 0, Math.PI * 0.12, Math.PI * 0.7);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── brows: thin, inner ends lifted (worried, not angry) ────
  ctx.save();
  ctx.strokeStyle = SKIN[2];
  ctx.lineWidth = 1.9;
  ctx.lineCap = 'round';
  ctx.globalAlpha = 0.82;
  ctx.beginPath();
  ctx.moveTo(-8.6, -139.0 - brow * 0.8);
  ctx.quadraticCurveTo(-3.0, -141.6 - brow * 1.8, 2.6, -140.2 - brow * 0.4);
  ctx.stroke();
  ctx.globalAlpha = 0.76;
  ctx.beginPath();
  ctx.moveTo(5.4, -140.6 - brow * 0.6);
  ctx.quadraticCurveTo(10.8, -142.2 - brow * 1.7, 16.0, -139.6 - brow * 0.7);
  ctx.stroke();
  ctx.restore();

  // ── nose: long, straight, softly turned ───────────────────
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(7.0, -135.2);
  ctx.quadraticCurveTo(4.7, -126.2, 5.9, -120.4);
  ctx.quadraticCurveTo(8.2, -118.8, 10.8, -120.5);
  ctx.quadraticCurveTo(9.4, -127.8, 9.6, -134.8);
  ctx.closePath();
  ctx.fillStyle = SKIN[3];
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = SKIN[9];
  ctx.lineWidth = 1.3;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(9.2, -134.6);
  ctx.quadraticCurveTo(10.4, -126.6, 10.1, -121.4);
  ctx.stroke();
  ctx.globalAlpha = 0.9;
  ell(ctx, 7.9, -120.2, 1.25, 0.85, -0.15);
  ctx.fillStyle = SKIN[2];
  ctx.fill();
  // nose bridge shadow on the far side
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = SKIN[3];
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(6.6, -134.8);
  ctx.quadraticCurveTo(4.6, -126.4, 5.6, -120.8);
  ctx.stroke();
  ctx.restore();

  // ── mouth: small, closed, quietly disappointed ────────────
  ctx.save();
  const mOpen = Math.max(0, mouth) * 3.4;
  ctx.beginPath();
  ctx.moveTo(0.8, -115.7);
  ctx.quadraticCurveTo(6.4, -113.7, 12.2, -115.3);
  ctx.quadraticCurveTo(6.5, -112.6 + mOpen, 0.8, -115.7);
  ctx.closePath();
  ctx.fillStyle = SKIN[1];
  ctx.globalAlpha = 0.95;
  ctx.fill();
  if (mOpen > 0.35) {
    ctx.beginPath();
    ctx.moveTo(2.6, -115.5);
    ctx.quadraticCurveTo(6.4, -115.7 + mOpen * 0.3, 10.4, -116.9);
    ctx.quadraticCurveTo(6.4, -114.9 + mOpen * 0.95, 2.6, -115.5);
    ctx.closePath();
    ctx.fillStyle = STRIPE[0];
    ctx.globalAlpha = 0.92;
    ctx.fill();
  }
  // corner dimples
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = SKIN[3];
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(1.2, -116.3);
  ctx.lineTo(0.4, -117.5);
  ctx.moveTo(11.8, -115.7);
  ctx.lineTo(12.6, -116.9);
  ctx.stroke();
  // lower lip light
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = SKIN[9];
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(2.4, -114.7);
  ctx.quadraticCurveTo(6.3, -113.5 + mOpen * 0.75, 10.2, -114.7);
  ctx.stroke();
  ctx.restore();

  // jaw shadow cast by the hood rim
  ctx.save();
  const jg = ctx.createRadialGradient(3.6, -101.0, 1, 3.6, -101.0, 11);
  jg.addColorStop(0, HONEY[1]);
  jg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = jg;
  ctx.fillRect(-12, -112, 32, 12);
  ctx.restore();

  // chin + jaw
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = SKIN[3];
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(1.2, -113.1);
  ctx.quadraticCurveTo(6.2, -111.4, 10.8, -112.9);
  ctx.stroke();

  // faint warm blush on the cheek
  ctx.save();
  const blg = ctx.createRadialGradient(12.4, -122.0, 0.5, 12.4, -122.0, 7.5);
  blg.addColorStop(0, 'rgba(178,116,86,0.35)');
  blg.addColorStop(1, 'rgba(178,116,86,0)');
  ctx.fillStyle = blg;
  ctx.fillRect(4, -130, 17, 16);
  ctx.restore();

  // freckles on the near cheek
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = SKIN[3];
  ctx.fillRect(14.4, -123.6, 0.9, 0.9);
  ctx.fillRect(15.6, -121.8, 0.8, 0.8);
  ctx.fillRect(13.6, -121.0, 0.7, 0.7);

  // cool bounce from the room on the far cheek
  const bg2 = ctx.createLinearGradient(-12, 0, 1, 0);
  bg2.addColorStop(0, RIM[2]);
  bg2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = bg2;
  ctx.fillRect(-14, -144, 15, 32);
  ctx.globalAlpha = 1;

  ctx.restore(); // face clip
}

function drawHead(ctx, p) {
  ctx.save();

  // far antenna behind the hood
  drawAntennae(ctx, p, true);

  // hood (this is also the head silhouette: no neck seam, no outline)
  ctx.save();
  torsoPath(ctx, p);
  ctx.clip();
  const hg = ctx.createLinearGradient(-22, -150, 22, -108);
  hg.addColorStop(0, HONEY[3]);
  hg.addColorStop(0.38, HONEY[5]);
  hg.addColorStop(0.7, HONEY[7]);
  hg.addColorStop(1, HONEY[5]);
  ctx.fillStyle = hg;
  ctx.fillRect(-26, -156, 56, 54);

  const dg = ctx.createRadialGradient(11, -144, 1, 9, -141, 25);
  dg.addColorStop(0, HONEY[9]);
  dg.addColorStop(0.45, HONEY[8]);
  dg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = dg;
  ctx.fillRect(-26, -156, 56, 46);

  // fabric folds across the crown
  ctx.globalAlpha = 0.26;
  ctx.strokeStyle = HONEY[2];
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(-16.5, -138.6);
  ctx.quadraticCurveTo(-2, -133.2, 15.5, -139.2);
  ctx.stroke();
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-14, -131.4);
  ctx.quadraticCurveTo(-1, -127.6, 18, -133.0);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  drawFace(ctx, p);

  // near antenna
  drawAntennae(ctx, p, false);

  // cool rim on the back of the hood
  ctx.save();
  torsoPath(ctx, p);
  ctx.clip();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = RIM[2];
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-16, -104);
  ctx.bezierCurveTo(-21, -110, -22.5, -118, -21, -128);
  ctx.bezierCurveTo(-19.6, -137, -15.5, -144.5, -9.5, -148.4);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════
//  PUBLIC
// ═══════════════════════════════════════════════════════════

export const BEE_LANDMARKS = {
  height: 150,
  antennaTip: 176,
  feet: 0,
  hip: 54,
  waist: 100,
  crown: 150,
};

/** Draw the bee. (0,0) = the ground point between the feet. */
export function drawBee(ctx, p) {
  ctx.save();
  const sc = p.scale ?? 1;
  if (sc !== 1) ctx.scale(sc, sc);

  // whole-body sway from the hip
  ctx.translate(p.x ?? 0, p.y ?? 0);

  drawWings(ctx, p);

  drawLeg(ctx, p, 'far');
  drawLeg(ctx, p, 'near');
  drawArm(ctx, p, 'far');

  // body group (abdomen + torso) rotates around the pelvis
  ctx.save();
  ctx.translate(0, -56);
  ctx.rotate((p.lean ?? 0) * D);
  ctx.scale(1 / (p.bodyStretch ?? 1), p.bodyStretch ?? 1);
  ctx.translate(0, 56);
  drawAbdomen(ctx, p);
  drawTorso(ctx, p);
  ctx.restore();

  drawArm(ctx, p, 'near');

  // head: own pivot at the neck, follows the body a little
  ctx.save();
  ctx.translate(0, -108);
  // the hood is continuous with the torso, so head rotation is damped
  ctx.rotate((p.headRot ?? 0) * 0.55 * D);
  ctx.translate(0, 108);
  // slight foreshortening: the head reads a touch smaller than the body
  ctx.translate(0, -108);
  ctx.scale(0.935, 0.935);
  ctx.translate(0, 108);
  ctx.translate(p.headX ?? 0, p.headY ?? 0);
  drawHead(ctx, p);
  ctx.restore();

  ctx.restore();
}
