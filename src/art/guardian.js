// ─────────────────────────────────────────────────────────────
//  THE DEEP-REEF WARDEN · character art (320 × 360 logical px)
//
//  Construction measured from the reference silhouette
//  (normalised against the character's own height, then mapped
//  into this canvas):
//
//     y  10  hat tip
//     y  50  hat brim (x 104…216, tattered)
//     y  70  skull top (hidden by the brim)
//     y 136  chin — a small head, ~72 px wide
//     y 136  shoulders, torso only 112 px wide
//     y 196  coral orb (r 30) and both cuffs (r 33) — widest point
//     y 220  sash
//     y 252  tattered robe hem, legs read clearly below it
//     y 352  boots on the floor
//
//  Shading is deliberately *flat*: a base tone, one hard shadow
//  shape, one hard light shape, a few texture lines. The palette
//  quantiser then locks every colour to the 66-colour ramp, so
//  the result reads as hand-placed pixels rather than an airbrush.
// ─────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const INK = '#04101a';
const INK_DEEP = '#030a12';

// ── palette shortcuts (see art/palette.js) ──────────────────
const C = {
  robeLit: '#38a9b1',
  robeHi: '#6ed2d0',
  robe: '#20808f',
  robeMid: '#155568',
  robeShade: '#0d3040',
  robeDeep: '#07141d',
  mint: '#aadfc9',
  mintLit: '#e2fff2',
  mintHi: '#f6fffb',
  mintMid: '#8fc9b4',
  mintShade: '#5b9080',
  skin: '#3a6a5d',
  skinLit: '#6aa08d',
  skinHi: '#8dbca8',
  skinShade: '#152d28',
  skinDeep: '#0e1f1c',
  red: '#d93a44',
  redLit: '#fb7f74',
  redHi: '#ffd0c4',
  redMid: '#961a2b',
  redShade: '#4d0714',
  redDeep: '#2b040c',
  gold: '#d8b74b',
  goldHi: '#fff6cf',
  goldShade: '#6b4f14',
  purple: '#5d3d7c',
  purpleLit: '#a37cc4',
  purpleShade: '#2c1b3f',
  boot: '#0e171d',
  bootLit: '#223640',
  bootHi: '#314b57',
  metal: '#27485a',
  metalLit: '#376176',
  metalHi: '#66a0b2',
};

// ── shapes ──────────────────────────────────────────────────
const path = {
  hatCrown(ctx) {
    ctx.beginPath();
    ctx.moveTo(160, 8);
    ctx.bezierCurveTo(153, 26, 139, 44, 128, 58);
    ctx.bezierCurveTo(144, 65, 176, 65, 192, 58);
    ctx.bezierCurveTo(181, 44, 167, 26, 160, 8);
    ctx.closePath();
  },
  hatBrim(ctx) {
    // lens silhouette with a tattered rim
    ctx.beginPath();
    ctx.moveTo(92, 68);
    ctx.bezierCurveTo(94, 62, 100, 57, 108, 53);
    ctx.lineTo(112, 58);
    ctx.bezierCurveTo(124, 52, 136, 48, 146, 47);
    ctx.lineTo(149, 51);
    ctx.bezierCurveTo(156, 49, 164, 49, 171, 51);
    ctx.lineTo(174, 47);
    ctx.bezierCurveTo(184, 48, 196, 52, 208, 58);
    ctx.lineTo(212, 53);
    ctx.bezierCurveTo(220, 57, 226, 62, 228, 68);
    ctx.bezierCurveTo(230, 74, 226, 78, 218, 80);
    ctx.bezierCurveTo(202, 86, 182, 88, 160, 88);
    ctx.bezierCurveTo(138, 88, 118, 86, 102, 80);
    ctx.bezierCurveTo(94, 78, 90, 74, 92, 68);
    ctx.closePath();
  },
  head(ctx) {
    ctx.beginPath();
    ctx.moveTo(160, 76);
    ctx.bezierCurveTo(177, 76, 188, 84, 190, 97);
    ctx.bezierCurveTo(192, 109, 189, 122, 184, 132);
    ctx.bezierCurveTo(178, 141, 170, 146, 160, 146);
    ctx.bezierCurveTo(150, 146, 142, 141, 136, 132);
    ctx.bezierCurveTo(131, 122, 128, 109, 130, 97);
    ctx.bezierCurveTo(132, 84, 143, 76, 160, 76);
    ctx.closePath();
  },
  torso(ctx) {
    ctx.beginPath();
    ctx.moveTo(160, 116);
    ctx.bezierCurveTo(140, 114, 122, 120, 112, 130);
    ctx.bezierCurveTo(98, 144, 90, 170, 88, 194);
    ctx.bezierCurveTo(86, 218, 96, 236, 112, 240);
    ctx.lineTo(208, 240);
    ctx.bezierCurveTo(224, 236, 234, 218, 232, 194);
    ctx.bezierCurveTo(230, 170, 222, 144, 208, 130);
    ctx.bezierCurveTo(198, 120, 180, 114, 160, 116);
    ctx.closePath();
  },
  chest(ctx) {
    // the open, exposed chest & belly
    ctx.beginPath();
    ctx.moveTo(160, 114);
    ctx.bezierCurveTo(138, 114, 122, 122, 116, 138);
    ctx.bezierCurveTo(108, 158, 107, 194, 114, 216);
    ctx.bezierCurveTo(120, 234, 139, 240, 160, 240);
    ctx.bezierCurveTo(181, 240, 200, 234, 206, 216);
    ctx.bezierCurveTo(213, 194, 212, 158, 204, 138);
    ctx.bezierCurveTo(198, 122, 182, 114, 160, 114);
    ctx.closePath();
  },
  sleeveL(ctx) {
    // a heavy forearm: shoulder → thick bicep → rounded elbow → cuff
    ctx.beginPath();
    ctx.moveTo(146, 118);
    ctx.bezierCurveTo(118, 120, 92, 132, 72, 152);
    ctx.bezierCurveTo(52, 172, 34, 192, 30, 212);
    ctx.bezierCurveTo(28, 230, 42, 240, 62, 238);
    ctx.bezierCurveTo(84, 236, 100, 226, 104, 206);
    ctx.bezierCurveTo(108, 188, 116, 168, 128, 150);
    ctx.bezierCurveTo(138, 136, 148, 128, 154, 126);
    ctx.closePath();
  },
  sleeveR(ctx) {
    ctx.beginPath();
    ctx.moveTo(174, 118);
    ctx.bezierCurveTo(202, 120, 228, 132, 248, 152);
    ctx.bezierCurveTo(268, 172, 286, 192, 290, 212);
    ctx.bezierCurveTo(292, 230, 278, 240, 258, 238);
    ctx.bezierCurveTo(236, 236, 220, 226, 216, 206);
    ctx.bezierCurveTo(212, 188, 204, 168, 192, 150);
    ctx.bezierCurveTo(182, 136, 172, 128, 166, 126);
    ctx.closePath();
  },
  cuffL(ctx) {
    ctx.beginPath();
    ctx.ellipse(52, 190, 35, 33, -0.1, 0, TAU);
    ctx.closePath();
  },
  cuffR(ctx) {
    ctx.beginPath();
    ctx.ellipse(268, 190, 35, 33, 0.1, 0, TAU);
    ctx.closePath();
  },
};

