"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, Marker, Line } from "react-simple-maps";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { X, Search, Swords, Handshake, ZoomIn, ZoomOut, RotateCcw, Rocket } from "lucide-react";
import { geoCentroid } from "d3-geo";
// @ts-ignore
import * as topojson from "topojson-client";
import ConflictDossier from "./ConflictDossier";

const topoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Country { id: string; name: string; isoCode: string; region: string; gdpCurrentUsd?: number | null; militaryBudget?: number | null; leaders?: Array<{ name: string; title: string }>; }
interface Alliance { id: string; countryAId: string; countryBId: string | null; organizationId: string | null; allianceType: string; motivation?: string; countryA: Country; countryB?: Country; }
interface Conflict { id: string; name: string; type: string; cause?: string; participants: Array<{ role: string; country: Country }>; }
interface ArmsTransfer { id: string; exporterId: string; importerId: string; exporter: { name: string; isoCode: string }; importer: { name: string; isoCode: string }; weaponType: string; volumeTIV: number | null; }

function fmtMoney(v: number | null | undefined) {
  if (v == null) return "N/A";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}

const MANUAL_COORDS: Record<string, [number, number]> = {
  "United States": [-95.7129, 37.0902], "Soviet Union": [105.3188, 61.524],
  "Russia": [105.3188, 61.524], "United Kingdom": [-3.436, 55.3781],
  "North Korea": [127.5, 40.0], "South Korea": [127.8, 36.5],
  "Saudi Arabia": [45.0, 24.0], "South Africa": [25.0, -29.0],
};

