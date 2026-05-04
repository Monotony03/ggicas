"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, CartesianGrid,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart3, Globe2, ShieldAlert, Ban, TrendingUp, Handshake, Swords, Activity } from "lucide-react";

interface Analytics {
  mostConnected:      { name: string; isoCode: string; totalConnections: number; allianceCount: number; conflictCount: number; sanctionCount: number }[];
  conflictsByType:    { type: string; count: number }[];
  conflictsPerDecade: { decade: number; count: number }[];
  topSanctioners:    { country: string; sanctionsImposed: number }[];
  mostSanctioned:    { country: string; sanctionsReceived: number }[];
  topTradePairs:     { countryA: string; countryB: string; totalVolume: number }[];
  gdpMilRatio:       { name: string; gdpCurrentUsd: number; militaryBudget: number; milPercent: number }[];
  allianceTypes:     { allianceType: string; count: number }[];
}

function fmtMoney(v: number | null) {
  if (!v) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}

/* ── Recharts tooltip style ─────────────────────────────────────────── */
const TT = {
  contentStyle: {
    background: "rgba(12,10,30,0.96)",
    border: "1px solid rgba(139,92,246,0.3)",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
  labelStyle: { color: "#f0f0ff", fontWeight: 600 },
  itemStyle:  { color: "#a78bfa" },
};

/* ── Color palettes ─────────────────────────────────────────────────── */
const PIE_COLORS = [
  "#8b5cf6","#f43f5e","#f59e0b","#14b8a6",
  "#06b6d4","#d946ef","#ec4899","#10b981",
];

/* ── Card wrapper ───────────────────────────────────────────────────── */
function Card({
  title, subtitle, icon, accentColor, borderColor, children, delay = 0,
}: {
  title: string; subtitle?: string; icon: React.ReactNode;
  accentColor: string; borderColor: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative flex flex-col gap-5 p-6 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${borderColor}`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Colored top-strip */}
      <div className={`absolute top-0 left-8 right-8 h-px ${accentColor}`} />
      {/* Header */}
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h3 className="text-sm font-bold text-[#f0f0ff] tracking-wide">{title}</h3>
          {subtitle && <p className="text-[11px] text-[#5a6490] font-mono mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

/* ── Skeleton ───────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  );
}

/* ── Icon badge ─────────────────────────────────────────────────────── */
function IconBadge({ gradient, children }: { gradient: string; children: React.ReactNode }) {
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${gradient}`}
    >
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData]       = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/analytics")
      .then(r => setData(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;
  if (!data)   return (
    <div className="min-h-screen flex items-center justify-center text-rose-400">
      Failed to load analytics.
    </div>
  );

  const conflictsDecadeData = data.conflictsPerDecade.map(d => ({ name: `${d.decade}s`, conflicts: d.count }));
  const connectedData       = data.mostConnected.slice(0, 10).map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
    total: c.totalConnections, alliances: c.allianceCount, conflicts: c.conflictCount,
  }));
  const milData  = data.gdpMilRatio.slice(0, 10).map(g => ({
    name: g.name.length > 12 ? g.name.slice(0, 12) + "…" : g.name,
    pct: +g.milPercent.toFixed(2),
  }));
  const pieData      = data.conflictsByType.map(c => ({ name: c.type, value: c.count }));
  const alliancePie  = data.allianceTypes.map(a => ({ name: a.allianceType, value: a.count }));

  return (
    <div className="min-h-screen text-[#f0f0ff]">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-violet-700/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/3  w-[400px] h-[300px] bg-teal-700/8   blur-[100px] rounded-full" />
        <div className="absolute top-1/2 left-0     w-[300px] h-[300px] bg-fuchsia-700/6 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-4 mb-2"
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #14b8a6, #22d3ee)", boxShadow: "0 8px 24px rgba(20,184,166,0.45)" }}
          >
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#f0f0ff] tracking-tight">Analytics Dashboard</h1>
            <p className="text-xs text-teal-400 font-mono tracking-widest uppercase mt-0.5">Aggregate Intelligence</p>
          </div>
        </motion.div>

        {/* ── Row 1 ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card
            title="Most Connected Nations"
            subtitle="GROUP BY + COUNT — alliances + conflicts + sanctions"
            icon={<IconBadge gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500"><Globe2 className="w-4.5 h-4.5 text-white" /></IconBadge>}
            accentColor="bg-gradient-to-r from-violet-500/80 to-fuchsia-500/80"
            borderColor="rgba(139,92,246,0.25)"
            delay={0.05}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={connectedData} layout="vertical" margin={{ left: 8, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#5a6490", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#a0a8d0", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <RTooltip {...TT} />
                <Bar dataKey="alliances" stackId="a" fill="#8b5cf6" radius={[0,0,0,0]} name="Alliances" />
                <Bar dataKey="conflicts" stackId="a" fill="#f43f5e" radius={[0,4,4,0]} name="Conflicts" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title="Conflicts by Type"
            subtitle="GROUP BY type, COUNT(*)"
            icon={<IconBadge gradient="bg-gradient-to-br from-rose-500 to-pink-500"><ShieldAlert className="w-4.5 h-4.5 text-white" /></IconBadge>}
            accentColor="bg-gradient-to-r from-rose-500/80 to-pink-500/80"
            borderColor="rgba(244,63,94,0.25)"
            delay={0.10}
          >
            <div className="flex gap-4">
              <ResponsiveContainer width="55%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={2} dataKey="value" nameKey="name"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RTooltip {...TT} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center gap-1.5 text-xs">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[#a0a8d0]">{d.name}</span>
                    <span className="text-[#5a6490] ml-auto font-mono">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ── Row 2 ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card
            title="Conflicts Per Decade"
            subtitle="Temporal aggregation — strftime + GROUP BY decade"
            icon={<IconBadge gradient="bg-gradient-to-br from-amber-400 to-orange-400"><Swords className="w-4.5 h-4.5 text-white" /></IconBadge>}
            accentColor="bg-gradient-to-r from-amber-400/80 to-orange-400/80"
            borderColor="rgba(251,191,36,0.25)"
            delay={0.15}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={conflictsDecadeData} margin={{ left: -10, right: 10 }}>
                <defs>
                  <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "#5a6490", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#5a6490", fontSize: 10 }} axisLine={false} tickLine={false} />
                <RTooltip {...TT} />
                <Area
                  type="monotone" dataKey="conflicts"
                  stroke="#f59e0b" strokeWidth={2.5}
                  fill="url(#cfGrad)"
                  dot={{ fill: "#f59e0b", r: 3, strokeWidth: 0 }}
                  name="Conflicts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card
            title="Sanctions Network"
            subtitle="Multi-table JOIN + GROUP BY"
            icon={<IconBadge gradient="bg-gradient-to-br from-rose-500 to-fuchsia-500"><Ban className="w-4.5 h-4.5 text-white" /></IconBadge>}
            accentColor="bg-gradient-to-r from-rose-500/80 to-fuchsia-500/80"
            borderColor="rgba(244,63,94,0.25)"
            delay={0.20}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-[10px] text-amber-400 font-mono font-semibold mb-3 uppercase tracking-widest">Top Sanctioners</h4>
                {data.topSanctioners.map(s => (
                  <div key={s.country} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.05]">
                    <span className="text-[#a0a8d0] truncate mr-2">{s.country}</span>
                    <span className="text-amber-400 font-mono font-bold shrink-0">{s.sanctionsImposed}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-[10px] text-rose-400 font-mono font-semibold mb-3 uppercase tracking-widest">Most Sanctioned</h4>
                {data.mostSanctioned.map(s => (
                  <div key={s.country} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.05]">
                    <span className="text-[#a0a8d0] truncate mr-2">{s.country}</span>
                    <span className="text-rose-400 font-mono font-bold shrink-0">{s.sanctionsReceived}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ── Row 3 ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card
            title="Top Trade Pairs"
            subtitle="SUM(tradeVolume) + GROUP BY + ORDER BY DESC"
            icon={<IconBadge gradient="bg-gradient-to-br from-teal-400 to-cyan-400"><TrendingUp className="w-4.5 h-4.5 text-white" /></IconBadge>}
            accentColor="bg-gradient-to-r from-teal-400/80 to-cyan-400/80"
            borderColor="rgba(20,184,166,0.25)"
            delay={0.25}
          >
            <div className="flex flex-col gap-2">
              {data.topTradePairs.slice(0, 8).map((t, i) => {
                const max = data.topTradePairs[0].totalVolume;
                const pct = max > 0 ? (t.totalVolume / max) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3 group">
                    <span className="text-xs text-[#5a6490] w-32 text-right truncate shrink-0">
                      {t.countryA} ↔ {t.countryB}
                    </span>
                    <div className="flex-1 h-6 bg-white/[0.04] rounded-lg overflow-hidden relative">
                      <motion.div
                        className="h-full rounded-lg"
                        style={{ background: "linear-gradient(90deg, #14b8a6, #22d3ee)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.05, ease: "easeOut" }}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-white/70">
                        {fmtMoney(t.totalVolume)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            title="Military Spending (% of GDP)"
            subtitle="CAST(militaryBudget) / NULLIF(gdp, 0) * 100"
            icon={<IconBadge gradient="bg-gradient-to-br from-emerald-500 to-teal-500"><Handshake className="w-4.5 h-4.5 text-white" /></IconBadge>}
            accentColor="bg-gradient-to-r from-emerald-500/80 to-teal-500/80"
            borderColor="rgba(16,185,129,0.25)"
            delay={0.30}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={milData} layout="vertical" margin={{ left: 8, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" unit="%" tick={{ fill: "#5a6490", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#a0a8d0", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
                <RTooltip {...TT} formatter={(v) => [`${v}%`, "Mil. % GDP"]} />
                <Bar dataKey="pct" radius={[0,4,4,0]} name="Mil. % GDP">
                  {milData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${160 - i * 8}, 65%, ${55 - i * 2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Alliance type distribution ───────────────────────────── */}
        <Card
          title="Alliance Type Distribution"
          subtitle="GROUP BY allianceType, COUNT(*)"
          icon={<IconBadge gradient="bg-gradient-to-br from-violet-500 to-indigo-500"><Activity className="w-4.5 h-4.5 text-white" /></IconBadge>}
          accentColor="bg-gradient-to-r from-violet-500/80 to-indigo-500/80"
          borderColor="rgba(139,92,246,0.25)"
          delay={0.35}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {data.allianceTypes.map((a, i) => {
              const colors = [
                { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.30)", text: "#a78bfa" },
                { bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.30)",  text: "#2dd4bf" },
                { bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.30)",  text: "#fbbf24" },
                { bg: "rgba(244,63,94,0.12)",   border: "rgba(244,63,94,0.30)",   text: "#fb7185" },
              ];
              const c = colors[i % colors.length];
              return (
                <motion.div
                  key={a.allianceType}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.42 + i * 0.07 }}
                  className="rounded-xl p-4 text-center"
                  style={{ background: c.bg, border: `1px solid ${c.border}` }}
                >
                  <div className="text-2xl font-black font-mono" style={{ color: c.text }}>{a.count}</div>
                  <div className="text-xs text-[#a0a8d0] mt-1">{a.allianceType}</div>
                </motion.div>
              );
            })}
          </div>
        </Card>

        {/* ── DB concepts footer ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
          className="glass-sm p-5"
        >
          <p className="text-[10px] font-mono tracking-widest text-violet-400/70 uppercase mb-3">
            Database Concepts Demonstrated
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "GROUP BY + COUNT", "SUM + ORDER BY DESC", "Subqueries (correlated)",
              "Multi-table JOINs", "Temporal Aggregation", "Computed Columns",
              "NULLIF / CAST", "Raw SQL via $queryRaw",
            ].map(c => (
              <span
                key={c}
                className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300/80 text-[10px] font-mono"
              >
                {c}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
