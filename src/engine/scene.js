// ─────────────────────────────────────────────────────────────
//  THE DEEP REEF — world art
//  Drawn with the same palette & flat-shading language as the
//  Warden, at the same 320×360 logical resolution, so character
//  and world composite into one coherent pixel scene.
// ─────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;

const C = {
  deep: '#04101a',
  water0: '#061a26',
  water1: '#0a2b3b',
  water2: '#114457',
  water3: '#1a6a7c',
  water4: '#2a95a1',
  glow: '#6ed2d0',
  pale: '#bdf6ee',
  sand: '#27485a',
  sandLit: '#376176',
  red1: '#961a2b',
  red2: '#d93a44',
  red3: '#fb7f74',
  gold: '#d8b74b',
  purple: '#5d3d7c',
  rock: '#0d1720',
  rockLit: '#213a48',
};

// deterministic pseudo-random so the scene is stable frame to frame
const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const KELP = (() => {
  const r = rng(7);
  return Array.from({ length: 7 }, (_, i) => ({
    x: 14 + i * 47 + r() * 18,
    h: 90 + r() * 120,
    w: 4 + r() * 4,
    phase: r() * TAU,
    speed: 0.5 + r() * 0.6,
    hue: r(),
  }));
})();

const CORALS = (() => {
  const r = rng(23);
  return Array.from({ length: 9 }, (_, i) => ({
    x: 8 + i * 38 + r() * 14,
    h: 18 + r() * 34,
    phase: r() * TAU,
    kind: Math.floor(r() * 3),
  }));
})();

const MOTES = (() => {
  const r = rng(91);
  return Array.from({ length: 42 }, () => ({
    x: r() * 320,
    y: r() * 360,
    r: 0.6 + r() * 1.5,
    sp: 4 + r() * 14,
    ph: r() * TAU,
  }));
})();

const BUBBLES = (() => {
  const r = rng(55);
  return Array.from({ length: 16 }, () => ({
    x: r() * 320,
    y: r() * 360,
    r: 1 + r() * 2.6,
    sp: 12 + r() * 26,
    ph: r() * TAU,
  }));
})();

const FISH = (() => {
  const r = rng(17);
  return Array.from({ length: 5 }, (_, i) => ({
    y: 90 + r() * 150,
    x: r() * 400,
    sp: 8 + r() * 16,
    s: 0.6 + r() * 0.8,
    dir: i % 2 ? 1 : -1,
    ph: r() * TAU,
  }));
})();

