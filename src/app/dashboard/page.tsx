"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Globe2,
  BarChart3,
  Database,
  Search,
  ShieldAlert,
  Activity,
  Zap,
  TrendingUp,
  ArrowRight,
  Map,
} from "lucide-react";

/* ─── Animated counter ───────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const id = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(current);
      if (current >= target) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [target]);
  return (
    <span className="tabular-nums">
      {val.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Floating blob ──────────────────────────────────────────────────── */
function Blob({
  color,
  size,
  style,
}: {
  color: string;
  size: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`absolute rounded-full blur-[100px] pointer-events-none ${color} ${size}`}
      style={style}
    />
  );
}

/* ─── Navigation card definition ────────────────────────────────────── */
const PANELS = [
  {
    id: "globe",
    href: "/globe",
    label: "Globe Map",
    sublabel: "Interactive Intelligence",
    description:
      "Explore an interactive 3D world map. Click any nation to pull up alliances, conflicts, and economic data.",
    icon: Globe2,
    gradient: "from-[#163058] to-[#2563a8]",
    shadowColor: "rgba(37,99,168,0.35)",
    border: "rgba(37,99,168,0.28)",
    bgTint: "rgba(37,99,168,0.06)",
    badge: "Live",
    badgeClass: "badge-primary",
    stats: [{ icon: Map, label: "Nations", key: "countries" }],
  },
  {
    id: "analytics",
    href: "/analytics",
    label: "Analytics",
    sublabel: "Aggregate Intelligence",
    description:
      "Deep-dive charts and statistics — conflict timelines, trade flows, military spending ratios, sanctions networks.",
    icon: BarChart3,
    gradient: "from-[#1e4618] to-[#3d7c30]",
    shadowColor: "rgba(61,124,48,0.30)",
    border: "rgba(61,124,48,0.25)",
    bgTint: "rgba(61,124,48,0.05)",
    badge: "Charts",
    badgeClass: "badge-field",
    stats: [{ icon: TrendingUp, label: "Datasets", key: "alliances" }],
  },
  {
    id: "admin",
    href: "/admin",
    label: "Admin Panel",
    sublabel: "Database Management",
    description:
      "Full CRUD operations — manage countries, conflicts, alliances, sanctions, and trade records in real time.",
    icon: Database,
    gradient: "from-[#3d2800] to-[#92620a]",
    shadowColor: "rgba(176,125,26,0.30)",
    border: "rgba(176,125,26,0.25)",
    bgTint: "rgba(176,125,26,0.05)",
    badge: "CRUD",
    badgeClass: "badge-amber",
    stats: [{ icon: Activity, label: "Tables", key: null }],
  },
  {
    id: "search",
    href: null,
    label: "Intel Search",
    sublabel: "Command Palette",
    description:
      "Lightning-fast fuzzy search across all nations and conflicts. Press ⌘K anytime to open the command palette.",
    icon: Search,
    gradient: "from-[#1f0a0a] to-[#7a1f1f]",
    shadowColor: "rgba(192,57,43,0.30)",
    border: "rgba(192,57,43,0.25)",
    bgTint: "rgba(192,57,43,0.05)",
    badge: "⌘K",
    badgeClass: "badge-danger",
    stats: [{ icon: ShieldAlert, label: "Conflicts", key: "conflicts" }],
  },
  {
    id: "cast",
    href: "/conflict-predictor",
    label: "Conflict Predictor",
    sublabel: "ACLED CAST Model",
    description:
      "Monthly predictive forecasts of political violence events globally. Powered by ACLED.",
    icon: TrendingUp,
    gradient: "from-[#3d1111] to-[#a61f1f]",
    shadowColor: "rgba(192,57,43,0.28)",
    border: "rgba(192,57,43,0.22)",
    bgTint: "rgba(192,57,43,0.04)",
    badge: "CAST",
    badgeClass: "badge-danger",
    stats: [{ icon: ShieldAlert, label: "Monitored", key: "countries" }],
  },
];

