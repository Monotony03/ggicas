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
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard, gradient: "from-violet-500 to-fuchsia-500", active: "text-violet-300" },
  { href: "/globe",     label: "Globe",     Icon: Globe2,          gradient: "from-teal-400 to-cyan-500",    active: "text-teal-300"   },
  { href: "/analytics", label: "Analytics", Icon: BarChart3,       gradient: "from-teal-400 to-cyan-400",    active: "text-cyan-300"   },
  { href: "/conflict-predictor", label: "Predictor", Icon: TrendingUp, gradient: "from-orange-400 to-rose-500", active: "text-orange-300" },
  { href: "/admin",     label: "Admin",     Icon: Database,        gradient: "from-amber-400 to-orange-400", active: "text-amber-300"  },
];

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
          ? "bg-[#05061a]/90 backdrop-blur-2xl border-b border-white/[0.07] shadow-[0_4px_40px_rgba(0,0,0,0.4)]"
          : "bg-[#05061a]/70 backdrop-blur-xl border-b border-white/[0.05]"
      }`}
    >
      {/* ── Brand ─────────────────────────────────────────────── */}
      <Link href="/dashboard" className="flex items-center gap-2.5 group select-none shrink-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
            boxShadow: "0 0 20px rgba(139,92,246,0.50)",
          }}
        >
          <Globe2 className="w-4 h-4 text-white" />
        </div>
        <div className="leading-none">
          <span
            className="block text-sm font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #a78bfa, #e879f9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            GGICAS
          </span>
          <span className="block text-[9px] text-violet-400/70 font-mono tracking-widest uppercase mt-0.5">
            Geopolitical Intel
          </span>
        </div>
      </Link>

      {/* ── Nav links ──────────────────────────────────────────── */}
      <nav className="flex items-center gap-0.5 mx-4">
        {NAV.map(({ href, label, Icon, gradient, active }) => {
          const isActive = pathname === href || (href === "/dashboard" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? active
                  : "text-[#5a6490] hover:text-[#a0a8d0] hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                  transition={{ type: "spring", damping: 26, stiffness: 280 }}
                />
              )}
              {/* Gradient icon when active */}
              <span className="relative z-10">
                {isActive ? (
                  <span
                    style={{
                      display: "inline-flex",
                      background: `linear-gradient(135deg, ${
                        gradient.includes("violet") ? "#a78bfa, #e879f9" :
                        gradient.includes("teal") && gradient.includes("cyan") ? "#2dd4bf, #22d3ee" :
                        gradient.includes("orange") ? "#f97316, #f43f5e" :
                        gradient.includes("amber") ? "#fbbf24, #fb923c" :
                        "#a78bfa, #2dd4bf"
                      })`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: "inherit" }} />
                  </span>
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </span>
              <span className="relative z-10 hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Right: stats + search ──────────────────────────────── */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1.5">
            <Globe2 className="w-3 h-3 text-violet-400" />
            <AnimatedCounter value={stats.countries} className="text-violet-300 font-semibold" />
            <span className="text-[#5a6490]">nations</span>
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <AnimatedCounter value={stats.conflicts} className="text-rose-300 font-semibold" />
            <span className="text-[#5a6490]">conflicts</span>
          </span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-teal-400" />
            <AnimatedCounter value={stats.alliances} className="text-teal-300 font-semibold" />
            <span className="text-[#5a6490]">alliances</span>
          </span>
        </div>

        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-200 hover:scale-105"
          style={{
            background: "rgba(139,92,246,0.1)",
            border: "1px solid rgba(139,92,246,0.25)",
            color: "#a78bfa",
          }}
          aria-label="Open search (Ctrl+K)"
          id="cmd-palette-trigger"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-violet-400/70">Search…</span>
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-violet-500/20 rounded text-[10px] leading-none text-violet-300">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>
      </div>
    </header>
  );
}
