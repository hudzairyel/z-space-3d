"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Mail, User, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleGoogle = async () => {
    setLoading("google");
    await new Promise(r => setTimeout(r, 1500));
    window.location.href = "/workspace";
  };

  const handleGithub = async () => {
    setLoading("github");
    await new Promise(r => setTimeout(r, 1500));
    window.location.href = "/workspace";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading("form");
    await new Promise(r => setTimeout(r, 1500));
    window.location.href = "/workspace";
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              width: `${(i % 2) + 1}px`,
              height: `${(i % 2) + 1}px`,
              animationDelay: `${i * 0.3}s`,
              opacity: 0.3 + (i % 3) * 0.2,
            }}
          />
        ))}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-white/5 blur-[200px] rounded-full" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.06)] overflow-hidden">
        {/* Glow top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Logo & Back */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.png" alt="Z-Space" className="w-7 h-7 object-contain group-hover:scale-105 transition-transform" />
            <span className="font-bold text-sm text-white tracking-tight">Z-Space</span>
          </Link>
          <Link href="/" className="text-xs text-gray-600 hover:text-white transition-colors">
            ← Home
          </Link>
        </div>

        <div className="px-6 pt-2 pb-5 border-b border-white/5">
          <h2 className="text-xl font-black tracking-tight text-white">
            {mode === "login" ? "Selamat Datang" : "Buat Akun"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {mode === "login"
              ? "Masuk untuk mengakses workspace dan menyimpan aset 3D"
              : "Mulai buat model 3D dari gambar atau deskripsi teks"}
          </p>
        </div>

        {/* Social Buttons */}
        <div className="px-6 pt-5 space-y-2.5">
          <button
            onClick={handleGoogle}
            disabled={loading !== null}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50 group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-6.2z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm text-gray-300 flex-1 text-left font-medium">Lanjutkan dengan Gmail</span>
            {loading === "google" && <Loader2 size={14} className="animate-spin text-gray-400" />}
          </button>

          <button
            onClick={handleGithub}
            disabled={loading !== null}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50 group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-gray-300 flex-shrink-0 group-hover:scale-110 transition-transform">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span className="text-sm text-gray-300 flex-1 text-left font-medium">Lanjutkan dengan GitHub</span>
            {loading === "github" && <Loader2 size={14} className="animate-spin text-gray-400" />}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-6 pt-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">atau masuk dengan email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-3">
          {mode === "signup" && (
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input
                type="text"
                placeholder="Nama lengkap"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading !== null || !email || !password}
            className="w-full py-3 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
          >
            {loading === "form" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : mode === "login" ? (
              "Masuk"
            ) : (
              "Daftar"
            )}
          </button>
        </form>

        {/* Footer toggle */}
        <p className="text-center pb-5 text-xs text-gray-500">
          {mode === "login" ? (
            <>Belum punya akun?{" "}
              <button onClick={() => setMode("signup")} className="text-white hover:underline font-medium">
                Daftar sekarang
              </button>
            </>
          ) : (
            <>Sudah punya akun?{" "}
              <button onClick={() => setMode("login")} className="text-white hover:underline font-medium">
                Masuk
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
