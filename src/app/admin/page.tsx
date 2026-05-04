"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Globe2, ShieldAlert, Handshake, Plus, Pencil, Trash2,
  X, Check, AlertTriangle, Loader2, Database,
  Ban, TrendingUp, Search
} from "lucide-react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Country {
  id: string; name: string; isoCode: string; region: string;
  gdpCurrentUsd: number | null; militaryBudget: number | null;
}
interface Conflict {
  id: string; name: string; type: string; cause: string | null;
  startDate: string; endDate: string | null;
  participants: Array<{ role: string; country: Country }>;
}
interface Alliance {
  id: string; allianceType: string; motivation: string | null;
  startDate: string; endDate: string | null;
  countryA: Country; countryB?: Country;
}
interface Sanction {
  id: string; sanctionType: string;
  startDate: string; endDate: string | null;
  imposingCountry: Country; targetCountry: Country;
}
interface Trade {
  id: string; year: number; tradeVolumeUsd: number | null;
  countryA: Country; countryB: Country;
}

type Tab = "countries" | "conflicts" | "alliances" | "sanctions" | "trade";
type ModalMode = "create" | "edit";

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).getFullYear().toString();
}
function fmtMoney(v: number | null) {
  if (v === null || v === undefined) return "—";
  return `$${(v / 1e9).toFixed(1)}B`;
}
function toInputDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

