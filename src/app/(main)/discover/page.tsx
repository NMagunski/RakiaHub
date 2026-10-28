"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { searchRakija } from "@/lib/queries/rakija";
import origins from "@/lib/origin-registry.json";
import RakijaCard from "@/components/rakija/RakijaCard";
import type { Rakija } from "@/types/app";

type RakijaRow = Pick<Rakija, "id" | "name" | "producer" | "fruit" | "region" | "country" | "type" | "abv" | "global_rating" | "rating_count" | "is_verified">;
type SortBy = "rating_count" | "global_rating" | "name";

const FRUIT_OPTIONS = [
  { value: null,       label: "Всички" },
  { value: "plum",     label: "🍑 Слива" },
  { value: "grape",    label: "🍇 Грозде" },
  { value: "apricot",  label: "🍊 Кайсия" },
  { value: "pear",     label: "🍐 Круша" },
  { value: "fig",      label: "🫐 Смокиня" },
  { value: "quince",   label: "🍋 Дюля" },
  { value: "mixed",    label: "🌿 Смесена" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "rating_count",  label: "Най-оценявани" },
  { value: "global_rating", label: "Най-висок рейтинг" },
  { value: "name",          label: "А-Я" },
];

export default function DiscoverPage() {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [activeFruit, setActiveFruit] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>("rating_count");
  const [results, setResults] = useState<RakijaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [offset, setOffset] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const sequence = useRef(0);

  // Keep a ref to current filter values so load() doesn't need them as dependencies
  const filtersRef = useRef({ activeFruit, verifiedOnly, sortBy });
  filtersRef.current = { activeFruit, verifiedOnly, sortBy };

  async function load(q: string) {
    const request = ++sequence.current;
    setError("");
    setLoading(true);
    try {
      const { activeFruit: fruit, verifiedOnly: verified, sortBy: sort } = filtersRef.current;
      const data = await searchRakija(supabase, q, {
        fruit, country, region, offset, triedOnly: tried,
        verifiedOnly: verified,
        sortBy: sort,
      });
      if (request !== sequence.current) return;
      setResults(data as RakijaRow[]);
      if (q.trim()) {
        const history = [q.trim(), ...JSON.parse(localStorage.getItem("rakiq-searches") || "[]").filter((v: string) => v !== q.trim())].slice(0, 6);
        localStorage.setItem("rakiq-searches", JSON.stringify(history)); setRecent(history);
      }
    } catch {
      if (request === sequence.current) setError("Търсенето не е достъпно. Опитай отново.");
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }

  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem("rakiq-searches") || "[]")); } catch { /* fresh history */ }
  }, []);
  useEffect(() => { setOffset(0); }, [activeFruit, verifiedOnly, sortBy]);
  useEffect(() => {
    ++sequence.current;
    const timer = setTimeout(() => { void load(query); }, 300);
    return () => { clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeFruit, verifiedOnly, sortBy, country, region, offset, tried]);
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) { setQuery(e.target.value); setOffset(0); }

  const hasActiveFilters = activeFruit !== null || verifiedOnly || sortBy !== "rating_count";

  return (
    <div className="flex flex-col">
      {/* Sticky header: search + filters */}
      <div
        className="sticky top-0 z-30 px-4 pt-4 pb-3 flex flex-col gap-2 glass-panel"
      >
        {/* Search bar */}
        <div
          className="flex items-center gap-2 rounded-2xl px-4 py-3"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(44,24,16,0.09)", boxShadow: "0 1px 6px rgba(44,24,16,0.06)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 shrink-0 text-accent">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={handleSearch}
            placeholder="Търси по име, производител, вид…"
            className="flex-1 bg-transparent text-sm text-oak placeholder:text-muted focus:outline-none"
            autoComplete="off"
          />
          {query && (
            <button onClick={() => { setQuery(""); load(""); }} className="text-accent" aria-label="Изчисти">✕</button>
          )}
        </div>

        {/* Fruit chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {FRUIT_OPTIONS.map((opt) => {
            const active = activeFruit === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => setActiveFruit(active ? null : opt.value)}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                style={active
                  ? { background: "linear-gradient(135deg,rgb(var(--walnut)),rgb(var(--oak)))", color: "#FFFFFF", boxShadow: "0 2px 10px rgba(107,68,35,0.35)" }
                  : { background: "rgba(255,255,255,0.90)", color: "rgb(var(--walnut))", border: "1px solid rgba(44,24,16,0.12)" }
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Sort + Verified row */}
        <div className="flex items-center justify-between gap-2">
          {/* Sort selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="appearance-none rounded-xl pl-3 pr-7 py-1.5 text-xs font-medium text-walnut focus:outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.90)", border: "1px solid rgba(44,24,16,0.12)" }}
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-walnut">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Verified toggle */}
          <button
            onClick={() => setVerifiedOnly((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all"
            style={verifiedOnly
              ? { background: "rgba(61,122,61,0.12)", color: "#3D7A3D", border: "1px solid rgba(61,122,61,0.30)" }
              : { background: "rgba(255,255,255,0.90)", color: "rgb(var(--walnut))", border: "1px solid rgba(44,24,16,0.12)" }
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Верифицирани
          </button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={() => { setActiveFruit(null); setVerifiedOnly(false); setSortBy("rating_count"); }}
              className="text-xs text-muted underline"
            >
              Изчисти
            </button>
          )}
        </div>
      </div>

      <section className="px-4 py-3 space-y-3">
        <h1 className="font-serif text-3xl text-oak">Открий следващата история.</h1>
        <p className="text-sm text-muted">По плод, произход или спомен от последната чаша.</p>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Държава" className="input !w-auto" value={country} onChange={e=>{setCountry(e.target.value);setRegion("");setOffset(0);}}><option value="">Всички държави</option><option value="BG">България</option><option value="RS">Сърбия</option><option value="MK">Северна Македония</option></select>
          <select aria-label="Регион" className="input !w-auto" value={region} onChange={e=>{setRegion(e.target.value);setOffset(0);}}><option value="">Всички региони</option>{origins.filter(r=>!country||r.country_id===country).map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <button aria-pressed={tried} className="rounded-xl border border-accent px-3 text-sm" onClick={()=>{setTried(!tried);setOffset(0);}}>Вече опитани</button>
        </div>
        {!query && recent.length>0 && <div className="flex flex-wrap gap-2 text-xs"><span>Скорошни:</span>{recent.map(q=><button className="underline" key={q} onClick={()=>{setQuery(q);setOffset(0);}}>{q}</button>)}</div>}
        <button className="text-sm font-semibold text-walnut underline" onClick={()=>window.dispatchEvent(new CustomEvent("open-rating-sheet",{detail:{query}}))}>Не я намираш? Добави ракия →</button>
        {error && <p role="alert" className="text-red-700">{error} <button className="underline" onClick={()=>load(query)}>Повтори</button></p>}
      </section>
      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-4 pt-2">
        {loading ? (
          <SkeletonList />
        ) : results.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-2 text-center">
            <span className="text-4xl">🥃</span>
            <p className="font-medium text-oak">Няма намерени напитки</p>
            <p className="text-sm text-muted">Опитай с различно търсене</p>
            {query.trim() && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-rating-sheet", { detail: { query } }))}
                className="mt-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-cream"
                style={{ background: "linear-gradient(135deg,rgb(var(--walnut)),rgb(var(--oak)))" }}
              >
                + Добави личен запис
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="pb-1 text-xs text-accent md:col-span-2">{results.length} резултата</p>
            {results.map((r) => (
              <RakijaCard key={r.id} rakija={r} />
            ))}
          </>
        )}
      </div>
      <div className="flex justify-between p-4"><button disabled={offset===0} onClick={()=>setOffset(Math.max(0,offset-40))} className="disabled:opacity-40">← Предишни</button><span className="text-xs">Страница {offset/40+1}</span><button disabled={results.length<40} onClick={()=>setOffset(offset+40)} className="disabled:opacity-40">Следващи →</button></div>
    </div>
  );
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 px-4 py-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-cream" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-cream" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-cream" />
          </div>
          <div className="h-4 w-8 animate-pulse rounded bg-cream" />
        </div>
      ))}
    </>
  );
}
