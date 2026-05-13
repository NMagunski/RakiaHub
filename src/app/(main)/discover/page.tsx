"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { searchRakija } from "@/lib/queries/rakija";
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
  const [, startTransition] = useTransition();

  // Keep a ref to current filter values so load() doesn't need them as dependencies
  const filtersRef = useRef({ activeFruit, verifiedOnly, sortBy });
  filtersRef.current = { activeFruit, verifiedOnly, sortBy };

  async function load(q: string) {
    setLoading(true);
    try {
      const { activeFruit: fruit, verifiedOnly: verified, sortBy: sort } = filtersRef.current;
      const data = await searchRakija(supabase, q, {
        fruit,
        verifiedOnly: verified,
        sortBy: sort,
      });
      setResults(data as RakijaRow[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(query); }, []);

  // Reload when filters change
  useEffect(() => {
    startTransition(() => { load(query); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFruit, verifiedOnly, sortBy]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    startTransition(() => { load(val); });
  }

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
            className="flex-1 bg-transparent text-sm text-oak placeholder:text-accent/60 focus:outline-none"
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
                  ? { background: "linear-gradient(135deg,#6B4423,#2C1810)", color: "#FFFFFF", boxShadow: "0 2px 10px rgba(107,68,35,0.35)" }
                  : { background: "rgba(255,255,255,0.90)", color: "#6B4423", border: "1px solid rgba(44,24,16,0.12)" }
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
              : { background: "rgba(255,255,255,0.90)", color: "#6B4423", border: "1px solid rgba(44,24,16,0.12)" }
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
              className="text-xs text-accent/70 underline"
            >
              Изчисти
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
        {loading ? (
          <SkeletonList />
        ) : results.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-2 text-center">
            <span className="text-4xl">🥃</span>
            <p className="font-medium text-oak">Няма намерени напитки</p>
            <p className="text-sm text-walnut">Опитай с различно търсене</p>
          </div>
        ) : (
          <>
            <p className="pb-1 text-xs text-accent">{results.length} резултата</p>
            {results.map((r) => (
              <RakijaCard key={r.id} rakija={r} />
            ))}
          </>
        )}
      </div>
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
