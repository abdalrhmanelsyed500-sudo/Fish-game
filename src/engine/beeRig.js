// ─────────────────────────────────────────────────────────────
//  BEE RIG — platformer animation set
//  A pose is a flat bag of channels; an animation is a pure
//  function of local time, so runs cycle, one-shots (jump,
//  land, sting, hurt) ease exactly the same way every time.
//  Angles are in degrees.
// ─────────────────────────────────────────────────────────────

export const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
export const smoothstep = (a, b, x) => smooth((x - a) / (b - a));
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const bell = (t, a, b) => (t <= a || t >= b ? 0 : Math.sin(((t - a) / (b - a)) * Math.PI));

export const basePose = () => ({
  x: 0, y: 0, scale: 1,
  lean: 0, bodyStretch: 1,
  abdomenRot: 0, abdomenSquash: 1, abdomenStretch: 1,
  headRot: 0, headX: 0, headY: 0,
  antennaSway: 0, antennaSpring: 0,
  wingSpread: 0, wingFlap: 0, wingSpeed: 0, wingPhase: 0,
  armNearRot: 0, armFarRot: 0, elbowNear: 0, elbowFar: 0,
  handNearRot: 0, handFarRot: 0,
  legNearRot: 0, legFarRot: 0, kneeNear: 0, kneeFar: 0,
  footNear: 0, footFar: 0,
  eyeOpen: 1, eyeLookX: 0.34, eyeLookY: 0, brow: 0.4, mouth: 0.12,
});

const KEYS = Object.keys(basePose());

export function blendPose(a, b, t) {
  const out = {};
  for (const k of KEYS) out[k] = lerp(a[k] ?? 0, b[k] ?? 0, t);
  return out;
}
export function approachPose(cur, target, dt, time = 0.18) {
  const k = 1 - Math.exp(-dt / (time * 0.3));
  const out = {};
  for (const k of KEYS) out[k] = lerp(cur[k] ?? 0, target[k] ?? 0, k);
  return out;
}

// blink: hard 90ms close, soft open, deterministic
export function blinkAt(t, period, offset = 0) {
  const u = ((t + offset) % period) / period;
  const p = u * period;
  if (p < 0.09) return 0.12;
  if (p < 0.16) return lerp(0.12, 1, (p - 0.09) / 0.07);
  return 1;
}

// ── shared motion ──────────────────────────────────────────
function breathe(P, u, amt = 1) {
  const s = Math.sin(u * TAU);
  P.bodyStretch = 1 + s * 0.012 * amt;
  P.headY = -s * 0.5 * amt;
  P.antennaSpring = s * 0.28 * amt;
  P.antennaSway = Math.sin(u * TAU + 0.7) * 0.22 * amt;
  P.wingSpread = 0.26 + Math.sin(u * TAU + 1.3) * 0.035;
  P.wingFlap = -0.14 + Math.sin(u * TAU + 0.4) * 0.06;
  P.wingSpeed = Math.abs(Math.cos(u * TAU)) * 0.5;
  P.armNearRot = 2 + s * 1.4;
  P.armFarRot = 1 + s * 1.1;
  P.elbowNear = -2;
  P.elbowFar = 0;
  P.mouth = 0.1 + Math.sin(u * TAU + 2) * 0.04;
}

// ── IDLE ───────────────────────────────────────────────────
function idle(u) {
  const P = basePose();
  breathe(P, u, 1);
  P.y = Math.sin(u * TAU) * 0.55;
  P.lean = 1.6 + Math.sin(u * TAU + 0.4) * 0.8;
  P.abdomenRot = Math.sin(u * TAU + 1.1) * 1.2;
  P.headRot = Math.sin(u * TAU + 0.55) * 1.5;
  P.eyeOpen = blinkAt(u * 3.2, 3.2, 1.2);
  P.eyeLookX = 0.34 + Math.sin(u * TAU * 0.5) * 0.14;
  P.eyeLookY = Math.sin(u * TAU * 0.5 + 1) * 0.1;
  P.legNearRot = 3.2;
  P.legFarRot = -3.4;
  P.kneeNear = 2.0;
  P.kneeFar = 3.0;
  return P;
}