export default function GlobeMap() {
  const [countries, setCountries]   = useState<Country[]>([]);
  const [alliances, setAlliances]   = useState<Alliance[]>([]);
  const [conflicts, setConflicts]   = useState<Conflict[]>([]);
  const [armsTransfers, setArmsTransfers] = useState<ArmsTransfer[]>([]);
  const [year, setYear]             = useState<number>(2024);
  const [weaponFilter, setWeaponFilter] = useState<string>("All");
  const [tooltip, setTooltip]       = useState<string>("");
  const [mousePos, setMousePos]     = useState<[number, number]>([0, 0]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [rotation, setRotation]     = useState<[number, number, number]>([0, -20, 0]);
  const [scale, setScale]           = useState(390);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos]     = useState<[number, number]>([0, 0]);
  const [countryCoords, setCountryCoords] = useState<Record<string, [number, number]>>({});
  const [topology, setTopology]     = useState<any>(null);
  const [isLoadingTopology, setIsLoadingTopology] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);

  const isDraggingRef    = useRef(isDragging);
  const selectedRef      = useRef(selectedCountry);
  const globeRef         = useRef<HTMLDivElement>(null);
  const animFrameRef     = useRef<number>(0);

  useEffect(() => { isDraggingRef.current = isDragging; },    [isDragging]);
  useEffect(() => { selectedRef.current   = selectedCountry; }, [selectedCountry]);

  /* Auto-rotate when idle */
  useEffect(() => {
    const tick = () => {
      if (!isDraggingRef.current && !selectedRef.current) {
        setRotation(p => [p[0] + 0.08, p[1], p[2]]);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current!);
  }, []);

  /* Scroll-wheel zoom (non-passive) */
  useEffect(() => {
    const el = globeRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale(s => Math.max(200, Math.min(650, s - e.deltaY * 0.4)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isLoadingTopology]);

  /* Load topology */
  useEffect(() => {
    axios.get(topoUrl).then(res => {
      setTopology(res.data);
      const geo = topojson.feature(res.data, res.data.objects.countries) as any;
      const coords: Record<string, [number, number]> = {};
      geo.features.forEach((f: any) => { if (f.properties?.name) coords[f.properties.name] = geoCentroid(f); });
      setCountryCoords({ ...coords, ...MANUAL_COORDS });
    }).catch(e => console.error(e)).finally(() => setIsLoadingTopology(false));
  }, []);

  /* Fetch data on year change */
  useEffect(() => {
    axios.get(`/api/countries?year=${year}`).then(r => setCountries(r.data.data ?? r.data));
    axios.get(`/api/alliances?year=${year}`).then(r => setAlliances(r.data.data ?? r.data));
    axios.get(`/api/conflicts?year=${year}`).then(r => setConflicts(r.data.data ?? r.data));
    axios.get(`/api/arms-trade?year=${year}`).then(r => setArmsTransfers(r.data.data ?? r.data));
  }, [year]);

  const currentSelectedData = useMemo(() => {
    if (!selectedCountry) return null;
    return countries.find(c => c.id === selectedCountry.id) ?? selectedCountry;
  }, [selectedCountry, countries]);

  const allianceArrows = useMemo(() => {
    if (!selectedCountry) return [];
    const myId = selectedCountry.id;
    const myCoords = countryCoords[selectedCountry.name];
    if (!myCoords) return [];
    return alliances.filter(a => a.countryAId === myId || a.countryBId === myId).map(a => {
      const partner = a.countryAId === myId ? a.countryB : a.countryA;
      if (!partner) return null;
      const pc = countryCoords[partner.name];
      if (!pc) return null;
      return { id: a.id, from: myCoords, to: pc, label: partner.name, type: a.allianceType };
    }).filter(Boolean) as { id: string; from: [number,number]; to: [number,number]; label: string; type: string }[];
  }, [selectedCountry, alliances, countryCoords]);

  const conflictArrows = useMemo(() => {
    if (!selectedCountry) return [];
    const myId = selectedCountry.id;
    const myCoords = countryCoords[selectedCountry.name];
    if (!myCoords) return [];
    const targets = new Map<string, { coords: [number,number]; name: string; conflict: string }>();
    conflicts.forEach(cf => {
      if (!cf.participants.some(p => p.country.id === myId)) return;
      cf.participants.forEach(p => {
        if (p.country.id === myId) return;
        const c = countryCoords[p.country.name];
        if (c && !targets.has(p.country.id)) targets.set(p.country.id, { coords: c, name: p.country.name, conflict: cf.name });
      });
    });
    return Array.from(targets.entries()).map(([id, v]) => ({ id, from: myCoords, to: v.coords, label: v.name, conflict: v.conflict }));
  }, [selectedCountry, conflicts, countryCoords]);

  const armsArrows = useMemo(() => {
    if (weaponFilter !== "All") {
      // Global weapon mode
      return armsTransfers.filter(a => a.weaponType === weaponFilter).map(a => {
        const fromCoords = countryCoords[a.exporter.name];
        const toCoords = countryCoords[a.importer.name];
        if (!fromCoords || !toCoords) return null;
        return { id: a.id, from: fromCoords, to: toCoords, label: `${a.exporter.name} → ${a.importer.name}`, weaponType: a.weaponType, volume: a.volumeTIV };
      }).filter(Boolean) as any[];
    }

    if (!selectedCountry) return [];
    const myId = selectedCountry.id;
    const myCoords = countryCoords[selectedCountry.name];
    if (!myCoords) return [];
    return armsTransfers.filter(a => a.exporterId === myId || a.importerId === myId).map(a => {
      const isExport = a.exporterId === myId;
      const partnerName = isExport ? a.importer.name : a.exporter.name;
      const pc = countryCoords[partnerName];
      if (!pc) return null;
      return { id: a.id, from: isExport ? myCoords : pc, to: isExport ? pc : myCoords, label: partnerName, weaponType: a.weaponType, volume: a.volumeTIV, isExport };
    }).filter(Boolean) as any[];
  }, [selectedCountry, armsTransfers, countryCoords, weaponFilter]);

  /* Search */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return countries.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, countries]);

  const flyTo = useCallback((country: Country) => {
    const coords = countryCoords[country.name];
    if (coords) setRotation([-coords[0], Math.max(-70, Math.min(70, -coords[1])), 0]);
    setSelectedCountry(country);
    setSearchQuery("");
    setSearchFocus(false);
  }, [countryCoords]);

  /* Drag */
  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    setStartPos([x, y]);
  };
  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    const y = "touches" in e ? e.touches[0].clientY : e.clientY;
    setMousePos([x, y]);
    if (!isDragging) return;
    const dx = x - startPos[0], dy = y - startPos[1];
    setRotation(p => [p[0] + dx * 0.45, Math.max(-90, Math.min(90, p[1] - dy * 0.45)), p[2]]);
    setStartPos([x, y]);
  };
  const onMouseUp = () => setIsDragging(false);

  if (isLoadingTopology) return (
    <div className="flex-1 flex items-center justify-center text-indigo-400 animate-pulse font-mono tracking-widest text-sm">
      INITIALIZING GEOPOLITICAL TOPOLOGY…
    </div>
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative font-sans overflow-hidden">

      {/* ── Timeline + Search Panel ── */}
      <div className="absolute top-4 left-4 p-5 bg-[#0d1120]/85 backdrop-blur-xl border border-white/[0.09] rounded-xl shadow-2xl z-20 w-72" style={{ fontFamily: "var(--font-sans)" }}>
        <h2 className="text-sm font-semibold text-[#e8edf4] mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>Timeline Explorer</h2>
        <p className="text-xs mb-4" style={{ color: "#566577", fontFamily: "var(--font-mono)" }}>Scroll to zoom · Click to inspect</p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
            placeholder="Fly to country…"
            className="w-full pl-8 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
            id="globe-country-search"
          />
          {(searchFocus && searchResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl z-30">
              {searchResults.map(c => (
                <button key={c.id} onMouseDown={() => flyTo(c)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-white/8 text-white flex items-center gap-2 transition-colors">
                  <span className="text-indigo-400 font-mono">{c.isoCode}</span> {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Weapon Dropdown */}
        <div className="mb-4 flex flex-col gap-1">
          <label className="text-[10px] uppercase tracking-widest font-semibold mb-1 block" style={{ color: "#566577", fontFamily: "var(--font-mono)" }}>Weapon System Filter</label>
          <select
            value={weaponFilter}
            onChange={(e) => { setWeaponFilter(e.target.value); setSelectedCountry(null); }}
            className="w-full text-xs rounded-md text-[#e8edf4] p-2 outline-none cursor-pointer"
            style={{ background: "rgba(22,48,88,0.60)", border: "1px solid rgba(37,99,168,0.30)", fontFamily: "var(--font-sans)" }}
          >
            <option value="All">All Weapons (Select Country)</option>
            <option value="Aircraft">Aircraft</option>
            <option value="Missiles">Missiles</option>
            <option value="Armored Vehicles">Armored Vehicles</option>
            <option value="Naval Weapons">Naval Weapons</option>
            <option value="Air Defense Systems">Air Defense Systems</option>
            <option value="Artillery">Artillery</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 text-xs" style={{ color: "#566577" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5" style={{ background: "#52a040" }} /><span>Alliance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5" style={{ background: "#dc4b3a" }} /><span>Conflict</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-0.5" style={{ background: "#d4972a" }} /><span>Arms Trade</span>
          </div>
        </div>

        {/* Year slider */}
        <input type="range" min="1940" max="2024" value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{ background: "rgba(37,99,168,0.25)", accentColor: "#2563a8" }} />
        <div className="flex justify-between text-xs font-mono mt-1" style={{ color: "#566577" }}>
          <span>1940</span>
          <span className="font-bold text-base -mt-1" style={{ color: "#60a5d8" }}>{year}</span>
          <span>2024</span>
        </div>

        {selectedCountry && (
          <div className="mt-3 pt-3 border-t border-white/[0.07] text-xs space-y-1" style={{ color: "#566577" }}>
            <div className="flex items-center gap-2" style={{ color: "#52a040" }}>
              <Handshake className="w-3 h-3" />
              <span>{allianceArrows.length} alliance{allianceArrows.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: "#dc4b3a" }}>
              <Swords className="w-3 h-3" />
              <span>{conflictArrows.length} conflict connection{conflictArrows.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: "#d4972a" }}>
              <Rocket className="w-3 h-3" />
              <span>{armsArrows.length} arms transfer{armsArrows.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Zoom controls ── */}
      <div className="absolute bottom-6 left-4 flex flex-col gap-1.5 z-20">
        <button onClick={() => setScale(s => Math.min(650, s + 40))}
          className="w-8 h-8 rounded-lg bg-slate-900/70 backdrop-blur border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={() => setScale(s => Math.max(200, s - 40))}
          className="w-8 h-8 rounded-lg bg-slate-900/70 backdrop-blur border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={() => { setRotation([0, -20, 0]); setScale(390); setSelectedCountry(null); }}
          className="w-8 h-8 rounded-lg bg-slate-900/70 backdrop-blur border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors" title="Reset view">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Intel Dossier ── */}
      <AnimatePresence>
        {currentSelectedData && (
          <motion.div
            key="dossier"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="absolute top-4 right-4 w-[22rem] max-h-[calc(100vh-120px)] overflow-y-auto bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] z-20 p-5 flex flex-col gap-4"
          >
            <button onClick={() => setSelectedCountry(null)}
              className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1 flex items-center gap-1.5">
                <Search className="w-3 h-3" /> Intel Dossier
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">{currentSelectedData.name}</h2>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-slate-300 font-mono">ISO: {currentSelectedData.isoCode}</span>
                <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-slate-300 font-mono">REG: {currentSelectedData.region}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">GDP</p>
                <p className="text-sm font-bold text-emerald-400">{fmtMoney(currentSelectedData.gdpCurrentUsd)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Mil. Budget</p>
                <p className="text-sm font-bold text-rose-400">{fmtMoney(currentSelectedData.militaryBudget)}</p>
              </div>
            </div>

            {currentSelectedData.leaders && currentSelectedData.leaders.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <h3 className="text-xs text-slate-400 mb-1">Head of State ({year})</h3>
                <p className="text-sm text-white font-semibold">
                  {currentSelectedData.leaders[0].name} <span className="text-slate-400 font-normal">({currentSelectedData.leaders[0].title})</span>
                </p>
              </div>
            )}

            <div>
              <h3 className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-2 border-b border-emerald-500/20 pb-1.5 flex items-center gap-1.5">
                <Handshake className="w-3.5 h-3.5" /> Active Alliances ({allianceArrows.length})
              </h3>
              {alliances.filter(a => a.countryAId === currentSelectedData.id || a.countryBId === currentSelectedData.id).length === 0
                ? <p className="text-xs text-slate-500 italic">No alliances on record.</p>
                : alliances.filter(a => a.countryAId === currentSelectedData.id || a.countryBId === currentSelectedData.id).map(a => {
                    const partner = a.countryAId === currentSelectedData.id ? a.countryB?.name : a.countryA?.name;
                    return (
                      <div key={a.id} className="text-xs mb-2">
                        <div className="font-semibold text-white">{a.allianceType} <span className="text-emerald-400">↔</span> {partner ?? "Org."}</div>
                        {a.motivation && <div className="text-slate-400 mt-0.5 border-l-2 border-emerald-500/30 pl-2">{a.motivation}</div>}
                      </div>
                    );
                  })}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-2 border-b border-rose-500/20 pb-1.5 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" /> Active Conflicts
              </h3>
              {conflicts.filter(c => c.participants.some(p => p.country.id === currentSelectedData.id)).length === 0
                ? <p className="text-xs text-slate-500 italic">No conflicts on record.</p>
                : conflicts.filter(c => c.participants.some(p => p.country.id === currentSelectedData.id)).map(c => {
                    const role = c.participants.find(p => p.country.id === currentSelectedData.id)?.role;
                    return (
                      <div key={c.id} className="text-xs mb-3">
                        <div className="font-bold text-white cursor-pointer hover:text-amber-400 transition-colors flex items-center gap-1"
                          onClick={() => setSelectedConflictId(c.id)}>
                          {c.name} <span className="text-amber-500 font-normal">({c.type})</span>
                        </div>
                        <div className="inline-block px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 mt-1 mb-1">{role}</div>
                        {c.cause && <div className="text-slate-400 border-l-2 border-amber-500/30 pl-2">{c.cause.slice(0, 160)}…</div>}
                      </div>
                    );
                  })}
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-2 border-b border-cyan-500/20 pb-1.5 flex items-center gap-1.5">
                 <Rocket className="w-3.5 h-3.5" /> Arms Transfers
              </h3>
              {armsArrows.filter(a => a.isExport !== undefined).length === 0
                ? <p className="text-xs text-slate-500 italic">No transfers on record.</p>
                : armsArrows.filter(a => a.isExport !== undefined).map(a => (
                    <div key={a.id} className="text-xs mb-2">
                      <div className="font-semibold text-white">
                        {a.isExport ? <span className="text-cyan-400 font-mono">EXPORT → </span> : <span className="text-fuchsia-400 font-mono">IMPORT ← </span>}
                        {a.label}
                      </div>
                      <div className="text-slate-400 mt-0.5 border-l-2 border-cyan-500/30 pl-2">
                        {a.weaponType} {a.volume ? `(TIV: ${a.volume})` : ''}
                      </div>
                    </div>
                  ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tooltip ── */}
      {tooltip && !isDragging && (
        <div className="fixed px-3 py-1.5 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg text-white shadow-xl z-30 pointer-events-none text-sm font-medium"
          style={{ left: mousePos[0] + 14, top: mousePos[1] + 14 }}>
          {tooltip}
        </div>
      )}

      {/* Globe container — atmospheric Prussian blue outer glow */}
      <div
        ref={globeRef}
        className={`w-full max-w-4xl aspect-square rounded-full overflow-hidden flex items-center justify-center ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ border: "1px solid rgba(37,99,168,0.15)", boxShadow: "0 0 80px rgba(37,99,168,0.10), 0 0 200px rgba(10,14,24,0.60)" }}
        onMouseDown={onMouseDown}
        onMouseMove={e => { onMouseMove(e); setMousePos([e.clientX, e.clientY]); }}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onMouseDown}
        onTouchMove={onMouseMove}
        onTouchEnd={onMouseUp}
      >
        <ComposableMap projection="geoOrthographic"
          projectionConfig={{ scale, rotate: rotation }}
          className="w-full h-full pointer-events-none">
          <defs>
            <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L8,3 z" fill="#52a040" opacity="0.90" />
            </marker>
            <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L8,3 z" fill="#c0392b" opacity="0.90" />
            </marker>
            <marker id="arrow-cyan" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L8,3 z" fill="#b07d1a" opacity="0.90" />
            </marker>
          </defs>
          <Sphere stroke="#111d30" strokeWidth={0.8} id="sphere" fill="#0a0e1a" />
          <Graticule stroke="rgba(37,99,168,0.12)" strokeWidth={0.3} />

          {topology && (
            <Geographies geography={topology}>
              {({ geographies }) => geographies.map(geo => {
                const isSel = selectedCountry && geo.properties.name === selectedCountry.name;
                return (
                  <Geography key={geo.rsmKey} geography={geo}
                    fill={isSel ? "#1e4272" : "#131d2e"} stroke="#1e2d40" strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover:   { fill: isSel ? "#2563a8" : "#1a2a40", outline: "none", transition: "fill 0.15s" },
                      pressed: { outline: "none" },
                    }}
                    className="pointer-events-auto"
                    onMouseEnter={() => setTooltip(geo.properties.name)}
                    onMouseLeave={() => setTooltip("")}
                    onClick={() => {
                      if (isDragging) return;
                      const m = countries.find(c => c.name === geo.properties.name);
                      if (m) setSelectedCountry(p => p?.id === m.id ? null : m);
                    }}
                  />
                );
              })}
            </Geographies>
          )}

          {allianceArrows.map(a => (
            <Line key={`ally-${a.id}`} from={a.from} to={a.to} stroke="#3d7c30" strokeWidth={2.0}
              strokeLinecap="round" markerEnd="url(#arrow-green)"
              // @ts-ignore
              style={{ filter: "drop-shadow(0 0 3px rgba(61,124,48,0.60))", opacity: 0.80 }}
              className="pointer-events-none" />
          ))}

          {conflictArrows.map(a => (
            <Line key={`cf-${a.id}`} from={a.from} to={a.to} stroke="#c0392b" strokeWidth={2.0}
              strokeLinecap="round" markerEnd="url(#arrow-amber)" strokeDasharray="5 3"
              // @ts-ignore
              style={{ filter: "drop-shadow(0 0 4px rgba(192,57,43,0.70))", opacity: 0.80 }}
              className="pointer-events-none" />
          ))}

          {armsArrows.map(a => (
            <Line key={`arms-${a.id}`} from={a.from} to={a.to} stroke="#b07d1a" strokeWidth={1.8}
              strokeLinecap="round" markerEnd="url(#arrow-cyan)"
              // @ts-ignore
              style={{ filter: "drop-shadow(0 0 3px rgba(176,125,26,0.65))", opacity: weaponFilter !== "All" ? 0.55 : 0.78 }}
              className="pointer-events-none" />
          ))}

          {countries.map(country => {
            const coords = countryCoords[country.name];
            if (!coords) return null;
            const isSel    = selectedCountry?.id === country.id;
            const hasAlly  = allianceArrows.some(a => a.label === country.name);
            const hasCf    = conflictArrows.some(a => a.label === country.name);
            const hasArms  = armsArrows.some(a => a.label?.includes(country.name) || weaponFilter !== "All" && (a.from === coords || a.to === coords));
            const dotColor = isSel ? "#3b82c4" : hasAlly ? "#52a040" : hasCf ? "#c0392b" : hasArms ? "#d4972a" : "#263348";
            return (
              <Marker key={`m-${country.id}`} coordinates={coords} className="pointer-events-auto">
                {isSel && <circle r={16} fill="#2563a8" opacity={0.12} className="animate-ping pointer-events-none" />}
                {(hasAlly || hasCf) && !isSel && (
                  <circle r={9} fill={hasAlly ? "#3d7c30" : "#a61f1f"} opacity={0.20} className="pointer-events-none" />
                )}
                <circle r={isSel ? 7 : (hasAlly || hasCf || hasArms) ? 4.5 : 3} fill={dotColor}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => !isDragging && setSelectedCountry(p => p?.id === country.id ? null : country)}
                  onMouseEnter={() => setTooltip(country.name)}
                  onMouseLeave={() => setTooltip("")} />
                <text textAnchor="middle" y={isSel ? -16 : -9}
                  style={{ fontFamily: "var(--font-mono)", fill: isSel ? "#60a5d8" : hasAlly ? "#a8d898" : hasCf ? "#e87268" : hasArms ? "#e8b84b" : "#566577",
                    fontSize: isSel ? "11px" : "8px", fontWeight: isSel ? 700 : 500, pointerEvents: "none" }}>
                  {country.name}
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {selectedConflictId && (
        <ConflictDossier conflictId={selectedConflictId} onClose={() => setSelectedConflictId(null)} />
      )}
    </div>
  );
}
