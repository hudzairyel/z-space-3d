"use client";

import { useEffect, useRef } from "react";
import { createOrbTheme, type OrbController, type ResolvedOrbVariant } from "orbloom";

// Resolve theme at module scope — invalid tokens fail loudly at startup
const theme: ResolvedOrbVariant = createOrbTheme({
  preset: "core-teal-01",
  id: "orb-studio-core-teal-01",
  seed: 1,
  colors: {
    base: "#07262b",
    interior: "#050809",
    accents: ["#00c2a8", "#38e1ff", "#ffc65c"],
  },
  appearance: { intensity: 0.95, detail: 0.8, glow: 0.9, glass: 0.35 },
  motion: { speed: 0.8, drift: 0.6 },
  audioResponse: { brightness: 1.2, motion: 0.55, pulse: 0.85 },
});

export default function OrbloomOrb() {
  const motionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<OrbController | null>(null);

  useEffect(() => {
    const motionEl = motionRef.current;
    const canvasEl = canvasRef.current;
    if (!motionEl || !canvasEl) return;

    // Apply per-variant ambient float (negated travel = up)
    const m = theme.ambientMotion;
    motionEl.dataset.ambientMotion = String(m.enabled);
    motionEl.style.setProperty("--orb-diameter", "264px");
    motionEl.style.setProperty("--orb-motion-distance", `${-m.verticalTravel}px`);
    motionEl.style.setProperty("--orb-motion-scale", String(m.scale));
    motionEl.style.setProperty("--orb-motion-duration", `${m.durationSeconds}s`);
    motionEl.style.setProperty("--orb-motion-delay", `${m.delaySeconds}s`);

    let alive = true;

    import("orbloom").then(({ createOrb }) => {
      if (!alive || !canvasRef.current) return;
      try {
        const c = createOrb(canvasEl, {
          theme,
          quality: "balanced" as const,
          state: "idle" as const,
          reducedMotion: "user" as const,
          onError: (err: Error) => {
            console.warn("[orbloom] error:", err.message);
            motionEl.classList.add("orb-no-webgl");
          },
        });
        controllerRef.current = c;
      } catch {
        motionEl.classList.add("orb-no-webgl");
      }
    }).catch((err: unknown) => {
      console.error("[orbloom] load failed:", err);
      motionEl.classList.add("orb-no-webgl");
    });

    return () => {
      alive = false;
      if (controllerRef.current) {
        controllerRef.current.destroy();
        controllerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={motionRef}
      className="orb-motion"
      style={{ "--orb-diameter": "264px" } as unknown as React.CSSProperties}
    >
      <div className="orb-shell">
        <div className="orb-clip">
          <canvas ref={canvasRef} className="orb-canvas" width={264} height={264} aria-label="Decorative orb" />
          <div className="orb-fallback" aria-hidden="true"></div>
        </div>
        <div className="orb-chrome" aria-hidden="true"></div>
      </div>
    </div>
  );
}