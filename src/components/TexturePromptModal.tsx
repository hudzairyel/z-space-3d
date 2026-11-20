"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Wand2, Eye, Download, Loader2, CheckCircle, Zap } from "lucide-react";

/* ─── Procedural Noise (value + simplex-lite) ───────────────────────────── */

const perm = new Uint8Array(512);
(() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
})();

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number) {
  const h = hash & 3;
  return ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
}

function noise2d(x: number, y: number): number {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = fade(xf), v = fade(yf);
  const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
  const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v
  );
}

function fbm(
  x: number, y: number,
  octaves = 6, lacunarity = 2, gain = 0.5, seed = 0
): number {
  let value = 0, amplitude = 1, maxVal = 0;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise2d(x + seed, y + seed);
    maxVal += amplitude;
    amplitude *= gain;
    x *= lacunarity; y *= lacunarity;
  }
  return value / maxVal;
}

/* ─── Style presets mapped from keyword tokens ───────────────────────────── */

interface PatternConfig {
  fx: (u: number, v: number, detail: number) => number;
  name: string;
  category: "rough" | "smooth" | "detail";
}

const PATTERNS: Record<string, PatternConfig> = {
  stone: {
    name: "Stone", category: "rough",
    fx: (u, v, d) => fbm(u * d * 3, v * d * 3, 7, 2.1, 0.45, 1.0) * 0.5 +
                     fbm(u * d * 0.5 + 10, v * d * 0.5 + 10, 4, 2.0, 0.5, 2.0) * 0.3 + 0.2,
  },
  brushed: {
    name: "Brushed Metal", category: "detail",
    fx: (u, v, d) => {
      const line = Math.sin(v * d * 20 + fbm(u * d * 2, v * d * 2, 3, 2.0, 0.5, 3.0) * 2) * 0.5 + 0.5;
      return line * 0.4 + fbm(u * d * 5, v * d * 5, 4, 2.0, 0.5, 4.0) * 0.2 + 0.3;
    },
  },
  woven: {
    name: "Fabric Weave", category: "detail",
    fx: (u, v, d) => {
      const gx = (Math.sin(u * d * 8) * Math.sin(v * d * 8) > 0) ? 0.6 : 0.2;
      return gx + fbm(u * d * 3, v * d * 3, 4, 2.0, 0.5, 5.0) * 0.2;
    },
  },
  wood: {
    name: "Wood Grain", category: "smooth",
    fx: (u, v, d) => {
      const grain = Math.sin(v * d * 6 + fbm(u * d * 1.5, v * d * 1.5, 3, 2.0, 0.5, 6.0) * 3) * 0.5 + 0.5;
      return grain * 0.7 + fbm(u * d * 0.3, v * d * 0.3, 3, 2.0, 0.5, 7.0) * 0.3;
    },
  },
  concrete: {
    name: "Concrete", category: "rough",
    fx: (u, v, d) => {
      const pock = Math.max(0, fbm(u * d * 4, v * d * 4, 5, 2.2, 0.4, 8.0)) * 0.4;
      return 0.3 + pock + fbm(u * d * 8, v * d * 8, 4, 2.0, 0.5, 9.0) * 0.15;
    },
  },
  marble: {
    name: "Marble Vein", category: "detail",
    fx: (u, v, d) => {
      const vein = Math.abs(Math.sin(fbm(u * d * 2, v * d * 2, 4, 2.1, 0.5, 10.0) * 4));
      return 0.5 - vein * 0.3 + fbm(u * d * 1.5, v * d * 1.5, 5, 2.0, 0.5, 11.0) * 0.2;
    },
  },
  ceramic: {
    name: "Ceramic Glaze", category: "smooth",
    fx: (_u, _v, _d) => {
      // mostly smooth with subtle variation
      return 0.5 + fbm(_u * 2, _v * 2, 3, 2.0, 0.5, 12.0) * 0.1;
    },
  },
  cratered: {
    name: "Cratered Moon", category: "rough",
    fx: (u, v, d) => {
      const craters = fbm(u * d * 1.5, v * d * 1.5, 6, 2.3, 0.4, 13.0);
      const pits = Math.max(0, -craters * 2) * 0.5;
      return 0.3 + pits + (craters > 0 ? craters * 0.2 : 0);
    },
  },
  carbon: {
    name: "Carbon Fibre", category: "detail",
    fx: (u, v, d) => {
      const weft = Math.sin(u * d * 12) * Math.sin(v * d * 12);
      const base = weft > 0 ? 0.65 : 0.25;
      return base + fbm(u * d * 4, v * d * 4, 3, 2.0, 0.5, 14.0) * 0.1;
    },
  },
};

function classifyPrompt(text: string): PatternConfig {
  const t = text.toLowerCase();
  if (/stone|rock|granite|mountain|rugged|cobble/.test(t)) return PATTERNS.stone;
  if (/brushed|metal|steel|chrome|aluminium|satin/.test(t)) return PATTERNS.brushed;
  if (/fabric|cloth|weave|textile|linen|denim|cotton/.test(t)) return PATTERNS.woven;
  if (/wood|timber|oak|pine|dowel|grain|bark/.test(t)) return PATTERNS.wood;
  if (/concrete|cement|asphalt|rough|industrial/.test(t)) return PATTERNS.concrete;
  if (/marble|onyx|vein|polished\/stone/.test(t)) return PATTERNS.marble;
  if (/ceramic|glaze|porcelain|tile|pottery/.test(t)) return PATTERNS.ceramic;
  if (/crater|moon|asteroid|pitted|meteor/.test(t)) return PATTERNS.cratered;
  if (/carbon|fibre|fiber|weave|composite/.test(t)) return PATTERNS.carbon;
  // default: stone as fallback
  return PATTERNS.stone;
}