// ── WALK ───────────────────────────────────────────────────
function walkCycle(P, u, amp = 1) {
  const s = Math.sin(u * TAU);
  const c = Math.cos(u * TAU);
  // legs
  P.legNearRot = s * 26 * amp;
  P.legFarRot = Math.sin(u * TAU + Math.PI) * 26 * amp;
  P.kneeNear = Math.max(0, -c) * 26 * amp + 3;
  P.kneeFar = Math.max(0, c) * 26 * amp + 3;
  P.footNear = -s * 12 * amp;
  P.footFar = s * 12 * amp;
  // body: bob twice per stride
  P.y = -Math.abs(Math.sin(u * TAU)) * 2.2 * amp + 1.1 * amp;
  P.bodyStretch = 1 + Math.sin(u * TAU * 2) * 0.008;
  P.lean = 3.5 * amp;
  P.abdomenRot = -s * 2.2 * amp;
  P.headRot = -2.4 * amp + c * 1.4 * amp;
  P.headY = Math.abs(s) * 0.6 * amp;
  // arms counter-swing
  P.armNearRot = -s * 20 * amp;
  P.armFarRot = s * 20 * amp;
  P.elbowNear = 6 + Math.max(0, s) * 12 * amp;
  P.elbowFar = 6 + Math.max(0, -s) * 12 * amp;
  P.antennaSpring = -s * 1.5 * amp;
  P.antennaSway = Math.sin(u * TAU + 1.4) * 0.6;
  // wings hum along
  P.wingSpread = 0.1;
  P.wingFlap = -0.12 + Math.sin(u * TAU) * 0.1;
  P.wingSpeed = 1.1;
  P.eyeOpen = blinkAt(u * 1.9, 1.9, 0.8);
  P.brow = 0.45;
  P.mouth = 0.14;
}

function walk(u) {
  const P = basePose();
  walkCycle(P, u, 1);
  return P;
}

function run(u) {
  const P = basePose();
  walkCycle(P, u, 1.65);
  P.lean = 12 + Math.sin(u * TAU) * 1.6;
  P.y = -Math.abs(Math.sin(u * TAU)) * 3.4 + 1.4;
  P.armNearRot = -Math.sin(u * TAU) * 34;
  P.armFarRot = Math.sin(u * TAU) * 34;
  P.elbowNear = 26;
  P.elbowFar = 26;
  P.headRot = -4 + Math.cos(u * TAU) * 1.4;
  P.wingSpread = 0.18;
  P.wingSpeed = 2.4;
  P.mouth = 0.24;
  P.brow = 0.7;
  return P;
}

// ── JUMP (one-shot) ────────────────────────────────────────
function jump(u) {
  const P = basePose();
  const crouch = smoothstep(0.0, 0.16, u) * (1 - smoothstep(0.16, 0.34, u));
  const rise = smoothstep(0.16, 0.5, u);
  const apex = smoothstep(0.5, 1.0, u);

  P.y = -rise * 16 + crouch * 5 - apex * 1.5;
  P.bodyStretch = 1 - crouch * 0.05 + rise * 0.04;
  P.lean = 6 * rise + 3 * crouch;
  P.legNearRot = -crouch * 8 + rise * 26;
  P.legFarRot = -crouch * 8 + rise * 12;
  P.kneeNear = crouch * 24 + rise * 34 - apex * 26;
  P.kneeFar = crouch * 24 + rise * 20 - apex * 18;
  P.footNear = rise * 16;
  P.armNearRot = -crouch * 14 - rise * 46 + apex * 12;
  P.armFarRot = -crouch * 10 - rise * 30 + apex * 8;
  P.elbowNear = 10 + rise * 16;
  P.headRot = -crouch * 2 - rise * 2.5;
  P.headY = crouch * 1.2;
  P.antennaSpring = -8 * crouch + 6 * rise;
  P.antennaSway = 0.5;
  P.wingSpread = 0.25 + rise * 0.6;
  P.wingFlap = -0.55 * rise - 0.2 * crouch;
  P.wingSpeed = 8 * rise;
  P.eyeOpen = 1 - crouch * 0.4;
  P.brow = 0.7;
  P.mouth = 0.3 + rise * 0.2;
  P.eyeLookY = -0.35 * rise;
  return P;
}

