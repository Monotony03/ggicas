"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Globe2, BarChart3, Database, Activity,
  ShieldAlert, Search, Command, LayoutDashboard, TrendingUp
} from "lucide-react";

function AnimatedCounter({ value, className = "" }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let n = 0;
    const step = Math.max(1, Math.ceil(value / 28));
    const id = setInterval(() => {
      n = Math.min(n + step, value);
      setDisplay(n);
      if (n >= value) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [value]);
  return <span className={`tabular-nums ${className}`}>{display}</span>;
}

const NAV = [
  { href: "/dashboard",          label: "Dashboard",  Icon: LayoutDashboard, accent: "prussian" },
  { href: "/globe",              label: "Globe",      Icon: Globe2,          accent: "prussian" },
  { href: "/analytics",         label: "Analytics",  Icon: BarChart3,       accent: "prussian" },
  { href: "/conflict-predictor",label: "Predictor",  Icon: TrendingUp,      accent: "crimson"  },
  { href: "/admin",             label: "Admin",      Icon: Database,        accent: "amber"    },
];

/* Per-accent active text colors — drawn from our new palette */
const ACCENT_COLORS: Record<string, string> = {
  prussian: "#60a5d8",
  crimson:  "#e87268",
  amber:    "#e8b84b",
};

export default function Navbar() {
  const pathname = usePathname();
  const [stats, setStats] = useState({ countries: 0, conflicts: 0, alliances: 0 });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/countries").then(r => r.json()),
      fetch("/api/conflicts").then(r => r.json()),
      fetch("/api/alliances").then(r => r.json()),
    ]).then(([c, cf, al]) => {
      setStats({
        countries: ((c.data  ?? c)  as unknown[]).length,
        conflicts: ((cf.data ?? cf) as unknown[]).length,
        alliances: ((al.data ?? al) as unknown[]).length,
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full h-14 shrink-0 flex items-center justify-between px-5 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0e18]/95 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_2px_20px_rgba(0,0,0,0.40)]"
          : "bg-[#0a0e18]/80 backdrop-blur-md border-b border-white/[0.05]"
      }`}
    >
      {/* ── Brand Wordmark ──────────────────────────────────────────── */}
      <Link href="/dashboard" className="flex items-center gap-2.5 group select-none shrink-0">
        {/* Logo mark — a simple sovereign blue circle, no glow */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 group-hover:brightness-110 shrink-0"
          style={{
            background: "linear-gradient(135deg, #163058, #2563a8)",
            border: "1px solid rgba(37,99,168,0.50)",
            boxShadow: "0 2px 8px rgba(10,14,24,0.60)",
          }}
        >
          <Globe2 className="w-3.5 h-3.5 text-[#93c5e8]" />
        </div>
        <div className="leading-none">
          <span
            className="block text-sm font-semibold tracking-tight text-[#e8edf4]"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.01em" }}
          >
            GGICAS
          </span>
          <span
            className="block text-[9px] text-[#566577] tracking-widest uppercase mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Intelligence Platform
          </span>
        </div>
      </Link>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex items-center gap-0.5 mx-4">
        {NAV.map(({ href, label, Icon, accent }) => {
          const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
          const activeColor = ACCENT_COLORS[accent];
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "text-[#e8edf4]"
                  : "text-[#566577] hover:text-[#9baab8] hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-md"
                  style={{
                    background: "rgba(255,255,255,0.055)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                  transition={{ type: "spring", damping: 30, stiffness: 320 }}
                />
              )}
              <span
                className="relative z-10"
                style={{ color: isActive ? activeColor : undefined }}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="relative z-10 hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Right: intelligence digest + search ─────────────────────── */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Live stats — styled like a dashboard ticker, not colorful badges */}
        <div className="hidden lg:flex items-center gap-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}>
          <span className="flex items-center gap-1.5">
            <Globe2 className="w-3 h-3 text-[#566577]" />
            <AnimatedCounter value={stats.countries} className="text-[#9baab8] font-semibold" />
            <span className="text-[#566577]">nations</span>
          </span>
          <span className="w-px h-3 bg-white/[0.08]" />
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3" style={{ color: "#e87268", opacity: 0.75 }} />
            <span style={{ color: "#e87268" }}>
              <AnimatedCounter value={stats.conflicts} className="font-semibold" />
            </span>
            <span className="text-[#566577]">conflicts</span>
          </span>
          <span className="w-px h-3 bg-white/[0.08]" />
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3" style={{ color: "#74bc60", opacity: 0.75 }} />
            <span style={{ color: "#74bc60" }}>
              <AnimatedCounter value={stats.alliances} className="font-semibold" />
            </span>
            <span className="text-[#566577]">alliances</span>
          </span>
        </div>

        {/* Search / Command palette button — functional, not flashy */}
        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all duration-150 hover:bg-white/[0.06]"
          style={{
            fontFamily: "var(--font-mono)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: "#9baab8",
          }}
          aria-label="Open search (Ctrl+K)"
          id="cmd-palette-trigger"
        >
          <Search className="w-3.5 h-3.5" style={{ color: "#566577" }} />
          <span className="hidden sm:inline text-[#566577]">Search…</span>
          <kbd
            className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] leading-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#566577",
            }}
          >
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>
      </div>
    </header>
  );
}
