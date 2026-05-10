import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Crosshair, Loader2, Calendar, Flag, DollarSign, AlertTriangle, Percent, Shield, Activity } from "lucide-react";

interface Country {
  id: string;
  name: string;
  isoCode: string;
  militaryBudget: number | null;
  gdpCurrentUsd: number | null;
  alliancesA: { id: string; allianceType: string; organization: { name: string } | null }[];
  sanctionsIn: { id: string; sanctionType: string; imposingCountry: { name: string } }[];
  armsImports: { id: string; weaponType: string; year: number; exporter: { name: string } }[];
}

interface Participant {
  id: string;
  role: string;
  country: Country;
}

interface ConflictDetail {
  id: string;
  name: string;
  type: string;
  cause: string | null;
  startDate: string;
  endDate: string | null;
  participants: Participant[];
}

interface ConflictDossierProps {
  conflictId: string;
  onClose: () => void;
}

function fmtMoney(v: number | null | undefined) {
  if (v == null) return "N/A";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}

const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "World War":           { bg: "rgba(192,57,43,0.18)",  border: "rgba(192,57,43,0.45)",  text: "#f4a9a3" },
  "Global Proxy War":    { bg: "rgba(176,125,26,0.15)", border: "rgba(176,125,26,0.40)", text: "#f5d78a" },
  "Armed Conflict":      { bg: "rgba(192,57,43,0.15)",  border: "rgba(192,57,43,0.40)",  text: "#e87268" },
  "Civil War":           { bg: "rgba(192,57,43,0.12)",  border: "rgba(192,57,43,0.35)",  text: "#e87268" },
  "Territorial Dispute": { bg: "rgba(176,125,26,0.13)", border: "rgba(176,125,26,0.35)", text: "#e8b84b" },
  "Border Dispute":      { bg: "rgba(176,125,26,0.13)", border: "rgba(176,125,26,0.35)", text: "#e8b84b" },
  "Proxy War":           { bg: "rgba(37,99,168,0.14)",  border: "rgba(37,99,168,0.35)",  text: "#93c5e8" },
  "Insurgency":          { bg: "rgba(61,124,48,0.13)",  border: "rgba(61,124,48,0.35)",  text: "#a8d898" },
  "Invasion":            { bg: "rgba(192,57,43,0.18)",  border: "rgba(192,57,43,0.45)",  text: "#f4a9a3" },
};

function getTypeStyle(type: string) {
  return TYPE_COLORS[type] ?? { bg: "rgba(37,99,168,0.12)", border: "rgba(37,99,168,0.30)", text: "#60a5d8" };
}

