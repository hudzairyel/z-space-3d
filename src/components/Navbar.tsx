"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import LoginModal from "./LoginModal";
import { LogOut, User, ChevronDown, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "HOME", href: "/", badge: null },
  { label: "WORKSPACE", href: "/workspace", badge: "NEW" },
  { label: "PRICING", href: "/pricing", badge: null },
];

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<{ provider: string; email?: string } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const raw = localStorage.getItem("zspace_user");
    if (raw) {
      try { setUser(JSON.parse(raw)); } catch {}
    }
  }, [mounted]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLoginSuccess = (provider: string, email?: string) => {
    const u = { provider, email };
    setUser(u);
    localStorage.setItem("zspace_user", JSON.stringify(u));
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("zspace_user");
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const userEmail = user?.email || user?.provider || "";
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <>
      <nav className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-auto max-w-[95vw]">
        {/* Glow halo behind navbar */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-amber-500/20 rounded-full blur-xl opacity-60 animate-pulse pointer-events-none" />

        <div
          className={`relative flex items-center gap-1.5 sm:gap-4 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-300 ${
            scrolled
              ? "bg-[#08080c]/90 border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
              : "bg-[#0b0b12]/75 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 group pl-1 sm:pl-1.5 pr-1 sm:pr-2">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/15 group-hover:border-white/40 transition-all duration-300 overflow-hidden shadow-[0_0_12px_rgba(255,255,255,0.05)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <img src="/logo.png" alt="Z-Space" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain relative z-10 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-[13px] sm:text-[14px] font-extrabold text-white tracking-tight hidden md:inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
              Z-Space
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="w-px h-5 bg-white/10 hidden sm:block" />
          <div
            className="relative hidden sm:flex items-center bg-white/[0.03] p-1 rounded-full border border-white/5"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {NAV_LINKS.map((link, idx) => {
              const isActive = pathname === link.href;
              const isHovered = hoveredIndex === idx;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className={`relative z-10 px-3.5 py-1.5 text-[12px] font-semibold rounded-full transition-colors duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "text-white"
                      : isHovered
                      ? "text-gray-200"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {/* Sliding active background indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 rounded-full border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)] -z-10 animate-[fadeIn_0.2s_ease-out]" />
                  )}

                  {/* Hover background indicator */}
                  {!isActive && isHovered && (
                    <div className="absolute inset-0 bg-white/5 rounded-full -z-10 transition-all duration-150" />
                  )}

                  <span className="uppercase tracking-wider text-[11px]">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto pl-0.5 sm:pl-2">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="sm:hidden p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white border border-transparent hover:border-white/10"
              title="Menu"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>

            {/* Discord */}
            <a
              href="https://discord.gg/1477965133882986618"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-[#5865F2] border border-transparent hover:border-white/10"
              title="Join Discord Server"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-1.5 pr-2 sm:pr-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-200"
                >
                  <div className="w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                    {initial || <User size={10} />}
                  </div>
                  <span className="hidden sm:block text-[11px] text-gray-300 font-medium max-w-[100px] truncate">
                    {userEmail}
                  </span>
                  <ChevronDown
                    size={11}
                    className={`hidden sm:block text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c0c12] border border-white/15 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden z-50 animate-[dropdownIn_0.18s_ease-out_both]">
                      <div className="px-3.5 py-3 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-0.5">Signed in as</p>
                        <p className="text-[11px] text-gray-200 font-medium truncate">{userEmail}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-0.5 sm:gap-1.5">
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-[12px] font-medium text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile dropdown panel */}
        {mobileOpen && (
          <div className="sm:hidden mt-2 w-full max-w-[95vw]">
            <div className="bg-[#0c0c12]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 space-y-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-[dropdownIn_0.15s_ease-out_both]">
              {NAV_LINKS.map((link, idx) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-[12px] font-semibold tracking-wider uppercase transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 text-white border border-white/15"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 tracking-wider">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-[12px] text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={13} />
                  Sign out ({userEmail})
                </button>
              ) : (
                <button
                  onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                  className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl text-[12px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={13} />
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