// ── painter helpers ─────────────────────────────────────────
function shape(ctx, build, style, { stroke = INK, lw = 3, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  build(ctx);
  ctx.fillStyle = style;
  ctx.fill();
  ctx.restore();
  if (stroke) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    build(ctx);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }
}
const lin = (ctx, x0, y0, x1, y1, stops) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
};
const rad = (ctx, x, y, r0, r1, stops) => {
  const g = ctx.createRadialGradient(x, y, Math.max(0.01, r0), x, y, r1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
};
function pivot(ctx, px, py, rot = 0, sx = 1, sy = 1) {
  if (!rot && sx === 1 && sy === 1) return;
  ctx.translate(px, py);
  if (rot) ctx.rotate(rot);
  if (sx !== 1 || sy !== 1) ctx.scale(sx, sy);
  ctx.translate(-px, -py);
}
function clipTo(ctx, build, body) {
  ctx.save();
  build(ctx);
  ctx.clip();
  body(ctx);
  ctx.restore();
}
/** hard-edged shadow blob clipped to a shape */
function shade(ctx, build, paint) {
  clipTo(ctx, build, paint);
}

// ─────────────────────────────────────────────────────────────
export function drawGuardian(ctx, R) {
  // contact shadow
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(160 + R.x * 0.5, 354, 86 - Math.abs(R.y) * 0.7, 10, 0, 0, TAU);
  ctx.fillStyle = 'rgba(2,6,10,0.9)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(R.x, R.y);

  drawLegs(ctx, R);

  // hips group
  ctx.save();
  pivot(ctx, 160, 244, R.hipRot);
  drawSkirt(ctx, R);

  // chest group
  ctx.save();
  pivot(ctx, 160, 244, R.chestRot, R.chestSX, R.chestSY);
  drawTorso(ctx, R);
  drawSleeves(ctx, R);
  drawCuffs(ctx, R);
  drawSash(ctx, R);
  ctx.restore();

  // head group (small head, big hat)
  ctx.save();
  pivot(ctx, 160, 146, R.chestRot * 0.6);
  ctx.translate(R.headX, R.headY);
  ctx.translate(160, 146);
  ctx.scale(0.92, 0.92);
  ctx.translate(-160, -146);
  pivot(ctx, 160, 150, R.headRot);
  drawHead(ctx, R);
  ctx.save();
  ctx.translate(R.hatX, R.hatY);
  pivot(ctx, 160, 70, R.hatRot);
  drawHat(ctx, R);
  ctx.restore();
  ctx.restore();

  drawOrb(ctx, R);
  ctx.restore(); // hips

  drawRimLight(ctx);
  ctx.restore();
}

// ── LEGS ────────────────────────────────────────────────────
function drawLegs(ctx, R) {
  for (const side of [-1, 1]) {
    const cx = 160 + side * 30;

    // trouser leg
    const leg = () => {
      ctx.beginPath();
      ctx.moveTo(cx - side * 26, 220);
      ctx.bezierCurveTo(cx - side * 28, 252, cx - side * 27, 286, cx - side * 25, 306);
      ctx.lineTo(cx + side * 15, 306);
      ctx.bezierCurveTo(cx + side * 15, 286, cx + side * 16, 254, cx + side * 17, 220);
      ctx.closePath();
    };
    shape(ctx, leg, lin(ctx, cx - side * 22, 230, cx + side * 18, 306, [
      [0, C.metalLit],
      [0.28, C.metal],
      [0.7, '#1a3a4a'],
      [1, '#0f2330'],
    ]), { lw: 2.2 });
    shade(ctx, leg, (c) => {
      c.fillStyle = lin(c, cx + side * 6, 240, cx + side * 20, 312, [
        [0, 'rgba(4,10,16,0)'],
        [1, 'rgba(4,10,16,0.75)'],
      ]);
      c.fillRect(cx - 30, 234, 60, 84);
      // lit shin
      c.beginPath();
      c.moveTo(cx - side * 21, 250);
      c.bezierCurveTo(cx - side * 22, 276, cx - side * 21, 298, cx - side * 20, 310);
      c.strokeStyle = 'rgba(134,196,196,0.18)';
      c.lineWidth = 2;
      c.stroke();
    });

    // boot
    const boot = () => {
      ctx.beginPath();
      ctx.moveTo(cx - side * 25, 296);
      ctx.lineTo(cx + side * 20, 292);
      ctx.bezierCurveTo(cx + side * 26, 312, cx + side * 27, 334, cx + side * 23, 352);
      ctx.lineTo(cx - side * 28, 352);
      ctx.bezierCurveTo(cx - side * 29, 334, cx - side * 28, 314, cx - side * 25, 296);
      ctx.closePath();
    };
    shape(ctx, boot, lin(ctx, cx - side * 25, 292, cx + side * 24, 352, [
      [0, C.bootLit],
      [0.35, C.boot],
      [1, '#04080b'],
    ]), { lw: 2.2 });
    shade(ctx, boot, (c) => {
      // lit top edge of the boot cuff
      c.beginPath();
      c.moveTo(cx - side * 25, 297);
      c.quadraticCurveTo(cx - side * 2, 291, cx + side * 20, 294);
      c.strokeStyle = 'rgba(150,208,208,0.55)';
      c.lineWidth = 2.2;
      c.stroke();
      // strap
      c.beginPath();
      c.moveTo(cx - side * 29, 306);
      c.quadraticCurveTo(cx, 300, cx + side * 25, 303);
      c.strokeStyle = INK_DEEP;
      c.lineWidth = 3.4;
      c.stroke();
      // buckle
      c.beginPath();
      c.arc(cx + side * 10, 303, 3, 0, TAU);
      c.fillStyle = C.gold;
      c.fill();
      c.strokeStyle = C.goldShade;
      c.lineWidth = 0.9;
      c.stroke();
      // toe box + sole
      c.beginPath();
      c.ellipse(cx - side * 5, 334, 20, 10, 0, Math.PI * 0.95, Math.PI * 2.05);
      c.strokeStyle = 'rgba(134,196,196,0.4)';
      c.lineWidth = 2.2;
      c.stroke();
      c.beginPath();
      c.moveTo(cx - side * 27, 347);
      c.quadraticCurveTo(cx, 355, cx + side * 23, 347);
      c.strokeStyle = 'rgba(134,196,196,0.32)';
      c.lineWidth = 3;
      c.stroke();
      // shadow on the inner side
      c.fillStyle = lin(c, cx + side * 6, 296, cx + side * 24, 352, [
        [0, 'rgba(2,6,10,0)'],
        [1, 'rgba(2,6,10,0.8)'],
      ]);
      c.fillRect(cx - 30, 290, 60, 64);
    });
  }
}

// ── ROBE SKIRT ──────────────────────────────────────────────
function drawSkirt(ctx, R) {
  const sway = R.skirtSway;
  const hem = [
    [80, 250], [92, 246], [104, 252], [116, 247], [130, 253],
    [144, 248], [160, 254], [176, 248], [190, 253], [204, 247], [218, 252],
    [230, 246], [240, 250],
  ];
  const skirt = () => {
    ctx.beginPath();
    ctx.moveTo(160, 204);
    ctx.bezierCurveTo(132, 202, 110, 212, 98, 224);
    ctx.bezierCurveTo(90, 234, 84, 244, 80, 250);
    for (let i = 1; i < hem.length; i++) ctx.lineTo(hem[i][0], hem[i][1]);
    ctx.bezierCurveTo(236, 244, 230, 234, 222, 224);
    ctx.bezierCurveTo(210, 212, 188, 202, 160, 204);
    ctx.closePath();
  };

  shape(ctx, skirt, lin(ctx, 160, 200, 160, 258, [
    [0, C.robeLit],
    [0.28, C.robe],
    [0.62, C.robeMid],
    [0.85, C.robeShade],
    [1, C.robeDeep],
  ]), { lw: 2.6 });

  shade(ctx, skirt, (c) => {
    // fan pleats
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const xTop = 120 + t * 80;
      const xBot = 88 + t * 144;
      const bend = sway * (t - 0.5) * 6;
      c.beginPath();
      c.moveTo(xTop, 202);
      c.bezierCurveTo(xTop + (xBot - xTop) * 0.4, 222, xBot - bend, 234, xBot + bend, 250);
      c.strokeStyle = i % 2 ? 'rgba(4,14,22,0.6)' : 'rgba(160,240,232,0.20)';
      c.lineWidth = i % 2 ? 3 : 1.8;
      c.stroke();
    }
    // lit left half
    c.fillStyle = lin(c, 96, 210, 168, 250, [
      [0, 'rgba(160,240,232,0.4)'],
      [1, 'rgba(160,240,232,0)'],
    ]);
    c.fillRect(80, 200, 100, 48);
    // dark hem
    c.fillStyle = lin(c, 160, 232, 160, 250, [
      [0, 'rgba(3,10,18,0)'],
      [1, 'rgba(3,10,18,0.6)'],
    ]);
    c.fillRect(78, 232, 168, 22);
    // right side into shadow
    c.fillStyle = lin(c, 210, 228, 240, 258, [
      [0, 'rgba(3,10,18,0.08)'],
      [1, 'rgba(3,10,18,0.55)'],
    ]);
    c.fillRect(196, 200, 48, 48);
  });

  // gold trim hugging the torn hem
  shade(ctx, skirt, (c) => {
    c.beginPath();
    hem.forEach(([x, y], i) => (i ? c.lineTo(x, y - 2) : c.moveTo(x, y - 2)));
    c.strokeStyle = 'rgba(143,111,34,0.85)';
    c.lineWidth = 2.2;
    c.stroke();
    c.beginPath();
    hem.forEach(([x, y], i) => (i ? c.lineTo(x, y - 3.2) : c.moveTo(x, y - 3.2)));
    c.strokeStyle = 'rgba(216,183,75,0.5)';
    c.lineWidth = 1;
    c.stroke();
  });

  // front panel hanging between the legs
  ctx.save();
  ctx.translate(sway * 2, 0);
  const flap = () => {
    ctx.beginPath();
    ctx.moveTo(151, 210);
    ctx.bezierCurveTo(148, 232, 146, 252, 148, 266);
    ctx.lineTo(156, 256);
    ctx.lineTo(163, 276);
    ctx.lineTo(171, 258);
    ctx.bezierCurveTo(175, 242, 176, 226, 175, 210);
    ctx.closePath();
  };
  shape(ctx, flap, lin(ctx, 148, 210, 176, 276, [
    [0, C.robeLit],
    [0.4, C.robe],
    [0.8, C.robeMid],
    [1, C.robeShade],
  ]), { lw: 2.2 });
  shade(ctx, flap, (c) => {
    c.beginPath();
    c.moveTo(159, 212);
    c.bezierCurveTo(156, 234, 155, 254, 156, 272);
    c.strokeStyle = 'rgba(216,183,75,0.8)';
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = lin(c, 176, 234, 152, 280, [
      [0, 'rgba(3,10,18,0)'],
      [1, 'rgba(3,10,18,0.5)'],
    ]);
    c.fillRect(144, 206, 36, 76);
  });
  ctx.restore();

  // short side tail
  ctx.save();
  ctx.translate(-sway * 2, 0);
  const tail = () => {
    ctx.beginPath();
    ctx.moveTo(184, 212);
    ctx.bezierCurveTo(194, 226, 202, 242, 206, 258);
    ctx.lineTo(196, 250);
    ctx.lineTo(190, 264);
    ctx.bezierCurveTo(182, 246, 175, 228, 172, 214);
    ctx.closePath();
  };
  shape(ctx, tail, lin(ctx, 172, 212, 208, 264, [
    [0, C.robeLit],
    [0.55, C.robeMid],
    [1, C.robeShade],
  ]), { lw: 2.2 });
  ctx.restore();
}

