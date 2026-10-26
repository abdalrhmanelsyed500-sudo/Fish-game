// ─────────────────────────────────────────────────────────────
//  Minimal GIF89a encoder (no dependencies)
//   · global 256-colour table built from the frames' own palette
//   · transparent index so sprites keep clean alpha edges
//   · correct variable-width LZW + infinite loop extension
//  Verified against a reference decoder during development.
// ─────────────────────────────────────────────────────────────

/** Build a shared palette from RGBA frames. */
function buildPalette(frames) {
  const seen = new Map();
  for (const f of frames) {
    const d = f.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 40) continue;
      const key = ((d[i] >> 2) << 12) | ((d[i + 1] >> 2) << 6) | (d[i + 2] >> 2);
      if (!seen.has(key)) seen.set(key, [d[i], d[i + 1], d[i + 2]]);
      if (seen.size > 255) break;
    }
    if (seen.size > 255) break;
  }
  const colors = [...seen.values()].slice(0, 255);
  while (colors.length < 255) colors.push([0, 0, 0]);
  colors.push([0, 0, 0]); // transparent slot
  return colors;
}

const keyOf = (r, g, b) => ((r >> 2) << 12) | ((g >> 2) << 6) | (b >> 2);

/** Map one RGBA frame to palette indices. */
function indexFrame(frame, colors, lut) {
  const d = frame.data;
  const n = d.length / 4;
  const out = new Uint8Array(n);
  const exact = new Map();
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    if (d[i + 3] < 40) {
      out[p] = 255;
      continue;
    }
    const k = keyOf(d[i], d[i + 1], d[i + 2]);
    let v = lut.get(k);
    if (v === undefined) {
      v = exact.get(k);
      if (v === undefined) {
        let best = 0;
        let bd = Infinity;
        for (let c = 0; c < 255; c++) {
          const dr = d[i] - colors[c][0];
          const dg = d[i + 1] - colors[c][1];
          const db = d[i + 2] - colors[c][2];
          const dist = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11;
          if (dist < bd) { bd = dist; best = c; }
        }
        v = best;
        exact.set(k, v);
      }
    }
    out[p] = v;
  }
  return out;
}

/** Variable-width LZW → sub-blocks. */
function lzwEncode(indices, minCodeSize, out) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let nextCode = eoiCode + 1;
  let codeSize = minCodeSize + 1;
  let dict = new Map();

  let buffer = 0;
  let bits = 0;
  const block = [];
  const flushBlock = () => {
    while (block.length) {
      const n = Math.min(255, block.length);
      out.push(n);
      for (let i = 0; i < n; i++) out.push(block[i]);
      block.splice(0, n);
    }
  };
  const write = (code) => {
    buffer |= code << bits;
    bits += codeSize;
    while (bits >= 8) {
      block.push(buffer & 0xff);
      buffer >>= 8;
      bits -= 8;
    }
    if (block.length > 4096) flushBlock();
  };

  write(clearCode);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = (prefix << 8) | k;
    const found = dict.get(key);
    if (found !== undefined) {
      prefix = found;
      continue;
    }
    write(prefix);
    if (nextCode < 4096) {
      dict.set(key, nextCode++);
      if (nextCode > 1 << codeSize && codeSize < 12) codeSize++;
    } else {
      write(clearCode);
      dict = new Map();
      nextCode = eoiCode + 1;
      codeSize = minCodeSize + 1;
    }
    prefix = k;
  }
  write(prefix);
  write(eoiCode);
  if (bits > 0) block.push(buffer & 0xff);
  flushBlock();
  out.push(0); // block terminator
}

/**
 * @param {{width:number,height:number,data:Uint8ClampedArray}[]} frames
 * @param {number} w
 * @param {number} h
 * @param {number} delayCs  frame delay in 1/100 s
 * @param {boolean} loop
 * @returns {Uint8Array}
 */
export function encodeGIF(frames, w, h, delayCs = 6, loop = true) {
  const colors = buildPalette(frames);
  const lut = new Map();
  colors.forEach((c, i) => {
    if (i < 255) lut.set(keyOf(c[0], c[1], c[2]), i);
  });

  const out = [];
  const str = (s) => {
    for (const ch of s) out.push(ch.charCodeAt(0));
  };

  str('GIF89a');
  out.push(w & 0xff, w >> 8, h & 0xff, h >> 8);
  out.push(0xf7, 0x00, 0x00); // global colour table, 256 entries
  for (let i = 0; i < 256; i++) {
    const c = colors[i] || [0, 0, 0];
    out.push(c[0], c[1], c[2]);
  }
  if (loop) {
    out.push(0x21, 0xff, 0x0b);
    str('NETSCAPE2.0');
    out.push(0x03, 0x01, 0x00, 0x00, 0x00);
  }

  for (const f of frames) {
    const idx = indexFrame(f, colors, lut);
    out.push(0x21, 0xf9, 0x04, 0x09, delayCs & 0xff, (delayCs >> 8) & 0xff, 255, 0x00);
    out.push(0x2c, 0, 0, 0, 0, w & 0xff, w >> 8, h & 0xff, h >> 8, 0x00);
    out.push(8); // LZW minimum code size
    lzwEncode(idx, 8, out);
  }
  out.push(0x3b);
  return new Uint8Array(out);
}
