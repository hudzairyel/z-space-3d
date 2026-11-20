"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-[72px] flex items-center justify-center min-h-[80vh]">
        <div className="text-center px-6">
          <h1 className="text-4xl font-black tracking-tighter mb-4">Coming Soon</h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-8">
            Pricing plans are under development. Check back later!
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
