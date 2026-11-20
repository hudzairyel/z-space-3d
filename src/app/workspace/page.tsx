"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import * as THREE from "three";
import { generateMeshFromImage, exportToOBJ, exportToSTL, extractAllColors } from "../../utils/meshGenerator";
import { TexturePromptModal } from "../../components/TexturePromptModal";

import Link from "next/link";
import {
  Image as ImageIcon,
  Upload,
  X,
  RotateCw,
  Sparkles,
  Download,
  Camera,
  History,
  Circle,
  Sun,
  Moon,
  Droplets,
  Layers,
  Settings,
  Eye,
  Box,
  Palette,
  Zap,
  Globe,
  Star,
  Loader2,
  Wand2,
} from "lucide-react";

/* ── Animated particles ─────────────────────────────────────────────────── */
function Particles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.02;
    ref.current.rotation.x = t * 0.01;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.4} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ── Glow ring under mesh ────────────────────────────────────────────────── */
function GlowRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.scale.setScalar(1 + 0.04 * Math.sin(t * 1.5));
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.12 + 0.06 * Math.sin(t * 1.5);
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
      <ringGeometry args={[1.4, 1.6, 64]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ── Orbiting light for dynamic reflections ─────────────────────────────── */
function OrbitingLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.set(Math.cos(t * 0.8) * 3, 1.5 + Math.sin(t * 0.5) * 0.8, Math.sin(t * 0.8) * 3);
  });
  return <pointLight ref={ref} intensity={0.9} color="#ffffff" distance={12} />;
}

/* ── Galaxy Space Environment (3D) ───────────────────────────────────────── */
function GalaxyEnvironment() {
  const starsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      // Distribute in a galaxy spiral shape
      const radius = 4 + Math.random() * 12;
      const angle = Math.random() * Math.PI * 2 + (radius / 10);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 2 * Math.exp(-radius / 6);
      
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      const t = state.clock.elapsedTime;
      starsRef.current.rotation.y = t * 0.005;
      starsRef.current.rotation.x = t * 0.002;
    }
  });

  return (
    <>
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#ffffff" transparent opacity={0.8} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}

/* ── Scanning grid plane ─────────────────────────────────────────────────── */
function ScanGrid() {
  const ref = useRef<THREE.GridHelper>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.Material;
    mat.opacity = 0.05 + 0.04 * Math.sin(state.clock.elapsedTime * 2);
  });
  return (
    <gridHelper
      ref={ref}
      args={[12, 24, 0xffffff, 0x333333]}
      position={[0, -1.4, 0]}
    />
  );
}