export default function ConflictDossier({ conflictId, onClose }: ConflictDossierProps) {
  const [conflict, setConflict] = useState<ConflictDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/conflicts/${conflictId}`)
      .then(res => setConflict(res.data))
      .catch(err => console.error("Failed to load conflict details", err))
      .finally(() => setLoading(false));
  }, [conflictId]);

  const typeStyle = conflict ? getTypeStyle(conflict.type) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,6,26,0.80)", backdropFilter: "blur(16px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: "rgba(12,10,30,0.97)",
          border: "1px solid rgba(139,92,246,0.30)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.12)",
        }}
      >
        {/* Header accent strip — diplomatic crimson, not neon rainbow */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, rgba(192,57,43,0.80) 0%, rgba(37,99,168,0.60) 60%, transparent 100%)" }} />

        {/* ── Header ──────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.025)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.35)" }}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#e8edf4] tracking-tight">Conflict Intelligence Dossier</h2>
              <p className="text-[10px] text-[#566577] tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>GGICAS — Tactical Brief</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#566577] hover:text-[#e8edf4] hover:bg-white/[0.07] transition-all duration-150"
            aria-label="Close dossier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Content ──────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(37,99,168,0.12)", border: "1px solid rgba(37,99,168,0.28)" }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#60a5d8" }} />
              </div>
              <p className="text-sm" style={{ color: "#566577", fontFamily: "var(--font-mono)" }}>Retrieving intelligence…</p>
            </div>
          ) : !conflict ? (
            <div className="text-center py-20 text-[#5a6490] text-sm">
              Conflict intelligence classified or unavailable.
            </div>
          ) : (
            <>
              {/* Title + type badges */}
              <div className="flex flex-col gap-3">
                <h1 className="text-2xl font-black text-[#f0f0ff] leading-tight">{conflict.name}</h1>
                <div className="flex flex-wrap gap-2">
                  {typeStyle && (
                    <span
                      className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest"
                      style={{ background: typeStyle.bg, border: `1px solid ${typeStyle.border}`, color: typeStyle.text }}
                    >
                      {conflict.type}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-white/[0.05] border border-white/[0.08] text-[#a0a8d0]">
                    <Calendar className="w-3 h-3" />
                    Start: {new Date(conflict.startDate).toLocaleDateString()}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border ${
                      conflict.endDate
                        ? "bg-white/[0.05] border-white/[0.08] text-[#a0a8d0]"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    End: {conflict.endDate ? new Date(conflict.endDate).toLocaleDateString() : "ONGOING"}
                  </span>
                </div>
              </div>

              {/* Intelligence briefing */}
              {conflict.cause && (
                <div
                  className="rounded-lg p-4"
                  style={{ background: "rgba(37,99,168,0.07)", border: "1px solid rgba(37,99,168,0.18)" }}
                >
                  <p className="uppercase mb-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "#566577" }}>Intelligence Briefing</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#9baab8" }}>{conflict.cause}</p>
                </div>
              )}

              {/* Combatants */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Crosshair className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-bold text-[#f0f0ff] uppercase tracking-widest">
                    Identified Combatants ({conflict.participants.length})
                  </h3>
                </div>

                {conflict.participants.length === 0 ? (
                  <div
                    className="p-4 rounded-xl text-center text-sm text-[#5a6490]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    No recognized state combatants logged in database.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {conflict.participants.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-xl p-4 flex flex-col gap-2.5"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#f0f0ff]">{p.country.name}</span>
                          <div className="flex items-center gap-2">
                            {p.country.sanctionsIn && p.country.sanctionsIn.length > 0 && (
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-400" title={`Active Sanctions: ${p.country.sanctionsIn.length}`}>
                                <AlertTriangle className="w-3 h-3" />
                              </div>
                            )}
                            <span
                              className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                              style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(37,99,168,0.25)", color: "#93c5e8" }}
                            >
                              {p.country.isoCode}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#5a6490]">
                              <Flag className="w-3 h-3" />
                              <span className="text-[10px] uppercase tracking-wide">Role</span>
                            </div>
                            <span className="text-xs font-semibold text-amber-400">{p.role}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#5a6490]">
                              <DollarSign className="w-3 h-3" />
                              <span className="text-[10px] uppercase tracking-wide">Mil Budget</span>
                            </div>
                            <span className="text-xs font-mono text-emerald-400">{fmtMoney(p.country.militaryBudget)}</span>
                          </div>

                          {p.country.militaryBudget && p.country.gdpCurrentUsd && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#5a6490]">
                                <Percent className="w-3 h-3" />
                                <span className="text-[10px] uppercase tracking-wide">Mil Burden</span>
                              </div>
                              <span className="text-xs font-mono text-fuchsia-400">
                                {((p.country.militaryBudget / p.country.gdpCurrentUsd) * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>

                        {(p.country.alliancesA?.length > 0 || p.country.armsImports?.length > 0) && (
                          <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-col gap-2">
                            {p.country.alliancesA?.length > 0 && (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-[#5a6490] mb-0.5">
                                  <Shield className="w-3 h-3" />
                                  <span className="text-[9px] uppercase tracking-widest">Key Alliances</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {p.country.alliancesA.slice(0, 3).map(a => (
                                    <span key={a.id} className="text-[10px] bg-white/[0.05] border border-white/[0.1] px-1.5 py-0.5 rounded text-violet-300">
                                      {a.organization?.name || a.allianceType}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {p.country.armsImports?.length > 0 && (
                              <div className="flex flex-col gap-1 mt-1">
                                <div className="flex items-center gap-1.5 text-[#5a6490] mb-0.5">
                                  <Activity className="w-3 h-3" />
                                  <span className="text-[9px] uppercase tracking-widest">Arms Suppliers</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {p.country.armsImports.map(a => (
                                    <span key={a.id} className="text-[10px] bg-white/[0.05] border border-white/[0.1] px-1.5 py-0.5 rounded text-amber-300/80">
                                      {a.exporter?.name || 'Unknown'} ({a.year})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
