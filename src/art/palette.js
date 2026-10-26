// ─────────────────────────────────────────────────────────────
//  PALETTE — 66 hand-tuned colours, built the way a pixel artist
//  builds one: a long ramp per material (8–13 steps) so smooth
//  painting can be posterised into crisp, readable pixel bands.
//  Cool moonlight key from the upper-left, warm bounce from the
//  coral orb in the belly.
// ─────────────────────────────────────────────────────────────

export const R = {
  // robe — deep teal → glowing cyan (the character's signature)
  robe: ['#07141d', '#0a2230', '#0d3040', '#114255', '#155568', '#1a6a7c', '#20808f', '#2a95a1', '#38a9b1', '#4dbdc1', '#6ed2d0', '#93e5de', '#bdf6ee'],
  // exposed chest & belly — pale mint
  mint: ['#5b9080', '#74af9c', '#8fc9b4', '#aadfc9', '#c6f0dd', '#e2fff2', '#f6fffb', '#ffffff'],
  // the coral orb — red ramp
  red: ['#2b040c', '#4d0714', '#711020', '#961a2b', '#bb2437', '#d93a44', '#ee5a56', '#fb7f74', '#ffa79b', '#ffd0c4', '#fff0e8'],
  // gold trim
  gold: ['#241c06', '#45330c', '#6b4f14', '#8f6f22', '#b4912f', '#d8b74b', '#efd982', '#fff6cf'],
  // purple hat band
  purple: ['#1a1026', '#2c1b3f', '#432a5c', '#5d3d7c', '#7f5aa2', '#a37cc4'],
  // dark scale skin (face, hands)
  scale: ['#0e1f1c', '#152d28', '#1f3f38', '#2b544a', '#3a6a5d', '#4f8474', '#6aa08d', '#8dbca8'],
  // boots & leather
  boot: ['#03060a', '#070d12', '#0e171d', '#17242b', '#223640', '#314b57'],
  // sash / blue-grey metal
  metal: ['#1a3341', '#27485a', '#376176', '#4c7d92', '#66a0b2', '#86c3cd', '#aae0e2'],
};

export const PALETTE = [
  ...R.robe,
  ...R.mint,
  ...R.red,
  ...R.gold,
  ...R.purple,
  ...R.scale,
  ...R.boot,
  ...R.metal,
  '#000000',
];

export const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
