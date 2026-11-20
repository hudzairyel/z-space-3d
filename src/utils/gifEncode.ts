// Minimal GIF89a encoder. Quantizes each frame to a 256-color palette.

function nearest(r: number, g: number, b: number, pal: number[][]) {
  let best = 0;
  let bestD = 1e12;
  for (let i = 0; i < pal.length; i++) {
    const dr = r - pal[i][0];
    const dg = g - pal[i][1];
    const db = b - pal[i][2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function paletteOf(data: Uint8ClampedArray, size: number) {
  const buckets = new Map<number, number>();
  const step = Math.max(1, Math.floor(data.length / 4 / 4000));
  for (let i = 0; i < data.length; i += 4 * step) {
    const key =
      ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }
  const ranked = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, size);
  const pal = ranked.map(([k]) => [((k >> 8) & 15) * 17, ((k >> 4) & 15) * 17, (k & 15) * 17]);
  while (pal.length < size) pal.push([0, 0, 0]);
  return pal;
}

function byte(n: number) {
  return n & 255;
}

function lzw(index: Uint8Array, minCodeSize: number) {
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  let codeSize = minCodeSize + 1;
  let next = eoi + 1;
  const dict = new Map<string, number>();
  const out: number[] = [];
  let acc = 0;
  let bits = 0;
  const emit = (code: number) => {
    acc |= code << bits;
    bits += codeSize;
    while (bits >= 8) {
      out.push(acc & 255);
      acc >>= 8;
      bits -= 8;
    }
  };
  emit(clear);
  let w = String(index[0]);
  for (let i = 1; i < index.length; i++) {
    const k = String(index[i]);
    const wk = w + "," + k;
    if (dict.has(wk)) {
      w = wk;
    } else {
      emit(w.includes(",") ? dict.get(w)! : Number(w));
      if (next < 4096) {
        dict.set(wk, next++);
        if (next > 1 << codeSize && codeSize < 12) codeSize++;
      } else {
        emit(clear);
        dict.clear();
        codeSize = minCodeSize + 1;
        next = eoi + 1;
      }
      w = k;
    }
  }
  emit(w.includes(",") ? dict.get(w)! : Number(w));
  emit(eoi);
  if (bits > 0) out.push(acc & 255);
  return out;
}

export function encodeGif(frames: ImageData[], delayCs: number) {
  if (!frames.length) throw new Error("no frames");
  const w = frames[0].width;
  const h = frames[0].height;
  const bytes: number[] = [];
  const push = (...ns: number[]) => bytes.push(...ns);
  const str = (s: string) => {
    for (let i = 0; i < s.length; i++) bytes.push(s.charCodeAt(i));
  };

  str("GIF89a");
  push(byte(w), w >> 8, byte(h), h >> 8);
  push(0x70, 0, 0); // no global table
  str("!");
  push(0xff, 11);
  str("NETSCAPE2.0");
  push(3, 1, 0, 0, 0);

  for (const frame of frames) {
    const pal = paletteOf(frame.data, 256);
    const idx = new Uint8Array(w * h);
    const d = frame.data;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      idx[p] = nearest(d[i], d[i + 1], d[i + 2], pal);
    }
    str("!");
    push(0xf9, 4, 0, byte(delayCs), delayCs >> 8, 0, 0);
    push(0x2c);
    push(0, 0, 0, 0, byte(w), w >> 8, byte(h), h >> 8);
    push(0x87); // local table, 256 colors
    for (const c of pal) push(c[0], c[1], c[2]);
    const minCode = 8;
    push(minCode);
    const compressed = lzw(idx, minCode);
    for (let i = 0; i < compressed.length; ) {
      const n = Math.min(255, compressed.length - i);
      push(n);
      for (let j = 0; j < n; j++) push(compressed[i++]);
    }
    push(0);
  }
  push(0x3b);
  return new Uint8Array(bytes);
}