/* ─── Generate normal-map canvas from config ────────────────────────────── */

function generateNormalMapCanvas(config: PatternConfig, size = 512): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const res = size;

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = x / res, v = y / res;
      const k = config.fx(u, v, 4);
      const kU = config.fx((x + 1) / res, v, 4);
      const kV = config.fx(u, (y + 1) / res, 4);
      const dU = (kU - k) * 255;
      const dV = (kV - k) * 255;

      // Convert height → normal (simplified gradient method)
      const nx = -dU / 128;
      const ny = -dV / 128;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

      const idx = (y * res + x) * 4;
      data[idx]     = Math.round((nx / len * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.round((ny / len * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.round((nz / len * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return c;
}

function generateBumpMapCanvas(config: PatternConfig, size = 512): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const res = size;

  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      const u = x / res, v = y / res;
      const k = config.fx(u, v, 4);
      const val = Math.round(k * 255);
      const idx = (y * res + x) * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = val;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return c;
}

/* ─── Main modal component ──────────────────────────────────────────────── */

export function TexturePromptModal({
  isOpen, onClose, onApplyToMesh, currentTextureUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  onApplyToMesh: (normalMapUrl: string, bumpMapUrl: string) => void;
  currentTextureUrl?: string | null;
}) {
  const [prompt, setPrompt] = useState("");
  const [pattern, setPattern] = useState<PatternConfig>(PATTERNS.stone);
  const [generating, setGenerating] = useState(false);
  const [normalMapUrl, setNormalMapUrl] = useState<string | null>(null);
  const [bumpMapUrl, setBumpMapUrl] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [seed, setSeed] = useState(0);
  const [detailLevel, setDetailLevel] = useState(4);
  const intRef = useRef<number>(0);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setApplied(false);
    // Use setTimeout to allow loading state to render
    intRef.current = window.setTimeout(() => {
      const nC = generateNormalMapCanvas(pattern, 512);
      const bC = generateBumpMapCanvas(pattern, 512);
      setNormalMapUrl(nC.toDataURL());
      setBumpMapUrl(bC.toDataURL());
      setGenerating(false);
    }, 50);
  }, [pattern]);

  useEffect(() => {
    if (isOpen && !normalMapUrl) handleGenerate();
    return () => { if (intRef.current) clearTimeout(intRef.current); };
  }, [isOpen]);

  const handleApply = () => {
    if (!normalMapUrl) return;
    onApplyToMesh(normalMapUrl, bumpMapUrl!);
    setApplied(true);
  };

  const handleChangePrompt = (val: string) => {
    setPrompt(val);
    setApplied(false);
    setSeed(s => s + 1);
    const cfg = classifyPrompt(val);
    setPattern(cfg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d0d0d] border border-white/15 rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Wand2 size={16} className="text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300">AI Texture Prompt</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Prompt input */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 block mb-2">Describe your texture</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => handleChangePrompt(e.target.value)}
              placeholder="e.g. brushed metal, cracked stone, woven fabric…"
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-purple-500/60 transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(PATTERNS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { setPattern(cfg); setPrompt(cfg.name); setApplied(false); }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                  pattern.name === cfg.name
                    ? "bg-purple-600/30 border-purple-500/60 text-purple-200"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {cfg.name}
              </button>
            ))}
          </div>

          {/* Detail slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-xs text-zinc-400">Detail Level</span>
              <span className="text-xs text-zinc-500 font-mono">{detailLevel}</span>
            </div>
            <input
              type="range" min={1} max={8} step={1} value={detailLevel}
              onChange={(e) => setDetailLevel(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(168,85,247,0.6)]"
            />
          </div>

          {/* Preview grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Normal Map", url: normalMapUrl, icon: Eye },
              { label: "Bump Map", url: bumpMapUrl, icon: Layers },
            ].map(({ label, url, icon: Ic }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Ic size={10}/> {label}</span>
                  {url && (
                    <a href={url} download={`${label.toLowerCase().replace(" ", "-")}.png`} className="text-zinc-600 hover:text-white transition-colors">
                      <Download size={12} />
                    </a>
                  )}
                </div>
                <div className="aspect-square rounded-lg border border-white/10 bg-[#111] overflow-hidden flex items-center justify-center">
                  {generating ? (
                    <Loader2 size={20} className="animate-spin text-purple-400" />
                  ) : url ? (
                    <img src={url} alt={label} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-zinc-700 text-[10px]">Empty</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 py-2 rounded-lg border border-white/15 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {generating ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
              Regenerate
            </button>
            <button
              onClick={handleApply}
              disabled={!normalMapUrl || generating}
              className="flex-1 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-500 disabled:bg-white/10 disabled:text-zinc-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              {applied ? <CheckCircle size={13} /> : <Wand2 size={13} />}
              {applied ? "Applied ✓" : "Apply to Mesh"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stub: Layers icon alias (not in lucide by that name in some versions) ── */
import { Layers } from "lucide-react";
