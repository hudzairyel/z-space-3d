"use client";

import { UploadCloud, Sparkles, Download } from "lucide-react";

const steps = [
  {
    num: "1",
    icon: UploadCloud,
    title: "Upload Image",
    desc: "PNG, JPG, atau WEBP hingga 10MB di workspace galaxy",
  },
  {
    num: "2",
    icon: Sparkles,
    title: "Generate Mesh",
    desc: "AI mengekstrak kontur dan membangun solid 3D",
  },
  {
    num: "3",
    icon: Download,
    title: "Download",
    desc: "Export sebagai OBJ, STL, atau GLB secara instan",
  },
];

export default function HowItWorks() {
  return (
    <section className="pt-28 pb-20 sm:pt-32 sm:pb-28 bg-black relative overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[300px] sm:h-[500px] bg-white/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-center mb-3 sm:mb-4 text-white">
          How It Works
        </h2>
        <p className="text-gray-400 text-center max-w-lg mx-auto mb-10 sm:mb-20 text-xs sm:text-sm">
          Three simple steps to manifest your 2D images into live 3D space objects.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-px bg-white/10" />

          {steps.map(({ num, icon: Icon, title, desc }, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 mb-4 sm:mb-5">
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-30 blur-xl animate-pulse" />
                <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#0a0a0a] border border-white/20 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                  <Icon size={20} className="text-white sm:!size-7" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1.5 text-white tracking-tight">
                {num}. {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-[220px]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