// ── background pass ─────────────────────────────────────────
export function drawReefBackdrop(ctx, t) {
  // water column
  const g = ctx.createLinearGradient(0, 0, 0, 360);
  g.addColorStop(0, C.water2);
  g.addColorStop(0.28, C.water1);
  g.addColorStop(0.72, C.water0);
  g.addColorStop(1, C.deep);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 320, 360);

  // light shafts from the surface
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const x = 26 + i * 46;
    const sway = Math.sin(t * 0.35 + i) * 12;
    const a = 0.05 + 0.035 * (0.5 + 0.5 * Math.sin(t * 0.5 + i * 1.7));
    const grad = ctx.createLinearGradient(x + sway, 0, x + sway + 26, 340);
    grad.addColorStop(0, `rgba(110,210,208,${a})`);
    grad.addColorStop(0.4, `rgba(56,169,177,${a * 0.6})`);
    grad.addColorStop(1, 'rgba(56,169,177,0)');
    ctx.beginPath();
    ctx.moveTo(x + sway - 12, 0);
    ctx.lineTo(x + sway + 16, 0);
    ctx.lineTo(x + sway + 62, 350);
    ctx.lineTo(x + sway + 6, 350);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();

  // distant reef silhouettes (parallax layer 1)
  drawSilhouette(ctx, 0.18, 300, 62, C.water0, 0.9);
  drawSilhouette(ctx, 0.34, 262, 74, C.rock, 1);

  // fish silhouettes
  for (const f of FISH) {
    const span = 420;
    let x = ((f.x + t * f.sp * f.dir) % span + span) % span - 50;
    const y = f.y + Math.sin(t * 0.7 + f.ph) * 6;
    drawFish(ctx, x, y, f.s, f.dir, C.water1);
  }

  // sand floor
  const sg = ctx.createLinearGradient(0, 300, 0, 360);
  sg.addColorStop(0, C.sand);
  sg.addColorStop(1, C.rock);
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.lineTo(0, 318);
  ctx.bezierCurveTo(60, 306, 120, 322, 180, 312);
  ctx.bezierCurveTo(240, 302, 280, 316, 320, 308);
  ctx.lineTo(320, 360);
  ctx.closePath();
  ctx.fillStyle = sg;
  ctx.fill();
  // sand lit crest
  ctx.beginPath();
  ctx.moveTo(0, 318);
  ctx.bezierCurveTo(60, 306, 120, 322, 180, 312);
  ctx.bezierCurveTo(240, 302, 280, 316, 320, 308);
  ctx.strokeStyle = 'rgba(102,160,178,0.5)';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // coral clusters on the floor
  for (const c of CORALS) {
    drawCoral(ctx, c, t);
  }

  // kelp
  for (const k of KELP) {
    drawKelp(ctx, k, t);
  }

  // caustics shimmering across the sand
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.16;
  for (let i = 0; i < 6; i++) {
    const y = 316 + i * 7;
    ctx.beginPath();
    for (let x = 0; x <= 320; x += 8) {
      const yy = y + Math.sin(x * 0.06 + t * 1.3 + i) * 2.2;
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.strokeStyle = C.glow;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawSilhouette(ctx, alpha, baseY, height, color, scale) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  const r = rng(Math.floor(baseY * 13));
  for (let i = 0; i < 6; i++) {
    const x = i * 58 + r() * 26;
    const h = height * (0.5 + r() * 0.7);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.bezierCurveTo(x + 8, baseY - h * 0.5, x + 18, baseY - h, x + 26, baseY - h * 1.1);
    ctx.bezierCurveTo(x + 34, baseY - h, x + 40, baseY - h * 0.4, x + 48, baseY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawFish(ctx, x, y, s, dir, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir * s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 3.4, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(-13, -3.4);
  ctx.lineTo(-13, 3.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawKelp(ctx, k, t) {
  const lit = k.hue > 0.5 ? C.water3 : C.red2;
  const dark = k.hue > 0.5 ? C.water1 : C.red1;
  const tip = k.hue > 0.5 ? C.glow : C.red3;
  ctx.save();
  // a stack of curved blades, each with a hard lit edge
  for (let i = 0; i < 9; i++) {
    const p = i / 9;
    const p2 = (i + 1) / 9;
    const y1 = 366 - k.h * p;
    const y2 = 366 - k.h * p2;
    const d1 = Math.sin(t * k.speed + k.phase + p * 2.1) * 13 * p;
    const d2 = Math.sin(t * k.speed + k.phase + p2 * 2.1) * 13 * p2;
    const w1 = k.w * (1 - p * 0.72);
    const w2 = k.w * (1 - p2 * 0.72);
    ctx.beginPath();
    ctx.moveTo(k.x + d1 - w1, y1);
    ctx.quadraticCurveTo(k.x + d1 - w1 * 0.2, (y1 + y2) / 2, k.x + d2 - w2, y2);
    ctx.lineTo(k.x + d2, y2 - w2 * 0.9);
    ctx.lineTo(k.x + d2 + w2, y2);
    ctx.quadraticCurveTo(k.x + d1 + w1 * 0.2, (y1 + y2) / 2, k.x + d1 + w1, y1);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, k.x - 8, y1, k.x + 10, y2, [
      [0, dark],
      [0.55, lit],
      [1, p > 0.7 ? tip : lit],
    ]);
    ctx.fill();
  }
  ctx.restore();
}

function drawCoral(ctx, c, t) {
  const sway = Math.sin(t * 0.8 + c.phase) * 2.2;
  ctx.save();
  ctx.translate(c.x, 342);

  if (c.kind === 0) {
    // sea fan: branching fingers with pale tips
    ctx.strokeStyle = C.red1;
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(0, -c.h * 0.34);
    ctx.stroke();
    for (let i = -3; i <= 3; i++) {
      const spread = i * 8;
      const h = c.h * (0.62 + 0.38 * Math.cos(i * 0.5));
      ctx.beginPath();
      ctx.moveTo(0, -c.h * 0.3);
      ctx.quadraticCurveTo(spread * 0.55 + sway, -c.h * 0.62, spread + sway, -h);
      ctx.strokeStyle = i % 2 ? C.red2 : C.red1;
      ctx.lineWidth = i % 2 ? 2 : 2.8;
      ctx.stroke();
      // pale tip dots
      ctx.beginPath();
      ctx.arc(spread + sway, -h, 1.4, 0, TAU);
      ctx.fillStyle = C.red3;
      ctx.fill();
    }
  } else if (c.kind === 1) {
    // tube sponges: rounded mouths
    for (let i = -1; i <= 1; i++) {
      const hh = c.h * (1 - Math.abs(i) * 0.3);
      const bx = i * 7 + sway * 0.3;
      ctx.beginPath();
      ctx.moveTo(bx - 4, 4);
      ctx.quadraticCurveTo(bx - 4.6, -hh * 0.6, bx - 3.4, -hh);
      ctx.quadraticCurveTo(bx, -hh - 3.4, bx + 3.4, -hh);
      ctx.quadraticCurveTo(bx + 4.6, -hh * 0.6, bx + 4, 4);
      ctx.closePath();
      ctx.fillStyle = i === 0 ? C.red2 : C.red1;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(bx, -hh, 3.2, 1.8, 0, 0, TAU);
      ctx.fillStyle = '#2b040c';
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(bx - 1.2, -hh * 0.55, 1.2, hh * 0.28, 0, 0, TAU);
      ctx.fillStyle = 'rgba(251,127,116,0.35)';
      ctx.fill();
    }
  } else {
    // anemone: waving tentacles
    ctx.beginPath();
    ctx.ellipse(0, 0, c.h * 0.42, c.h * 0.2, 0, Math.PI, TAU);
    ctx.fillStyle = C.purple;
    ctx.fill();
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + (i / 8) * Math.PI;
      const bx = Math.cos(a) * c.h * 0.34;
      const bh = c.h * (0.4 + 0.35 * Math.abs(Math.sin(i * 1.7)));
      const wob = Math.sin(t * 1.4 + i + c.phase) * 2.4;
      ctx.beginPath();
      ctx.moveTo(bx, -2);
      ctx.quadraticCurveTo(bx + wob * 0.6, -bh * 0.6, bx + wob, -bh);
      ctx.strokeStyle = i % 2 ? '#a37cc4' : '#7f5aa2';
      ctx.lineWidth = 1.4;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx + wob, -bh, 1.2, 0, TAU);
      ctx.fillStyle = '#e2fff2';
      ctx.fill();
    }
  }
  ctx.restore();
}

// ── foreground pass (over the character) ───────────────────
export function drawReefForeground(ctx, t) {
  // corner rocks framing the stage
  ctx.save();
  const rockGrad = ctx.createLinearGradient(0, 296, 0, 360);
  rockGrad.addColorStop(0, '#1b3341');
  rockGrad.addColorStop(0.35, '#0b1c26');
  rockGrad.addColorStop(1, '#030a10');
  for (const side of [-1, 1]) {
    const x = side < 0 ? 0 : 320;
    const dir = side < 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(x, 362);
    ctx.lineTo(x, 300);
    ctx.bezierCurveTo(x + dir * 20, 296, x + dir * 32, 306, x + dir * 36, 318);
    ctx.bezierCurveTo(x + dir * 46, 326, x + dir * 48, 344, x + dir * 46, 362);
    ctx.closePath();
    ctx.fillStyle = rockGrad;
    ctx.fill();
    // moonlit crest
    ctx.beginPath();
    ctx.moveTo(x + dir * 2, 302);
    ctx.bezierCurveTo(x + dir * 20, 297, x + dir * 31, 307, x + dir * 35, 319);
    ctx.strokeStyle = 'rgba(102,160,178,0.45)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  ctx.restore();

  // floating motes
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.55;
  for (const m of MOTES) {
    const y = ((m.y - t * m.sp) % 360 + 360) % 360;
    const x = m.x + Math.sin(t * 0.8 + m.ph) * 5;
    ctx.beginPath();
    ctx.arc(x, y, m.r, 0, TAU);
    ctx.fillStyle = m.r > 1.4 ? C.pale : C.glow;
    ctx.fill();
  }
  ctx.restore();

  // vignette
  ctx.save();
  const vg = ctx.createRadialGradient(160, 180, 90, 160, 190, 250);
  vg.addColorStop(0, 'rgba(2,8,14,0)');
  vg.addColorStop(0.7, 'rgba(2,8,14,0.35)');
  vg.addColorStop(1, 'rgba(2,8,14,0.75)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, 320, 360);
  ctx.restore();

  // bubbles
  for (const b of BUBBLES) {
    const y = ((b.y - t * b.sp) % 360 + 360) % 360;
    const x = b.x + Math.sin(t * 1.6 + b.ph) * 4;
    ctx.beginPath();
    ctx.arc(x, y, b.r, 0, TAU);
    ctx.fillStyle = 'rgba(189,246,238,0.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - b.r * 0.3, y - b.r * 0.3, b.r * 0.35, 0, TAU);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();
  }
}

const lin = (ctx, x0, y0, x1, y1, stops) => {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
};