/* ── 3D Orbiting Chain Effect ───────────────────────────────────────────── */
function ChainRing({ radius, linkCount, reverse = false }: { radius: number; linkCount: number; reverse?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.z = t * 0.25 * (reverse ? -1 : 1);
  });

  const links = useMemo(() => {
    const items = [];
    for (let i = 0; i < linkCount; i++) {
      const angle = (i / linkCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      items.push({ x, z, angle });
    }
    return items;
  }, [radius, linkCount]);

  return (
    <group ref={groupRef}>
      {links.map((link, idx) => (
        <mesh
          key={idx}
          position={[link.x, 0, link.z]}
          rotation={[Math.PI / 2, -link.angle, 0]}
        >
          <torusGeometry args={[0.07, 0.015, 8, 12]} />
          <meshStandardMaterial
            color="#ffffff"
            metalness={0.95}
            roughness={0.15}
            emissive="#ffffff"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function OrbitingChain() {
  const chainRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!chainRef.current) return;
    const t = state.clock.elapsedTime;
    chainRef.current.rotation.y = t * 0.4;
    chainRef.current.rotation.x = Math.sin(t * 0.3) * 0.25;
  });

  return (
    <group ref={chainRef}>
      <ChainRing radius={1.6} linkCount={24} />
      <ChainRing radius={2.0} linkCount={32} reverse />
    </group>
  );
}

/* ── 3D Mesh viewer ─────────────────────────────────────────────────────── */
function MeshViewer({
  stylization = "Realistic",
  imageUrl,
  depthScale,
  gridSize,
  smoothness,
  remeshLevel,
  texRes,
  wireframe,
  useTexture,
  materialPreset,
  customColor,
  tintAmount,
  metalness,
  roughness,
  autoRotate,
  floatHeight,
  textureOpacity,
  animationMode,
  animStack,
  showChains,
  flipX,
  flipY,
  flipZ,
  scale,
  showUV,
  normalMapUrl,
  bumpMapUrl,
  onColorsExtracted,
  onGeometryChange,
}: {
  stylization?: string;
  imageUrl: string | null;
  depthScale: number;
  gridSize: number;
  smoothness: number;
  remeshLevel: "low" | "medium" | "high";
  texRes: number;
  wireframe: boolean;
  useTexture: boolean;
  materialPreset: string;
  customColor: string;
  tintAmount: number;
  metalness: number;
  roughness: number;
  autoRotate: boolean;
  floatHeight: number;
  textureOpacity: number;
  animationMode: string;
  animStack: string[];
  showChains: boolean;
  flipX: boolean;
  flipY: boolean;
  flipZ: boolean;
  scale: number;
  showUV: boolean;
  normalMapUrl?: string | null;
  bumpMapUrl?: string | null;
  onColorsExtracted?: (colors: string[]) => void;
  onGeometryChange?: (geom: THREE.BufferGeometry | null) => void;
}) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [normalMapTexture, setNormalMapTexture] = useState<THREE.Texture | null>(null);
  const [bumpMapTexture, setBumpMapTexture] = useState<THREE.Texture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [entry, setEntry] = useState(0);

  // Load normal map & bump map
  useEffect(() => {
    if (!normalMapUrl) {
      setNormalMapTexture(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const tex = new THREE.CanvasTexture(img);
      tex.colorSpace = THREE.NoColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
      setNormalMapTexture(tex);
    };
    img.src = normalMapUrl;
  }, [normalMapUrl]);

  useEffect(() => {
    if (!bumpMapUrl) {
      setBumpMapTexture(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const tex = new THREE.CanvasTexture(img);
      tex.colorSpace = THREE.NoColorSpace;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.needsUpdate = true;
      setBumpMapTexture(tex);
    };
    img.src = bumpMapUrl;
  }, [bumpMapUrl]);

  useEffect(() => {
    setEntry(0);
    const timer = setTimeout(() => setEntry(1), 600);
    return () => clearTimeout(timer);
  }, [imageUrl, geometry]);

  // Generate mesh from image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Create square canvas texture (UV expects square texture with letterboxing)
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const size = Math.max(naturalW, naturalH);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      // Fill background black (letterbox bars)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, size, size);
      // Draw image centered
      const scale = size / Math.max(naturalW, naturalH);
      const dw = naturalW * scale;
      const dh = naturalH * scale;
      ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

      // Downscale texture based on selected resolution
      const targetSize = texRes;
      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = targetSize;
      scaledCanvas.height = targetSize;
      const scaledCtx = scaledCanvas.getContext("2d")!;
      scaledCtx.drawImage(canvas, 0, 0, targetSize, targetSize);

      const tex = new THREE.CanvasTexture(scaledCanvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      setTexture(tex);

      // Extract dominant palette for UI
      const palette = extractAllColors(img, 5);
      if (onColorsExtracted) {
        onColorsExtracted(palette.map(([r, g, b]) => `rgb(${r},${g},${b})`));
      }

      let geom = generateMeshFromImage(img, gridSize, depthScale, smoothness, tex);
      
      // Apply stylization modifiers
      if (stylization === "Low Poly") {
        // Aggressively decimate to very low face count
        const idxArr = geom.index?.array;
        if (idxArr && Array.isArray(idxArr)) {
          const targetFaces = 300;
          const step = Math.max(1, Math.floor(idxArr.length / (targetFaces * 3)));
          const newIdx: number[] = [];
          for (let i = 0; i < idxArr.length; i += step) {
            newIdx.push(idxArr[i]);
          }
          const reduced = geom.clone();
          reduced.setIndex(newIdx);
          geom = reduced;
        }
      } else if (stylization === "Anime") {
        // Flatten depth (reduce depthScale effect) for cel-shaded look
        const pos = geom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          pos.setZ(i, pos.getZ(i) * 0.6);
        }
        pos.needsUpdate = true;
      } else if (stylization === "Stylized") {
        // Exaggerate depth for poppy stylized look
        const pos = geom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          pos.setZ(i, pos.getZ(i) * 1.8);
        }
        pos.needsUpdate = true;
      }
      
      // Simple face subsampling for remesh levels
      if (remeshLevel === "low" || remeshLevel === "medium") {
        const targetFaces = remeshLevel === "low" ? 800 : 1600;
        const idxArr = geom.index?.array;
        if (idxArr && Array.isArray(idxArr)) {
          const step = Math.max(1, Math.floor(idxArr.length / (targetFaces * 3)));
          const newIdx: number[] = [];
          for (let i = 0; i < idxArr.length; i += step) {
            newIdx.push(idxArr[i]);
          }
          const reduced = geom.clone();
          reduced.setIndex(newIdx);
          geom = reduced;
        }
      }

      geom.computeVertexNormals();
      setGeometry(geom);
      if (onGeometryChange) onGeometryChange(geom);
    };
    img.src = imageUrl;
  }, [imageUrl, gridSize, depthScale, smoothness, remeshLevel, stylization, onColorsExtracted]);

  let matColor = "#ffffff";
  let isMetal = metalness;
  let isRough = roughness;

  if (materialPreset === "white") {
    matColor = "#f5f5f5";
  } else if (materialPreset === "black") {
    matColor = "#1a1a1a";
  } else if (materialPreset === "metal") {
    matColor = "#cccccc";
    isMetal = 0.9;
    isRough = 0.15;
  } else if (materialPreset === "matte") {
    matColor = "#e2e8f0";
    isMetal = 0.0;
    isRough = 0.8;
  } else if (materialPreset === "gold") {
    matColor = "#ffd700";
    isMetal = 0.95;
    isRough = 0.2;
  } else if (materialPreset === "chrome") {
    matColor = "#ffffff";
    isMetal = 1.0;
    isRough = 0.05;
  } else if (materialPreset === "clay") {
    matColor = "#c2704e";
    isMetal = 0.0;
    isRough = 0.9;
  } else if (materialPreset === "neon") {
    matColor = "#00f5ff";
    isMetal = 0.2;
    isRough = 0.3;
  } else if (materialPreset === "ceramic") {
    matColor = "#f8f9fa";
    isMetal = 0.1;
    isRough = 0.2;
  } else if (materialPreset === "glass") {
    matColor = "#a5f3fc";
    isMetal = 0.0;
    isRough = 0.0;
  } else if (materialPreset === "rubber") {
    matColor = "#1e293b";
    isMetal = 0.0;
    isRough = 0.95;
  } else if (materialPreset === "emissive") {
    matColor = "#000000";
    isMetal = 0.0;
    isRough = 0.5;
  } else if (materialPreset === "custom") {
    matColor = customColor;
  }
  const hasTexture = useTexture && texture !== null;

  useEffect(() => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    if (hasTexture && texture) {
      mat.map = texture;
      // Base material color for texture multiplication — pure white keeps texture natural
      // When tintAmount > 0 and custom mode active, shift base toward the selected custom color
      const cBase = new THREE.Color(matColor);
      if (materialPreset === "custom") cBase.lerp(new THREE.Color(customColor), tintAmount);
      mat.color.copy(cBase);
      mat.metalness = isMetal;
      mat.roughness = isRough;
      mat.transparent = textureOpacity < 1.0 || materialPreset === "glass";
      mat.opacity = materialPreset === "glass" ? 0.4 : textureOpacity;
      if (textureOpacity < 1.0 || materialPreset === "glass") {
        mat.needsUpdate = true;
      }
      // Emissive setup
      if (materialPreset === "emissive") {
        mat.emissive.set("#00f5ff");
        mat.emissiveIntensity = 2.0;
        mat.emissiveMap = texture;
      } else {
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0.0;
        mat.emissiveMap = null;
      }
    } else {
      mat.map = null;
      mat.color.set(customColor !== undefined && materialPreset === "custom" ? customColor : matColor);
      mat.metalness = isMetal;
      mat.roughness = isRough;
      mat.transparent = materialPreset === "glass";
      mat.opacity = materialPreset === "glass" ? 0.4 : 1.0;
      // Emissive setup
      if (materialPreset === "emissive") {
        mat.emissive.set("#00f5ff");
        mat.emissiveIntensity = 2.0;
      } else {
        mat.emissive.set("#000000");
        mat.emissiveIntensity = 0.0;
      }
    }
    
    // Set maps
    mat.normalMap = normalMapTexture;
    mat.bumpMap = bumpMapTexture;
    mat.bumpScale = 0.05;

    mat.wireframe = wireframe;
    mat.needsUpdate = true;
  }, [hasTexture, texture, matColor, customColor, tintAmount, isMetal, isRough, wireframe, textureOpacity, materialPreset, normalMapTexture, bumpMapTexture]);

  const flipScale = [flipX ? -1 : 1, flipY ? -1 : 1, flipZ ? -1 : 1];

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    if (autoRotate) meshRef.current.rotation.y += 0.005;
    if (entry === 0) {
      const s = Math.min(1, t * 0.5);
      const ease = 1 - Math.pow(1 - s, 3);
      meshRef.current.scale.set(flipScale[0] * ease, flipScale[1] * ease, flipScale[2] * ease);
      meshRef.current.position.y = 0.5 * (1 - ease);
      return;
    }
    const modes = animStack.length > 0 ? animStack : [animationMode];
    let px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0;
    let sx = 1, sy = 1, sz = 1;
    for (const mode of modes) {
      if (mode === "float") py += floatHeight * Math.sin(t * 1.2);
      else if (mode === "pulse") {
        const p = 1 + 0.05 * Math.sin(t * 2.2);
        sx *= p; sy *= p; sz *= p;
      } else if (mode === "wave") {
        py += floatHeight * Math.sin(t * 1.1);
        rx += 0.12 * Math.sin(t * 0.7);
        rz += 0.08 * Math.sin(t * 0.9);
      } else if (mode === "turntable") ry += t * 0.5;
      else if (mode === "orbit") {
        ry += t * 0.35;
        rx += 0.25 * Math.sin(t * 0.5);
        py += floatHeight * Math.sin(t * 0.8);
      } else if (mode === "bounce") py += Math.abs(Math.sin(t * 2.4)) * floatHeight * 2;
      else if (mode === "swing") rz += 0.35 * Math.sin(t * 1.4);
      else if (mode === "heartbeat") {
        const beat = Math.pow(Math.max(0, Math.sin(t * 3.2)), 8);
        const p = 1 + 0.12 * beat;
        sx *= p; sy *= p; sz *= p;
      } else if (mode === "idle") {
        ry += 0.08 * Math.sin(t * 0.6);
        py += floatHeight * 0.25 * Math.sin(t * 0.9);
      }
    }
    meshRef.current.position.set(px, py, pz);
    meshRef.current.rotation.set(rx, ry, rz);
    meshRef.current.scale.set(flipScale[0] * scale * sx, flipScale[1] * scale * sy, flipScale[2] * scale * sz);
  });

  // UV checker texture
  const uvTexture = useMemo(() => {
    if (!showUV) return null;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, 64, 64);
    g.fillStyle = "#444";
    for (let x = 0; x < 4; x++)
      for (let y = 0; y < 4; y++)
        if ((x + y) % 2 === 0) g.fillRect(x * 16, y * 16, 16, 16);
    g.strokeStyle = "#ff00ff";
    g.lineWidth = 2;
    g.strokeRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, [showUV]);

  return (
    <Center>
      {geometry && (
        <>
          {showChains && <OrbitingChain />}
          <mesh ref={meshRef} castShadow receiveShadow>
            <primitive object={geometry} attach="geometry" />
            <meshStandardMaterial
              ref={materialRef}
              color={hasTexture ? matColor : matColor}
              map={showUV ? uvTexture : (hasTexture ? texture : null)}
              side={THREE.DoubleSide}
              wireframe={wireframe}
              roughness={isRough}
              metalness={isMetal}
              transparent={hasTexture && (textureOpacity < 1.0 || materialPreset === "glass")}
              opacity={hasTexture ? (materialPreset === "glass" ? 0.4 : textureOpacity) : (materialPreset === "glass" ? 0.4 : 1.0)}
              emissive={materialPreset === "emissive" ? "#00f5ff" : "#000000"}
              emissiveIntensity={materialPreset === "emissive" ? 2.0 : 0.0}
              emissiveMap={materialPreset === "emissive" && hasTexture ? texture : null}
            />
          </mesh>
        </>
      )}
    </Center>
  );
}