/* ─── Stat chip ──────────────────────────────────────────────────────── */
const STAT_CONFIGS = [
  {
    key: "countries",
    label: "Nations Tracked",
    icon: Globe2,
    color: "#60a5d8",
    bgColor: "rgba(37,99,168,0.10)",
    borderColor: "rgba(37,99,168,0.22)",
  },
  {
    key: "conflicts",
    label: "Active Conflicts",
    icon: ShieldAlert,
    color: "#e87268",
    bgColor: "rgba(192,57,43,0.10)",
    borderColor: "rgba(192,57,43,0.22)",
  },
  {
    key: "alliances",
    label: "Alliance Records",
    icon: Activity,
    color: "#74bc60",
    bgColor: "rgba(61,124,48,0.10)",
    borderColor: "rgba(61,124,48,0.22)",
  },
  {
    key: "sanctions",
    label: "Sanctions Orders",
    icon: Zap,
    color: "#e8b84b",
    bgColor: "rgba(176,125,26,0.10)",
    borderColor: "rgba(176,125,26,0.22)",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    countries: 0,
    conflicts: 0,
    alliances: 0,
    sanctions: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/countries").then((r) => r.json()),
      fetch("/api/conflicts").then((r) => r.json()),
      fetch("/api/alliances").then((r) => r.json()),
      fetch("/api/sanctions").then((r) => r.json()).catch(() => ({ data: [] })),
    ])
      .then(([c, cf, al, san]) => {
        setStats({
          countries: ((c.data ?? c) as unknown[]).length,
          conflicts: ((cf.data ?? cf) as unknown[]).length,
          alliances: ((al.data ?? al) as unknown[]).length,
          sanctions: ((san.data ?? san) as unknown[]).length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <main className="relative flex-1 flex flex-col overflow-x-hidden overflow-y-auto">
      {/* ── Ambient vignette — restrained Prussian depth ────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <Blob color="" size="w-[800px] h-[500px]" style={{ top: "-5%", left: "-10%", background: "radial-gradient(ellipse, rgba(37,99,168,0.08) 0%, transparent 70%)", animationDelay: "0s" }} />
        <Blob color="" size="w-[600px] h-[400px]" style={{ bottom: "5%", right: "-5%", background: "radial-gradient(ellipse, rgba(37,99,168,0.05) 0%, transparent 70%)", animationDelay: "3s" }} />
        {/* Topographic grid — sparse map-paper feel */}
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,168,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,168,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col gap-10">

        {/* ── Hero header ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center flex flex-col items-center gap-4"
        >
          {/* Status badge — OPERATIONAL */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex items-center gap-2.5 px-4 py-1.5 rounded text-xs font-semibold tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              background: "rgba(37,99,168,0.10)",
              border: "1px solid rgba(37,99,168,0.28)",
              color: "#60a5d8",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#60a5d8] opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2563a8]" />
            </span>
            GGICAS — System Operational
          </motion.div>

          {/* Main title — editorial weight, no gradient rainbow */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.50, delay: 0.18 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.03em" }}
          >
            <span className="text-gradient-primary">Global Geopolitical</span>
            <br />
            <span style={{ color: "#e8edf4" }}>Intelligence</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.30 }}
            className="max-w-2xl text-base md:text-lg leading-relaxed"
            style={{ color: "#9baab8" }}
          >
            Conflict analysis, alliance mapping, sanctions intelligence,
            and economic data across{" "}
            <span style={{ color: "#60a5d8", fontWeight: 600 }}>
              <AnimatedCounter target={stats.countries} /> nations
            </span>{" "}
            worldwide.
          </motion.p>
        </motion.div>

        {/* ── Live stats row ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.42 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {STAT_CONFIGS.map(({ key, label, icon: Icon, color, bgColor, borderColor }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.44 + i * 0.06 }}
              className="flex items-center gap-3 px-5 py-3 rounded-lg"
              style={{ background: bgColor, border: `1px solid ${borderColor}` }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color, opacity: 0.85 }} />
              <span className="text-xl font-bold tabular-nums" style={{ color, fontFamily: "var(--font-mono)" }}>
                <AnimatedCounter target={stats[key as keyof typeof stats]} />
              </span>
              <span className="text-xs" style={{ color: "#566577", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Navigation panel cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {PANELS.map((panel, i) => {
            const Icon = panel.icon;
            const statCount =
              panel.stats[0].key
                ? stats[panel.stats[0].key as keyof typeof stats]
                : 8;

            const CardContent = (
              <motion.div
                key={panel.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 + i * 0.10, ease: "easeOut" }}
                whileHover={{ y: -6, transition: { duration: 0.22 } }}
                className="group relative flex flex-col gap-5 p-6 rounded-2xl cursor-pointer overflow-hidden"
                style={{
                  background: panel.bgTint,
                  border: `1px solid ${panel.border}`,
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: `inset 0 0 60px ${panel.shadowColor.replace("0.5", "0.12")}`,
                  }}
                />
                {/* Top glow strip */}
                <div
                  className={`absolute top-0 left-6 right-6 h-px bg-gradient-to-r ${panel.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                />

                {/* Icon */}
                <div
                  className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${panel.gradient} flex items-center justify-center shadow-lg`}
                  style={{ boxShadow: `0 8px 24px ${panel.shadowColor}` }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Badge + Label */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono tracking-widest text-[#5a6490] uppercase mb-1">
                      {panel.sublabel}
                    </p>
                    <h2 className="text-xl font-bold text-[#f0f0ff]">{panel.label}</h2>
                  </div>
                  <span className={panel.badgeClass}>{panel.badge}</span>
                </div>

                {/* Description */}
                <p className="text-sm text-[#a0a8d0] leading-relaxed flex-1">
                  {panel.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const SI = panel.stats[0].icon;
                      return <SI className="w-3.5 h-3.5 text-[#5a6490]" />;
                    })()}
                    <span className="text-xs text-[#5a6490] font-mono">
                      {panel.stats[0].label}:{" "}
                      <span className="text-[#a0a8d0] font-semibold">{statCount}</span>
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold bg-gradient-to-r ${panel.gradient} bg-clip-text text-transparent group-hover:gap-2 transition-all duration-200`}
                  >
                    Open <ArrowRight className="w-3.5 h-3.5" style={{ color: "inherit" }} />
                  </div>
                </div>
              </motion.div>
            );

            if (panel.href) {
              return (
                <Link href={panel.href} key={panel.id} className="contents">
                  {CardContent}
                </Link>
              );
            }
            return (
              <button
                key={panel.id}
                className="contents text-left"
                onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
              >
                {CardContent}
              </button>
            );
          })}
        </div>

        {/* ── Quick-access secondary row ────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Conflict Dossiers",
              desc: "Click any hotspot on the globe to pull a full tactical conflict dossier with combatant details.",
              gradient: "from-rose-500 to-orange-500",
              icon: ShieldAlert,
              color: "text-rose-400",
              bg: "bg-rose-500/10",
              border: "border-rose-500/20",
              href: "/globe",
            },
            {
              title: "Trade Intelligence",
              desc: "Bilateral trade volume data and partner rankings across the global economy.",
              gradient: "from-teal-400 to-cyan-400",
              icon: TrendingUp,
              color: "text-teal-400",
              bg: "bg-teal-500/10",
              border: "border-teal-500/20",
              href: "/analytics",
            },
            {
              title: "Alliance Network",
              desc: "Military pacts, economic unions, and diplomatic alliances mapped in the globe view.",
              gradient: "from-violet-500 to-indigo-500",
              icon: Activity,
              color: "text-violet-400",
              bg: "bg-violet-500/10",
              border: "border-violet-500/20",
              href: "/globe",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.85 + i * 0.08 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-start gap-4 p-5 rounded-2xl border ${item.border} ${item.bg} hover:bg-white/[0.07] transition-colors duration-200 group block`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-[#f0f0ff] text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-[#a0a8d0] leading-relaxed">{item.desc}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 ${item.color} mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0`} />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ── DB concepts strip ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="p-5 rounded-lg"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <p
            className="uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "#566577" }}
          >
            Advanced Database Concepts Demonstrated
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "ACID Transactions",
              "Window Functions",
              "CTEs",
              "Correlated Subqueries",
              "GROUP BY + COUNT",
              "Multi-table JOINs",
              "Temporal Aggregation",
              "Raw SQL (better-sqlite3)",
              "Database Triggers",
              "Database Views",
              "Indexing",
            ].map((c) => (
              <span
                key={c}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  background: "rgba(37,99,168,0.08)",
                  border: "1px solid rgba(37,99,168,0.18)",
                  color: "#566577",
                  borderRadius: "4px",
                  padding: "2px 10px",
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
