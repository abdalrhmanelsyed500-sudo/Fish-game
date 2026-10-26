// ─────────────────────────────────────────────────────────────
//  BEE PALETTE
//  Warm honey costume, dusty grey-lilac wings, cold sage skin.
//  Deliberately NO pure black: every dark is a warm umber or a
//  cool charcoal-lilac, so the character never gets a black
//  outline — edges read from value and temperature instead.
// ─────────────────────────────────────────────────────────────

export const B = {
  // honey suit — deep burnt amber → pale butter
  honey: [
    '#5c3310', '#7a4513', '#995916', '#b76f1a', '#d18a22',
    '#e5a430', '#f2bb4a', '#f9d271', '#fde49f', '#fff2cd',
  ],
  // stripes — dark lilac-charcoal, never black
  stripe: ['#1b1820', '#272431', '#342f3e', '#443e4e', '#575064'],
  // wings — grey-lilac membrane
  wing: [
    '#3f3a4b', '#524c60', '#676076', '#7d768c', '#948da3',
    '#aca5b9', '#c2bccd', '#d8d3e0', '#eae7f0', '#f7f5fa',
  ],
  // skin — pale moss-grey, greenish like the reference drawing
  skin: [
    '#4a4e45', '#5d6255', '#73786a', '#8a8f80', '#a1a694',
    '#b8bca8', '#ced1bf', '#e0e2d2', '#f0f1e4', '#fcfcf2',
  ],
  // legs / hands — cool grey with a lilac cast
  limb: ['#4f4a58', '#625d6c', '#787282', '#8e8899', '#a5a0af', '#bcb8c5', '#d3d0da'],
  // antennae tips + small gold accents
  gold: ['#6b4310', '#8d5c14', '#b0791c', '#cf9727', '#e8b53b', '#f8d066', '#ffeaa1'],
  // rim light (cool bounce from the sky)
  rim: ['#5d93a8', '#84bccd', '#aadbe6', '#cdeff5'],

  // ── world ─────────────────────────────────────────────────
  sky: ['#171430', '#221c44', '#2f2659', '#3d2f6b', '#4f3c7b', '#654e8b', '#816498', '#a37fa4', '#c69bad', '#e3beBB'],
  dusk: ['#472f56', '#5d3d66', '#744d72', '#8d5f7c', '#a87586', '#c08f92', '#d6ab9f'],
  hill: ['#1b2038', '#242b45', '#2f3752', '#3c4660', '#4b5670'],
  leaf: ['#0f2620', '#17352f', '#1f4a3c', '#2a6049', '#377757', '#498e66', '#61a677', '#84c298'],
  stone: ['#2a2b3a', '#383a4c', '#484a5e', '#5b5e72', '#737689', '#8f92a3'],
  grass: ['#183a37', '#224b45', '#2e6055', '#3d7767', '#528f7b', '#71ab93', '#93c7b1', '#b8e0cd'],
  glow: ['#7a5a1e', '#a9822b', '#d3ac3d', '#f0cf68', '#fff0b0'],
};

const flat = (ramps) => ramps.flatMap((r) => B[r] ?? r);

export const BEE_PALETTE = [
  ...B.honey,
  ...B.stripe,
  ...B.wing,
  ...B.skin,
  ...B.limb,
  ...B.gold,
  ...B.rim,
];

export const WORLD_PALETTE = [
  ...flat(['sky', 'dusk', 'hill', 'leaf', 'stone', 'grass', 'glow', 'wing', 'honey', 'stripe', 'skin', 'limb', 'gold', 'rim']),
];

export const PALETTE = [...new Set(WORLD_PALETTE)];