// ── SLEEVES (behind the torso) ──────────────────────────────
function drawSleeves(ctx, R) {
  for (const side of [-1, 1]) {
    const isL = side < 0;
    const rot = isL ? R.armLRot : R.armRRot;
    const ext = isL ? R.armLExt : R.armRExt;

    ctx.save();
    pivot(ctx, 160 + side * 52, 132, rot);
    ctx.translate(side * ext * 6, ext * 4);

    const build = isL ? path.sleeveL : path.sleeveR;
    shape(ctx, build, lin(ctx, 160 + side * 30, 126, 160 + side * 96, 232, [
      [0, C.robeMid],
      [0.35, C.robeShade],
      [0.75, C.robeDeep],
      [1, '#030b12'],
    ]), { lw: 3 });

    // sleeve end: a rounded mass that the cuff ring always sits on
    ctx.save();
    const cuffC = isL ? path.cuffL : path.cuffR;
    cuffC(ctx);
    ctx.fillStyle = lin(ctx, 160 + side * 70, 160, 160 + side * 100, 236, [
      [0, C.robeMid],
      [0.5, C.robeShade],
      [1, C.robeDeep],
    ]);
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    shade(ctx, build, (c) => {
      // moon-lit upper edge of the sleeve
      c.beginPath();
      c.moveTo(146, 118);
      c.bezierCurveTo(118, 120, 92, 132, 72, 152);
      c.bezierCurveTo(52, 172, 34, 192, 30, 212);
      c.lineTo(160 + side * 46, 200);
      c.bezierCurveTo(160 + side * 58, 174, 160 + side * 66, 144, 160 + side * 74, 126);
      c.closePath();
      c.fillStyle = lin(c, 160 + side * 30, 126, 160 + side * 60, 196, [
        [0, C.robeLit],
        [0.45, C.robe],
        [1, C.robeMid],
      ]);
      c.fill();
      // fold lines running down the sleeve
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.moveTo(160 + side * (44 + i * 9), 140 + i * 6);
        c.quadraticCurveTo(160 + side * (36 + i * 9), 172, 160 + side * (44 + i * 8), 210);
        c.strokeStyle = i % 2 ? 'rgba(3,12,20,0.55)' : 'rgba(160,240,232,0.22)';
        c.lineWidth = i % 2 ? 2.4 : 1.4;
        c.stroke();
      }
      // hard shadow where the sleeve tucks under the shoulder
      c.beginPath();
      c.moveTo(160 + side * 18, 126);
      c.bezierCurveTo(160 + side * 30, 156, 160 + side * 34, 190, 160 + side * 30, 224);
      c.lineTo(160 + side * 8, 230);
      c.bezierCurveTo(160 + side * 12, 196, 160 + side * 10, 160, 160 + side * 6, 134);
      c.closePath();
      c.fillStyle = 'rgba(3,10,18,0.62)';
      c.fill();
      // inner shadow at the cuff end
      c.fillStyle = lin(c, 160 + side * 40, 196, 160 + side * 44, 226, [
        [0, 'rgba(3,10,18,0)'],
        [1, 'rgba(3,10,18,0.65)'],
      ]);
      c.fillRect(160 + side * (side < 0 ? 20 : -76), 196, 78, 34);
    });
    ctx.restore();
  }
}

