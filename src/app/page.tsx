"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020409] text-white overflow-hidden">
      <Navbar />
      <Hero />
      <HowItWorks />

      {/* CTA Section */}
      <section className="pt-28 pb-32 sm:pt-36 sm:pb-40 bg-black relative overflow-hidden">
        {/* Soft blur overlay at top */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent z-10" />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-white/5 blur-[140px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 sm:mb-6 text-white">
            Ready to Build in 3D?
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            Upload your first image and create an interactive 3D model in under a minute.
          </p>
          <Link
            href="/workspace"
            className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-black font-extrabold text-sm sm:text-base rounded-full hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.35)]"
          >
            Open Workspace
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