// ── FALL (loop) ────────────────────────────────────────────
function fall(u) {
  const P = basePose();
  const s = Math.sin(u * TAU);
  P.y = s * 0.8;
  P.lean = -7 + s * 1.6;
  P.bodyStretch = 1.015;
  P.legNearRot = 16 + s * 3;
  P.legFarRot = -12 - s * 3;
  P.kneeNear = 26 + s * 4;
  P.kneeFar = 18 - s * 4;
  P.footNear = -14;
  P.footFar = 12;
  P.armNearRot = -66 + s * 5;
  P.armFarRot = -54 - s * 5;
  P.elbowNear = 22;
  P.elbowFar = 16;
  P.headRot = 5 + s * 1.2;
  P.antennaSpring = -10 - s * 1.4;
  P.antennaSway = s * 0.7;
  P.wingSpread = 0.85;
  P.wingFlap = -0.35 + s * 0.25;
  P.wingSpeed = 4;
  P.eyeOpen = 0.86;
  P.brow = 0.8;
  P.mouth = 0.34;
  P.eyeLookY = 0.5;
  return P;
}

// ── LAND (one-shot) ────────────────────────────────────────
function land(u) {
  const P = basePose();
  const hit = Math.sin(clamp(u / 0.35) * Math.PI * 0.5);
  const settle = smoothstep(0.3, 1, u);
  const squash = hit * (1 - settle * 0.9);
  P.y = squash * 6;
  P.bodyStretch = 1 - squash * 0.10;
  P.lean = 2 + squash * 6;
  P.legNearRot = 8 + squash * 6;
  P.legFarRot = -10 - squash * 4;
  P.kneeNear = 8 + squash * 30;
  P.kneeFar = 12 + squash * 26;
  P.footNear = -squash * 8;
  P.footFar = squash * 6;
  P.armNearRot = 16 + squash * 26;
  P.armFarRot = 8 + squash * 18;
  P.elbowNear = 12 + squash * 14;
  P.headY = squash * 2.4;
  P.headRot = 3 + squash * 4;
  P.antennaSpring = -12 * squash + 6 * settle;
  P.wingSpread = 0.4 * (1 - settle) + 0.1;
  P.wingFlap = -0.5 * (1 - settle);
  P.wingSpeed = 3 * (1 - settle);
  P.eyeOpen = 1 - squash * 0.55;
  P.mouth = 0.2 + squash * 0.2;
  P.brow = 0.55;
  return P;
}

// ── FLY (loop) ─────────────────────────────────────────────
function fly(u) {
  const P = basePose();
  const s = Math.sin(u * TAU);
  const beat = Math.sin(u * TAU * 2.0);
  P.y = -3 + s * 2.2;
  P.lean = 1 + s * 1;
  P.bodyStretch = 1 + beat * 0.006;
  P.legNearRot = 14 + s * 3;
  P.legFarRot = 4 - s * 3;
  P.kneeNear = 22 + s * 4;
  P.kneeFar = 16 - s * 4;
  P.footNear = -18;
  P.footFar = -10;
  P.armNearRot = -18 + s * 5;
  P.armFarRot = -10 - s * 5;
  P.elbowNear = 14;
  P.elbowFar = 10;
  P.headRot = -2 + s * 0.8;
  P.antennaSpring = -6 + beat * 2.2;
  P.antennaSway = s * 0.5;
  P.wingSpread = 1;
  P.wingFlap = beat * 0.62;
  P.wingSpeed = 9;
  P.wingPhase = u * TAU * 4;
  P.eyeOpen = 0.95;
  P.brow = 0.5;
  P.mouth = 0.16;
  return P;
}