// ── TORSO ───────────────────────────────────────────────────
function drawTorso(ctx, R) {
  shape(ctx, path.torso, lin(ctx, 96, 130, 240, 246, [
    [0, C.robe],
    [0.2, C.robeMid],
    [0.55, C.robeShade],
    [0.8, C.robeDeep],
    [1, '#04101a'],
  ]), { lw: 3 });

  shade(ctx, path.torso, (c) => {
    // folds
    [
      [118, 148, 106, 186, 104, 232, 2.8],
      [132, 144, 120, 184, 116, 236, 3.2],
      [202, 148, 214, 186, 216, 232, 2.8],
      [188, 144, 200, 184, 204, 236, 3.2],
    ].forEach(([x0, y0, x1, y1, x2, y2, w]) => {
      c.beginPath();
      c.moveTo(x0, y0);
      c.quadraticCurveTo(x1, y1, x2, y2);
      c.strokeStyle = 'rgba(4,14,22,0.55)';
      c.lineWidth = w;
      c.stroke();
      c.beginPath();
      c.moveTo(x0 + 5, y0 + 2);
      c.quadraticCurveTo(x1 + 5, y1, x2 + 5, y2);
      c.strokeStyle = 'rgba(160,240,232,0.24)';
      c.lineWidth = 1.5;
      c.stroke();
    });
    // lit shoulder mass (upper-left key)
    c.fillStyle = rad(c, 118, 146, 4, 62, [
      [0, 'rgba(200,252,248,0.42)'],
      [1, 'rgba(200,252,248,0)'],
    ]);
    c.fillRect(90, 128, 90, 84);
    // deep shadow at the armpits
    c.fillStyle = lin(c, 92, 140, 120, 232, [
      [0, 'rgba(3,10,16,0)'],
      [1, 'rgba(3,10,16,0.6)'],
    ]);
    c.fillRect(88, 136, 40, 110);
    c.fillStyle = lin(c, 228, 140, 200, 232, [
      [0, 'rgba(3,10,16,0.05)'],
      [1, 'rgba(3,10,16,0.6)'],
    ]);
    c.fillRect(196, 136, 40, 110);
    // cloth weave
    c.strokeStyle = 'rgba(160,240,232,0.06)';
    c.lineWidth = 1;
    for (let i = -6; i < 18; i++) {
      c.beginPath();
      c.moveTo(92 + i * 8, 130);
      c.lineTo(112 + i * 8, 246);
      c.stroke();
    }
  });

  // ── exposed chest ──
  shape(ctx, path.chest, rad(ctx, 142, 156, 6, 76, [
    [0, C.mintLit],
    [0.4, C.mint],
    [0.75, C.mintMid],
    [1, C.mintShade],
  ]), { stroke: '#04161a', lw: 2.2 });

  shade(ctx, path.chest, (c) => {
    // belly scales
    c.strokeStyle = 'rgba(47,110,96,0.30)';
    c.lineWidth = 1.2;
    for (let row = 0; row < 12; row++) {
      const y = 144 + row * 8;
      const offs = row % 2 ? 4.4 : 0;
      for (let i = 0; i < 9; i++) {
        const x = 126 + offs + i * 8.6;
        c.beginPath();
        c.arc(x, y, 4.2, Math.PI * 0.06, Math.PI * 0.94);
        c.stroke();
      }
    }
    // shadow under the collar
    c.fillStyle = lin(c, 160, 134, 160, 152, [
      [0, 'rgba(24,64,56,0.85)'],
      [1, 'rgba(24,64,56,0)'],
    ]);
    c.fillRect(120, 132, 80, 24);
    // pecs
    c.beginPath();
    c.moveTo(160, 150);
    c.bezierCurveTo(152, 158, 140, 160, 132, 156);
    c.moveTo(160, 150);
    c.bezierCurveTo(168, 158, 180, 160, 188, 156);
    c.strokeStyle = 'rgba(47,110,96,0.45)';
    c.lineWidth = 2.4;
    c.stroke();
    c.beginPath();
    c.ellipse(160, 214, 4.6, 6.6, 0, 0, TAU);
    c.strokeStyle = 'rgba(47,110,96,0.4)';
    c.lineWidth = 1.6;
    c.stroke();
    // form: light upper-left
    c.fillStyle = rad(c, 140, 156, 6, 60, [
      [0, 'rgba(255,255,255,0.5)'],
      [1, 'rgba(255,255,255,0)'],
    ]);
    c.fillRect(124, 132, 72, 72);
    // flanks & lower belly
    c.fillStyle = lin(c, 126, 150, 134, 240, [
      [0, 'rgba(37,84,72,0)'],
      [1, 'rgba(37,84,72,0.6)'],
    ]);
    c.fillRect(122, 136, 18, 104);
    c.fillStyle = lin(c, 194, 150, 186, 240, [
      [0, 'rgba(37,84,72,0.05)'],
      [1, 'rgba(37,84,72,0.6)'],
    ]);
    c.fillRect(180, 136, 18, 104);
    c.fillStyle = lin(c, 160, 208, 160, 240, [
      [0, 'rgba(37,84,72,0)'],
      [1, 'rgba(37,84,72,0.6)'],
    ]);
    c.fillRect(124, 208, 72, 32);
  });

  // ── lapels ──
  for (const side of [-1, 1]) {
    const lapel = () => {
      ctx.beginPath();
      ctx.moveTo(160 + side * 22, 116);
      ctx.bezierCurveTo(160 + side * 42, 120, 160 + side * 54, 130, 160 + side * 58, 148);
      ctx.bezierCurveTo(160 + side * 62, 176, 160 + side * 56, 212, 160 + side * 52, 238);
      ctx.bezierCurveTo(160 + side * 44, 226, 160 + side * 38, 202, 160 + side * 34, 184);
      ctx.bezierCurveTo(160 + side * 30, 164, 160 + side * 25, 138, 160 + side * 22, 116);
      ctx.closePath();
    };
    shape(ctx, lapel, lin(ctx, 160 + side * 54, 132, 160 + side * 16, 238, [
      [0, C.robeLit],
      [0.3, C.robe],
      [0.65, C.robeMid],
      [1, C.robeShade],
    ]), { lw: 2.2 });
    shade(ctx, lapel, (c) => {
      c.strokeStyle = 'rgba(4,14,22,0.45)';
      c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(160 + side * 28, 136);
      c.quadraticCurveTo(160 + side * 40, 176, 160 + side * 36, 230);
      c.stroke();
      c.strokeStyle = 'rgba(160,240,232,0.3)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(160 + side * 18, 134);
      c.quadraticCurveTo(160 + side * 30, 174, 160 + side * 26, 222);
      c.stroke();
      c.fillStyle = lin(c, 160 + side * 52, 160, 160 + side * 30, 238, [
        [0, 'rgba(3,10,16,0)'],
        [1, 'rgba(3,10,16,0.55)'],
      ]);
      c.fillRect(160 + side * (side < 0 ? 18 : -54), 130, 56, 112);
    });

    // gold piping on the inner edge
    ctx.beginPath();
    ctx.moveTo(160 + side * 24, 117);
    ctx.bezierCurveTo(160 + side * 43, 121, 160 + side * 53, 131, 160 + side * 57, 149);
    ctx.bezierCurveTo(160 + side * 61, 176, 160 + side * 55, 212, 160 + side * 51, 236);
    ctx.strokeStyle = '#2a2208';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(160 + side * 24, 117);
    ctx.bezierCurveTo(160 + side * 43, 121, 160 + side * 53, 131, 160 + side * 57, 149);
    ctx.bezierCurveTo(160 + side * 61, 176, 160 + side * 55, 212, 160 + side * 51, 236);
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(160 + side * 24, 116);
    ctx.bezierCurveTo(160 + side * 43, 120, 160 + side * 53, 130, 160 + side * 57, 148);
    ctx.strokeStyle = C.goldHi;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // amulet
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(150, 136);
  ctx.quadraticCurveTo(157, 146, 160, 152);
  ctx.moveTo(170, 136);
  ctx.quadraticCurveTo(163, 146, 160, 152);
  ctx.strokeStyle = C.goldShade;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(155, 152);
  ctx.lineTo(160, 146);
  ctx.lineTo(165, 152);
  ctx.lineTo(160, 160);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 155, 146, 165, 160, [[0, C.goldHi], [0.5, C.gold], [1, C.goldShade]]);
  ctx.fill();
  ctx.strokeStyle = '#241c06';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

// ── SASH ────────────────────────────────────────────────────
function drawSash(ctx, R) {
  const w = R.skirtSway * 1.2;
  ctx.save();
  ctx.translate(w * 0.6, 0);

  const band = () => {
    ctx.beginPath();
    ctx.moveTo(92, 208);
    ctx.bezierCurveTo(118, 202, 202, 202, 228, 208);
    ctx.lineTo(226, 228);
    ctx.bezierCurveTo(202, 221, 118, 221, 94, 228);
    ctx.closePath();
  };
  shape(ctx, band, lin(ctx, 96, 214, 224, 242, [
    [0, C.metalHi],
    [0.28, C.metalLit],
    [0.62, C.metal],
    [1, '#152c38'],
  ]), { lw: 2.4 });
  shade(ctx, band, (c) => {
    for (let i = 0; i < 7; i++) {
      const x = 102 + i * 20;
      c.beginPath();
      c.moveTo(x, 214);
      c.lineTo(x - 2, 244);
      c.strokeStyle = i % 2 ? 'rgba(6,20,30,0.5)' : 'rgba(190,240,236,0.24)';
      c.lineWidth = i % 2 ? 2.4 : 1.6;
      c.stroke();
    }
    c.fillStyle = lin(c, 160, 222, 160, 238, [
      [0, 'rgba(3,10,16,0)'],
      [1, 'rgba(3,10,16,0.6)'],
    ]);
    c.fillRect(88, 222, 144, 16);
  });

  // gold upper edge
  ctx.beginPath();
  ctx.moveTo(92, 207);
  ctx.bezierCurveTo(118, 201, 202, 201, 228, 207);
  ctx.strokeStyle = C.goldShade;
  ctx.lineWidth = 2.8;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(92, 205.4);
  ctx.bezierCurveTo(118, 199.4, 202, 199.4, 228, 205.4);
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // knot + two tails below the orb
  const knot = () => {
    ctx.beginPath();
    ctx.moveTo(146, 236);
    ctx.bezierCurveTo(139, 244, 141, 256, 151, 260);
    ctx.bezierCurveTo(161, 264, 175, 263, 181, 256);
    ctx.bezierCurveTo(186, 249, 182, 238, 172, 235);
    ctx.bezierCurveTo(162, 232, 152, 232, 146, 236);
    ctx.closePath();
  };
  shape(ctx, knot, lin(ctx, 142, 232, 184, 262, [
    [0, C.metalHi],
    [0.35, C.metalLit],
    [0.75, C.metal],
    [1, '#152c38'],
  ]), { lw: 2.2 });
  shade(ctx, knot, (c) => {
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(153 + i * 9, 226);
      c.quadraticCurveTo(158 + i * 9, 237, 153 + i * 9, 251);
      c.strokeStyle = 'rgba(4,14,22,0.42)';
      c.lineWidth = 2;
      c.stroke();
    }
  });

  [
    { x: 152, len: 28, tilt: -3 },
    { x: 167, len: 20, tilt: 4 },
  ].forEach(({ x, len, tilt }) => {
    const tail = () => {
      ctx.beginPath();
      ctx.moveTo(x - 7, 248);
      ctx.bezierCurveTo(x - 9 + tilt, 258, x - 8 + tilt * 1.6, 268, x - 6 + tilt * 2, 248 + len);
      ctx.lineTo(x + 2 + tilt * 2, 248 + len - 7);
      ctx.lineTo(x + 7 + tilt * 2, 248 + len + 1);
      ctx.bezierCurveTo(x + 9 + tilt, 262, x + 9, 254, x + 8, 248);
      ctx.closePath();
    };
    shape(ctx, tail, lin(ctx, x - 8, 248, x + tilt * 2, 248 + len, [
      [0, C.metalHi],
      [0.5, C.metal],
      [1, '#122733'],
    ]), { lw: 2 });
  });
  ctx.restore();
}

