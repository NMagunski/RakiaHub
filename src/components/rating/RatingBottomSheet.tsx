"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { searchRakija } from "@/lib/queries/rakija";
import RatingSlider from "./RatingSlider";
import FruitIcon from "@/components/ui/FruitIcon";
import type { Rakija } from "@/types/app";
import { AROMA_TAGS, TASTE_TAGS, FINISH_TAGS, COLOR_TAGS } from "@/types/app";

type Step = "search" | "score" | "details";

type SelectedRakija =
  | { kind: "existing"; id: string; name: string; producer: string | null }
  | { kind: "new"; name: string; producer: string; fruit: string };

type Props = {
  onClose: () => void;
  preselected?: { kind: "existing"; id: string; name: string; producer: string | null };
  initialQuery?: string;
};

type TagSection = {
  label: string;
  field: "aroma_tags" | "taste_tags" | "finish_tags" | "color_tags";
  tags: readonly string[];
  noteField: "aroma_note" | "taste_note" | "finish_note" | null;
};

const TAG_LABELS: Record<string, string> = {
  fruity: "Плодово", plum: "Слива", apricot: "Кайсия", oaky: "Дъбово",
  floral: "Цветно", spirity: "Спиртово", earthy: "Земно", honey: "Мед", vanilla: "Ванилия",
  sweet: "Сладко", dry: "Сухо", smooth: "Мек", sharp: "Остър",
  balanced: "Балансиран", buttery: "Масленост", spicy: "Пикантно", bitter: "Горчиво",
  short: "Кратък", long: "Дълъг", warm: "Топъл",
  clear: "Бистра", golden: "Златиста", amber: "Кехлибарена", cloudy: "Мътна", dark: "Тъмна",
};

const SECTIONS: TagSection[] = [
  { label: "Аромат", field: "aroma_tags", tags: AROMA_TAGS, noteField: "aroma_note" },
  { label: "Вкус", field: "taste_tags", tags: TASTE_TAGS, noteField: "taste_note" },
  { label: "Финиш", field: "finish_tags", tags: FINISH_TAGS, noteField: "finish_note" },
  { label: "Цвят / яснота", field: "color_tags", tags: COLOR_TAGS, noteField: null },
];

