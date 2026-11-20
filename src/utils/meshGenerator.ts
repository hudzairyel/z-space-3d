import * as THREE from "three";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface ImageMeshOptions {
  width?: number;         // target mask resolution, 160–512
  depth?: number;         // 0.05–1.2
  smoothness?: number;    // 0–100
}

interface Shape {
  outer: { x: number; y: number }[];
  holes: { x: number; y: number }[][];
}

interface MaskInfo {
  W: number;
  H: number;
  mask: Uint8Array;
  dist: Float32Array;
  s: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
}

/* ─── 1. Image → mask ────────────────────────────────────────────────────── */

function computeMaskFromImage(
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  res: number,
  removeBg: boolean
): { mask: Uint8Array; W: number; H: number; w: number; h: number; bounds: MaskInfo } {
  const iw = img instanceof HTMLImageElement ? img.naturalWidth || img.width : img.width;
  const ih = img instanceof HTMLImageElement ? img.naturalHeight || img.height : img.height;
  // Scale so that the *longer* dimension equals `res`, shorter keeps aspect
  const k = res / Math.max(iw, ih);
  const w = Math.max(2, Math.round(iw * k));
  const h = Math.max(2, Math.round(ih * k));
  const W = w + 2;
  const H = h + 2;

  // Draw to a padded canvas so mask indices align with NPNH's (offset by 1)
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true });
  if (!g) throw new Error("Canvas 2D context unavailable");
  g.drawImage(img as CanvasImageSource, 1, 1, w, h);
  const d = g.getImageData(0, 0, W, H).data;
  const N = W * H;

  let mask = new Uint8Array(N);

  if (!removeBg) {
    // Whole slab: every inside pixel is filled
    for (let i = 0; i < N; i++) {
      const x = i % W;
      const y = (i / W) | 0;
      mask[i] = x >= 1 && y >= 1 && x <= w && y <= h ? 1 : 0;
    }
  } else {
    // Auto background removal:
    // 1. Check alpha channel
    let clear = 0;
    for (let y = 1; y <= h; y++)
      for (let x = 1; x <= w; x++)
        if (d[(y * W + x) * 4 + 3] < 200) clear++;

    const useAlpha = clear > w * h * 0.01;

    if (useAlpha) {
      for (let i = 0; i < N; i++) {
        mask[i] = d[i * 4 + 3] > 110 ? 1 : 0;
      }
    } else {
      // Flood-fill from corners
      const corners = [
        [1, 1], [w, 1], [1, h], [w, h],
      ];
      let cr = 0, cg = 0, cb = 0;
      for (const [x, y] of corners) {
        const j = (y * W + x) * 4;
        cr += d[j]; cg += d[j + 1]; cb += d[j + 2];
      }
      cr /= 4; cg /= 4; cb /= 4;

      const thr2 = 25; // sensitivity 25²
      const near = (i: number) => {
        const j = i * 4;
        const dr = d[j] - cr, dg = d[j + 1] - cg, db = d[j + 2] - cb;
        return dr * dr + dg * dg + db * db < thr2;
      };

      const bg = new Uint8Array(N);
      const q = new Int32Array(N);
      let qh = 0, qt = 0;
      for (let i = 0; i < N; i++) {
        const x = i % W;
        if (x === 0 || x === W - 1 || i < W || i >= N - W) { bg[i] = 1; q[qt++] = i; }
      }
      while (qh < qt) {
        const i = q[qh++];
        const x = i % W;
        const nb = [i - W, i + W, x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1];
        for (const n of nb) {
          if (n >= 0 && n < N && !bg[n] && near(n)) { bg[n] = 1; q[qt++] = n; }
        }
      }
      for (let i = 0; i < N; i++) mask[i] = bg[i] ? 0 : 1;
    }
  }

  // Median filter (same as NPNH: 3×3 majority vote)
  const m2 = new Uint8Array(N);
  for (let y = 1; y < H - 1; y++)
    for (let x = 1; x < W - 1; x++) {
      let s = 0;
      for (let yy = -1; yy <= 1; yy++)
        for (let xx = -1; xx <= 1; xx++)
          s += mask[(y + yy) * W + x + xx];
      m2[y * W + x] = s >= 5 ? 1 : 0;
    }
  mask = m2;

  // Fill back: if less than 0.4% is filled, use full-slab mode
  let filled = 0;
  for (let i = 0; i < N; i++) filled += mask[i];
  if (filled < w * h * 0.004) {
    for (let i = 0; i < N; i++) {
      const x = i % W;
      const y = (i / W) | 0;
      mask[i] = x >= 1 && y >= 1 && x <= w && y <= h ? 1 : 0;
    }
  }

  return {
    mask, W, H, w, h,
    bounds: { W, H, mask, dist: distanceField(mask, W, H), s: 2.2 / Math.max(w, h), cx: 1 + w / 2, cy: 1 + h / 2, w, h } as MaskInfo,
  };
}