// ── CUFFS + HANDS ───────────────────────────────────────────
function drawCuffs(ctx, R) {
  for (const side of [-1, 1]) {
    const isL = side < 0;
    const handRot = isL ? R.handLRot : R.handRRot;
    const ext = isL ? R.armLExt : R.armRExt;
    const rot = isL ? R.armLRot : R.armRRot;
    const cx = 160 + side * 108;
    const cy = 190;

    ctx.save();
    pivot(ctx, 160 + side * 52, 132, rot);
    ctx.translate(side * ext * 6, ext * 4);

    const cuff = isL ? path.cuffL : path.cuffR;
    shape(ctx, cuff, lin(ctx, cx - 28, cy - 28, cx + 24, cy + 28, [
      [0, C.metalHi],
      [0.2, C.metalLit],
      [0.5, C.metal],
      [0.78, '#1c3a49'],
      [1, '#122b38'],
    ]), { lw: 2.4 });

    shade(ctx, cuff, (c) => {
      // gold ring around the sleeve opening
      c.beginPath();
      c.ellipse(cx, cy, 24.5, 22.5, 0, 0, TAU);
      c.strokeStyle = C.goldShade;
      c.lineWidth = 3.4;
      c.stroke();
      c.beginPath();
      c.ellipse(cx, cy, 24.5, 22.5, 0, Math.PI * 1.0, Math.PI * 1.9);
      c.strokeStyle = C.gold;
      c.lineWidth = 1.4;
      c.stroke();
      // radiating fabric folds
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU + 0.2;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 23);
        c.lineTo(cx + Math.cos(a) * 34, cy + Math.sin(a) * 31);
        c.strokeStyle = i % 2 ? 'rgba(4,14,22,0.4)' : 'rgba(200,246,240,0.3)';
        c.lineWidth = i % 2 ? 2.2 : 1.4;
        c.stroke();
      }
      // key light
      c.fillStyle = rad(c, cx - 12, cy - 14, 3, 34, [
        [0, 'rgba(255,255,255,0.5)'],
        [1, 'rgba(255,255,255,0)'],
      ]);
      c.fillRect(cx - 34, cy - 32, 68, 64);
      // shadow at the bottom
      c.fillStyle = lin(c, cx, cy + 4, cx, cy + 32, [
        [0, 'rgba(3,10,16,0)'],
        [1, 'rgba(3,10,16,0.6)'],
      ]);
      c.fillRect(cx - 34, cy + 4, 68, 30);
    });

    // sleeve opening
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 22.5, 20.5, 0, 0, TAU);
    ctx.fillStyle = rad(ctx, cx, cy - 4, 2, 24, [
      [0, '#173a49'],
      [0.55, '#08161f'],
      [1, '#02070b'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#02101a';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 21, 19, 0, Math.PI * 1.08, Math.PI * 1.92);
    ctx.strokeStyle = 'rgba(150,220,214,0.4)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // hand, curled inside the sleeve opening
    ctx.save();
    ctx.translate(cx, cy + 7);
    ctx.rotate(handRot + side * 0.05);
    const palm = () => {
      ctx.beginPath();
      ctx.moveTo(-13, -9);
      ctx.bezierCurveTo(-18, 1, -15, 12, -4, 15.5);
      ctx.bezierCurveTo(7, 17, 17, 10, 16, -1);
      ctx.bezierCurveTo(15, -11, 3, -14, -4, -13);
      ctx.closePath();
    };
    shape(ctx, palm, lin(ctx, -13, -13, 14, 15, [
      [0, C.mintLit],
      [0.3, C.mint],
      [0.66, C.skinLit],
      [1, C.skin],
    ]), { stroke: C.skinDeep, lw: 2 });
    shade(ctx, palm, (c) => {
      c.fillStyle = rad(c, -6, -6, 3, 18, [
        [0, 'rgba(255,255,255,0.45)'],
        [1, 'rgba(255,255,255,0)'],
      ]);
      c.fillRect(-20, -18, 40, 34);
      c.fillStyle = lin(c, -2, 8, 14, 16, [
        [0, 'rgba(14,44,38,0)'],
        [1, 'rgba(14,44,38,0.7)'],
      ]);
      c.fillRect(-20, 8, 40, 12);
      c.fillStyle = 'rgba(20,58,50,0.35)';
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.arc(-7 + (i % 2) * 8, -3 + Math.floor(i / 2) * 7, 1.1, 0, TAU);
        c.fill();
      }
    });
    for (let f = 0; f < 3; f++) {
      const fx = -8 + f * 7.6;
      const fy = 9 + Math.abs(f - 1) * 1.2;
      const finger = () => {
        ctx.beginPath();
        ctx.moveTo(fx - 3.4, fy - 6);
        ctx.bezierCurveTo(fx - 4.2, fy + 3, fx - 1, fy + 7.4, fx + 2, fy + 6.6);
        ctx.bezierCurveTo(fx + 4.8, fy + 5.4, fx + 4.6, fy - 1, fx + 3.4, fy - 6);
        ctx.closePath();
      };
      shape(ctx, finger, lin(ctx, fx - 3, fy - 6, fx + 4, fy + 7, [
        [0, C.mintLit],
        [0.6, C.skinLit],
        [1, C.skin],
      ]), { stroke: C.skinDeep, lw: 1.4 });
      ctx.beginPath();
      ctx.moveTo(fx + 0.4, fy + 4.6);
      ctx.quadraticCurveTo(fx + 0.7, fy + 7.4, fx + 1.6, fy + 8.6);
      ctx.strokeStyle = '#0b2a26';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx + 0.4, fy + 4.6);
      ctx.quadraticCurveTo(fx + 0.7, fy + 7.4, fx + 1.6, fy + 8.6);
      ctx.strokeStyle = C.mintHi;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }
}

