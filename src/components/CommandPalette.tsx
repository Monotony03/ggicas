"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe2, Swords, X, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Country  { id: string; name: string; isoCode: string; region: string; }
interface Conflict { id: string; name: string; type: string; }

type Result =
  | { kind: "country";  item: Country  }
  | { kind: "conflict"; item: Conflict };

export default function CommandPalette() {
  const [open, setOpen]           = useState(false);
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<Result[]>([]);
  const [selected, setSelected]   = useState(0);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [allConflicts, setAllConflicts] = useState<Conflict[]>([]);
  const [dataReady, setDataReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router   = useRouter();

  /* Preload data once */
  useEffect(() => {
    Promise.all([
      fetch("/api/countries").then(r => r.json()),
      fetch("/api/conflicts").then(r => r.json()),
    ]).then(([c, cf]) => {
      setAllCountries((c.data  ?? c)  as Country[]);
      setAllConflicts((cf.data ?? cf) as Conflict[]);
      setDataReady(true);
    }).catch(() => {});
  }, []);

  /* Open/close listeners */
  useEffect(() => {
    const toggle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(o => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    const openEv = () => setOpen(true);
    window.addEventListener("keydown", toggle);
    window.addEventListener("open-command-palette", openEv);
    return () => {
      window.removeEventListener("keydown", toggle);
      window.removeEventListener("open-command-palette", openEv);
    };
  }, []);

  /* Focus input when opened */
  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 60); setQuery(""); setSelected(0); }
  }, [open]);

  /* Filter results */
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const q = query.toLowerCase();
    const countries: Result[] = allCountries
      .filter(c => c.name.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q))
      .slice(0, 5)
      .map(item => ({ kind: "country", item }));
    const conflicts: Result[] = allConflicts
      .filter(c => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
      .slice(0, 4)
      .map(item => ({ kind: "conflict", item }));
    setResults([...countries, ...conflicts]);
    setSelected(0);
  }, [query, allCountries, allConflicts]);

  /* Keyboard navigation */
  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && results[selected]) pick(results[selected]);
  }, [results, selected]);

  const pick = (r: Result) => {
    setOpen(false);
    if (r.kind === "country")  router.push(`/globe?country=${r.item.id}`);
    if (r.kind === "conflict") router.push(`/globe?conflict=${r.item.id}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cp-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[14vh] px-4"
          style={{ background: "rgba(10,14,24,0.80)", backdropFilter: "blur(10px)" }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1,    y: 0    }}
            exit={{   opacity: 0, scale: 0.96,  y: -12  }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            className="w-full max-w-xl overflow-hidden"
            style={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "0.75rem",
              boxShadow: "0 24px 64px rgba(0,0,0,0.60), 0 0 0 1px rgba(37,99,168,0.10) inset, 0 1px 0 rgba(255,255,255,0.05) inset",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top accent strip — Prussian blue, not rainbow */}
            <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(37,99,168,0.70) 40%, rgba(37,99,168,0.70) 60%, transparent)" }} />

            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.07]">
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "rgba(37,99,168,0.15)", border: "1px solid rgba(37,99,168,0.28)" }}>
                <Search className="w-3.5 h-3.5" style={{ color: "#60a5d8" }} />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder={dataReady ? "Search nations, conflicts, ISO codes…" : "Loading intelligence data…"}
                disabled={!dataReady}
                className="flex-1 bg-transparent text-[#e8edf4] placeholder-[#566577] text-sm outline-none"
                style={{ fontFamily: "var(--font-sans)" }}
                id="command-palette-input"
              />
              {!dataReady && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: "#60a5d8" }} />}
              {query && (
                <button onClick={() => setQuery("")} className="text-[#566577] hover:text-[#9baab8] transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd
                className="px-1.5 py-0.5 rounded text-[10px] shrink-0"
                style={{
                  fontFamily: "var(--font-mono)",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "#566577",
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results list */}
            {results.length > 0 && (
              <div className="py-2 max-h-72 overflow-y-auto">
                {results.some(r => r.kind === "country") && (
                  <p className="px-4 py-1 text-[10px] tracking-widest text-[#566577] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Nations
                  </p>
                )}
                {results.map((r, i) => {
                  const prevIsCountry = i > 0 && results[i - 1].kind === "country";
                  const isFirstConflict = r.kind === "conflict" && (i === 0 || prevIsCountry);
                  return (
                    <div key={`${r.kind}-${r.item.id}`}>
                      {isFirstConflict && (
                        <p className="px-4 pt-2 pb-1 text-[10px] tracking-widest text-[#566577] uppercase border-t border-white/[0.05]" style={{ fontFamily: "var(--font-mono)" }}>
                          Conflicts
                        </p>
                      )}
                      <button
                        onClick={() => pick(r)}
                        onMouseEnter={() => setSelected(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                          i === selected ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                          style={
                            r.kind === "country"
                              ? { background: "rgba(37,99,168,0.18)",  border: "1px solid rgba(37,99,168,0.30)" }
                              : { background: "rgba(192,57,43,0.18)", border: "1px solid rgba(192,57,43,0.30)" }
                          }
                        >
                          {r.kind === "country"
                            ? <Globe2 className="w-3.5 h-3.5" style={{ color: "#60a5d8" }} />
                            : <Swords className="w-3.5 h-3.5" style={{ color: "#e87268" }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#e8edf4] truncate">{r.item.name}</p>
                          <p className="text-xs text-[#566577]" style={{ fontFamily: "var(--font-mono)" }}>
                            {r.kind === "country"
                              ? `${(r.item as Country).isoCode} · ${(r.item as Country).region}`
                              : `Conflict · ${(r.item as Conflict).type}`}
                          </p>
                        </div>
                        {i === selected && (
                          <div className="flex items-center gap-1 text-[11px] font-medium shrink-0" style={{ color: "#60a5d8" }}>
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {query && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: "#566577" }}>
                  No results for{" "}
                  <span className="font-medium" style={{ color: "#9baab8" }}>&ldquo;{query}&rdquo;</span>
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#38485a", fontFamily: "var(--font-mono)" }}>
                  Try a country name, ISO code, or conflict type
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/[0.05]">
              <span className="text-[10px] text-[#38485a]" style={{ fontFamily: "var(--font-mono)" }}>
                ↑↓ navigate · Enter select · Esc close
              </span>
              <span className="text-[10px] text-[#38485a]" style={{ fontFamily: "var(--font-mono)" }}>
                {allCountries.length} nations · {allConflicts.length} conflicts
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