/* ─── 2. Distance field (Felzenszwalb–Huttenlocher) ─────────────────────── */

function distanceField(mask: Uint8Array, W: number, H: number): Float32Array {
  const INF = 1e20;
  const M = Math.max(W, H);
  const grid = new Float64Array(W * H);
  for (let i = 0; i < W * H; i++) grid[i] = mask[i] ? INF : 0;

  const f = new Float64Array(M);
  const z = new Float64Array(M + 1);
  const v = new Int32Array(M);

  const pass = (offset: number, stride: number, length: number) => {
    v[0] = 0;
    z[0] = -INF;
    z[1] = INF;
    f[0] = grid[offset];
    for (let q = 1, k = 0, s = 0; q < length; q++) {
      f[q] = grid[offset + q * stride];
      do {
        const r = v[k];
        s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2;
      } while (s <= z[k] && --k > -1);
      k++;
      v[k] = q;
      z[k] = s;
      z[k + 1] = INF;
    }
    for (let q = 0, k = 0; q < length; q++) {
      while (z[k + 1] < q) k++;
      const r = v[k], d = q - r;
      grid[offset + q * stride] = f[r] + d * d;
    }
  };

  for (let x = 0; x < W; x++) pass(x, W, H);
  for (let y = 0; y < H; y++) pass(y * W, 1, W);

  const out = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) out[i] = Math.sqrt(grid[i]);
  return out;
}

/* ─── 3. Contour tracing (edge-walking) ──────────────────────────────────── */

function traceLoops(mask: Uint8Array, W: number, H: number): number[][] {
  const W1 = W + 1;
  const filled = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x] === 1;

  const out = new Map<number, number[]>();
  const add = (x1: number, y1: number, x2: number, y2: number) => {
    const k = y1 * W1 + x1;
    let a = out.get(k);
    if (!a) out.set(k, a = []);
    a.push(y2 * W1 + x2);
  };

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      if (!filled(x, y)) continue;
      if (!filled(x, y - 1)) add(x, y, x + 1, y);
      if (!filled(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!filled(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!filled(x - 1, y)) add(x, y + 1, x, y);
    }

  const loops: number[][] = [];
  for (const start of out.keys()) {
    const arr = out.get(start)!;
    while (arr.length) {
      const pts: number[] = [];
      let cur = start, nxt = arr.pop()!;
      for (let guard = 0; guard < 1e6; guard++) {
        const cx = cur % W1, cy = (cur / W1) | 0;
        pts.push(cx, cy);
        cur = nxt;
        if (cur === start) break;
        const cand = out.get(cur);
        if (!cand || !cand.length) break;
        let pick = 0;
        if (cand.length > 1) {
          const nx = cur % W1, ny = (cur / W1) | 0;
          const dx = (nxt % W1) - cx, dy = ((nxt / W1) | 0) - cy;
          const prefs = [[-dy, dx], [dx, dy], [dy, -dx]];
          outer: for (const [px, py] of prefs)
            for (let i = 0; i < cand.length; i++) {
              if ((cand[i] % W1) - nx === px && ((cand[i] / W1) | 0) - ny === py) { pick = i; break outer; }
            }
        }
        nxt = cand.splice(pick, 1)[0];
      }
      if (pts.length >= 8) loops.push(pts);
    }
  }
  return loops;
}

