// ─────────────────────────────────────────────────────────────
//  RIG + ANIMATION
//  A rig is a flat object of transform channels. Animations are
//  pure functions (t → rig), so the character can be scrubbed,
//  blended and exported frame-by-frame. All curves are continuous
//  (sin / smoothstep / cubic), which is what keeps motion silky.
// ─────────────────────────────────────────────────────────────

export const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};
export const smoother = (t) => {
  t = clamp(t);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
/** 0 → 1 → 0 bell across a normalised window */
export const pulse = (t, a, b) => {
  if (t <= a || t >= b) return 0;
  const u = (t - a) / (b - a);
  return Math.sin(u * Math.PI);
};

export const baseRig = () => ({
  x: 0,
  y: 0,
  sx: 1,
  sy: 1,
  hipRot: 0,
  chestRot: 0,
  chestSX: 1,
  chestSY: 1,
  headRot: 0,
  headX: 0,
  headY: 0,
  hatRot: 0,
  hatX: 0,
  hatY: 0,
  armLRot: 0,
  armRRot: 0,
  armLExt: 0,
  armRExt: 0,
  handLRot: 0,
  handRRot: 0,
  skirtSway: 0,
  orbX: 0,
  orbY: 0,
  orbScale: 1,
  glow: 0.35,
  mouth: 0.22,
  eyeOpen: 1,
});

const KEYS = Object.keys(baseRig());

/** Blend two rig states. */
export function blendRig(a, b, t) {
  const out = {};
  for (const k of KEYS) out[k] = lerp(a[k] ?? 0, b[k] ?? 0, t);
  return out;
}

/** Blend a rig toward a target with a time-based ease (for animation switching). */
export function approachRig(cur, target, dt, time = 0.28) {
  const k = 1 - Math.exp(-dt / (time * 0.32));
  const out = {};
  for (const key of KEYS) out[key] = lerp(cur[key] ?? 0, target[key] ?? 0, k);
  return out;
}

// ── individual animations ───────────────────────────────────
// Each receives normalised loop time u∈[0,1) and returns a rig.

function breathBody(R, u, amt = 1) {
  const b = Math.sin(u * TAU);
  R.chestSY = 1 + b * 0.014 * amt;
  R.chestSX = 1 - b * 0.008 * amt;
  R.y = -b * 1.6 * amt;
  R.headY = -b * 1.4 * amt;
  R.chestRot = b * 0.006 * amt;
  R.armLRot = b * 0.018 * amt;
  R.armRRot = -b * 0.018 * amt;
  R.skirtSway = Math.sin(u * TAU - 0.7) * 0.5 * amt;
}

export const ANIMS = {
  idle: {
    label: 'وقوف',
    en: 'Idle',
    duration: 4.2,
    loop: true,
    hint: 'تنفّس هادئ + نبض الجوهرة',
    apply(u, out = baseRig()) {
      const R = out;
      breathBody(R, u);
      const g = (Math.sin(u * TAU * 1.0 - 0.4) * 0.5 + 0.5);
      R.glow = 0.25 + g * 0.55;
      R.orbScale = 1 + Math.sin(u * TAU * 1.0 - 0.4) * 0.012;
      R.orbY = Math.sin(u * TAU - 1.2) * 0.8;
      // occasional blink
      const bl = blinkAt(u, 0.42);
      R.eyeOpen = bl;
      R.mouth = 0.18 + Math.sin(u * TAU + 1.1) * 0.06;
      return R;
    },
  },

  breathe: {
    label: 'تنفّس عميق',
    en: 'Deep Breath',
    duration: 3.4,
    loop: true,
    hint: 'صدر يتمدد ويرتخي بتوقيت ثقيل',
    apply(u, out = baseRig()) {
      const R = out;
      const s = smooth(u);
      R.chestSY = 1 + Math.sin(u * TAU - 0.5) * 0.045;
      R.chestSX = 1 - Math.sin(u * TAU - 0.5) * 0.028;
      R.y = -Math.sin(u * TAU - 0.5) * 4;
      R.headY = -Math.sin(u * TAU - 0.9) * 3.2;
      R.headRot = Math.sin(u * TAU - 1.4) * 0.02;
      R.armLRot = Math.sin(u * TAU - 0.2) * 0.05 - 0.03;
      R.armRRot = -Math.sin(u * TAU - 0.2) * 0.05 + 0.03;
      R.armLExt = Math.sin(u * TAU - 0.6) * 0.4;
      R.armRExt = Math.sin(u * TAU - 0.6) * 0.4;
      R.glow = 0.2 + (Math.sin(u * TAU - 1.2) * 0.5 + 0.5) * 0.5;
      R.mouth = 0.35 + Math.sin(u * TAU - 1.2) * 0.25;
      R.skirtSway = Math.sin(u * TAU - 1.1) * 0.7;
      R.eyeOpen = blinkAt(u, 0.8);
      return R;
    },
  },

  talk: {
    label: 'كلام',
    en: 'Talk',
    duration: 2.6,
    loop: true,
    hint: 'فم ولحية مع إيماءة رأس',
    apply(u, out = baseRig()) {
      const R = out;
      breathBody(R, u, 0.7);
      const m =
        0.25 +
        0.5 * Math.max(0, Math.sin(u * TAU * 3.0)) * (0.55 + 0.45 * Math.sin(u * TAU * 1.0));
      R.mouth = m;
      R.headRot = Math.sin(u * TAU) * 0.035;
      R.headX = Math.sin(u * TAU - 0.6) * 1.6;
      R.headY = Math.sin(u * TAU * 2) * 0.9;
      R.hatRot = -R.headRot * 0.6;
      R.hatY = Math.sin(u * TAU * 2 + 0.6) * 0.7;
      R.eyeOpen = blinkAt(u, 0.72) * (0.85 + 0.15 * Math.cos(u * TAU * 4));
      R.orbScale = 1 + Math.sin(u * TAU * 2) * 0.01;
      R.glow = 0.35 + Math.sin(u * TAU * 2 - 0.8) * 0.12;
      return R;
    },
  },

  bow: {
    label: 'انحناء',
    en: 'Bow',
    duration: 3.6,
    loop: true,
    hint: 'تحية ثقيلة مع رفعة للقبعة',
    apply(u, out = baseRig()) {
      const R = out;
      // 0 → bow → hold → rise
      const down = u < 0.42 ? smoother(u / 0.42) : u < 0.72 ? 1 : 1 - smoother((u - 0.72) / 0.28);
      R.chestRot = down * 0.16;
      R.headRot = down * 0.24;
      R.y = down * 7;
      R.chestSY = 1 - down * 0.03;
      R.chestSX = 1 + down * 0.02;
      R.armLRot = down * 0.16;
      R.armRRot = -down * 0.16;
      R.armLExt = down * 1.1;
      R.armRExt = down * 1.1;
      R.hatRot = down * -0.05;
      R.hatY = down * 1.6;
      R.skirtSway = down * 1.4;
      R.eyeOpen = 1 - down * 0.85;
      R.mouth = 0.2 + down * 0.12;
      R.glow = 0.3 + down * 0.18;
      R.orbY = down * 1.4;
      return R;
    },
  },

  roar: {
    label: 'زئير',
    en: 'Roar',
    duration: 3.2,
    loop: true,
    hint: 'شهيق، زئير، وارتجاف الجوهرة',
    apply(u, out = baseRig()) {
      const R = out;
      const wind = pulse(u, 0.0, 0.42) * (u < 0.2 ? 1 : 0.6);
      const roar = u < 0.42 ? 0 : u < 0.78 ? smoother((u - 0.42) / 0.1) : 1 - smoother((u - 0.78) / 0.22);
      const shake = roar * Math.sin(u * TAU * 26) * 0.006;
      R.mouth = 0.2 + roar * 0.95 + wind * 0.1;
      R.headRot = -roar * 0.12 + wind * 0.03;
      R.headY = -roar * 4 + wind * 2.4;
      R.chestRot = -roar * 0.05;
      R.chestSY = 1 + roar * 0.045 - wind * 0.02;
      R.chestSX = 1 + roar * 0.03;
      R.y = -roar * 5 + wind * 2;
      R.armLRot = -roar * 0.34 + wind * 0.08;
      R.armRRot = roar * 0.34 - wind * 0.08;
      R.armLExt = roar * 1.6;
      R.armRExt = roar * 1.6;
      R.handLRot = roar * 0.5;
      R.handRRot = -roar * 0.5;
      R.eyeOpen = 1 - roar * 0.45;
      R.hatRot = -roar * 0.06;
      R.hatY = -roar * 3.4 + shake * 10;
      R.hatX = shake * 22;
      R.glow = 0.4 + roar * 0.7;
      R.orbScale = 1 + roar * 0.06;
      R.skirtSway = roar * Math.sin(u * TAU * 13) * 1.6;
      R.x = shake * 14;
      return R;
    },
  },

  cast: {
    label: 'استدعاء',
    en: 'Cast',
    duration: 4.4,
    loop: true,
    hint: 'شحن الجوهرة ثم إطلاق الطاقة',
    apply(u, out = baseRig()) {
      const R = out;
      const charge = u < 0.62 ? smoother(u / 0.62) : 1 - smoother((u - 0.62) / 0.38);
      const burst = pulse(u, 0.62, 0.92);
      const shiver = charge * Math.sin(u * TAU * 18) * 0.0035;
      R.chestRot = -charge * 0.04;
      R.chestSY = 1 + charge * 0.02 + burst * 0.05;
      R.chestSX = 1 - charge * 0.02 + burst * 0.04;
      R.headRot = -charge * 0.05;
      R.headY = -charge * 3;
      R.y = -charge * 3;
      R.armLRot = -charge * 0.42 + burst * 0.2;
      R.armRRot = charge * 0.42 - burst * 0.2;
      R.armLExt = charge * 1.4 + burst * 2.2;
      R.armRExt = charge * 1.4 + burst * 2.2;
      R.handLRot = -charge * 1.1 + burst * 0.6;
      R.handRRot = charge * 1.1 - burst * 0.6;
      R.hatRot = charge * 0.05;
      R.hatY = charge * 2;
      R.glow = 0.25 + charge * 0.9 + burst * 0.6;
      R.orbScale = 0.9 + charge * 0.22 + burst * 0.18;
      R.orbY = -charge * 4;
      R.mouth = 0.2 + charge * 0.35 + burst * 0.5;
      R.eyeOpen = 1 - burst * 0.35;
      R.skirtSway = shiver * 200 + charge * 0.8;
      R.x = shiver * 300;
      return R;
    },
  },

  walk: {
    label: 'مشي',
    en: 'Walk',
    duration: 1.9,
    loop: true,
    hint: 'خطوة ثقيلة متمايلة',
    apply(u, out = baseRig()) {
      const R = out;
      const s = Math.sin(u * TAU);
      const c = Math.cos(u * TAU);
      const step = Math.sin(u * TAU * 2);
      R.x = s * 5;
      R.y = -Math.abs(step) * 6;
      R.hipRot = c * 0.03;
      R.chestRot = -c * 0.02;
      R.chestSX = 1 + Math.abs(step) * 0.012;
      R.chestSY = 1 - Math.abs(step) * 0.014;
      R.headRot = c * 0.02;
      R.headY = -Math.abs(step) * 2.4;
      R.armLRot = s * 0.12;
      R.armRRot = -s * 0.12;
      R.armLExt = Math.max(0, -s) * 0.5;
      R.armRExt = Math.max(0, s) * 0.5;
      R.hatRot = -c * 0.02;
      R.hatY = -Math.abs(step) * 1.6 + 1;
      R.skirtSway = -s * 1.5;
      R.glow = 0.3 + Math.abs(step) * 0.25;
      R.orbY = -Math.abs(step) * 2 + 1;
      R.orbX = s * -1.5;
      R.mouth = 0.24;
      R.eyeOpen = 1;
      return R;
    },
  },

  float: {
    label: 'طَفْو',
    en: 'Float',
    duration: 5.0,
    loop: true,
    hint: 'يرتفع عن الأرض ويرفرف',
    apply(u, out = baseRig()) {
      const R = out;
      const b = Math.sin(u * TAU);
      R.y = -18 + b * 5;
      R.chestRot = b * 0.02;
      R.chestSY = 1 + b * 0.02;
      R.headY = -b * 3;
      R.headRot = Math.sin(u * TAU - 0.8) * 0.02;
      R.armLRot = -0.14 + b * 0.05;
      R.armRRot = 0.14 - b * 0.05;
      R.armLExt = 0.6 + b * 0.2;
      R.armRExt = 0.6 + b * 0.2;
      R.skirtSway = Math.sin(u * TAU - 1.2) * 1.8;
      R.hatRot = b * 0.02;
      R.hatY = -2 + b * 2;
      R.glow = 0.45 + b * 0.3;
      R.orbY = b * 2;
      R.eyeOpen = 1 - pulse(u, 0.55, 0.62) * 0.9;
      R.mouth = 0.2;
      return R;
    },
  },
};

/** blink curve helper: 1 most of the time, dips to 0 briefly at `at` (0..1) */
export function blinkAt(u, at) {
  const d = Math.abs(u - at);
  const w = 0.018;
  if (d > w) return 1;
  return 1 - Math.pow(Math.cos((d / w) * Math.PI * 0.5), 0.7);
}

export const ANIM_LIST = Object.keys(ANIMS);

/** Sample an animation at absolute time (seconds). */
export function sampleAnimation(name, time) {
  const A = ANIMS[name] || ANIMS.idle;
  const u = ((time % A.duration) + A.duration) % A.duration / A.duration;
  return A.apply(u, baseRig());
}