// ── HEAD ────────────────────────────────────────────────────
function drawHead(ctx, R) {
  // neck stub
  ctx.beginPath();
  ctx.moveTo(148, 138);
  ctx.lineTo(172, 138);
  ctx.lineTo(176, 156);
  ctx.lineTo(144, 156);
  ctx.closePath();
  ctx.fillStyle = C.skinShade;
  ctx.fill();

  shape(ctx, path.head, rad(ctx, 138, 92, 6, 60, [
    [0, C.skinHi],
    [0.35, C.skinLit],
    [0.7, C.skin],
    [1, C.skinShade],
  ]), { lw: 2.2 });

  shade(ctx, path.head, (c) => {
    // brim shadow
    c.fillStyle = lin(c, 160, 70, 160, 106, [
      [0, 'rgba(2,10,14,0.95)'],
      [0.55, 'rgba(2,10,14,0.6)'],
      [1, 'rgba(2,10,14,0)'],
    ]);
    c.fillRect(118, 66, 84, 40);
    // cheek + temple volume
    c.fillStyle = rad(c, 136, 110, 3, 30, [
      [0, 'rgba(200,244,228,0.5)'],
      [1, 'rgba(200,244,228,0)'],
    ]);
    c.fillRect(122, 94, 38, 40);
    c.fillStyle = rad(c, 186, 116, 3, 26, [
      [0, 'rgba(110,160,141,0.35)'],
      [1, 'rgba(110,160,141,0)'],
    ]);
    c.fillRect(164, 100, 34, 36);
    // jaw shadow
    c.fillStyle = lin(c, 160, 128, 160, 148, [
      [0, 'rgba(6,22,20,0)'],
      [1, 'rgba(6,22,20,0.55)'],
    ]);
    c.fillRect(124, 128, 72, 24);
    // forehead speckles
    c.fillStyle = 'rgba(190,236,220,0.18)';
    for (let i = 0; i < 14; i++) {
      c.beginPath();
      c.arc(130 + ((i * 29) % 60), 78 + ((i * 17) % 14), 1, 0, TAU);
      c.fill();
    }
  });

  // ── eyes ──
  for (const side of [-1, 1]) {
    const ex = 160 + side * 16;
    const ey = 99;
    const open = R.eyeOpen;
    ctx.save();
    // socket shadow
    ctx.beginPath();
    ctx.ellipse(ex, ey + 1.4, 10.4, 6.8, side * -0.14, 0, TAU);
    ctx.fillStyle = 'rgba(14,44,38,0.85)';
    ctx.fill();
    // eyeball
    ctx.beginPath();
    ctx.ellipse(ex, ey, 8.4, 4.8 * open + 0.5, side * -0.14, 0, TAU);
    ctx.fillStyle = lin(ctx, ex, ey - 6, ex, ey + 6, [
      [0, '#ffffff'],
      [0.45, C.mintLit],
      [1, C.mintMid],
    ]);
    ctx.fill();
    if (open > 0.32) {
      ctx.beginPath();
      ctx.ellipse(ex + side * 0.6, ey + 0.6, 1.7, 3.8 * open, 0, 0, TAU);
      ctx.fillStyle = '#06171a';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ex, ey - 2.6, 6.6, 1.2, side * -0.14, 0, TAU);
      ctx.fillStyle = 'rgba(30,72,62,0.6)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex - side * 3.6, ey - 2.4, 1.5, 0, TAU);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
    // heavy lids, angry angle
    ctx.beginPath();
    ctx.moveTo(ex - side * 8.8, ey - 3.8);
    ctx.quadraticCurveTo(ex + side * 1, ey - 8.2, ex + side * 8.8, ey - 0.6);
    ctx.strokeStyle = '#0a2a26';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex - side * 8.4, ey - 4.4);
    ctx.quadraticCurveTo(ex + side * 1, ey - 8.8, ex + side * 8.4, ey - 1.6);
    ctx.strokeStyle = 'rgba(190,236,220,0.3)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.restore();
  }

  // ── brow ridge ──
  ctx.beginPath();
  ctx.moveTo(130, 88);
  ctx.quadraticCurveTo(145, 82, 160, 88);
  ctx.quadraticCurveTo(175, 82, 190, 88);
  ctx.strokeStyle = 'rgba(6,24,22,0.9)';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // ── nose ──
  const nose = () => {
    ctx.beginPath();
    ctx.moveTo(150, 113);
    ctx.bezierCurveTo(149, 104, 171, 104, 170, 113);
    ctx.bezierCurveTo(171, 120, 165, 124, 160, 124);
    ctx.bezierCurveTo(155, 124, 149, 120, 150, 113);
    ctx.closePath();
  };
  shape(ctx, nose, lin(ctx, 150, 104, 170, 124, [
    [0, C.skinHi],
    [0.45, C.skinLit],
    [1, C.skin],
  ]), { stroke: 'rgba(7,28,25,0.8)', lw: 1.5 });
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(160 + side * 6, 118, 2.8, 1.8, side * 0.3, 0, TAU);
    ctx.fillStyle = 'rgba(4,16,15,0.95)';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(155, 110, 4, 2, -0.22, 0, TAU);
  ctx.fillStyle = 'rgba(190,236,220,0.45)';
  ctx.fill();

  // ── mouth ──
  const mo = R.mouth;
  const mTop = 126;
  const mh = 3 + mo * 13;
  const mouth = () => {
    ctx.beginPath();
    ctx.moveTo(136, mTop);
    ctx.quadraticCurveTo(160, mTop - 4, 184, mTop);
    ctx.quadraticCurveTo(181, mTop + mh, 160, mTop + mh + 2.5);
    ctx.quadraticCurveTo(139, mTop + mh, 136, mTop);
    ctx.closePath();
  };
  ctx.save();
  mouth();
  ctx.fillStyle = lin(ctx, 160, mTop, 160, mTop + mh + 3, [
    [0, '#4d0714'],
    [0.55, C.redDeep],
    [1, '#0e0106'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#05100d';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  clipTo(ctx, mouth, (c) => {
    for (let i = 0; i < 6; i++) {
      const x = 138 + i * 7.6;
      c.beginPath();
      c.moveTo(x, mTop - 5);
      c.lineTo(x + 4.6, mTop - 5);
      c.lineTo(x + 3.6, mTop + 2);
      c.lineTo(x + 1, mTop + 2);
      c.closePath();
      c.fillStyle = C.mintHi;
      c.fill();
    }
    for (let i = 0; i < 5; i++) {
      const x = 141 + i * 7.6;
      c.beginPath();
      c.moveTo(x, mTop + mh + 6);
      c.lineTo(x + 4, mTop + mh + 6);
      c.lineTo(x + 3.4, mTop + mh + 1.4);
      c.lineTo(x + 0.6, mTop + mh + 1.4);
      c.closePath();
      c.fillStyle = 'rgba(230,255,247,0.94)';
      c.fill();
    }
    if (mo > 0.2) {
      c.beginPath();
      c.ellipse(160, mTop + mh + 0.5, 11, 2.6 + mo * 2.6, 0, 0, TAU);
      c.fillStyle = 'rgba(217,58,68,0.85)';
      c.fill();
    }
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.fillRect(130, mTop + mh * 0.55, 60, mh * 0.5 + 4);
  });
  ctx.restore();

  // ── tusks ──
  for (const side of [-1, 1]) {
    const x = 160 + side * 24;
    const tusk = () => {
      ctx.beginPath();
      ctx.moveTo(x, mTop + 6);
      ctx.bezierCurveTo(x + side * 5, mTop - 4, x + side * 6, mTop - 13, x + side * 2, mTop - 18);
      ctx.bezierCurveTo(x + side * 1, mTop - 10, x - side * 1, mTop - 2, x - side * 3, mTop + 5);
      ctx.closePath();
    };
    shape(ctx, tusk, lin(ctx, x, mTop + 6, x + side * 4, mTop - 18, [
      [0, C.skinHi],
      [0.5, C.mintLit],
      [1, '#ffffff'],
    ]), { stroke: 'rgba(7,26,23,0.6)', lw: 1.1 });
  }

  // ── moustache ──
  for (const side of [-1, 1]) {
    const m = () => {
      ctx.beginPath();
      ctx.moveTo(160 - side * 2, 122);
      ctx.bezierCurveTo(160 + side * 10, 117, 160 + side * 22, 121, 160 + side * 27, 132);
      ctx.bezierCurveTo(160 + side * 20, 128, 160 + side * 14, 128, 160 + side * 8, 131);
      ctx.bezierCurveTo(160 + side * 5, 130, 160 + side * 2, 126, 160 - side * 2, 122);
      ctx.closePath();
    };
    shape(ctx, m, lin(ctx, 160, 117, 160 + side * 27, 132, [
      [0, '#ffffff'],
      [0.45, C.mintHi],
      [0.8, C.mintLit],
      [1, C.mintMid],
    ]), { stroke: 'rgba(14,44,38,0.5)', lw: 1.2 });
  }

  // ── beard ──
  const strands = [
    [-10, 136, -11.5, 142, -8, 147],
    [-3.5, 138, -4, 144, -2.6, 150],
    [2.5, 138, 3, 144, 1.8, 150],
    [9, 136, 11, 142, 7.4, 147],
  ];
  strands.forEach(([x0, y0, x1, y1, x2, y2]) => {
    const b = () => {
      ctx.beginPath();
      ctx.moveTo(160 + x0 - 4, y0 - 3);
      ctx.bezierCurveTo(160 + x1 - 4.4, y1, 160 + x2 - 2.6, y2 - 4, 160 + x2, y2);
      ctx.bezierCurveTo(160 + x2 + 2.6, y2 - 4, 160 + x1 + 4.4, y1, 160 + x0 + 4, y0 - 3);
      ctx.closePath();
    };
    shape(ctx, b, lin(ctx, 160 + x0, y0, 160 + x2, y2, [
      [0, '#ffffff'],
      [0.4, C.mintHi],
      [0.8, C.mintLit],
      [1, C.mintMid],
    ]), { stroke: 'rgba(14,44,38,0.5)', lw: 0.9 });
  });

  // ── gill fins ──
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(160 + side * 35, 106);
    ctx.rotate(side * 0.45);
    const fin = () => {
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.bezierCurveTo(side * 10, -11, side * 15, 0, side * 11, 12);
      ctx.bezierCurveTo(side * 8, 5, side * 4, 1, 0, 0);
      ctx.closePath();
    };
    shape(ctx, fin, lin(ctx, 0, -9, side * 14, 12, [
      [0, C.skinLit],
      [0.55, C.skin],
      [1, C.skinShade],
    ]), { lw: 1.6 });
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(side * 2, -4 + i * 3.4);
      ctx.quadraticCurveTo(side * 8, -3 + i * 3.8, side * 11, 1 + i * 3.4);
      ctx.strokeStyle = 'rgba(160,214,196,0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ── HAT ─────────────────────────────────────────────────────
function drawHat(ctx, R) {
  // underside (dark, casts the shadow on the face)
  const under = () => {
    ctx.beginPath();
    ctx.moveTo(92, 68);
    ctx.bezierCurveTo(110, 80, 138, 86, 160, 86);
    ctx.bezierCurveTo(182, 86, 210, 80, 228, 68);
    ctx.lineTo(224, 80);
    ctx.bezierCurveTo(202, 92, 182, 96, 160, 96);
    ctx.bezierCurveTo(138, 96, 118, 92, 96, 80);
    ctx.closePath();
  };
  shape(ctx, under, lin(ctx, 160, 64, 160, 90, [
    [0, '#1c3a4c'],
    [0.6, '#091a25'],
    [1, '#030a11'],
  ]), { lw: 1.8 });

  // brim top
  shape(ctx, path.hatBrim, lin(ctx, 160, 44, 160, 82, [
    [0, C.robeLit],
    [0.35, C.robe],
    [0.7, C.robeMid],
    [1, C.robeShade],
  ]), { lw: 2.4 });

  shade(ctx, path.hatBrim, (c) => {
    // woven radial lines
    for (let i = 0; i < 30; i++) {
      const a = Math.PI + (i / 29) * Math.PI;
      const x = 160 + Math.cos(a) * 66;
      const y = 66 + Math.sin(a) * 20;
      c.beginPath();
      c.moveTo(160, 54);
      c.lineTo(x, y);
      c.strokeStyle = i % 3 ? 'rgba(160,240,232,0.12)' : 'rgba(3,12,18,0.35)';
      c.lineWidth = i % 3 ? 0.9 : 1.4;
      c.stroke();
    }
    // concentric weave
    for (let r = 10; r < 68; r += 9) {
      c.beginPath();
      c.ellipse(160, 62, r, r * 0.30, 0, 0, Math.PI);
      c.strokeStyle = 'rgba(3,12,18,0.2)';
      c.lineWidth = 1;
      c.stroke();
    }
    // lit left tip / dark right tip
    c.fillStyle = lin(c, 104, 52, 146, 82, [
      [0, 'rgba(200,252,248,0.45)'],
      [1, 'rgba(200,252,248,0)'],
    ]);
    c.fillRect(94, 46, 54, 44);
    c.fillStyle = lin(c, 176, 50, 220, 82, [
      [0, 'rgba(2,8,14,0)'],
      [1, 'rgba(2,8,14,0.6)'],
    ]);
    c.fillRect(174, 46, 54, 44);
  });

  // tattered nicks
  ctx.save();
  ctx.strokeStyle = '#05101a';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  [[106, 78, 109, 72], [124, 85, 127, 79], [196, 85, 193, 79], [214, 78, 211, 72]]
    .forEach(([x0, y0, x1, y1]) => {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    });
  ctx.restore();

  // crown
  shape(ctx, path.hatCrown, lin(ctx, 136, 14, 188, 64, [
    [0, C.robeHi],
    [0.22, C.robeLit],
    [0.55, C.robe],
    [0.82, C.robeMid],
    [1, C.robeShade],
  ]), { lw: 2.4 });

  shade(ctx, path.hatCrown, (c) => {
    for (let i = -6; i <= 6; i++) {
      c.beginPath();
      c.moveTo(160 + i * 1.4, 6);
      c.quadraticCurveTo(160 + i * 4, 32, 160 + i * 5.8, 64);
      c.strokeStyle = i % 2 ? 'rgba(3,12,18,0.22)' : 'rgba(200,252,248,0.16)';
      c.lineWidth = 1.1;
      c.stroke();
    }
    for (let y = 20; y < 64; y += 6) {
      c.beginPath();
      c.ellipse(160, y, 30 - (64 - y) * 0.32, 6, 0, 0.15, Math.PI - 0.15);
      c.strokeStyle = 'rgba(3,12,18,0.16)';
      c.lineWidth = 0.9;
      c.stroke();
    }
    c.fillStyle = lin(c, 144, 8, 172, 64, [
      [0, 'rgba(220,255,252,0.55)'],
      [0.4, 'rgba(180,246,240,0.16)'],
      [1, 'rgba(180,246,240,0)'],
    ]);
    c.fillRect(128, 2, 44, 66);
    c.fillStyle = lin(c, 172, 16, 196, 66, [
      [0, 'rgba(2,8,14,0)'],
      [1, 'rgba(2,8,14,0.62)'],
    ]);
    c.fillRect(168, 6, 32, 62);
  });

  // purple band
  const band = () => {
    ctx.beginPath();
    ctx.moveTo(130, 52);
    ctx.bezierCurveTo(142, 60, 178, 60, 190, 52);
    ctx.lineTo(191, 61);
    ctx.bezierCurveTo(178, 69, 142, 69, 129, 61);
    ctx.closePath();
  };
  shape(ctx, band, lin(ctx, 128, 50, 192, 70, [
    [0, C.purpleLit],
    [0.32, C.purple],
    [0.7, C.purpleShade],
    [1, '#1a1026'],
  ]), { lw: 2 });
  ctx.beginPath();
  ctx.moveTo(133, 54.4);
  ctx.bezierCurveTo(144, 62, 176, 62, 187, 54.4);
  ctx.strokeStyle = 'rgba(220,196,242,0.55)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const x = 137 + i * 11.6;
    const t = (i / 4) * Math.PI;
    const y = 56 + Math.sin(t) * 3.4;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, TAU);
    ctx.fillStyle = lin(ctx, x, y - 2.4, x, y + 2.4, [[0, C.goldHi], [0.55, C.gold], [1, C.goldShade]]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(36,28,6,0.85)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // cord + bead
  ctx.beginPath();
  ctx.moveTo(132, 60);
  ctx.bezierCurveTo(127, 72, 133, 82, 127, 92);
  ctx.strokeStyle = 'rgba(216,183,75,0.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(126, 93.5, 2.6, 0, TAU);
  ctx.fillStyle = lin(ctx, 124, 91, 129, 96, [[0, C.goldHi], [0.5, C.gold], [1, C.goldShade]]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(36,28,6,0.9)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

// ── CORAL ORB ───────────────────────────────────────────────
function drawOrb(ctx, R) {
  const cx = 160 + R.orbX;
  const cy = 200 + R.orbY;
  const s = R.orbScale;

  ctx.save();

  // leather socket
  const socket = () => {
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 35 * s, 33 * s, 0, 0, TAU);
  };
  shape(ctx, socket, lin(ctx, cx - 24, cy - 24, cx + 28, cy + 34, [
    [0, '#8a1128'],
    [0.35, C.redShade],
    [0.72, C.redDeep],
    [1, '#160208'],
  ]), { stroke: '#0c0206', lw: 2.2 });
  shade(ctx, socket, (c) => {
    c.beginPath();
    c.ellipse(cx, cy + 3, 36 * s, 34 * s, 0, Math.PI * 0.68, Math.PI * 1.82);
    c.strokeStyle = 'rgba(251,127,116,0.55)';
    c.lineWidth = 1.8;
    c.stroke();
    c.beginPath();
    c.ellipse(cx, cy + 3, 35 * s, 33 * s, 0, Math.PI * 0.02, Math.PI * 0.52);
    c.strokeStyle = 'rgba(20,2,6,0.85)';
    c.lineWidth = 2.6;
    c.stroke();
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU;
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * 30 * s, cy + 3 + Math.sin(a) * 29 * s);
      c.lineTo(cx + Math.cos(a) * 33 * s, cy + 3 + Math.sin(a) * 32 * s);
      c.strokeStyle = 'rgba(255,167,155,0.3)';
      c.lineWidth = 1;
      c.stroke();
    }
  });

  // inner shadow then the orb
  ctx.beginPath();
  ctx.ellipse(cx, cy, 28 * s, 27 * s, 0, 0, TAU);
  ctx.fillStyle = '#190208';
  ctx.fill();

  const orb = () => {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 24.5 * s, 23.5 * s, 0, 0, TAU);
  };
  orb();
  const g = ctx.createRadialGradient(cx - 10 * s, cy - 11 * s, 1, cx + 3 * s, cy + 4 * s, 38 * s);
  g.addColorStop(0, '#fff0e8');
  g.addColorStop(0.12, '#ffc3b6');
  g.addColorStop(0.3, C.redLit);
  g.addColorStop(0.52, C.red);
  g.addColorStop(0.76, C.redMid);
  g.addColorStop(0.92, '#711020');
  g.addColorStop(1, '#4d0714');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = '#3d060f';
  ctx.lineWidth = 2;
  ctx.stroke();

  shade(ctx, orb, (c) => {
    // faceted coral core
    const facets = [
      [[cx, cy - 27], [cx + 18, cy - 10], [cx + 7, cy + 9]],
      [[cx, cy - 27], [cx - 18, cy - 12], [cx - 6, cy + 7]],
      [[cx + 18, cy - 10], [cx + 27, cy + 14], [cx + 7, cy + 9]],
      [[cx - 18, cy - 12], [cx - 25, cy + 16], [cx - 6, cy + 7]],
      [[cx + 7, cy + 9], [cx + 27, cy + 14], [cx + 2, cy + 27]],
      [[cx - 6, cy + 7], [cx - 25, cy + 16], [cx + 2, cy + 27]],
      [[cx + 7, cy + 9], [cx + 2, cy + 27], [cx - 6, cy + 7]],
    ];
    facets.forEach((poly, i) => {
      c.beginPath();
      poly.forEach(([x, y], j) => (j ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fillStyle = [
        'rgba(255,190,178,0.26)', 'rgba(77,7,20,0.22)', 'rgba(251,127,116,0.18)',
        'rgba(77,7,20,0.28)', 'rgba(255,190,178,0.16)', 'rgba(43,4,12,0.32)', 'rgba(255,208,196,0.24)',
      ][i];
      c.fill();
      c.strokeStyle = i % 2 ? 'rgba(77,7,20,0.3)' : 'rgba(255,208,196,0.28)';
      c.lineWidth = 1.2;
      c.stroke();
    });
    // specular cluster
    c.beginPath();
    c.ellipse(cx - 11 * s, cy - 12 * s, 9 * s, 6 * s, -0.55, 0, TAU);
    c.fillStyle = 'rgba(255,255,255,0.95)';
    c.fill();
    c.beginPath();
    c.ellipse(cx - 14 * s, cy - 14 * s, 3.2 * s, 2.2 * s, -0.42, 0, TAU);
    c.fillStyle = '#ffffff';
    c.fill();
    [[-3, -19, 1.7], [2, -17, 1.1], [-19, -3, 1.1], [-5, 11, 0.9], [13, 7, 0.8], [-14, 14, 0.7]]
      .forEach(([dx, dy, r]) => {
        c.beginPath();
        c.arc(cx + dx * s, cy + dy * s, r * s, 0, TAU);
        c.fillStyle = 'rgba(255,240,232,0.95)';
        c.fill();
      });
    // bounce light
    c.beginPath();
    c.ellipse(cx + 1, cy + 3, 24 * s, 23 * s, 0, Math.PI * 0.16, Math.PI * 0.84);
    c.strokeStyle = 'rgba(255,190,178,0.45)';
    c.lineWidth = 2.4;
    c.stroke();
  });

  // aura
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.14 + R.glow * 0.26;
  const aura = ctx.createRadialGradient(cx, cy, 22 * s, cx, cy, 62 * s);
  aura.addColorStop(0, 'rgba(217,58,68,0.65)');
  aura.addColorStop(0.55, 'rgba(150,26,43,0.18)');
  aura.addColorStop(1, 'rgba(150,26,43,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, 62 * s, 0, TAU);
  ctx.fillStyle = aura;
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ── RIM LIGHT ───────────────────────────────────────────────
function drawRimLight(ctx) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // cool moon rim, left silhouette
  ctx.beginPath();
  ctx.moveTo(114, 146);
  ctx.bezierCurveTo(98, 166, 90, 190, 90, 214);
  ctx.strokeStyle = 'rgba(120,225,215,0.26)';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(122, 56);
  ctx.bezierCurveTo(112, 60, 106, 64, 102, 70);
  ctx.strokeStyle = 'rgba(200,252,248,0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(153, 16);
  ctx.bezierCurveTo(148, 30, 140, 44, 133, 56);
  ctx.strokeStyle = 'rgba(230,255,252,0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // warm bounce, right side
  ctx.beginPath();
  ctx.moveTo(224, 160);
  ctx.bezierCurveTo(234, 182, 232, 210, 226, 232);
  ctx.strokeStyle = 'rgba(251,127,116,0.14)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}
