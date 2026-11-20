"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function SpaceHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white"
    >
      {/* Deep Space Background / Monochrome Noise */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] rounded-full bg-white/5 blur-[180px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] sm:w-[850px] sm:h-[850px] rounded-full bg-white/5 blur-[180px]" />

        {/* Twinkling White Stars */}
        {[...Array(70)].map((_, i) => {
          const top = ((i * 17) % 100);
          const left = ((i * 33) % 100);
          const size = (i % 3) + 1;
          const delay = (i * 0.3) % 4;
          const duration = 2 + ((i * 0.3) % 3);
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                boxShadow: size > 1 ? "0 0 4px rgba(255,255,255,0.8)" : "none",
                animation: `starTwinkle ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* 3D Solar System Rings Stage with Realistic Planet Colors */}
      <div
        className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[600px] sm:h-[600px] md:w-[900px] md:h-[900px] lg:w-[1400px] lg:h-[1400px] pointer-events-none overflow-visible opacity-60 sm:opacity-80"
        style={{ perspective: "1000px" }}
      >
        {/* Center Glowing Sun */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-r from-amber-200 via-yellow-100 to-white opacity-25 blur-3xl" />

        {/* Ring 1 - Mercury */}
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[420px] md:h-[420px] rounded-full border border-white/10 anim-orbit-fast">
          <div className="absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3.5 sm:h-3.5 rounded-full bg-[#a8a8a8] shadow-[0_0_12px_rgba(168,168,168,0.8)]" />
        </div>

        {/* Ring 2 - Venus & Earth */}
        <div className="absolute top-1/2 left-1/2 w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] md:w-[720px] md:h-[720px] rounded-full border border-white/10 anim-orbit">
          <div className="absolute top-1/2 -left-1.5 sm:-left-3 -translate-y-1/2 w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-[#e3bb76] to-[#b8860b] shadow-[0_0_15px_rgba(227,187,118,0.7)]" />
          <div className="absolute -bottom-1.5 sm:-bottom-2.5 left-1/3 w-3.5 h-3.5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#2b82c9] to-[#1e3a8a] shadow-[0_0_18px_rgba(43,130,201,0.8)] border border-white/30" />
        </div>

        {/* Ring 3 - Mars & Jupiter */}
        <div className="absolute top-1/2 left-1/2 w-[480px] h-[480px] sm:w-[700px] sm:h-[700px] md:w-[1050px] md:h-[1050px] rounded-full border border-white/10 anim-orbit-reverse">
          <div className="absolute -top-2 sm:-top-3.5 right-1/4 w-2.5 h-2.5 sm:w-4.5 sm:h-4.5 rounded-full bg-gradient-to-br from-[#c1440e] to-[#8b2500] shadow-[0_0_15px_rgba(193,68,14,0.8)]" />
          <div className="absolute bottom-1/4 -left-1.5 sm:-left-3.5 w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#bc8259] via-[#d4a373] to-[#8c5830] shadow-[0_0_20px_rgba(188,130,89,0.7)]" />
        </div>

        {/* Ring 4 - Saturn & Uranus */}
        <div className="absolute top-1/2 left-1/2 w-[620px] h-[620px] sm:w-[900px] sm:h-[900px] md:w-[1380px] md:h-[1380px] rounded-full border border-white/10 anim-orbit">
          <div className="absolute top-1/3 -right-2 sm:-right-4 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#f4e2bb] to-[#d4b483] shadow-[0_0_20px_rgba(244,226,187,0.7)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2 sm:w-12 sm:h-3 border border-amber-200/60 rounded-full rotate-12" />
          </div>
          <div className="absolute bottom-5 sm:bottom-10 left-1/4 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#73c2fb] to-[#4682b4] shadow-[0_0_15px_rgba(115,194,251,0.7)]" />
        </div>
      </div>

      {/* Floating Monochrome Dust */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:56px_56px]" />

      {/* Foreground Content */}
      <div className="relative z-10 text-center px-5 sm:px-6 max-w-4xl mx-auto pt-20 pb-16 sm:pt-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/5 border border-white/15 rounded-full text-[11px] sm:text-xs font-medium text-gray-300 mb-6 sm:mb-8 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.08)] animate-fadeInDown">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-ping" />
          <span className="tracking-wider">Z-Space Solar Dimension • Monochrome AI 3D</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 sm:mb-6 leading-[0.95]">
          <span className="block text-white animate-fadeInUp">
            Create 3D In
          </span>
          <span
            className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 animate-gradientX drop-shadow-[0_0_35px_rgba(255,255,255,0.25)]"
            style={{ animationDelay: "0.2s" }}
          >
            Deep Space
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-sm sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed animate-fadeInUp"
          style={{ animationDelay: "0.4s" }}
        >
          Transform single flat pictures into live, rotatable 3D objects orbiting
          your digital galaxy. Automatic contours, depth generation, zero complex tools.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 animate-fadeInUp"
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            href="/workspace"
            className="group relative w-full sm:w-auto px-6 sm:px-9 py-3.5 sm:py-4 bg-white text-black font-extrabold text-sm sm:text-base rounded-full hover:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.25)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Launch Workspace
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-6 sm:px-9 py-3.5 sm:py-4 bg-white/5 border border-white/20 text-white font-semibold text-sm sm:text-base rounded-full hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-md"
          >
            Explore Plans
          </Link>
        </div>
      </div>

      {/* Blur transition overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20 backdrop-blur-[2px]" />

      {/* Orbit Indicator bottom */}
      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 sm:gap-2 text-gray-500 animate-bounce z-30">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-400 font-mono">Orbiting</span>
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}
