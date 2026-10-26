// DOM-shim smoke test for bee.html: runs the real app modules against a
// fake DOM backed by @napi-rs/canvas, exercising UI wiring, rendering,
// sprite sheets and GIF encoding outside a browser.
import { createCanvas } from '@napi-rs/canvas';

const listeners = new Map();
const elements = new Map();

function makeCanvasEl(id = '') {
  const canvas = createCanvas(300, 150);
  canvas.id = id;
  canvas.style = {};
  canvas.classList = {
    _s: new Set(),
    add(...c) { c.forEach((x) => this._s.add(x)); },
    remove(...c) { c.forEach((x) => this._s.delete(x)); },
    toggle(c, on) { on === undefined ? (this._s.has(c) ? this._s.delete(c) : this._s.add(c)) : on ? this._s.add(c) : this._s.delete(c); },
    contains(c) { return this._s.has(c); },
  };
  canvas.addEventListener = () => {};
  canvas.appendChild = (c) => c;
  canvas.toBlob = (cb) => cb({ size: canvas.toBuffer('image/png').length, type: 'image/png' });
  return canvas;
}

function makeEl(tag = 'div', id = '') {
  if (tag === 'canvas') return makeCanvasEl(id);
  return {
    tagName: tag.toUpperCase(),
    id,
    textContent: '',
    innerHTML: '',
    children: [],
    dataset: {},
    style: {},
    value: '0',
    classList: {
      _s: new Set(),
      add(...c) { c.forEach((x) => this._s.add(x)); },
      remove(...c) { c.forEach((x) => this._s.delete(x)); },
      toggle(c, on) { on === undefined ? (this._s.has(c) ? this._s.delete(c) : this._s.add(c)) : on ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); },
    },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(type, fn) {
      const k = this.id + ':' + type;
      listeners.set(k, [...(listeners.get(k) || []), fn]);
    },
    click() { (listeners.get(this.id + ':click') || []).forEach((f) => f({ currentTarget: this, preventDefault() {} })); },
    setAttribute() {},
    getBoundingClientRect() { return { width: 960, height: 540, top: 0, left: 0 }; },
  };
}

const canvasIds = new Set(['stage', 'strip']);
function el(id) {
  if (!elements.has(id)) {
    elements.set(id, makeEl(canvasIds.has(id) ? 'canvas' : id.startsWith('btn') || id.startsWith('speed') ? 'button' : 'div', id));
  }
  return elements.get(id);
}

const sliders = { speed: '1', zoom: '2', dither: '6' };

globalThis.document = {
  getElementById: (id) => {
    const e = el(id);
    if (id in sliders && e.value === '0') e.value = sliders[id];
    return e;
  },
  createElement: (tag) => makeEl(tag),
  querySelectorAll: (sel) => (sel === '.anim' ? el('animGrid').children : []),
  querySelector: () => null,
  body: makeEl('body'),
};
globalThis.window = { addEventListener: (t, fn) => listeners.set('window:' + t, fn) };
globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(globalThis.performance.now()), 16);
globalThis.performance ??= globalThis.performance || { now: () => Date.now() };
globalThis.Blob = class { constructor(parts) { this.parts = parts; } };
globalThis.URL.createObjectURL = () => 'blob:fake';
globalThis.URL.revokeObjectURL = () => {};

const origCreate = document.createElement;
document.createElement = (tag) => {
  const e = origCreate(tag);
  if (tag === 'a') e.click = () => { globalThis.__downloads = (globalThis.__downloads || 0) + 1; };
  return e;
};

await import('../src/app/bee-app.js');
await new Promise((r) => setTimeout(r, 350));

const anims = el('animGrid').children;
for (const a of anims) {
  a.click();
  await new Promise((r) => setTimeout(r, 60));
}
for (const id of ['btnNext', 'btnNext', 'btnPrev', 'btnSheet', 'btnFrame', 'btnGif', 'btnShot', 'btnPlay', 'btnPlay', 'btnGrid', 'btnWorld', 'btnPauseAll']) {
  el(id).click();
  await new Promise((r) => setTimeout(r, 90));
}

console.log('animations       :', anims.length);
console.log('palette swatches :', el('swatches').children.length);
console.log('current anim     :', el('animName').textContent);
console.log('time label       :', el('timePill').textContent);
console.log('downloads queued :', globalThis.__downloads || 0);
console.log('strip canvas     :', el('strip').width + 'x' + el('strip').height);
console.log('SMOKE TEST OK');
process.exit(0);
