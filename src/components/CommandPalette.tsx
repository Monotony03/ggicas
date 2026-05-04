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
          style={{ background: "rgba(5,6,26,0.75)", backdropFilter: "blur(12px)" }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, scale: 0.94, y: -16 }}
            animate={{ opacity: 1, scale: 1,    y: 0    }}
            exit={{   opacity: 0, scale: 0.94,  y: -16  }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="w-full max-w-xl overflow-hidden"
            style={{
              background: "rgba(12,10,30,0.95)",
              border: "1px solid rgba(139,92,246,0.30)",
              borderRadius: "1.25rem",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.12) inset, 0 1px 0 rgba(255,255,255,0.06) inset",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top gradient strip */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

            {/* Input row */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(217,70,239,0.25))", border: "1px solid rgba(139,92,246,0.3)" }}>
                <Search className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder={dataReady ? "Search nations, conflicts…" : "Loading intelligence data…"}
                disabled={!dataReady}
                className="flex-1 bg-transparent text-[#f0f0ff] placeholder-[#5a6490] text-sm outline-none"
                style={{ fontFamily: "inherit" }}
                id="command-palette-input"
              />
              {!dataReady && <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin shrink-0" />}
              {query && (
                <button onClick={() => setQuery("")} className="text-[#5a6490] hover:text-[#a0a8d0] transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 bg-violet-500/15 border border-violet-500/25 rounded text-[10px] text-violet-400 font-mono shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results list */}
            {results.length > 0 && (
              <div className="py-2 max-h-72 overflow-y-auto">
                {/* Section labels */}
                {results.some(r => r.kind === "country") && (
                  <p className="px-4 py-1 text-[10px] font-mono tracking-widest text-[#5a6490] uppercase">Nations</p>
                )}
                {results.map((r, i) => {
                  /* Insert "Conflicts" heading before first conflict result */
                  const prevIsCountry = i > 0 && results[i - 1].kind === "country";
                  const isFirstConflict = r.kind === "conflict" && (i === 0 || prevIsCountry);
                  return (
                    <div key={`${r.kind}-${r.item.id}`}>
                      {isFirstConflict && (
                        <p className="px-4 pt-2 pb-1 text-[10px] font-mono tracking-widest text-[#5a6490] uppercase border-t border-white/[0.04]">
                          Conflicts
                        </p>
                      )}
                      <button
                        onClick={() => pick(r)}
                        onMouseEnter={() => setSelected(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                          i === selected ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150"
                          style={
                            r.kind === "country"
                              ? { background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }
                              : { background: "rgba(244,63,94,0.2)",  border: "1px solid rgba(244,63,94,0.3)"  }
                          }
                        >
                          {r.kind === "country"
                            ? <Globe2 className="w-4 h-4 text-violet-400" />
                            : <Swords className="w-4 h-4 text-rose-400"   />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#f0f0ff] truncate">{r.item.name}</p>
                          <p className="text-xs text-[#5a6490]">
                            {r.kind === "country"
                              ? `${(r.item as Country).isoCode} · ${(r.item as Country).region}`
                              : `Conflict · ${(r.item as Conflict).type}`}
                          </p>
                        </div>
                        {i === selected && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-violet-400 shrink-0">
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
                <p className="text-[#5a6490] text-sm">
                  No results for{" "}
                  <span className="text-violet-300 font-medium">"{query}"</span>
                </p>
                <p className="text-[10px] text-[#3a4060] mt-1">Try a country name, ISO code, or conflict type</p>
              </div>
            )}

            {/* Footer hints */}
            <div className="px-4 py-2.5 flex items-center justify-between border-t border-white/[0.05]">
              <span className="text-[10px] text-[#3a4060] font-mono">
                ↑↓ navigate · Enter select · Esc close
              </span>
              <span className="text-[10px] text-[#3a4060] font-mono">
                {allCountries.length} nations · {allConflicts.length} conflicts
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
