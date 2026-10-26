// DOM-shim smoke test: runs the real app modules against a fake DOM
// backed by @napi-rs/canvas, so UI wiring + rendering + exports are
// exercised outside a browser.
import { createCanvas } from '@napi-rs/canvas';

const listeners = new Map();
const elements = new Map();

function makeEl(tag = 'div', id = '') {
  const el = {
    tagName: tag.toUpperCase(),
    id,
    _text: '',
    _html: '',
    children: [],
    dataset: {},
    style: { setProperty() {}, removeProperty() {} },
    classList: {
      _s: new Set(),
      add(...c) { c.forEach((x) => this._s.add(x)); },
      remove(...c) { c.forEach((x) => this._s.delete(x)); },
      toggle(c, on) { on === undefined ? (this._s.has(c) ? this._s.delete(c) : this._s.add(c)) : on ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); },
    },
    get textContent() { return this._text; },
    set textContent(v) { this._text = String(v); },
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener(type, fn) {
      const k = this.id + ':' + type;
      listeners.set(k, [...(listeners.get(k) || []), fn]);
    },
    click() { (listeners.get(this.id + ':click') || []).forEach((f) => f({ currentTarget: this })); },
    querySelector(sel) {
      if (sel.includes('active')) {
        const active = this.children.find((c) => c.classList.contains('active'));
        return active ? active.querySelector('.bar i') : null;
      }
      return null;
    },
    setAttribute() {},
    getBoundingClientRect() { return { width: 640, height: 720, top: 0, left: 0 }; },
    value: '0',
    min: '0',
    max: '100',
  };
  if (tag === 'canvas') {
    const c = createCanvas(320, 360);
    el.width = 640;
    el.height = 720;
    el.getContext = (type, opts) => c.getContext(type === '2d' ? '2d' : '2d', opts);
    el.toBlob = (cb) => cb({ size: 1000, type: 'image/png' });
    el._canvas = c;
  }
  return el;
}

function el(id) {
  if (!elements.has(id)) elements.set(id, makeEl(id === 'stage' ? 'canvas' : id.startsWith('btn') ? 'button' : 'div', id));
  return elements.get(id);
}

// preset values for sliders
const sliderDefaults = { speed: 100, zoom: 2, dither: 7, scrub: 0 };
globalThis.document = {
  getElementById: (id) => {
    const e = el(id);
    if (id in sliderDefaults && e.value === '0') e.value = String(sliderDefaults[id]);
    return e;
  },
  createElement: (tag) => (tag === 'canvas' ? makeEl('canvas') : makeEl(tag)),
  querySelectorAll: (sel) => {
    if (sel === '.anim') return el('anims').children;
    return [];
  },
  querySelector: (sel) => (sel === '.anim.active .bar i' ? null : null),
  body: makeEl('body'),
};
globalThis.window = {
  addEventListener: (t, fn) => listeners.set('window:' + t, fn),
};
globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(performance.now()), 16);
globalThis.performance = performance;
globalThis.Blob = class { constructor(parts) { this.parts = parts; } };
globalThis.URL.createObjectURL = () => 'blob:fake';
globalThis.URL.revokeObjectURL = () => {};

// stub anchor downloads
const origCreate = document.createElement;
document.createElement = (tag) => {
  const e = origCreate(tag);
  if (tag === 'a') e.click = () => { globalThis.__downloads = (globalThis.__downloads || 0) + 1; };
  return e;
};

await import('../src/app/main.js');

// let a few frames run
await new Promise((r) => setTimeout(r, 400));

// exercise the UI
const ids = ['btnNext', 'btnNext', 'btnPrev', 'btnPause', 'btnGrid', 'btnWorld', 'btnSheet', 'btnFrame', 'btnGif'];
for (const id of ids) {
  el(id).click();
  await new Promise((r) => setTimeout(r, 120));
}

// switch every animation once
const anims = el('anims').children;
for (const a of anims) a.click();
await new Promise((r) => setTimeout(r, 500));

console.log('animations:', anims.length);
console.log('palette swatches :', el('paletteBody').children.length);
console.log('fps label        :', el('fps').textContent);
console.log('current anim     :', el('curAnim').textContent);
console.log('time label       :', el('curTime').textContent);
console.log('downloads queued :', globalThis.__downloads || 0);
console.log('SMOKE TEST OK');

process.exit(0);