// ── STING (one-shot attack) ────────────────────────────────
function sting(u) {
  const P = basePose();
  const wind = bell(u, 0, 0.42) * 0 + smoothstep(0.05, 0.4, u) * (1 - smoothstep(0.4, 0.55, u));
  const thrust = smoothstep(0.42, 0.62, u) * (1 - smoothstep(0.62, 1, u));
  const back = smoothstep(0.62, 1, u);

  P.x = wind * -3 + thrust * 8 - back * 1;
  P.y = wind * 1.5 - thrust * 1;
  P.lean = -wind * 8 + thrust * 14 - back * 4;
  P.bodyStretch = 1 - wind * 0.03 + thrust * 0.05;
  P.abdomenRot = -wind * 10 + thrust * 16;
  P.headRot = wind * 4 - thrust * 8;
  P.headX = wind * -1 + thrust * 2;
  P.legNearRot = -wind * 4 + thrust * 10;
  P.legFarRot = -wind * 6 + thrust * 4;
  P.kneeNear = 6 + wind * 8 + thrust * 10;
  P.kneeFar = 8 + wind * 6;
  P.armNearRot = -wind * 20 + thrust * 40;
  P.armFarRot = -wind * 14 + thrust * 20;
  P.elbowNear = 8 + thrust * 10;
  P.antennaSpring = wind * 10 - thrust * 14;
  P.antennaSway = 0.4;
  P.wingSpread = 0.2 + thrust * 0.4;
  P.wingFlap = -wind * 0.2 + thrust * 0.3;
  P.wingSpeed = 2.5;
  P.eyeOpen = 1 - wind * 0.1;
  P.brow = 0.9;
  P.mouth = 0.3 + thrust * 0.4;
  P.eyeLookX = 0.5;
  return P;
}

// ── HURT (one-shot) ────────────────────────────────────────
function hurt(u) {
  const P = basePose();
  const hit = bell(u, 0, 0.55);
  const tail = smoothstep(0.45, 1, u);
  P.x = -hit * 5;
  P.y = hit * 1.5;
  P.lean = -hit * 12 + tail * 2;
  P.bodyStretch = 1 - hit * 0.02;
  P.headRot = -hit * 9;
  P.headY = hit * 1.5;
  P.legNearRot = -hit * 8;
  P.legFarRot = hit * 6;
  P.kneeNear = 4 + hit * 14;
  P.kneeFar = 6 + hit * 10;
  P.armNearRot = -hit * 34 - tail * 4;
  P.armFarRot = -hit * 22;
  P.elbowNear = 10 + hit * 16;
  P.antennaSpring = -hit * 16;
  P.antennaSway = hit * 0.8;
  P.wingSpread = 0.45 * hit + 0.1;
  P.wingFlap = -hit * 0.5;
  P.wingSpeed = 5 * hit;
  P.eyeOpen = 1 - hit * 0.95;
  P.brow = 0.95;
  P.mouth = 0.15 + hit * 0.55;
  P.eyeLookY = hit * 0.4;
  return P;
}

// ── registry ───────────────────────────────────────────────
export const BEE_ANIMS = {
  idle: { fn: idle, duration: 3.2, label: 'وقوف', loop: true, hint: 'تنفّس + رمشة' },
  walk: { fn: walk, duration: 0.92, label: 'مشي', loop: true, hint: 'دورة خطوة كاملة' },
  run: { fn: run, duration: 0.62, label: 'جري', loop: true, hint: 'انحناء للأمام' },
  jump: { fn: jump, duration: 0.58, label: 'قفز', loop: false, hint: 'تحميل ← اندفاع ← هواء' },
  fall: { fn: fall, duration: 0.8, label: 'سقوط', loop: true, hint: 'أجنحة مفتوحة' },
  land: { fn: land, duration: 0.36, label: 'هبوط', loop: false, hint: 'انضغاط + استقرار' },
  fly: { fn: fly, duration: 0.6, label: 'طيران', loop: true, hint: 'رفرفة سريعة' },
  sting: { fn: sting, duration: 0.78, label: 'لسعة', loop: false, hint: 'هجوم بالإبرة' },
  hurt: { fn: hurt, duration: 0.5, label: 'إصابة', loop: false, hint: 'ارتداد خلفي' },
};

export const BEE_ANIM_LIST = Object.keys(BEE_ANIMS);

export function sampleBee(name, t) {
  const A = BEE_ANIMS[name] ?? BEE_ANIMS.idle;
  let u = (t / A.duration) % 1;
  if (u < 0) u += 1;
  if (!A.loop) u = clamp(t / A.duration);
  return A.fn(u);
}