/* ── Toggle switch ───────────────────────────────────────────────────────── */
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0
        ${checked ? "bg-white" : "bg-zinc-700"}
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm
          transition-transform duration-200
          ${checked ? "translate-x-4.5" : "translate-x-0"}`}
      />
    </button>
  );
}

/* ── Range slider ────────────────────────────────────────────────────────── */
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-xs text-zinc-500 font-mono tabular-nums">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(255,255,255,0.4)]
          [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
          [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
      />
    </div>
  );
}

/* ── Section card ────────────────────────────────────────────────────────── */
function Card({
  title,
  children,
  icon: Icon,
}: {
  title?: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 space-y-4 backdrop-blur-sm">
      {title && (
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-gray-400" />}
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function WorkspacePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [depthScale, setDepthScale] = useState(0.35);
  const [gridSize, setGridSize] = useState(64);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; label: string; imageUrl?: string; time: string }>>([]);
  const [materialPreset, setMaterialPreset] = useState<"image" | "white" | "black" | "metal" | "matte" | "gold" | "chrome" | "clay" | "neon" | "ceramic" | "glass" | "rubber" | "emissive" | "custom">("image");
  const [useTexture, setUseTexture] = useState(true);
  const [textureOpacity, setTextureOpacity] = useState(1.0);
  const [customColor, setCustomColor] = useState("#ffffff");
  const [tintAmount, setTintAmount] = useState(0.0);
  const [metalness, setMetalness] = useState(0.1);
  const [roughness, setRoughness] = useState(0.25);
  const [autoRotate, setAutoRotate] = useState(false);
  const [floatHeight, setFloatHeight] = useState(0.1);
  const [animationMode, setAnimationMode] = useState<"none" | "float" | "pulse" | "wave" | "turntable" | "orbit" | "bounce" | "swing" | "heartbeat" | "idle">("float");
  const [animStack, setAnimStack] = useState<string[]>([]);
  const [gifBusy, setGifBusy] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [showGlowRing, setShowGlowRing] = useState(true);
  const [showOrbitLight, setShowOrbitLight] = useState(false);
  const [showScanGrid, setShowScanGrid] = useState(false);
  const [showChains, setShowChains] = useState(false);
  const [background, setBackground] = useState<"dark" | "light" | "gradient" | "transparent">("dark");
  const [colorPalette, setColorPalette] = useState<string[]>([]);
  const [smoothness, setSmoothness] = useState(30);
  const [remeshLevel, setRemeshLevel] = useState<"low" | "medium" | "high">("high");
  const [texRes, setTexRes] = useState(512);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [flipZ, setFlipZ] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [showUV, setShowUV] = useState(false);
  const [emissionColor, setEmissionColor] = useState("#000000");
  const [emissionIntensity, setEmissionIntensity] = useState(0);
  const [clearcoat, setClearcoat] = useState(0);
  const [uvRepeatU, setUvRepeatU] = useState(1);
  const [uvRepeatV, setUvRepeatV] = useState(1);
  const [cameraAngle, setCameraAngle] = useState("default");
  const [showGrid, setShowGrid] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(false);
  const [boundingBox, setBoundingBox] = useState<{ min: number[]; max: number[] } | null>(null);
  const [mobileTab, setMobileTab] = useState<"image" | "model" | "animate" | "assets">("model");
  const [stylization, setStylization] = useState<string>("Realistic");
  const [showTextureModal, setShowTextureModal] = useState(false);
  const [normalMapUrl, setNormalMapUrl] = useState<string | null>(null);
  const [bumpMapUrl, setBumpMapUrl] = useState<string | null>(null);

  const handleColorsExtracted = useCallback((colors: string[]) => {
    setColorPalette(colors);
  }, []);

  // Keep texture active on all materials; only reset opacity on preset change
  useEffect(() => {
    setTextureOpacity(1.0);
    setUseTexture(true);
  }, [materialPreset]);

  // Re-generate mesh when Remesh Quality, Texture Resolution or Stylization is changed
  useEffect(() => {
    if (imageUrl) {
      console.log("Generating with style:", stylization);
      handleGenerate();
    }
  }, [remeshLevel, texRes, stylization]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string);
      setMaterialPreset("image");
      setUseTexture(true);
      setTextureOpacity(1.0);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!imageUrl) return;
    setIsGenerating(true);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Create square canvas texture (UV expects square texture with letterboxing)
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const size = Math.max(naturalW, naturalH);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      // Fill background black (letterbox bars)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, size, size);
      // Draw image centered
      const scale = size / Math.max(naturalW, naturalH);
      const dw = naturalW * scale;
      const dh = naturalH * scale;
      ctx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;

      const geom = generateMeshFromImage(img, gridSize, depthScale, smoothness, tex);

      // Set geometry via custom event or callback
      window.dispatchEvent(new CustomEvent('meshGenerated', { detail: { geometry: geom } }));

      setHistory((prev) => [
        { id: Date.now().toString(), label: "Image Generation", imageUrl: imageUrl || undefined, time: "Just now" },
        ...prev,
      ]);
      setIsGenerating(false);
    };
    img.src = imageUrl;
  };

  const download = async (type: "glb" | "obj" | "stl") => {
    if (!imageUrl || !geometry) return;

    const downloadBlob = (blob: Blob, ext: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `model.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = async () => {
      const TARGET = 2048;
      const c = document.createElement("canvas");
      c.width = c.height = TARGET;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, TARGET, TARGET);
      const scale = TARGET / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
      const dw = (img.naturalWidth || img.width) * scale;
      const dh = (img.naturalHeight || img.height) * scale;
      ctx.drawImage(img, (TARGET - dw) / 2, (TARGET - dh) / 2, dw, dh);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const geom = generateMeshFromImage(img, gridSize, depthScale, smoothness, tex);

      if (type === "glb") {
        const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
        const mat = new THREE.MeshStandardMaterial({ map: tex, color: 0xffffff });
        const mesh = new THREE.Mesh(geom, mat);
        const group = new THREE.Group();
        group.add(mesh);
        new GLTFExporter().parse(
          group,
          (result) => {
            downloadBlob(new Blob([result as ArrayBuffer], { type: "model/gltf-binary" }), "glb");
          },
          (err) => console.error("GLTF export error:", err),
          { binary: true }
        );
        return;
      }

      if (type === "obj") {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 2048;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 2048, 2048);
        const scale = 2048 / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
        const dw = (img.naturalWidth || img.width) * scale;
        const dh = (img.naturalHeight || img.height) * scale;
        ctx.drawImage(img, (2048 - dw) / 2, (2048 - dh) / 2, dw, dh);
        
        const result = exportToOBJ(geom, canvas);
        downloadBlob(new Blob([result.obj], { type: "text/plain" }), "obj");
        
        if (result.texture) {
          const blobUrl = URL.createObjectURL(result.texture);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = "texture.png";
          a.click();
          URL.revokeObjectURL(blobUrl);
        }
        return;
      }

      if (type === "stl") {
        downloadBlob(new Blob([exportToSTL(geom).slice().buffer], { type: "model/stl" }), "stl");
      }
    };
    img.src = imageUrl;
  };

  const takeScreenshot = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "mesh.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const applyAnimPose = (mesh: THREE.Object3D, t: number, modes: string[]) => {
    let px = 0, py = 0, pz = 0, rx = 0, ry = 0, rz = 0;
    let sx = 1, sy = 1, sz = 1;
    for (const mode of modes) {
      if (mode === "float") py += floatHeight * Math.sin(t * 1.2);
      else if (mode === "pulse") {
        const p = 1 + 0.05 * Math.sin(t * 2.2);
        sx *= p; sy *= p; sz *= p;
      } else if (mode === "wave") {
        py += floatHeight * Math.sin(t * 1.1);
        rx += 0.12 * Math.sin(t * 0.7);
        rz += 0.08 * Math.sin(t * 0.9);
      } else if (mode === "turntable") ry += t * 0.5;
      else if (mode === "orbit") {
        ry += t * 0.35;
        rx += 0.25 * Math.sin(t * 0.5);
        py += floatHeight * Math.sin(t * 0.8);
      } else if (mode === "bounce") py += Math.abs(Math.sin(t * 2.4)) * floatHeight * 2;
      else if (mode === "swing") rz += 0.35 * Math.sin(t * 1.4);
      else if (mode === "heartbeat") {
        const beat = Math.pow(Math.max(0, Math.sin(t * 3.2)), 8);
        const p = 1 + 0.12 * beat;
        sx *= p; sy *= p; sz *= p;
      } else if (mode === "idle") {
        ry += 0.08 * Math.sin(t * 0.6);
        py += floatHeight * 0.25 * Math.sin(t * 0.9);
      }
    }
    mesh.position.set(px, py, pz);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set((flipX ? -1 : 1) * scale * sx, (flipY ? -1 : 1) * scale * sy, (flipZ ? -1 : 1) * scale * sz);
  };

  const downloadGif = async () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas || !geometry || gifBusy) return;
    setGifBusy(true);
    try {
      const { encodeGif } = await import("../../utils/gifEncode");
      const frames = 16;
      const w = 240;
      const h = Math.max(1, Math.round((canvas.height / canvas.width) * w));
      const snap = document.createElement("canvas");
      snap.width = w;
      snap.height = h;
      const ctx = snap.getContext("2d", { willReadFrequently: true })!;
      const images: ImageData[] = [];
      for (let i = 0; i < frames; i++) {
        ctx.drawImage(canvas, 0, 0, w, h);
        images.push(ctx.getImageData(0, 0, w, h));
        await new Promise((r) => setTimeout(r, 110));
      }
      const bytes = encodeGif(images, 11);
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/gif" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "model.gif";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("GIF export error:", err);
    } finally {
      setGifBusy(false);
    }
  };

  const downloadFbx = () => {
    // Three.js has no native FBXExporter. Fallback to GLB (recommended) or OBJ
    if (!geometry || !imageUrl) return;
    download("glb");
  };

  const bgStyle =
    background === "dark"
      ? "radial-gradient(ellipse at center, #000000 0%, #000000 60%, #050505 100%)"
      : background === "light"
        ? "radial-gradient(ellipse at center, #1a1a1a 0%, #050505 100%)"
        : background === "gradient"
          ? "radial-gradient(ellipse at center, #0a0a1a 0%, #000000 100%)"
          : "transparent";

  const materialOptions: { key: typeof materialPreset; label: string }[] = [
    { key: "image", label: "Image" },
    { key: "white", label: "White" },
    { key: "black", label: "Black" },
    { key: "metal", label: "Metal" },
    { key: "matte", label: "Matte" },
    { key: "gold", label: "Gold" },
    { key: "chrome", label: "Chrome" },
    { key: "clay", label: "Clay" },
    { key: "neon", label: "Neon" },
    { key: "ceramic", label: "Ceramic" },
    { key: "glass", label: "Glass" },
    { key: "rubber", label: "Rubber" },
    { key: "emissive", label: "Emissive" },
    { key: "custom", label: "Custom" },
  ];

  const animationOptions: { key: "none" | "float" | "pulse" | "wave" | "turntable" | "orbit" | "bounce" | "swing" | "heartbeat" | "idle"; label: string }[] = [
    { key: "none", label: "None" },
    { key: "float", label: "Float" },
    { key: "pulse", label: "Pulse" },
    { key: "wave", label: "Wave" },
    { key: "turntable", label: "Spin" },
    { key: "orbit", label: "Orbit" },
    { key: "bounce", label: "Bounce" },
    { key: "swing", label: "Swing" },
    { key: "heartbeat", label: "Heartbeat" },
    { key: "idle", label: "Idle" },
  ];

  const bgOptions: { key: typeof background; label: string; icon: React.ReactNode }[] = [
    { key: "dark", label: "Dark", icon: <Moon size={12} /> },
    { key: "light", label: "Light", icon: <Sun size={12} /> },
    { key: "gradient", label: "Gradient", icon: <Droplets size={12} /> },
    { key: "transparent", label: "Clear", icon: <Eye size={12} /> },
  ];

  const [showMobilePanel, setShowMobilePanel] = useState(false);

  const openMobileTab = (tab: any) => {
    setMobileTab(tab);
    setShowMobilePanel(true);
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white select-none overflow-hidden">

      {/* ═══ NAV RAIL (Desktop only) ═══ */}
      <nav className="hidden md:flex w-16 bg-[#0a0a0a] border-r border-white/10 flex-col items-center py-5 gap-6 z-20 flex-shrink-0">
        <Link href="/" className="group">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-all">
            <img src="/logo.png" alt="Z" className="w-5 h-5 object-contain" />
          </div>
        </Link>
        <div className="flex flex-col gap-3 mt-4">
          {[
            { id: "image", icon: ImageIcon, label: "Image" },
            { id: "model", icon: Box, label: "3D Model" },
            { id: "animate", icon: Zap, label: "Animate" },
            { id: "assets", icon: Layers, label: "Assets" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id as any)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                mobileTab === tab.id
                  ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
              title={tab.label}
            >
              <tab.icon size={18} />
            </button>
          ))}
        </div>
      </nav>

      {/* ═══ SETTINGS SIDEBAR (Desktop) / Overlay (Mobile) ═══ */}
      <aside className="hidden md:flex w-80 bg-[#0d0d0d] border-r border-white/10 flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            {mobileTab === "image" && "Image to 3D"}
            {mobileTab === "model" && "3D Model Settings"}
            {mobileTab === "animate" && "Animation Studio"}
            {mobileTab === "assets" && "My Assets"}
          </span>
          <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">Z-Space</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mobileTab === "image" && (
            <>
              <Card title="Source Image" icon={Sparkles}>
                <div className="space-y-3">
                  <label className="flex flex-col items-center gap-2 border-2 border-dashed border-white/15 rounded-xl p-6 cursor-pointer hover:border-white/30 transition-colors bg-white/[0.02]">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs text-gray-400 text-center">Upload concept art or image</span>
                      </>
                    )}
                  </label>
                  {imageUrl && (
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    >
                      {isGenerating ? <RotateCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {isGenerating ? "Generating..." : "Generate 3D"}
                    </button>
                  )}
                </div>
              </Card>

              <Card title="Stylization" icon={Palette}>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {["Realistic", "Stylized", "Low Poly", "Anime"].map((st) => (
                    <button 
                      key={st}
                      onClick={() => setStylization(st)}
                      className={`p-2 border rounded-lg hover:border-white/30 text-left bg-white/5 transition-all ${
                        stylization === st ? "border-white bg-white/20" : "border-white/10"
                      }`}
                    >
                      <div className="font-bold text-gray-200">{st}</div>
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}

          {mobileTab === "model" && (
            <>
              {/* Material Settings */}
              <Card title="Material & Shader" icon={Layers}>
                <div className="grid grid-cols-3 gap-2">
                  {materialOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setMaterialPreset(opt.key)}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                        materialPreset === opt.key
                          ? "bg-white text-black border-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                
                {materialPreset === "image" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Texture Map</span>
                      <Toggle checked={useTexture} onChange={setUseTexture} />
                    </div>
                    {useTexture && (
                      <Slider
                        label="Opacity"
                        value={textureOpacity}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={setTextureOpacity}
                        display={`${Math.round(textureOpacity * 100)}%`}
                      />
                    )}
                  </div>
                )}
              </Card>

              {/* Geometry & Remesh */}
              <Card title="Mesh Optimization" icon={Settings}>
                <div className="space-y-4">
                  <Slider label="Depth" value={depthScale} min={0.1} max={1.0} step={0.05} onChange={setDepthScale} display={depthScale.toFixed(2)} />
                  <Slider label="Resolution" value={gridSize} min={64} max={256} step={32} onChange={setGridSize} display={gridSize.toString()} />
                  <Slider label="Smoothness" value={smoothness} min={0} max={80} step={1} onChange={setSmoothness} display={smoothness.toString()} />
                  
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs text-zinc-400 block">Smart Topology (Remesh)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["low", "medium", "high"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setRemeshLevel(lvl)}
                          className={`py-1.5 rounded-lg border text-center transition-all ${
                            remeshLevel === lvl
                              ? "bg-white text-black font-bold border-white"
                              : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          <span className="text-[10px] uppercase font-bold">{lvl}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          {mobileTab === "animate" && (
            <Card title="Animation Tracks" icon={Zap}>
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 block">Stack motion layers on imported mesh:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {animationOptions.map((opt) => {
                    const on = animStack.includes(opt.key) || (animStack.length === 0 && animationMode === opt.key);
                    return (
                      <button
                        key={opt.key}
                        onClick={() => {
                          if (opt.key === "none") {
                            setAnimStack([]);
                            setAnimationMode("none");
                            return;
                          }
                          setAnimStack((prev) => {
                            const next = prev.includes(opt.key)
                              ? prev.filter((k) => k !== opt.key)
                              : [...prev.filter((k) => k !== "none"), opt.key];
                            setAnimationMode((next[0] as typeof animationMode) || "none");
                            return next;
                          });
                        }}
                        className={`py-2 rounded-md text-[10px] font-bold border transition-all ${
                          on ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {mobileTab === "assets" && (
            <Card title="Export & History" icon={Download}>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-1.5">
                  {(["glb", "obj", "stl"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => download(type)}
                      disabled={!geometry}
                      className="py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-xs font-bold border border-zinc-700"
                    >
                      .{type.toUpperCase()}
                    </button>
                  ))}
                  <button
                    onClick={downloadFbx}
                    disabled={!geometry}
                    className="py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-xs font-bold border border-zinc-700"
                  >
                    .FBX
                  </button>
                  <button
                    onClick={() => !gifBusy && downloadGif()}
                    disabled={!geometry}
                    className="col-span-2 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-xs font-bold border border-zinc-700 flex items-center justify-center gap-1.5"
                  >
                    {gifBusy && <Loader2 size={12} className="animate-spin" />}
                    {gifBusy ? "Recording..." : "⚡ GIF Loop"}
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </aside>

      {/* ═══ MAIN VIEWPORT (Meshy Style) ═══ */}
      <main className="flex-1 relative overflow-hidden bg-black">

        {/* Mobile Panel Overlay */}
        {showMobilePanel && (
          <div className="md:hidden fixed inset-0 bottom-14 z-40 bg-[#0d0d0d] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d0d0d] flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {mobileTab === "image" && "Image to 3D"}
                {mobileTab === "model" && "3D Model Settings"}
                {mobileTab === "animate" && "Animation Studio"}
                {mobileTab === "assets" && "My Assets"}
              </span>
              <button onClick={() => setShowMobilePanel(false)} className="p-1.5 rounded-full hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mobileTab === "image" && (
                <>
                  <Card title="Source Image" icon={Sparkles}>
                    <div className="space-y-3">
                      <div className="relative w-full min-h-[120px]">
                        <label className="flex flex-col items-center gap-2 border-2 border-dashed border-white/15 rounded-xl p-6 cursor-pointer hover:border-white/30 transition-colors bg-white/[0.02] min-h-[120px] justify-center w-full relative">
                          <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 m-0 p-0" onChange={handleFileUpload} />
                          {imageUrl ? (
                            <img src={imageUrl} alt="Preview" className="max-h-32 rounded-lg object-contain pointer-events-none" />
                          ) : (
                            <>
                              <Upload size={24} className="text-gray-400 pointer-events-none" />
                              <span className="text-xs text-gray-400 text-center pointer-events-none">Upload concept art or image</span>
                            </>
                          )}
                        </label>
                      </div>
                      {imageUrl && (
                        <button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="w-full py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                          {isGenerating ? <RotateCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          {isGenerating ? "Generating..." : "Generate 3D"}
                        </button>
                      )}
                    </div>
                  </Card>
                  <Card title="Stylization" icon={Palette}>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {["Realistic", "Stylized", "Low Poly", "Anime"].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStylization(st)}
                          className={`p-2 border rounded-lg hover:border-white/30 text-left bg-white/5 transition-all ${
                            stylization === st ? "border-white bg-white/20" : "border-white/10"
                          }`}
                        >
                          <div className="font-bold text-gray-200">{st}</div>
                        </button>
                      ))}
                    </div>
                  </Card>
                </>
              )}

              {mobileTab === "model" && (
                <>
                  <Card title="Material & Shader" icon={Layers}>
                    <div className="grid grid-cols-3 gap-2">
                      {materialOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => setMaterialPreset(opt.key)}
                          className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                            materialPreset === opt.key
                              ? "bg-white text-black border-white"
                              : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {materialPreset === "image" && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">Texture Map</span>
                          <Toggle checked={useTexture} onChange={setUseTexture} />
                        </div>
                        {useTexture && (
                          <Slider label="Opacity" value={textureOpacity} min={0} max={1} step={0.05} onChange={setTextureOpacity} display={`${Math.round(textureOpacity * 100)}%`} />
                        )}
                      </div>
                    )}
                  </Card>
                  <Card title="Mesh Optimization" icon={Settings}>
                    <div className="space-y-4">
                      <Slider label="Depth" value={depthScale} min={0.1} max={1.0} step={0.05} onChange={setDepthScale} display={depthScale.toFixed(2)} />
                      <Slider label="Resolution" value={gridSize} min={64} max={256} step={32} onChange={setGridSize} display={gridSize.toString()} />
                      <Slider label="Smoothness" value={smoothness} min={0} max={80} step={1} onChange={setSmoothness} display={smoothness.toString()} />
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs text-zinc-400 block">Smart Topology (Remesh)</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(["low", "medium", "high"] as const).map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setRemeshLevel(lvl)}
                              className={`py-1.5 rounded-lg border text-center transition-all ${
                                remeshLevel === lvl
                                  ? "bg-white text-black font-bold border-white"
                                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                              }`}
                            >
                              <span className="text-[10px] uppercase font-bold">{lvl}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {mobileTab === "animate" && (
                <Card title="Animation Tracks" icon={Zap}>
                  <div className="space-y-3">
                    <span className="text-[10px] text-zinc-500 block">Stack motion layers on imported mesh:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {animationOptions.map((opt) => {
                        const on = animStack.includes(opt.key) || (animStack.length === 0 && animationMode === opt.key);
                        return (
                          <button
                            key={opt.key}
                            onClick={() => {
                              if (opt.key === "none") {
                                setAnimStack([]);
                                setAnimationMode("none");
                                return;
                              }
                              setAnimStack((prev) => {
                                const next = prev.includes(opt.key)
                                  ? prev.filter((k) => k !== opt.key)
                                  : [...prev.filter((k) => k !== "none"), opt.key];
                                setAnimationMode((next[0] as typeof animationMode) || "none");
                                return next;
                              });
                            }}
                            className={`py-2 rounded-md text-[10px] font-bold border transition-all ${
                              on ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              )}

              {mobileTab === "assets" && (
                <Card title="Export & History" icon={Download}>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["glb", "obj", "stl"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => download(type)}
                          disabled={!geometry}
                          className="py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-xs font-bold border border-zinc-700"
                        >
                          .{type.toUpperCase()}
                        </button>
                      ))}
                      <button
                        onClick={downloadFbx}
                        disabled={!geometry}
                        className="py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-xs font-bold border border-zinc-700"
                      >
                        .FBX
                      </button>
                      <button
                        onClick={() => !gifBusy && downloadGif()}
                        disabled={!geometry}
                        className="col-span-2 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg text-xs font-bold border border-zinc-700 flex items-center justify-center gap-1.5"
                      >
                        {gifBusy && <Loader2 size={12} className="animate-spin" />}
                        {gifBusy ? "Recording..." : "GIF Loop"}
                      </button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        <Canvas
          shadows
          camera={{ position: [0, 0, 4], fov: 45 }}
          dpr={[1, 1.5]}
        >
          <color attach="background" args={["#050505"]} />
          <ambientLight intensity={0.5} color="#ffffff" />
          <directionalLight
            position={[3, 5, 3]}
            intensity={0.6}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-3, -2, -3]} intensity={0.15} color="#8888ff" />
          
          {showOrbitLight && <OrbitingLight />}
          <Environment preset={background === "dark" ? "night" : "studio"} blur={0.8} />
          
          <GalaxyEnvironment />
          
          {showScanGrid && <ScanGrid />}
          {showGlowRing && <GlowRing />}
          {showParticles && <Particles />}
          
          <MeshViewer
            stylization={stylization}
            imageUrl={imageUrl}
            depthScale={depthScale}
            gridSize={gridSize}
            smoothness={smoothness}
            remeshLevel={remeshLevel}
            texRes={texRes}
            wireframe={wireframe}
            useTexture={useTexture}
            materialPreset={materialPreset}
            customColor={customColor}
            tintAmount={tintAmount}
            metalness={metalness}
            roughness={roughness}
            autoRotate={autoRotate}
            floatHeight={floatHeight}
            textureOpacity={textureOpacity}
            animationMode={animationMode}
            animStack={animStack}
            showChains={showChains}
            flipX={flipX}
            flipY={flipY}
            flipZ={flipZ}
            scale={scale}
            showUV={showUV}
            onColorsExtracted={handleColorsExtracted}
            onGeometryChange={setGeometry}
          />
          
          <OrbitControls
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            autoRotate={autoRotate}
            autoRotateSpeed={0.5}
          />
        </Canvas>

        {/* Desktop Floating Toolbar */}
        <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 items-center gap-1.5 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 z-20 shadow-2xl">
          <button 
            onClick={() => setAutoRotate(!autoRotate)} 
            className={`p-2 rounded-full transition-colors ${autoRotate ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
            title="Auto Rotate"
          >
            <RotateCw size={15} />
          </button>
          <span className="text-white/10">|</span>
          <button 
            onClick={() => setWireframe(!wireframe)} 
            className={`p-2 rounded-full transition-colors ${wireframe ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
            title="Toggle Wireframe"
          >
            <Box size={15} />
          </button>
          <button 
            onClick={() => setShowUV(!showUV)} 
            className={`p-2 rounded-full transition-colors ${showUV ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
            title="UV Checker"
          >
            <Layers size={15} />
          </button>
        </div>

        {/* Mobile Bottom Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 py-2">
          <button onClick={() => openMobileTab("image")} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] transition-all ${mobileTab === "image" && showMobilePanel ? "text-white" : "text-zinc-500"}`}>
            <ImageIcon size={18} />
            <span>Image</span>
          </button>
          <button onClick={() => openMobileTab("model")} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] transition-all ${mobileTab === "model" && showMobilePanel ? "text-white" : "text-zinc-500"}`}>
            <Box size={18} />
            <span>Model</span>
          </button>
          <button
            onClick={() => setShowMobilePanel(!showMobilePanel)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] transition-all ${showMobilePanel ? "text-white" : "text-zinc-500"}`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button onClick={() => openMobileTab("animate")} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] transition-all ${mobileTab === "animate" && showMobilePanel ? "text-white" : "text-zinc-500"}`}>
            <Zap size={18} />
            <span>Anim</span>
          </button>
          <button onClick={() => openMobileTab("assets")} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] transition-all ${mobileTab === "assets" && showMobilePanel ? "text-white" : "text-zinc-500"}`}>
            <Layers size={18} />
            <span>Export</span>
          </button>
        </div>
      </main>
    </div>
  );
}