export default function RatingBottomSheet({ onClose, preselected, initialQuery = "" }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const searchRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(preselected ? "score" : "search");
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Rakija[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SelectedRakija | null>(preselected ?? null);
  const [score, setScore] = useState(7.0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New personal entry fields
  const [newName, setNewName] = useState("");
  const [newProducer, setNewProducer] = useState("");
  const [newFruit, setNewFruit] = useState("plum");
  const [showNewForm, setShowNewForm] = useState(false);

  // Details step state
  const [tags, setTags] = useState<Record<string, string[]>>({
    aroma_tags: [], taste_tags: [], finish_tags: [], color_tags: [],
  });
  const [detailNotes, setDetailNotes] = useState<Record<string, string>>({
    aroma_note: "", taste_note: "", finish_note: "",
  });
  const [venueName, setVenueName] = useState("");
  const [generalNote, setGeneralNote] = useState("");

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchRakija(supabase, query);
        setResults(data as Rakija[]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function selectRakija(r: Rakija) {
    setSelected({ kind: "existing", id: r.id, name: r.name, producer: r.producer });
    setStep("score");
  }

  function confirmNewEntry() {
    if (!newName.trim()) return;
    setSelected({ kind: "new", name: newName.trim(), producer: newProducer.trim(), fruit: newFruit });
    setStep("score");
  }

  function toggleTag(field: string, tag: string) {
    setTags((prev) => {
      const current = prev[field] ?? [];
      return {
        ...prev,
        [field]: current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag],
      };
    });
  }

  function buildBody(withDetails: boolean) {
    const base =
      selected!.kind === "existing"
        ? { rakija_id: selected!.id, score }
        : {
            score,
            is_new_personal: true,
            personal_name: (selected as { name: string }).name,
            personal_producer: (selected as { producer: string }).producer,
            personal_fruit: (selected as { fruit: string }).fruit,
          };

    if (!withDetails) return base;

    return {
      ...base,
      aroma_tags: tags.aroma_tags.length ? tags.aroma_tags : null,
      taste_tags: tags.taste_tags.length ? tags.taste_tags : null,
      finish_tags: tags.finish_tags.length ? tags.finish_tags : null,
      color_tags: tags.color_tags.length ? tags.color_tags : null,
      aroma_note: detailNotes.aroma_note || null,
      taste_note: detailNotes.taste_note || null,
      finish_note: detailNotes.finish_note || null,
      venue_name: venueName || null,
      notes: generalNote || null,
    };
  }

  async function save(withDetails: boolean) {
    if (!selected) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildBody(withDetails)),
      });

      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Грешка при запис");
      }

      window.dispatchEvent(new Event("rating-saved"));
      onClose();
      router.push("/feed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Грешка");
      setSaving(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-background shadow-2xl animate-slide-up flex flex-col"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Handle */}
        <div className="flex-shrink-0 pt-4 px-5 pb-2">
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-accent/30" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-8">

          {step === "search" && (
            <>
              <h2 className="mb-4 text-lg font-bold text-oak">Оцени напитка</h2>

              <div className="input flex items-center gap-2 px-4 py-3 mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5 shrink-0 text-accent">
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowNewForm(false); }}
                  placeholder="Търси напитка…"
                  className="flex-1 bg-transparent text-sm text-oak placeholder:text-accent/60 focus:outline-none"
                  autoComplete="off"
                />
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {searching && (
                  <p className="py-3 text-center text-sm text-walnut">Търсене…</p>
                )}
                {!searching && results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectRakija(r)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-cream active:bg-cream"
                  >
                    <FruitIcon fruit={r.fruit} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-oak">{r.name}</p>
                      <p className="truncate text-xs text-walnut">{r.producer ?? ""}</p>
                    </div>
                  </button>
                ))}
                {!searching && query.trim() && results.length === 0 && !showNewForm && (
                  <div className="py-3 text-center">
                    <p className="text-sm text-walnut mb-2">Не е намерена в базата</p>
                    <button
                      onClick={() => { setShowNewForm(true); setNewName(query.trim()); }}
                      className="rounded-xl bg-cream px-4 py-2 text-sm font-semibold text-walnut"
                    >
                      + Добави личен запис
                    </button>
                  </div>
                )}
              </div>

              {showNewForm && (
                <div className="card mt-3 space-y-2 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Нов личен запис</p>
                  <input
                    className="input text-sm"
                    placeholder="Наименование *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input
                    className="input text-sm"
                    placeholder="Производител"
                    value={newProducer}
                    onChange={(e) => setNewProducer(e.target.value)}
                  />
                  <select className="input text-sm" value={newFruit} onChange={(e) => setNewFruit(e.target.value)}>
                    <option value="plum">Сливова</option>
                    <option value="grape">Гроздова</option>
                    <option value="apricot">Кайсиева</option>
                    <option value="pear">Крушова</option>
                    <option value="fig">Смокинева</option>
                    <option value="quince">Дюлева</option>
                    <option value="mixed">Смесена</option>
                    <option value="other">Друга</option>
                  </select>
                  <button
                    onClick={confirmNewEntry}
                    disabled={!newName.trim()}
                    className="w-full rounded-xl bg-walnut py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
                  >
                    Продължи →
                  </button>
                </div>
              )}
            </>
          )}

          {step === "score" && selected && (
            <>
              <button onClick={() => setStep("search")} className="mb-4 flex items-center gap-1 text-sm text-walnut">
                ← Назад
              </button>

              <div className="mb-5 text-center">
                <p className="text-base font-bold text-oak">{selected.name}</p>
                {selected.kind === "existing" && selected.producer && (
                  <p className="text-sm text-walnut">{selected.producer}</p>
                )}
                {selected.kind === "new" && (
                  <span className="mt-1 inline-block rounded-full bg-cream px-2 py-0.5 text-xs text-walnut">
                    Личен запис
                  </span>
                )}
              </div>

              <RatingSlider value={score} onChange={setScore} />

              {error && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => save(false)}
                  disabled={saving}
                  className="btn-primary py-4 text-base font-bold"
                >
                  {saving ? "Запазване…" : "Запази"}
                </button>
                <button
                  onClick={() => setStep("details")}
                  disabled={saving}
                  className="w-full rounded-2xl border border-accent/30 py-3 text-sm font-medium text-walnut disabled:opacity-60"
                >
                  Добави детайли →
                </button>
              </div>
            </>
          )}

          {step === "details" && selected && (
            <>
              <button onClick={() => setStep("score")} className="mb-4 flex items-center gap-1 text-sm text-walnut">
                ← Назад
              </button>

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-oak">{selected.name}</p>
                  {selected.kind === "existing" && selected.producer && (
                    <p className="text-sm text-walnut">{selected.producer}</p>
                  )}
                </div>
                <div
                  className="flex flex-col items-center justify-center rounded-xl px-3 py-1.5"
                  style={{ background: "linear-gradient(145deg, #D4A574, #C8882A)" }}
                >
                  <span className="text-lg font-bold text-white leading-none">{score}</span>
                  <span className="text-[9px] text-white/65 leading-none">/10</span>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                {SECTIONS.map((s) => (
                  <section key={s.field}>
                    <h2 className="mb-2 text-sm font-semibold text-oak">{s.label}</h2>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {s.tags.map((tag) => {
                        const active = (tags[s.field] ?? []).includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(s.field, tag)}
                            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                              active ? "bg-walnut text-cream" : "bg-cream text-walnut"
                            }`}
                          >
                            {TAG_LABELS[tag] ?? tag}
                          </button>
                        );
                      })}
                    </div>
                    {s.noteField && (
                      <input
                        type="text"
                        placeholder={`Бележка за ${s.label.toLowerCase()}…`}
                        value={detailNotes[s.noteField] ?? ""}
                        onChange={(e) => setDetailNotes((p) => ({ ...p, [s.noteField!]: e.target.value }))}
                        className="input text-sm"
                      />
                    )}
                  </section>
                ))}

                <section>
                  <h2 className="mb-2 text-sm font-semibold text-oak">Място</h2>
                  <input
                    type="text"
                    placeholder="Кафе / бар / събитие…"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="input text-sm"
                  />
                </section>

                <section>
                  <h2 className="mb-2 text-sm font-semibold text-oak">Обща бележка</h2>
                  <textarea
                    placeholder="Впечатления, контекст, с кого…"
                    value={generalNote}
                    onChange={(e) => setGeneralNote(e.target.value)}
                    className="input min-h-[80px] resize-none text-sm"
                  />
                </section>
              </div>

              {error && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
              )}

              <button
                onClick={() => save(true)}
                disabled={saving}
                className="btn-primary mt-6 w-full py-4 text-base font-bold"
              >
                {saving ? "Запазване…" : "Запази"}
              </button>
            </>
          )}

        </div>
      </div>
    </>
  );
}
