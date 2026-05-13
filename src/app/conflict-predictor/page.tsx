"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, Filter, Map, Calendar, ShieldCheck, Info, ShieldAlert, Shield } from "lucide-react";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface ForecastData {
  id: string;
  countryIso: string;
  countryName: string;
  forecastMonth: string;
  bestCase: number;
  expectedCase: number;
  worstCase: number;
  historicalAvg: number;
  predictedChange: "increase" | "decrease" | "stable";
  violenceType: string;
}

export default function ConflictPredictorPage() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<ForecastData | null>(null);

  const fetchData = async (month?: string) => {
    setLoading(true);
    try {
      const query = month ? `?month=${month}` : "";
      const [resData, resMonths] = await Promise.all([
        axios.get(`/api/conflict-forecast${query}`),
        axios.get(`/api/conflict-forecast/months`)
      ]);
      setData(resData.data.data);
      setMonths(resMonths.data.data);
      if (!month && resMonths.data.data.length > 0) {
        setSelectedMonth(resMonths.data.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post("/api/cron/cast-sync", {});
      await fetchData(); // Refresh data after sync
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const totals = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.expectedCase, 0);
  }, [data]);

  // Safety Status Logic
  const getSafetyStatus = (expected: number) => {
    if (expected > 1000) return { label: "Extreme Risk", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: <ShieldAlert className="w-3 h-3" />, desc: "Severe conflict and high violence levels predicted." };
    if (expected > 500) return { label: "High Risk", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: <AlertTriangle className="w-3 h-3" />, desc: "Significant volatility and unrest expected." };
    if (expected > 200) return { label: "Moderate Risk", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <Shield className="w-3 h-3" />, desc: "Localized instability and protests likely." };
    return { label: "Low Risk", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <ShieldCheck className="w-3 h-3" />, desc: "Relatively stable environment." };
  };

  // Map color scale based on expectedCase
  const getColor = (expected: number) => {
    if (expected > 1000) return "#f43f5e"; // Rose 500
    if (expected > 500) return "#fb923c"; // Orange 400
    if (expected > 200) return "#fbbf24"; // Amber 400
    return "rgba(255,255,255,0.05)"; // Base
  };

  // Mock historical data for the chart based on the selected country
  const chartData = useMemo(() => {
    if (!selectedCountry) return [];
    const base = selectedCountry.historicalAvg || selectedCountry.expectedCase * 0.9;
    return Array.from({ length: 12 }).map((_, i) => ({
      month: `M-${11 - i}`,
      historical: Math.floor(base + (Math.random() * 50 - 25)),
      expected: i === 11 ? selectedCountry.expectedCase : null,
      best: i === 11 ? selectedCountry.bestCase : null,
      worst: i === 11 ? selectedCountry.worstCase : null,
    }));
  }, [selectedCountry]);

  return (
    <div className="min-h-screen text-[#f0f0ff] flex flex-col h-screen overflow-hidden bg-[#05061a]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 -right-20 w-[600px] h-[500px] bg-rose-700/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[400px] bg-orange-700/10 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col p-4 md:p-6 gap-6 h-full overflow-hidden max-w-[1600px] mx-auto w-full">
        
        {/* Header */}
        <header className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(244,63,94,0.3)] bg-gradient-to-br from-orange-400 to-rose-500">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                CAST <span className="font-light text-[#a0a8d0]">|</span> Conflict Alert System
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border border-rose-500/30 text-rose-400 bg-rose-500/10 ml-2">
                  Monthly Forecast
                </span>
              </h1>
              <p className="text-sm text-[#5a6490]">Predictive model of political violence events globally.</p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Latest CAST"}
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          
          {/* Left / Center Map Area */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            {/* Stat Row */}
            <div className="grid grid-cols-3 gap-4 shrink-0">
              <div className="glass-sm p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-orange-500">
                <AlertTriangle className="w-8 h-8 text-orange-400 opacity-80" />
                <div>
                  <p className="text-xs text-[#a0a8d0] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    Global Forecasted Events
                    <div className="group relative">
                      <Info className="w-3 h-3 text-[#5a6490] cursor-help" />
                      <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-[#0a0a1a] border border-white/10 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-[10px] normal-case text-[#a0a8d0] leading-relaxed">
                        <p className="font-bold text-white mb-1">What are "Conflict Events"?</p>
                        ACLED records individual instances of political violence including battles, explosions, protests, riots, and violence against civilians. One event represents a single tactical occurrence.
                      </div>
                    </div>
                  </p>
                  <p className="text-2xl font-black text-white">{totals.toLocaleString()}</p>
                </div>
              </div>
              <div className="glass-sm p-4 rounded-xl flex items-center gap-4">
                <Map className="w-8 h-8 text-[#5a6490] opacity-80" />
                <div>
                  <p className="text-xs text-[#a0a8d0] uppercase tracking-wider mb-1">Nations Monitored</p>
                  <p className="text-2xl font-black text-white">{data.length}</p>
                </div>
              </div>
              <div className="glass-sm p-4 rounded-xl flex flex-col justify-center">
                <p className="text-xs text-[#a0a8d0] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Forecast Month
                </p>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    fetchData(e.target.value);
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-rose-400"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                  {months.length === 0 && <option value="">No data</option>}
                </select>
              </div>
            </div>

            {/* Map Container */}
            <div className="glass flex-1 rounded-2xl relative overflow-hidden border border-white/10">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center skeleton rounded-2xl" />
              ) : (
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120 }}>
                  <ZoomableGroup center={[0, 20]}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }) =>
                        geographies.map((geo) => {
                          const iso = geo.id; // Map topojson IDs usually match roughly, but we might need ISO-alpha2 or alpha3
                          // Simplify: we just colorize matches by countryName or iso.
                          const d = data.find(c => c.countryName === geo.properties.name);
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={d ? getColor(d.expectedCase) : "rgba(255,255,255,0.02)"}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: "none" },
                                hover: { fill: "#f472b6", outline: "none", cursor: d ? "pointer" : "default" },
                                pressed: { outline: "none" },
                              }}
                              onClick={() => {
                                if (d) setSelectedCountry(d);
                              }}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              )}

              {/* Map Legend */}
              <div className="absolute bottom-4 right-4 glass-sm p-4 rounded-xl border border-white/10 flex flex-col gap-3 backdrop-blur-md">
                <span className="text-[10px] font-bold text-[#a0a8d0] uppercase tracking-wider">Civilian Safety Level</span>
                <div className="flex items-center gap-3 text-[11px] font-medium text-rose-400">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Extreme Risk
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium text-orange-400">
                  <div className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" /> High Risk
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium text-amber-400">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" /> Moderate Risk
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Ranked Table & Chart */}
          <div className="w-full lg:w-[450px] flex flex-col gap-6 shrink-0 min-h-0">
            {/* Table */}
            <div className="glass flex-1 rounded-2xl flex flex-col overflow-hidden border border-white/10">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-400" />
                  Country Forecasts
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#0c0d21] text-[#5a6490] font-mono border-b border-white/10 z-10">
                    <tr>
                      <th className="py-3 px-4 font-medium">Country</th>
                      <th className="py-3 px-4 font-medium text-right">Status</th>
                      <th className="py-3 px-4 font-medium text-center">Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedCountry(row)}
                        className={`border-b border-white/[0.05] cursor-pointer transition-colors ${
                          selectedCountry?.id === row.id ? "bg-orange-500/10" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-[#f0f0ff]">{row.countryName}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getSafetyStatus(row.expectedCase).bg} ${getSafetyStatus(row.expectedCase).color} ${getSafetyStatus(row.expectedCase).border}`}>
                            {getSafetyStatus(row.expectedCase).icon}
                            {getSafetyStatus(row.expectedCase).label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {row.predictedChange === "increase" ? <ArrowUpRight className="w-4 h-4 text-rose-400 inline" /> :
                           row.predictedChange === "decrease" ? <ArrowDownRight className="w-4 h-4 text-emerald-400 inline" /> :
                           <Minus className="w-4 h-4 text-amber-400 inline" />}
                        </td>
                      </tr>
                    ))}
                    {data.length === 0 && !loading && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-[#5a6490]">No forecast data. Click Sync.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Country Assessment & Chart */}
            {selectedCountry ? (
              <div className="flex flex-col gap-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`glass p-5 rounded-2xl border-l-4 ${getSafetyStatus(selectedCountry.expectedCase).border} bg-gradient-to-r from-white/[0.02] to-transparent`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-black text-white">{selectedCountry.countryName}</h4>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase ${getSafetyStatus(selectedCountry.expectedCase).bg} ${getSafetyStatus(selectedCountry.expectedCase).color}`}>
                      {getSafetyStatus(selectedCountry.expectedCase).icon}
                      {getSafetyStatus(selectedCountry.expectedCase).label}
                    </span>
                  </div>
                  <p className="text-sm text-[#a0a8d0] leading-relaxed mb-4">
                    {getSafetyStatus(selectedCountry.expectedCase).desc} 
                    {selectedCountry.predictedChange === "increase" && " Data indicates an upward trend in local volatility for the upcoming month."}
                    {selectedCountry.predictedChange === "decrease" && " Indicators suggest a cooling period with reduced conflict intensity."}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] text-[#5a6490] uppercase font-bold mb-1">Impact Scenario</p>
                      <p className="text-xs text-[#a0a8d0]">
                        <span className="text-white font-bold">{selectedCountry.expectedCase}</span> events forecasted
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <p className="text-[10px] text-[#5a6490] uppercase font-bold mb-1">Historical Context</p>
                      <p className="text-xs text-[#a0a8d0]">
                        Avg: <span className="text-white font-bold">{Math.round(selectedCountry.historicalAvg || 0)}</span> events
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass h-[280px] rounded-2xl border border-white/10 flex flex-col p-4 bg-gradient-to-b from-white/[0.02] to-transparent"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-[10px] uppercase tracking-widest text-[#5a6490]">Predictive Trajectory</h4>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-1.5 text-[10px] text-[#5a6490]">
                         <div className="w-2 h-0.5 bg-[#60a5fa]" /> Historical
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] text-rose-400">
                         <div className="w-2 h-0.5 bg-rose-500" /> Forecast
                       </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: "#5a6490", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#5a6490", fontSize: 10 }} axisLine={false} tickLine={false} width={40} />
                        <Tooltip
                          contentStyle={{ background: "#0a0a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                          itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                          labelStyle={{ color: "#5a6490", fontSize: "10px", marginBottom: "4px" }}
                        />
                        <Line type="monotone" dataKey="historical" stroke="#60a5fa" strokeWidth={2} dot={false} name="Past Activity" />
                        <Area type="monotone" dataKey="expected" fill="url(#colorExpected)" stroke="#f43f5e" strokeWidth={2} name="Forecast" />
                        <defs>
                          <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="flex-1 glass rounded-2xl flex flex-col items-center justify-center text-[#5a6490] p-8 text-center">
                <Map className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">Select a nation on the map or table to view civilian safety assessment.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