/* ─── 4. Shape helpers ──────────────────────────────────────────────────── */

function rdp(pts: { x: number; y: number }[], eps: number): { x: number; y: number }[] {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  let best = -1, bi = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const dist = Math.abs(dy * pts[i].x - dx * pts[i].y + b.x * a.y - b.y * a.x) / len;
    if (dist > best) { best = dist; bi = i; }
  }
  if (best <= eps) return [a, b];
  const l = rdp(pts.slice(0, bi + 1), eps), r = rdp(pts.slice(bi), eps);
  return l.slice(0, -1).concat(r);
}

function simplifyClosed(p: { x: number; y: number }[], eps: number): { x: number; y: number }[] {
  let far = 0, fd = -1;
  for (let i = 1; i < p.length; i++) {
    const dd = (p[i].x - p[0].x) ** 2 + (p[i].y - p[0].y) ** 2;
    if (dd > fd) { fd = dd; far = i; }
  }
  const a = rdp(p.slice(0, far + 1), eps);
  const b = rdp(p.slice(far).concat([p[0]]), eps);
  return a.slice(0, -1).concat(b.slice(0, -1));
}

function chaikin(p: { x: number; y: number }[], n: number): { x: number; y: number }[] {
  for (let k = 0; k < n; k++) {
    const q: { x: number; y: number }[] = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      q.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      q.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    p = q;
  }
  return p;
}

function signedArea(p: { x: number; y: number }[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

function inPoly(pt: { x: number; y: number }, poly: { x: number; y: number }[]): boolean {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x)
      ins = !ins;
  }
  return ins;
}

/* ─── 5. computeShapes (NPNH logic) ──────────────────────────────────────── */

function computeShapes(
  maskInfo: MaskInfo
): Shape[] {
  const { mask, W, H, s, cx, cy } = maskInfo;
  const raw = traceLoops(mask, W, H);

  // Corner cutting iterations based on smoothness
  const iters = 0; // always smooth; user can adjust via smoothness param
  const outers: { p: { x: number; y: number }[]; A: number }[] = [];
  const holes: { p: { x: number; y: number }[]; A: number }[] = [];
  let verts = 0;

  for (const L of raw) {
    const n = L.length / 2;
    let p: { x: number; y: number }[] = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      p.push({ x: (L[i * 2] + L[j * 2]) / 2, y: (L[i * 2 + 1] + L[j * 2 + 1]) / 2 });
    }
    p = simplifyClosed(p, 0.55);
    if (p.length < 3) continue;
    p = chaikin(p, iters);
    p = p.map(v => ({ x: (v.x - cx) * s, y: -(v.y - cy) * s }));
    const A = signedArea(p);
    if (Math.abs(A) < 6 * s * s) continue;
    verts += p.length;
    // After y-flip, outlines have negative area
    (A < 0 ? outers : holes).push({ p, A: Math.abs(A) });
  }

  outers.sort((a, b) => a.A - b.A);
  const built = outers.map(o => ({ o, holes: [] as { x: number; y: number }[][] }));
  for (const h of holes) {
    const parent = built.find(b => inPoly(h.p[0], b.o.p));
    if (parent) parent.holes.push(h.p);
  }
  return built.map(b => ({ outer: b.o.p, holes: b.holes }));
}

/* ─── 6. softExtrude (NPNH logic, simplified) ───────────────────────────── */

