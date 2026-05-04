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
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    shadowColor: "rgba(139,92,246,0.5)",
    border: "rgba(139,92,246,0.35)",
    bgTint: "rgba(139,92,246,0.07)",
    badge: "Live",
    badgeClass: "badge-violet",
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
    gradient: "from-teal-400 via-cyan-500 to-sky-500",
    shadowColor: "rgba(20,184,166,0.5)",
    border: "rgba(20,184,166,0.35)",
    bgTint: "rgba(20,184,166,0.07)",
    badge: "Charts",
    badgeClass: "badge-teal",
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
    gradient: "from-amber-400 via-orange-400 to-rose-400",
    shadowColor: "rgba(251,191,36,0.5)",
    border: "rgba(251,191,36,0.35)",
    bgTint: "rgba(251,191,36,0.07)",
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
    gradient: "from-rose-400 via-pink-500 to-fuchsia-500",
    shadowColor: "rgba(244,63,94,0.5)",
    border: "rgba(244,63,94,0.35)",
    bgTint: "rgba(244,63,94,0.07)",
    badge: "⌘K",
    badgeClass: "badge-rose",
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
    gradient: "from-orange-400 via-orange-500 to-rose-500",
    shadowColor: "rgba(249,115,22,0.5)",
    border: "rgba(249,115,22,0.35)",
    bgTint: "rgba(249,115,22,0.07)",
    badge: "CAST",
    badgeClass: "badge-amber",
    stats: [{ icon: ShieldAlert, label: "Monitored", key: "countries" }],
  },
];

/* ─── Stat chip ──────────────────────────────────────────────────────── */
const STAT_CONFIGS = [
  {
    key: "countries",
    label: "Nations",
    icon: Globe2,
    color: "text-violet-400",
    glow: "bg-violet-500/15",
    border: "border-violet-500/25",
  },
  {
    key: "conflicts",
    label: "Conflicts",
    icon: ShieldAlert,
    color: "text-rose-400",
    glow: "bg-rose-500/15",
    border: "border-rose-500/25",
  },
  {
    key: "alliances",
    label: "Alliances",
    icon: Activity,
    color: "text-teal-400",
    glow: "bg-teal-500/15",
    border: "border-teal-500/25",
  },
  {
    key: "sanctions",
    label: "Sanctions",
    icon: Zap,
    color: "text-amber-400",
    glow: "bg-amber-500/15",
    border: "border-amber-500/25",
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
      {/* ── Ambient background blobs ─────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <Blob color="bg-violet-600/15" size="w-[700px] h-[700px]" style={{ top: "-10%", left: "-5%", animationDelay: "0s" }} />
        <Blob color="bg-fuchsia-600/10" size="w-[500px] h-[500px]" style={{ top: "30%", right: "-8%", animationDelay: "2s" }} />
        <Blob color="bg-teal-600/10" size="w-[600px] h-[600px]" style={{ bottom: "0%", left: "30%", animationDelay: "4s" }} />
        <Blob color="bg-amber-600/6" size="w-[400px] h-[400px]" style={{ top: "60%", right: "20%" }} />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
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
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold tracking-widest uppercase"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
            </span>
            GGICAS — Intelligence Platform
          </motion.div>

          {/* Main title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none"
          >
            <span className="text-gradient-primary">Global Geopolitical</span>
            <br />
            <span className="text-[#f0f0ff]">Intelligence</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="max-w-2xl text-base md:text-lg text-[#a0a8d0] leading-relaxed"
          >
            Real-time conflict analysis, alliance mapping, sanctions intelligence,
            and economic data across{" "}
            <span className="text-violet-400 font-semibold">
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
          {STAT_CONFIGS.map(({ key, label, icon: Icon, color, glow, border }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.38, delay: 0.48 + i * 0.07 }}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border ${border} ${glow} backdrop-blur-md`}
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`text-2xl font-black tabular-nums ${color}`}>
                <AnimatedCounter target={stats[key as keyof typeof stats]} />
              </span>
              <span className="text-xs text-[#a0a8d0] font-medium">{label}</span>
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
          className="glass-sm p-5"
        >
          <p className="text-[10px] font-mono tracking-widest text-violet-400/70 uppercase mb-3">
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
              "Raw SQL via $queryRaw",
              "Prisma ORM",
              "Database Views",
              "Indexing",
            ].map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300/80 text-[10px] font-mono"
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
