import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Crosshair, Loader2, Calendar, Flag, DollarSign } from "lucide-react";

interface Country {
  id: string;
  name: string;
  isoCode: string;
  militaryBudget: number | null;
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
  "Armed Conflict":       { bg: "rgba(244,63,94,0.15)",   border: "rgba(244,63,94,0.4)",   text: "#fb7185" },
  "Civil War":            { bg: "rgba(251,146,60,0.15)",  border: "rgba(251,146,60,0.4)",  text: "#fb923c" },
  "Territorial Dispute":  { bg: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.4)",  text: "#fbbf24" },
  "Proxy War":            { bg: "rgba(217,70,239,0.15)",  border: "rgba(217,70,239,0.4)",  text: "#e879f9" },
  "Insurgency":           { bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.4)",  text: "#a78bfa" },
};

function getTypeStyle(type: string) {
  return TYPE_COLORS[type] ?? { bg: "rgba(100,116,139,0.15)", border: "rgba(100,116,139,0.4)", text: "#94a3b8" };
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
        {/* Top gradient strip */}
        <div className="h-px w-full bg-gradient-to-r from-violet-500/80 via-fuchsia-500/80 to-rose-500/80" />

        {/* ── Header ──────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.06)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(244,63,94,0.3), rgba(217,70,239,0.3))", border: "1px solid rgba(244,63,94,0.4)" }}
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#f0f0ff] tracking-tight">Conflict Intelligence Dossier</h2>
              <p className="text-[10px] text-violet-400/70 font-mono tracking-widest uppercase">GGICAS — Tactical Brief</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5a6490] hover:text-[#f0f0ff] hover:bg-white/[0.08] transition-all duration-150"
            aria-label="Close dossier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Content ──────────────────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              </div>
              <p className="text-sm text-[#5a6490] font-mono">Retrieving intelligence…</p>
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
                  className="rounded-xl p-4"
                  style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.18)" }}
                >
                  <p className="text-[10px] font-mono tracking-widest text-violet-400/70 uppercase mb-2">Intelligence Briefing</p>
                  <p className="text-sm text-[#a0a8d0] leading-relaxed">{conflict.cause}</p>
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
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}
                          >
                            {p.country.isoCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flag className="w-3 h-3 text-[#5a6490]" />
                          <span className="text-[10px] text-[#5a6490] uppercase tracking-wide">Role:</span>
                          <span className="text-xs font-semibold text-amber-400">{p.role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-[#5a6490]" />
                          <span className="text-[10px] text-[#5a6490] uppercase tracking-wide">Mil Budget:</span>
                          <span className="text-xs font-mono text-emerald-400">{fmtMoney(p.country.militaryBudget)}</span>
                        </div>
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