function easeAlong(
  a: number[],
  seg: Float32Array,
  R: number
): Float32Array {
  const n = a.length;
  const lo = Float32Array.from(a);
  const out = new Float32Array(n);
  const near = (i: number, fn: (j: number) => void) => {
    for (let d = 0, j = i; ; ) {
      d += seg[j];
      j = (j + 1) % n;
      if (d > R || j === i) break;
      fn(j);
    }
    for (let d = 0, j = i; ; ) {
      j = (j - 1 + n) % n;
      d += seg[j];
      if (d > R || j === i) break;
      fn(j);
    }
  };
  for (let i = 0; i < n; i++) near(i, j => { if (a[j] < lo[i]) lo[i] = a[j]; });
  for (let i = 0; i < n; i++) {
    let sum = lo[i], cnt = 1;
    near(i, j => { sum += lo[j]; cnt++; });
    out[i] = sum / cnt;
  }
  return out;
}

function smooth01(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function softExtrude(
  shapes: Shape[],
  maskInfo: MaskInfo,
  depth: number,
  smoothness: number,
  imageTex?: THREE.Texture
): THREE.BufferGeometry {
  const { dist, W, H, s, cx, cy, w, h } = maskInfo;
  const t = Math.max(0, Math.min(100, smoothness)) / 100;
  const T = depth * 1.25;
  const kz = t > 0 ? Math.min(0.95, 1.2 * Math.sqrt(t)) : 0;
  const bt = (T / 2) * kz;
  const hs = T / 2 - bt;
  const S = kz > 0 ? 2 + Math.round(t * 10) : 0;
  const want = Math.min(bt, 0.17) / s;

  const BLUR = 4;
  const texW = (imageTex?.image as any)?.width || w * 8;
  const sideLod = Math.max(0, Math.log2((BLUR * texW) / w));

  const rings: { side: number; k: number; c: number; sn: number; z: number }[] = [];
  for (let k = S; k >= 0; k--) rings.push({ side: -1, k, c: 0, sn: 0, z: 0 });
  for (let k = 0; k <= S; k++) rings.push({ side: 1, k, c: 0, sn: 0, z: 0 });
  for (const r of rings) {
    const f = S ? (r.k / S) * (Math.PI / 2) : 0;
    r.c = Math.cos(f);
    r.sn = Math.sin(f);
    r.z = r.side * (hs + bt * r.sn);
  }

  // Bilinear distance field
  const field = (X: number, Y: number): number => {
    const fx = X - 0.5, fy = Y - 0.5;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const ax = fx - x0, ay = fy - y0;
    const at = (x: number, y: number) =>
      x < 0 || y < 0 || x >= W || y >= H ? 0 : dist[y * W + x];
    return (at(x0, y0) * (1 - ax) + at(x0 + 1, y0) * ax) * (1 - ay) +
           (at(x0, y0 + 1) * (1 - ax) + at(x0 + 1, y0 + 1) * ax) * ay;
  };

  // Climb inward along gradient
  const climb = (X: number, Y: number, nx: number, ny: number, max: number): number[] => {
    const path = [X, Y, 0];
    let x = X, y = Y, depth = 0;
    for (let k = 0; k < 4 * max + 8 && depth < max; k++) {
      let ux = nx, uy = ny;
      if (k >= 2) {
        const gx = field(x + 0.5, y) - field(x - 0.5, y);
        const gy = field(x, y + 0.5) - field(x, y - 0.5);
        const g = Math.hypot(gx, gy);
        if (g < 0.55) break;
        ux = gx / g;
        uy = gy / g;
      }
      x += ux * 0.5;
      y += uy * 0.5;
      depth = Math.max(depth, field(x, y) - 0.5);
      path.push(x, y, depth);
    }
    return path;
  };

  const pathAt = (path: number[], d: number): [number, number] => {
    for (let j = 3; j < path.length; j += 3) {
      if (path[j + 2] < d) continue;
      const d0 = path[j - 1], d1 = path[j + 2];
      const f = d1 > d0 ? (d - d0) / (d1 - d0) : 1;
      return [
        path[j - 3] + (path[j] - path[j - 3]) * f,
        path[j - 2] + (path[j + 1] - path[j - 2]) * f,
      ];
    }
    return [path[path.length - 3], path[path.length - 2]];
  };

  const orient = (pts: { x: number; y: number }[], sign: number) => {
    const q = [];
    for (const v of pts) {
      const l = q[q.length - 1];
      if (!l || Math.abs(l.x - v.x) + Math.abs(l.y - v.y) > 1e-7) q.push(v);
    }
    while (q.length > 2 && Math.abs(q[0].x - q[q.length - 1].x) + Math.abs(q[0].y - q[q.length - 1].y) <= 1e-7)
      q.pop();
    return Math.sign(signedArea(q)) === sign ? q : q.reverse();
  };

  const pos: number[] = [];
  const nor: number[] = [];
  const uv: number[] = [];
  const soft: number[] = [];
  const index: number[] = [];

  // UV: (u, v) in [0,1]² — texture is square 2048², image drawn with aspect fit
  // Image local coords: x ∈ [0, w] (0=left), y ∈ [0, h] (0=top)
  // World coords from computeShapes: x right, y up, centered at image center
  // Conversion: imageLX = x / s + w / 2, imageLY = h / 2 - y / s
  // Image aspect: aw = w/h. Texture square → letterbox
  //   w >= h: image fills width → v span = h/w centered, u = full
  //   w <  h: image fills height → u span = w/h centered, v = full
  const aw = w / h;
  let uOff: number, uSpan: number, vOff: number, vSpan: number;
  if (aw >= 1) {
    uSpan = 1; uOff = 0;
    vSpan = 1 / aw; vOff = (1 - vSpan) / 2;
  } else {
    uSpan = aw; uOff = (1 - uSpan) / 2;
    vSpan = 1; vOff = 0;
  }

  const toUV = (wx: number, wy: number): [number, number] => {
    const lx = wx / s + w / 2;
    const ly = h / 2 - wy / s;
    const u = uOff + (lx / w) * uSpan;
    const v = vOff + (1 - ly / h) * vSpan;
    return [u, v];
  };

  const vtx = (
    x: number, y: number, z: number,
    nx: number, ny: number, nz: number,
    k: number, ux?: number, uy?: number
  ): number => {
    pos.push(x, y, z);
    nor.push(nx, ny, nz);
    soft.push(k);
    if (ux !== undefined && uy !== undefined) {
      uv.push(...toUV(ux, uy));
    } else {
      uv.push(...toUV(x, y));
    }
    return pos.length / 3 - 1;
  };

  for (const sh of shapes) {
    const loops = [orient(sh.outer, 1), ...sh.holes.map(p => orient(p, -1))];
    if (loops[0].length < 3) continue;

    const capLoops: { x: number; y: number }[][] = [];

    for (const p of loops) {
      const n = p.length;
      if (n < 3) continue;

      // Outward normals and edge lengths (in mask px)
      const ex = new Float32Array(n), ey = new Float32Array(n), seg = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const a = p[i], b = p[(i + 1) % n];
        const dx = b.x - a.x, dy = b.y - a.y;
        const L = Math.hypot(dx, dy) || 1e-9;
        ex[i] = dy / L;
        ey[i] = -dx / L;
        seg[i] = L / s;
      }

      // Shading normals: weighted average within ±4px of arc length
      const cols: number[][][] = new Array(n);
      const NW = 4;
      for (let i = 0; i < n; i++) {
        const j = (i - 1 + n) % n;
        let ax = 0, ay = 0;
        for (let d = 0, e = i; d < NW; e = (e + 1) % n) {
          const k = Math.min(seg[e], NW - d);
          ax += ex[e] * k;
          ay += ey[e] * k;
          d += seg[e];
          if ((e + 1) % n === i) break;
        }
        for (let d = 0, e = j; d < NW; e = (e - 1 + n) % n) {
          const k = Math.min(seg[e], NW - d);
          ax += ex[e] * k;
          ay += ey[e] * k;
          d += seg[e];
          if (e === i) break;
        }
        const l = Math.hypot(ax, ay) || 1;
        cols[i] = [[ax / l, ay / l]];
      }

      // Climb path per outline point
      const paths: number[][] = new Array(n);
      const lim = new Float32Array(n);
      const uvIn: { x: number; y: number }[] = new Array(n);

      for (let i = 0; i < n; i++) {
        const c = cols[i]!;
        let bx = c[0][0] + c[c.length - 1][0];
        let by = c[0][1] + c[c.length - 1][1];
        const bl = Math.hypot(bx, by) || 1;
        const path = climb(
          p[i].x / s + cx,
          -p[i].y / s + cy,
          -bx / bl, by / bl,
          Math.max(want, BLUR)
        );
        const top = path[path.length - 1];
        paths[i] = path;
        lim[i] = top >= want - 1e-6 ? want : 0.72 * top;
        const [UX, UY] = pathAt(path, Math.min(BLUR, 0.7 * top));
        uvIn[i] = { x: (UX - cx) * s, y: -(UY - cy) * s };
      }

      const depthArr = S ? easeAlong(Array.from(lim), seg, Math.max(2, want)) : lim;

      // Ring positions
      const at: { x: number; y: number }[][] = new Array(n);
      for (let i = 0; i < n; i++) {
        const row: { x: number; y: number }[] = [{ x: p[i].x, y: p[i].y }];
        for (let k = 1; k <= S; k++) {
          const d = depthArr[i]! * (1 - Math.cos((k / S) * (Math.PI / 2)));
          if (d <= 0) { row.push({ x: p[i].x, y: p[i].y }); continue; }
          const [X, Y] = pathAt(paths[i]!, d);
          row.push({ x: (X - cx) * s, y: -(Y - cy) * s });
        }
        at[i] = row;
      }

      // Merge crossing neighbours
      for (let k = 1; k <= S; k++)
        for (let pass = 0; pass < 3; pass++)
          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const a = at[i]![k]!, b = at[j]![k]!;
            if ((b.x - a.x) * (p[j].x - p[i].x) + (b.y - a.y) * (p[j].y - p[i].y) < 0) {
              at[i]![k] = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
              at[j]![k] = at[i]![k];
            }
          }

      const inner = at.map(row => row[S]);

      // One column of rings per outline point
      const before = new Int32Array(n);
      const after = new Int32Array(n);
      for (let i = 0; i < n; i++) {
        const u = uvIn[i];
        const rb = Math.max(1e-5, depthArr[i]! * s);
        const nx = cols[i]![0][0];
        const ny = cols[i]![0][1];
        const base = pos.length / 3;
        for (const r of rings) {
          const { x, y } = at[i]![r.k]!;
          let mx = nx * bt * r.c;
          let my = ny * bt * r.c;
          const mz = r.side * rb * r.sn;
          if (!S) { mx = nx; my = ny; }
          const ml = Math.hypot(mx, my, mz) || 1;
          const k = S ? 1 - smooth01(0.3, 0.9, r.sn) : 1;
          vtx(x, y, r.z, mx / ml, my / ml, mz / ml, sideLod * k, x + (u.x - x) * k, y + (u.y - y) * k);
        }
        before[i] = base;
        after[i] = base;
      }

      for (let i = 0; i < n; i++) {
        const A = after[i], B = before[(i + 1) % n];
        for (let r = 0; r < rings.length - 1; r++)
          index.push(A + r, B + r, B + r + 1, A + r, B + r + 1, A + r + 1);
      }

      capLoops.push(inner.map(v => ({ x: v.x, y: v.y })));
    }

    if (!capLoops.length) continue;

    // Front and back caps
    const faces = triangulateShape(capLoops[0], capLoops.slice(1));
    const all = capLoops.flat();
    const z = hs + bt;
    const front = pos.length / 3;
    for (const v of all) vtx(v.x, v.y, z, 0, 0, 1, 0);
    const back = pos.length / 3;
    for (const v of all) vtx(v.x, v.y, -z, 0, 0, -1, 0);

    for (const [a, b, c] of faces) {
      const A = all[a]!, B = all[b]!, C = all[c]!;
      if ((B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x) > 0)
        index.push(front + a, front + b, front + c, back + a, back + c, back + b);
      else
        index.push(front + a, front + c, front + b, back + a, back + b, back + c);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute("soft", new THREE.Float32BufferAttribute(soft, 1));
  geo.setIndex(index);
  return geo;
}

/* ─── 7. triangulateShape (ear-clipping, no external deps) ───────────────── */

function triangulateShape(
  outer: { x: number; y: number }[],
  holes: { x: number; y: number }[][]
): [number, number, number][] {
  // Ear-clipping triangulation via THREE.ShapeUtils
  const result: [number, number, number][] = [];
  if (outer.length < 3) return result;
  const outerV2 = outer.map(v => new THREE.Vector2(v.x, v.y));
  const holesV2 = holes.filter(h => h.length >= 3).map(h => h.map(v => new THREE.Vector2(v.x, v.y)));
  const indices = (THREE.ShapeUtils as any).triangulateShape(outerV2, holesV2);
  for (const tri of indices) result.push(tri as [number, number, number]);
  return result;
}

/* ─── 8. Public API ──────────────────────────────────────────────────────── */

export function extractDominantColor(
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  sampleRes = 32
): [number, number, number] {
  const iw = img instanceof HTMLImageElement ? img.naturalWidth || img.width : img.width;
  const ih = img instanceof HTMLImageElement ? img.naturalHeight || img.height : img.height;
  const k = Math.min(1, sampleRes / Math.max(iw, ih));
  const w = Math.max(2, Math.round(iw * k));
  const h = Math.max(2, Math.round(ih * k));

  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img as CanvasImageSource, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data;

  // Quantize to 16 bins per channel (4-bit) → 4096 buckets
  const buckets = new Float32Array(4096 * 3);
  const counts = new Uint32Array(4096);
  for (let i = 0; i < w * h; i++) {
    const j = i * 4;
    const a = d[j + 3];
    if (a < 110) continue;
    const key = (((d[j] >> 4) << 8) | ((d[j + 1] >> 4) << 4) | (d[j + 2] >> 4)) & 0xffff;
    buckets[key * 3 + 0] += d[j];
    buckets[key * 3 + 1] += d[j + 1];
    buckets[key * 3 + 2] += d[j + 2];
    counts[key]++;
  }
  let best = 0, bc = 0;
  for (let key = 0; key < 4096; key++)
    if (counts[key] > bc) { bc = counts[key]; best = key; }
  if (bc === 0) return [128, 128, 128];
  return [
    Math.round(buckets[best * 3] / bc),
    Math.round(buckets[best * 3 + 1] / bc),
    Math.round(buckets[best * 3 + 2] / bc),
  ];
}

export function extractAllColors(
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  n = 5,
  sampleRes = 32
): [number, number, number][] {
  const iw = img instanceof HTMLImageElement ? img.naturalWidth || img.width : img.width;
  const ih = img instanceof HTMLImageElement ? img.naturalHeight || img.height : img.height;
  const k = Math.min(1, sampleRes / Math.max(iw, ih));
  const w = Math.max(2, Math.round(iw * k));
  const h = Math.max(2, Math.round(ih * k));

  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(img as CanvasImageSource, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data;

  const buckets = new Float32Array(4096 * 3);
  const counts = new Uint32Array(4096);
  for (let i = 0; i < w * h; i++) {
    const j = i * 4;
    if (d[j + 3] < 110) continue;
    const key = (((d[j] >> 4) << 8) | ((d[j + 1] >> 4) << 4) | (d[j + 2] >> 4)) & 0xffff;
    buckets[key * 3] += d[j];
    buckets[key * 3 + 1] += d[j + 1];
    buckets[key * 3 + 2] += d[j + 2];
    counts[key]++;
  }
  const keys = Array.from({ length: 4096 }, (_, i) => i);
  keys.sort((a, b) => counts[b] - counts[a]);
  const out: [number, number, number][] = [];
  const seen = new Set<string>();
  for (const key of keys) {
    if (counts[key] === 0) break;
    if (out.length >= n) break;
    const r = Math.round(buckets[key * 3] / counts[key]);
    const gc = Math.round(buckets[key * 3 + 1] / counts[key]);
    const b = Math.round(buckets[key * 3 + 2] / counts[key]);
    const sig = `${r >> 3},${gc >> 3},${b >> 3}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push([r, gc, b]);
  }
  if (out.length === 0) out.push([128, 128, 128]);
  return out;
}

export function generateMeshFromImage(
  imageBitmap: ImageBitmap | HTMLImageElement,
  res = 200,
  depthScale = 0.35,
  smoothness = 30,
  imageTex?: THREE.Texture,
  bevelScale = 1.0
): THREE.BufferGeometry {
  const { bounds } = computeMaskFromImage(imageBitmap, res, true);
  const shapes = computeShapes(bounds);
  if (shapes.length === 0) return new THREE.BufferGeometry();
  return softExtrude(shapes, bounds, depthScale, smoothness * bevelScale, imageTex);
}

/* ─── 9. Export functions (unchanged) ───────────────────────────────────── */

export function exportToOBJ(geometry: THREE.BufferGeometry): string {
  const pos = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const uv = geometry.attributes.uv;
  let obj = "# NPNH-style 3D Extruded Mesh\n";

  for (let i = 0; i < pos.count; i++)
    obj += `v ${pos.getX(i).toFixed(4)} ${pos.getY(i).toFixed(4)} ${pos.getZ(i).toFixed(4)}\n`;
  if (uv)
    for (let i = 0; i < uv.count; i++)
      obj += `vt ${uv.getX(i).toFixed(4)} ${uv.getY(i).toFixed(4)}\n`;
  if (normal)
    for (let i = 0; i < normal.count; i++)
      obj += `vn ${normal.getX(i).toFixed(4)} ${normal.getY(i).toFixed(4)} ${normal.getZ(i).toFixed(4)}\n`;

  const index = geometry.index;
  if (index)
    for (let i = 0; i < index.count; i += 3)
      obj += `f ${index.getX(i) + 1}/${index.getX(i) + 1}/${index.getX(i) + 1} ${index.getX(i + 1) + 1}/${index.getX(i + 1) + 1}/${index.getX(i + 1) + 1} ${index.getX(i + 2) + 1}/${index.getX(i + 2) + 1}/${index.getX(i + 2) + 1}\n`;

  return obj;
}

export function exportToSTL(geometry: THREE.BufferGeometry): Uint8Array {
  const geom = geometry.index ? geometry.toNonIndexed() : geometry;
  const pos = geom.attributes.position;
  const triCount = pos.count / 3;

  const bufferSize = 84 + triCount * 50;
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  const header = "NPNH-style 3D Solid STL Binary";
  for (let i = 0; i < 80; i++)
    view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);

  view.setUint32(80, triCount, true);

  let offset = 84;
  const vA = new THREE.Vector3();
  const vB = new THREE.Vector3();
  const vC = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();

  for (let i = 0; i < pos.count; i += 3) {
    vA.fromBufferAttribute(pos, i);
    vB.fromBufferAttribute(pos, i + 1);
    vC.fromBufferAttribute(pos, i + 2);
    cb.subVectors(vC, vB);
    ab.subVectors(vA, vB);
    cb.cross(ab).normalize();

    view.setFloat32(offset, cb.x, true);
    view.setFloat32(offset + 4, cb.y, true);
    view.setFloat32(offset + 8, cb.z, true);
    offset += 12;

    view.setFloat32(offset, vA.x, true);
    view.setFloat32(offset + 4, vA.y, true);
    view.setFloat32(offset + 8, vA.z, true);
    offset += 12;

    view.setFloat32(offset, vB.x, true);
    view.setFloat32(offset + 4, vB.y, true);
    view.setFloat32(offset + 8, vB.z, true);
    offset += 12;

    view.setFloat32(offset, vC.x, true);
    view.setFloat32(offset + 4, vC.y, true);
    view.setFloat32(offset + 8, vC.z, true);
    offset += 12;

    view.setUint16(offset, 0, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}
