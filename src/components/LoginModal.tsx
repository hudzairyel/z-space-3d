"use client";

import { useState } from "react";
import { X, Mail, User, Loader2, ArrowLeft, Check } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (provider: string, email?: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [googleStep, setGoogleStep] = useState<boolean>(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleStartGoogle = () => {
    setErrorMsg("");
    setGoogleStep(true);
  };

  const handleConfirmGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail || !googleEmail.includes("@")) {
      setErrorMsg("Masukkan alamat email Google yang valid (contoh: nama@gmail.com)");
      return;
    }
    setLoading("google");
    await new Promise((r) => setTimeout(r, 800));
    onLoginSuccess("google", googleEmail.trim().toLowerCase());
    setLoading(null);
    setGoogleStep(false);
    onClose();
  };

  const handleGithub = async () => {
    setLoading("github");
    await new Promise((r) => setTimeout(r, 1000));
    onLoginSuccess("github", "github-user@github.com");
    setLoading(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading("form");
    await new Promise((r) => setTimeout(r, 800));
    onLoginSuccess("email", email.trim().toLowerCase());
    setLoading(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-[#0b0c10] border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(255,255,255,0.08)] overflow-hidden">
        {/* Glow top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {googleStep ? (
          /* ── Google Dedicated Sign In View ── */
          <div className="p-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <button
                onClick={() => setGoogleStep(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
              >
                <ArrowLeft size={14} /> Kembali
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="text-center pt-5 pb-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-white">Login dengan Akun Google</h3>
              <p className="text-xs text-gray-400 mt-1">
                Masukkan alamat Gmail asli Anda untuk menghubungkan akun ke Z-Space.
              </p>
            </div>

            <form onSubmit={handleConfirmGoogle} className="space-y-4 pt-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-400 block mb-1.5 uppercase tracking-wider">
                  Alamat Gmail Anda
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="namaanda@gmail.com"
                    value={googleEmail}
                    onChange={(e) => {
                      setGoogleEmail(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/5 border border-white/15 focus:border-cyan-400/60 rounded-xl text-sm text-white placeholder:text-gray-600 outline-none transition-colors"
                  />
                </div>
                {errorMsg && <p className="text-xs text-red-400 mt-1.5">{errorMsg}</p>}
              </div>

              <button
                type="submit"
                disabled={loading !== null || !googleEmail}
                className="w-full py-2.5 bg-white hover:bg-gray-100 disabled:opacity-40 text-black font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
              >
                {loading === "google" ? (
                  <Loader2 size={16} className="animate-spin text-black" />
                ) : (
                  <>
                    <span>Lanjutkan Sebagai Akun Ini</span>
                    <Check size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ── Default Sign In / Sign Up View ── */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {mode === "login" ? "Masuk ke Z-Space" : "Buat Akun Baru"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {mode === "login"
                    ? "Akses workspace dan simpan aset 3D-mu"
                    : "Mulai buat model 3D dari gambar atau teks"}
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Social Buttons */}
            <div className="px-6 pt-5 space-y-2.5">
              <button
                onClick={handleStartGoogle}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm text-gray-200 font-medium flex-1 text-left">
                  Lanjutkan dengan Gmail
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  Google
                </span>
              </button>

              <button
                onClick={handleGithub}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-gray-300 flex-shrink-0">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="text-sm text-gray-300 flex-1 text-left">Lanjutkan dengan GitHub</span>
                {loading === "github" && <Loader2 size={14} className="animate-spin text-gray-400" />}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 px-6 pt-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">atau email manual</span>
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
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              )}
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  placeholder="Email Anda"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading !== null || !email || !password}
                className="w-full py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <>
                  Belum punya akun?{" "}
                  <button onClick={() => setMode("signup")} className="text-white hover:underline">
                    Daftar sekarang
                  </button>
                </>
              ) : (
                <>
                  Sudah punya akun?{" "}
                  <button onClick={() => setMode("login")} className="text-white hover:underline">
                    Masuk
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