/* ─── Small UI primitives ────────────────────────────────────────────────── */
function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-700/60 text-slate-300",
    indigo: "bg-tactical-accent/10 text-tactical-accent border border-tactical-accent/30",
    emerald: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    rose: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    amber: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${colors[color] ?? colors.slate}`}>
      {children}
    </span>
  );
}

function Input({ label, id, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <input
        id={id}
        className="bg-tactical-panel border-tactical-primary/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-tactical-accent focus:ring-1 focus:ring-tactical-accent/50 transition-all"
        {...props}
      />
    </div>
  );
}

function Select({ label, id, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; id: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <select
        id={id}
        className="bg-tactical-panel border-tactical-primary/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-tactical-accent focus:ring-1 focus:ring-tactical-accent/50 transition-all"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

/* ─── DELETE CONFIRM DIALOG ──────────────────────────────────────────────── */
function DeleteDialog({ name, onConfirm, onCancel, loading }: {
  name: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-tactical-panel border border-rose-500/30 rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-white font-bold text-lg">Confirm Deletion</p>
            <p className="text-slate-400 text-sm">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm">
          Are you sure you want to delete <span className="font-semibold text-white">"{name}"</span>?
          All associated records will also be removed.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-tactical-panel border-tactical-primary/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── TOAST ──────────────────────────────────────────────────────────────── */
function Toast({ msg, type, onDone }: { msg: string; type: "success" | "error"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-slide-up
      ${type === "success" ? "bg-emerald-900/80 border-emerald-500/40 text-emerald-300" : "bg-rose-900/80 border-rose-500/40 text-rose-300"}`}>
      {type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COUNTRY MODAL
═══════════════════════════════════════════════════════════════════════════ */
function CountryModal({ mode, initial, onClose, onSaved }: {
  mode: ModalMode; initial?: Country; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    isoCode: initial?.isoCode ?? "",
    region: initial?.region ?? "",
    gdpCurrentUsd: initial?.gdpCurrentUsd?.toString() ?? "",
    militaryBudget: initial?.militaryBudget?.toString() ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setLoading(true); setError("");
    try {
      if (mode === "create") {
        await axios.post("/api/countries", form);
      } else {
        await axios.put(`/api/countries/${initial!.id}`, form);
      }
      onSaved(); onClose();
    } catch {
      setError("Save failed. Please check the fields and try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-tactical-panel border border-white/10 rounded-2xl shadow-2xl p-7 w-full max-w-lg mx-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tactical-accent/10 flex items-center justify-center">
              <Globe2 className="w-5 h-5 text-tactical-accent drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]" />
            </div>
            <h2 className="text-white font-bold text-lg">{mode === "create" ? "Add Country" : "Edit Country"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input id="c-name" label="Country Name *" value={form.name} onChange={set("name")} placeholder="e.g. Germany" /></div>
          <Input id="c-iso" label="ISO Code *" value={form.isoCode} onChange={set("isoCode")} placeholder="e.g. DEU" maxLength={3} />
          <Select id="c-region" label="Region *" value={form.region} onChange={set("region")}>
            <option value="">Select region…</option>
            {["Europe","North America","South America","Asia","Middle East","Africa","Oceania","Central Asia"].map(r =>
              <option key={r} value={r}>{r}</option>)}
          </Select>
          <Input id="c-gdp" label="GDP (USD)" value={form.gdpCurrentUsd} onChange={set("gdpCurrentUsd")} placeholder="e.g. 4000000000000" type="number" />
          <Input id="c-mil" label="Military Budget (USD)" value={form.militaryBudget} onChange={set("militaryBudget")} placeholder="e.g. 50000000000" type="number" />
        </div>

        {error && <p className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-tactical-panel border-tactical-primary/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={submit} disabled={loading} className="px-5 py-2 rounded-lg bg-tactical-primary text-slate-100 border border-tactical-accent/30 hover:border-tactical-accent shadow-[0_0_10px_rgba(0,255,65,0.1)] hover:bg-tactical-primary/80 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFLICT MODAL
═══════════════════════════════════════════════════════════════════════════ */
function ConflictModal({ mode, initial, onClose, onSaved }: {
  mode: ModalMode; initial?: Conflict; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    type: initial?.type ?? "",
    cause: initial?.cause ?? "",
    startDate: toInputDate(initial?.startDate ?? null),
    endDate: toInputDate(initial?.endDate ?? null),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setLoading(true); setError("");
    try {
      if (mode === "create") {
        await axios.post("/api/conflicts", form);
      } else {
        await axios.put(`/api/conflicts/${initial!.id}`, form);
      }
      onSaved(); onClose();
    } catch {
      setError("Save failed. Please check the fields and try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-tactical-panel border border-white/10 rounded-2xl shadow-2xl p-7 w-full max-w-lg mx-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-white font-bold text-lg">{mode === "create" ? "Add Conflict" : "Edit Conflict"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Input id="cf-name" label="Conflict Name *" value={form.name} onChange={set("name")} placeholder="e.g. Falklands War" /></div>
          <Select id="cf-type" label="Type *" value={form.type} onChange={set("type")}>
            <option value="">Select type…</option>
            {["Civil War","Invasion","Proxy War","Border Dispute","Insurgency","Coup","Revolution","Other"].map(t =>
              <option key={t} value={t}>{t}</option>)}
          </Select>
          <div className="col-span-2">
            <label htmlFor="cf-cause" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Cause / Description</label>
            <textarea
              id="cf-cause"
              rows={3}
              value={form.cause}
              onChange={set("cause")}
              placeholder="Brief description of causes…"
              className="w-full bg-tactical-panel border-tactical-primary/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-tactical-accent focus:ring-1 focus:ring-tactical-accent/50 transition-all resize-none"
            />
          </div>
          <Input id="cf-start" label="Start Date *" value={form.startDate} onChange={set("startDate")} type="date" />
          <Input id="cf-end" label="End Date (if resolved)" value={form.endDate} onChange={set("endDate")} type="date" />
        </div>

        {error && <p className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-tactical-panel border-tactical-primary/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={submit} disabled={loading} className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ALLIANCE MODAL
═══════════════════════════════════════════════════════════════════════════ */
function AllianceModal({ mode, initial, countries, onClose, onSaved }: {
  mode: ModalMode; initial?: Alliance; countries: Country[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    countryAId: initial?.countryA?.id ?? "",
    countryBId: initial?.countryB?.id ?? "",
    allianceType: initial?.allianceType ?? "",
    motivation: initial?.motivation ?? "",
    startDate: toInputDate(initial?.startDate ?? null),
    endDate: toInputDate(initial?.endDate ?? null),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setLoading(true); setError("");
    try {
      if (mode === "create") {
        await axios.post("/api/alliances", form);
      } else {
        await axios.put(`/api/alliances/${initial!.id}`, form);
      }
      onSaved(); onClose();
    } catch {
      setError("Save failed. Please check the fields and try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-tactical-panel border border-white/10 rounded-2xl shadow-2xl p-7 w-full max-w-lg mx-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Handshake className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-white font-bold text-lg">{mode === "create" ? "Add Alliance" : "Edit Alliance"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select id="al-cA" label="Country A *" value={form.countryAId} onChange={set("countryAId")} disabled={mode === "edit"}>
            <option value="">Select country…</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select id="al-cB" label="Country B" value={form.countryBId} onChange={set("countryBId")} disabled={mode === "edit"}>
            <option value="">None / Organization</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select id="al-type" label="Alliance Type *" value={form.allianceType} onChange={set("allianceType")}>
            <option value="">Select type…</option>
            {["Defense Pact","Economic Treaty","Non-Aggression Pact","Military Alliance","Trade Agreement","Diplomatic Recognition"].map(t =>
              <option key={t} value={t}>{t}</option>)}
          </Select>
          <div className="col-span-2">
            <label htmlFor="al-mot" className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Motivation</label>
            <textarea
              id="al-mot"
              rows={2}
              value={form.motivation}
              onChange={set("motivation")}
              placeholder="Reason / context for this alliance…"
              className="w-full bg-tactical-panel border-tactical-primary/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-tactical-accent focus:ring-1 focus:ring-tactical-accent/50 transition-all resize-none"
            />
          </div>
          <Input id="al-start" label="Start Date *" value={form.startDate} onChange={set("startDate")} type="date" />
          <Input id="al-end" label="End Date (if dissolved)" value={form.endDate} onChange={set("endDate")} type="date" />
        </div>

        {error && <p className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg">{error}</p>}

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-tactical-panel border-tactical-primary/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={submit} disabled={loading} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SANCTION MODAL
═══════════════════════════════════════════════════════════════════════════ */
function SanctionModal({ mode, initial, countries, onClose, onSaved }: {
  mode: ModalMode; initial?: Sanction; countries: Country[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    imposingCountryId: initial?.imposingCountry?.id ?? "",
    targetCountryId: initial?.targetCountry?.id ?? "",
    sanctionType: initial?.sanctionType ?? "",
    startDate: toInputDate(initial?.startDate ?? null),
    endDate: toInputDate(initial?.endDate ?? null),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setLoading(true); setError("");
    try {
      if (mode === "create") await axios.post("/api/sanctions", form);
      else await axios.put(`/api/sanctions/${initial!.id}`, form);
      onSaved(); onClose();
    } catch { setError("Save failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-tactical-panel border border-white/10 rounded-2xl shadow-2xl p-7 w-full max-w-lg mx-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center"><Ban className="w-5 h-5 text-amber-400" /></div>
            <h2 className="text-white font-bold text-lg">{mode === "create" ? "Add Sanction" : "Edit Sanction"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select id="s-imp" label="Imposing Country *" value={form.imposingCountryId} onChange={set("imposingCountryId")} disabled={mode === "edit"}>
            <option value="">Select…</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select id="s-tgt" label="Target Country *" value={form.targetCountryId} onChange={set("targetCountryId")} disabled={mode === "edit"}>
            <option value="">Select…</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select id="s-type" label="Type *" value={form.sanctionType} onChange={set("sanctionType")}>
            <option value="">Select…</option>
            {["Economic","Arms Embargo","Diplomatic","Travel Ban","Financial","Trade Restriction"].map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <div />
          <Input id="s-start" label="Start Date *" value={form.startDate} onChange={set("startDate")} type="date" />
          <Input id="s-end" label="End Date" value={form.endDate} onChange={set("endDate")} type="date" />
        </div>
        {error && <p className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg">{error}</p>}
        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-tactical-panel border-tactical-primary/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={submit} disabled={loading} className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRADE MODAL
═══════════════════════════════════════════════════════════════════════════ */
function TradeModal({ mode, initial, countries, onClose, onSaved }: {
  mode: ModalMode; initial?: Trade; countries: Country[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    countryAId: initial?.countryA?.id ?? "",
    countryBId: initial?.countryB?.id ?? "",
    year: initial?.year?.toString() ?? "2023",
    tradeVolumeUsd: initial?.tradeVolumeUsd?.toString() ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setLoading(true); setError("");
    try {
      if (mode === "create") await axios.post("/api/trade", form);
      else await axios.put(`/api/trade/${initial!.id}`, form);
      onSaved(); onClose();
    } catch { setError("Save failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-tactical-panel border border-white/10 rounded-2xl shadow-2xl p-7 w-full max-w-lg mx-4 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-cyan-400" /></div>
            <h2 className="text-white font-bold text-lg">{mode === "create" ? "Add Trade Relation" : "Edit Trade Relation"}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select id="t-cA" label="Country A *" value={form.countryAId} onChange={set("countryAId")} disabled={mode === "edit"}>
            <option value="">Select…</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select id="t-cB" label="Country B *" value={form.countryBId} onChange={set("countryBId")} disabled={mode === "edit"}>
            <option value="">Select…</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input id="t-year" label="Year *" value={form.year} onChange={set("year")} type="number" placeholder="e.g. 2023" />
          <Input id="t-vol" label="Volume (USD)" value={form.tradeVolumeUsd} onChange={set("tradeVolumeUsd")} type="number" placeholder="e.g. 500000000000" />
        </div>
        {error && <p className="text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg">{error}</p>}
        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-tactical-panel border-tactical-primary/50 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors">Cancel</button>
          <button onClick={submit} disabled={loading} className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {mode === "create" ? "Create" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN ADMIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("countries");
  const [filterQ, setFilterQ] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [countryModal, setCountryModal] = useState<{ mode: ModalMode; data?: Country } | null>(null);
  const [conflictModal, setConflictModal] = useState<{ mode: ModalMode; data?: Conflict } | null>(null);
  const [allianceModal, setAllianceModal] = useState<{ mode: ModalMode; data?: Alliance } | null>(null);
  const [sanctionModal, setSanctionModal] = useState<{ mode: ModalMode; data?: Sanction } | null>(null);
  const [tradeModal, setTradeModal] = useState<{ mode: ModalMode; data?: Trade } | null>(null);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; type: Tab } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
  }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [c, cf, al, sn, tr] = await Promise.all([
        axios.get("/api/countries"),
        axios.get("/api/conflicts"),
        axios.get("/api/alliances"),
        axios.get("/api/sanctions"),
        axios.get("/api/trade"),
      ]);
      setCountries(c.data.data ?? c.data);
      setConflicts(cf.data.data ?? cf.data);
      setAlliances(al.data.data ?? al.data);
      setSanctions(sn.data);
      setTrades(tr.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/${deleteTarget.type}/${deleteTarget.id}`);
      showToast(`"${deleteTarget.name}" deleted successfully.`);
      fetchAll();
    } catch {
      showToast("Deletion failed. The record may have dependent data.", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "countries", label: "Countries", icon: <Globe2 className="w-4 h-4" />, color: "indigo" },
    { key: "conflicts", label: "Conflicts", icon: <ShieldAlert className="w-4 h-4" />, color: "rose" },
    { key: "alliances", label: "Alliances", icon: <Handshake className="w-4 h-4" />, color: "emerald" },
    { key: "sanctions", label: "Sanctions", icon: <Ban className="w-4 h-4" />, color: "amber" },
    { key: "trade", label: "Trade", icon: <TrendingUp className="w-4 h-4" />, color: "cyan" },
  ];

  const tabColorMap: Record<string, string> = {
    indigo: "bg-tactical-primary text-slate-100 border border-tactical-accent/30 hover:border-tactical-accent shadow-[0_0_10px_rgba(0,255,65,0.1)] text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]",
    rose: "bg-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]",
    emerald: "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]",
    amber: "bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    cyan: "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]",
  };

  const addBtnMap: Record<string, string> = {
    countries: "bg-tactical-primary text-slate-100 border border-tactical-accent/30 hover:border-tactical-accent shadow-[0_0_10px_rgba(0,255,65,0.1)] hover:bg-tactical-primary/80 shadow-[0_0_15px_rgba(99,102,241,0.3)]",
    conflicts: "bg-rose-600 hover:bg-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    alliances: "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    sanctions: "bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    trade: "bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  };

  const tabCounts: Record<Tab, number> = {
    countries: countries.length, conflicts: conflicts.length, alliances: alliances.length,
    sanctions: sanctions.length, trade: trades.length,
  };

  const currentTab = tabs.find(t => t.key === tab)!;

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">

      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-700/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-purple-700/8 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex flex-col gap-5">

        <div className="flex justify-end gap-3 mb-2">
          <button 
            onClick={async () => {
              showToast("Triggering ACLED sync pipeline...", "success");
              try {
                const res = await axios.post('/api/sync/acled');
                showToast(res.data.message || "Sync complete", "success");
                fetchAll(); // Refresh data
              } catch (e: any) {
                showToast(e.response?.data?.error || "Sync failed", "error");
              }
            }} 
            className="px-4 py-2 bg-tactical-primary text-slate-100 border border-tactical-accent/30 hover:border-tactical-accent shadow-[0_0_10px_rgba(0,255,65,0.1)] hover:bg-tactical-primary/80 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Globe2 className="w-4 h-4" /> Sync Real-World Data (ACLED)
          </button>
        </div>

        {/* Page title row */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Database Manager</h1>
            <p className="text-[10px] text-[#00ff41] font-mono tracking-widest uppercase">GGICAS Admin</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2 text-xs text-slate-500">
            {[`${countries.length} nations`,`${conflicts.length} conflicts`,`${alliances.length} alliances`,`${sanctions.length} sanctions`,`${trades.length} trades`].map(s=><span key={s} className="px-2.5 py-1 bg-white/5 rounded-full border border-white/8">{s}</span>)}
          </div>
        </div>

        {/* ── Tabs + Add + Search row ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5 p-1 bg-white/[0.04] rounded-xl border border-white/[0.07]">
            {tabs.map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setFilterQ(""); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? tabColorMap[t.color] : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                {t.icon} {t.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded text-xs font-mono ${tab === t.key ? "bg-white/20" : "bg-white/10 text-slate-500"}`}>{tabCounts[t.key]}</span>
              </button>
            ))}
          </div>

          {/* Filter search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input value={filterQ} onChange={e => setFilterQ(e.target.value)}
              placeholder={`Filter ${currentTab.label.toLowerCase()}…`}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 transition-colors"
              id="admin-filter-input" />
          </div>

          <button onClick={() => {
              if (tab==="countries") setCountryModal({mode:"create"});
              else if (tab==="conflicts") setConflictModal({mode:"create"});
              else if (tab==="alliances") setAllianceModal({mode:"create"});
              else if (tab==="sanctions") setSanctionModal({mode:"create"});
              else setTradeModal({mode:"create"});
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all ml-auto ${addBtnMap[tab]}`}>
            <Plus className="w-4 h-4" /> Add {currentTab.label.slice(0,-1)}
          </button>
        </div>

        {/* ── Loading ─────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading data…
          </div>
        )}

        {/* ═══════════ COUNTRIES TABLE ═══════════ */}
        {!loading && tab === "countries" && (
          <div className="bg-[#0d1117]/70 backdrop-blur border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-tactical-accent drop-shadow-[0_0_5px_rgba(0,255,65,0.5)]" />
              <h2 className="text-sm font-semibold text-white">Countries Registry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-semibold">Country</th>
                    <th className="text-left px-5 py-3 font-semibold">ISO</th>
                    <th className="text-left px-5 py-3 font-semibold">Region</th>
                    <th className="text-left px-5 py-3 font-semibold">GDP</th>
                    <th className="text-left px-5 py-3 font-semibold">Mil. Budget</th>
                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.filter(c => !filterQ || c.name.toLowerCase().includes(filterQ.toLowerCase()) || c.isoCode.toLowerCase().includes(filterQ.toLowerCase())).map((c, i) => (
                    <tr key={c.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-5 py-3.5 font-semibold text-white">{c.name}</td>
                      <td className="px-5 py-3.5"><Badge color="indigo">{c.isoCode}</Badge></td>
                      <td className="px-5 py-3.5 text-slate-300">{c.region}</td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{fmtMoney(c.gdpCurrentUsd)}</td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{fmtMoney(c.militaryBudget)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setCountryModal({ mode: "edit", data: c })}
                            className="p-2 rounded-lg bg-indigo-500/10 hover:bg-tactical-primary/80/20 text-tactical-accent drop-shadow-[0_0_5px_rgba(0,255,65,0.5)] hover:text-tactical-accent transition-colors"
                            title="Edit"
                          ><Pencil className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={() => setDeleteTarget({ id: c.id, name: c.name, type: "countries" })}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Delete"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {countries.filter(c => !filterQ || c.name.toLowerCase().includes(filterQ.toLowerCase())).length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-600 italic">No countries found. Add one to get started.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ CONFLICTS TABLE ═══════════ */}
        {!loading && tab === "conflicts" && (
          <div className="bg-tactical-panel/60 backdrop-blur border border-white/8 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h2 className="text-sm font-semibold text-white">Conflict Registry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-semibold">Conflict Name</th>
                    <th className="text-left px-5 py-3 font-semibold">Type</th>
                    <th className="text-left px-5 py-3 font-semibold">Period</th>
                    <th className="text-left px-5 py-3 font-semibold">Participants</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {conflicts.map((c, i) => (
                    <tr key={c.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-white">{c.name}</div>
                        {c.cause && <div className="text-slate-500 text-xs mt-0.5 max-w-xs truncate">{c.cause}</div>}
                      </td>
                      <td className="px-5 py-3.5"><Badge color="rose">{c.type}</Badge></td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{fmt(c.startDate)} – {c.endDate ? fmt(c.endDate) : "Ongoing"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {c.participants.slice(0, 3).map((p, pi) => (
                            <Badge key={pi} color="slate">{p.country.name}</Badge>
                          ))}
                          {c.participants.length > 3 && <Badge>+{c.participants.length - 3}</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.endDate
                          ? <Badge color="slate">Resolved</Badge>
                          : <Badge color="rose">Active</Badge>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setConflictModal({ mode: "edit", data: c })}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Edit"
                          ><Pencil className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={() => setDeleteTarget({ id: c.id, name: c.name, type: "conflicts" })}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Delete"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {conflicts.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-600 italic">No conflicts on record.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ ALLIANCES TABLE ═══════════ */}
        {!loading && tab === "alliances" && (
          <div className="bg-tactical-panel/60 backdrop-blur border border-white/8 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center gap-2">
              <Handshake className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white">Alliance Registry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-semibold">Type</th>
                    <th className="text-left px-5 py-3 font-semibold">Country A</th>
                    <th className="text-left px-5 py-3 font-semibold">Country B</th>
                    <th className="text-left px-5 py-3 font-semibold">Period</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alliances.map((a, i) => (
                    <tr key={a.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-5 py-3.5"><Badge color="emerald">{a.allianceType}</Badge></td>
                      <td className="px-5 py-3.5 font-semibold text-white">{a.countryA?.name ?? "—"}</td>
                      <td className="px-5 py-3.5 text-slate-300">{a.countryB?.name ?? <span className="text-slate-600 italic">Org. / None</span>}</td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{fmt(a.startDate)} – {a.endDate ? fmt(a.endDate) : "Ongoing"}</td>
                      <td className="px-5 py-3.5">
                        {a.endDate
                          ? <Badge color="slate">Dissolved</Badge>
                          : <Badge color="emerald">Active</Badge>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setAllianceModal({ mode: "edit", data: a })}
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="Edit"
                          ><Pencil className="w-3.5 h-3.5" /></button>
                          <button
                            onClick={() => setDeleteTarget({ id: a.id, name: `${a.countryA?.name} ↔ ${a.countryB?.name ?? "Org"}`, type: "alliances" })}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Delete"
                          ><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {alliances.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-600 italic">No alliances on record.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ SANCTIONS TABLE ═══════════ */}
        {!loading && tab === "sanctions" && (
          <div className="bg-tactical-panel/60 backdrop-blur border border-white/8 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center gap-2">
              <Ban className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Sanctions Registry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-semibold">Imposing Country</th>
                    <th className="text-left px-5 py-3 font-semibold">Target Country</th>
                    <th className="text-left px-5 py-3 font-semibold">Type</th>
                    <th className="text-left px-5 py-3 font-semibold">Period</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sanctions.map((s, i) => (
                    <tr key={s.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-5 py-3.5 font-semibold text-white">{s.imposingCountry?.name ?? "—"}</td>
                      <td className="px-5 py-3.5 text-slate-300">{s.targetCountry?.name ?? "—"}</td>
                      <td className="px-5 py-3.5"><Badge color="amber">{s.sanctionType}</Badge></td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{fmt(s.startDate)} – {s.endDate ? fmt(s.endDate) : "Ongoing"}</td>
                      <td className="px-5 py-3.5">{s.endDate ? <Badge color="slate">Lifted</Badge> : <Badge color="amber">Active</Badge>}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setSanctionModal({ mode: "edit", data: s })} className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget({ id: s.id, name: `${s.imposingCountry?.name} → ${s.targetCountry?.name}`, type: "sanctions" })} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sanctions.length === 0 && (<tr><td colSpan={6} className="px-5 py-12 text-center text-slate-600 italic">No sanctions on record.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════ TRADE TABLE ═══════════ */}
        {!loading && tab === "trade" && (
          <div className="bg-tactical-panel/60 backdrop-blur border border-white/8 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Trade Relations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-semibold">Country A</th>
                    <th className="text-left px-5 py-3 font-semibold">Country B</th>
                    <th className="text-left px-5 py-3 font-semibold">Year</th>
                    <th className="text-left px-5 py-3 font-semibold">Volume</th>
                    <th className="text-right px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t, i) => (
                    <tr key={t.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                      <td className="px-5 py-3.5 font-semibold text-white">{t.countryA?.name ?? "—"}</td>
                      <td className="px-5 py-3.5 text-slate-300">{t.countryB?.name ?? "—"}</td>
                      <td className="px-5 py-3.5"><Badge color="cyan">{t.year}</Badge></td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">{fmtMoney(t.tradeVolumeUsd)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setTradeModal({ mode: "edit", data: t })} className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteTarget({ id: t.id, name: `${t.countryA?.name} ↔ ${t.countryB?.name}`, type: "trade" })} className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {trades.length === 0 && (<tr><td colSpan={5} className="px-5 py-12 text-center text-slate-600 italic">No trade relations on record.</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────── */}
      {countryModal && (
        <CountryModal
          mode={countryModal.mode}
          initial={countryModal.data}
          onClose={() => setCountryModal(null)}
          onSaved={() => { fetchAll(); showToast(`Country ${countryModal.mode === "create" ? "created" : "updated"} successfully!`); }}
        />
      )}
      {conflictModal && (
        <ConflictModal
          mode={conflictModal.mode}
          initial={conflictModal.data}
          onClose={() => setConflictModal(null)}
          onSaved={() => { fetchAll(); showToast(`Conflict ${conflictModal.mode === "create" ? "created" : "updated"} successfully!`); }}
        />
      )}
      {allianceModal && (
        <AllianceModal
          mode={allianceModal.mode}
          initial={allianceModal.data}
          countries={countries}
          onClose={() => setAllianceModal(null)}
          onSaved={() => { fetchAll(); showToast(`Alliance ${allianceModal.mode === "create" ? "created" : "updated"} successfully!`); }}
        />
      )}

      {sanctionModal && (
        <SanctionModal
          mode={sanctionModal.mode}
          initial={sanctionModal.data}
          countries={countries}
          onClose={() => setSanctionModal(null)}
          onSaved={() => { fetchAll(); showToast(`Sanction ${sanctionModal.mode === "create" ? "created" : "updated"} successfully!`); }}
        />
      )}
      {tradeModal && (
        <TradeModal
          mode={tradeModal.mode}
          initial={tradeModal.data}
          countries={countries}
          onClose={() => setTradeModal(null)}
          onSaved={() => { fetchAll(); showToast(`Trade relation ${tradeModal.mode === "create" ? "created" : "updated"} successfully!`); }}
        />
      )}

      {/* ── Delete Dialog ───────────────────────────────── */}
      {deleteTarget && (
        <DeleteDialog
          name={deleteTarget.name}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ───────────────────────────────────────── */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <style jsx global>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        tbody tr:hover { background: rgba(255,255,255,0.02); }
      `}</style>
    </div>
  );
}
