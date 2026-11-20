"use client";

import { useEffect, useRef, useState } from "react";

interface FeatureProps {
  icon: string;
  title: string;
  desc: string;
  delay: number;
}

function FeatureCard({ icon, title, desc, delay }: FeatureProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`p-8 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-[#00c2a8]/30 hover:bg-white/[0.05] transition-all duration-500 group ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-4xl mb-5 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-lg font-bold mb-2 text-white group-hover:text-[#00c2a8] transition-colors">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Features() {
  const features: FeatureProps[] = [
    {
      icon: "🖼️",
      title: "Image to 3D",
      desc: "Upload a single image and get a textured 3D mesh with automatic contour extraction and depth mapping.",
      delay: 0,
    },
    {
      icon: "🎨",
      title: "Color Extraction",
      desc: "The 3D model automatically preserves the dominant colors from your image — no flat materials needed.",
      delay: 100,
    },
    {
      icon: "⬇️",
      title: "Export Anywhere",
      desc: "Download your 3D model as OBJ or STL. Compatible with Blender, Unity, and all major 3D software.",
      delay: 200,
    },
  ];

  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#07262b]/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-center mb-4">
          Powerful Features
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Everything you need to go from a flat image to a polished 3D model.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}