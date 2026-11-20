"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "Rp0",
    period: "/month",
    credits: "100 credits/month",
    desc: "Perfect for trying out AI 3D generation.",
    features: [
      { text: "Basic Image → 3D & Text → 3D", included: true },
      { text: "Standard output quality", included: true },
      { text: "Watermarked exports", included: true },
      { text: "Community Discord support", included: true },
      { text: "CC BY 4.0 license", included: true },
      { text: "API access", included: false },
      { text: "Priority queue", included: false },
      { text: "Unlimited downloads", included: false },
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
  },
  {
    name: "Starter",
    price: "Rp175.000",
    period: "/month",
    credits: "250 credits/month",
    desc: "For hobbyists and indie developers.",
    features: [
      { text: "All Free features", included: true },
      { text: "Higher resolution exports", included: true },
      { text: "No watermark", included: true },
      { text: "Email support", included: true },
      { text: "MIT commercial license", included: true },
      { text: "API access (rate limited)", included: true },
      { text: "Priority queue", included: false },
      { text: "Team sharing", included: false },
    ],
    cta: "Upgrade",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    price: "Rp350.000",
    period: "/month",
    credits: "1,000 credits/month",
    highlight: "50% off first month",
    desc: "Professional grade tools with full API access.",
    features: [
      { text: "All Starter features", included: true },
      { text: "High-quality generation priority", included: true },
      { text: "Multi-view & batch modes", included: true },
      { text: "AI Texturing & Animation", included: true },
      { text: "Unlimited generation queue", included: true },
      { text: "Full API access (20 RPS)", included: true },
      { text: "Custom style presets", included: true },
      { text: "Dedicated Slack channel", included: true },
    ],
    cta: "Go Pro",
    ctaVariant: "filled" as const,
  },
  {
    name: "Premium",
    price: "Rp700.000",
    period: "/month",
    credits: "3,000 credits/month",
    desc: "Heavy usage with best performance.",
    features: [
      { text: "All Pro features", included: true },
      { text: "Fastest generation priority", included: true },
      { text: "8K texture support", included: true },
      { text: "Advanced rigging & skinning", included: true },
      { text: "Early access to new models", included: true },
      { text: "API access (50 RPS)", included: true },
      { text: "Usage analytics dashboard", included: true },
      { text: "Account manager", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
  },
  {
    name: "Studio",
    price: "Rp1.225.000",
    period: "/month",
    credits: "5,500 shared credits",
    desc: "Team seats with collaboration tools.",
    features: [
      { text: "All Premium features", included: true },
      { text: "Up to 5 team members", included: true },
      { text: "Shared credit pool", included: true },
      { text: "Project & version management", included: true },
      { text: "Team asset library", included: true },
      { text: "API access (100 RPS)", included: true },
      { text: "SSO / SAML", included: true },
      { text: "SLA guarantee", included: true },
    ],
    cta: "Start Trial",
    ctaVariant: "outline" as const,
  },
];

const apiLimits = [
  { tier: "Pro", rps: "20", concurrent: "10", monthlyOps: "Unlimited" },
  { tier: "Premium", rps: "50", concurrent: "30", monthlyOps: "Unlimited" },
  { tier: "Studio", rps: "100", concurrent: "60", monthlyOps: "Unlimited" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-[72px] pb-24">
        {/* Header */}
        <section className="border-b border-white/10 bg-black relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px] opacity-10" />
          <div className="max-w-[1400px] mx-auto px-6 py-16 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h1 className="text-5xl font-black tracking-tighter">Pricing</h1>
            <p className="text-xl text-gray-400 mt-4 max-w-2xl">
              Start free. Scale when you&apos;re ready. No hidden fees.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-6 rounded-3xl border transition-all ${
                  tier.ctaVariant === "filled"
                    ? "bg-white text-black border-white scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                    : "bg-white/[0.03] border-white/10 hover:border-white/30 backdrop-blur-md"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {tier.highlight}
                  </div>
                )}
                <div className="text-sm font-bold mb-2">{tier.name}</div>
                <div className="mb-1">
                  <span className="text-2xl font-black">{tier.price}</span>
                  <span className={tier.ctaVariant === "filled" ? "text-gray-600" : "text-gray-400"}>
                    {tier.period}
                  </span>
                </div>
                <div
                  className={`text-xs mb-4 ${
                    tier.ctaVariant === "filled" ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {tier.credits}
                </div>
                <p
                  className={`text-xs mb-6 ${
                    tier.ctaVariant === "filled" ? "text-gray-700" : "text-gray-500"
                  }`}
                >
                  {tier.desc}
                </p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-xs">
                      <span
                        className={
                          f.included
                            ? tier.ctaVariant === "filled"
                              ? "text-black font-bold"
                              : "text-white font-bold"
                            : "text-gray-700"
                        }
                      >
                        {f.included ? "✓" : "—"}
                      </span>
                      <span
                        className={
                          f.included
                            ? tier.ctaVariant === "filled"
                              ? "text-gray-800 font-medium"
                              : "text-gray-300"
                            : "text-gray-600"
                        }
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-2.5 rounded-full font-bold text-xs transition-colors ${
                    tier.ctaVariant === "filled"
                      ? "bg-black text-white hover:bg-gray-900 shadow-md"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* API Rate Limits */}
        <section className="max-w-[1400px] mx-auto px-6 pb-16">
          <h2 className="text-2xl font-black tracking-tighter mb-8">API Rate Limits</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-4 pr-8 text-gray-400 font-medium">Plan</th>
                  <th className="pb-4 pr-8 text-gray-400 font-medium">Requests/sec</th>
                  <th className="pb-4 pr-8 text-gray-400 font-medium">Concurrent Tasks</th>
                  <th className="pb-4 text-gray-400 font-medium">Monthly Ops</th>
                </tr>
              </thead>
              <tbody>
                {apiLimits.map((row) => (
                  <tr key={row.tier} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-8 font-bold">{row.tier}</td>
                    <td className="py-4 pr-8 text-gray-300">{row.rps}</td>
                    <td className="py-4 pr-8 text-gray-300">{row.concurrent}</td>
                    <td className="py-4 text-gray-300">{row.monthlyOps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-black tracking-tighter mb-8">FAQ</h2>
          <div className="space-y-6">
            {[
              { q: "What is a credit?", a: "One credit = one generation operation. Text/Image to 3D costs ~20 credits. Texture adds ~10. Animation clips cost 3–5." },
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your billing dashboard. No questions asked." },
              { q: "What license do I get?", a: "Free tier: CC BY 4.0. All paid tiers: MIT license — use assets commercially without attribution." },
              { q: "Do unused credits rollover?", a: "No. Credits reset monthly at billing cycle start." },
              { q: "How does Enterprise work?", a: "Custom volume discounts, dedicated GPU allocation, SLA-backed uptime, and a named account manager." },
            ].map(({ q, a }) => (
              <div key={q} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="font-bold mb-2 text-white">{q}</div>
                <div className="text-gray-400 text-sm leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
