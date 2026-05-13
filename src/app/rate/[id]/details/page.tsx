"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AROMA_TAGS, TASTE_TAGS, FINISH_TAGS, COLOR_TAGS } from "@/types/app";

type TagSection = {
  label: string;
  field: "aroma_tags" | "taste_tags" | "finish_tags" | "color_tags";
  tags: readonly string[];
  noteField: "aroma_note" | "taste_note" | "finish_note" | null;
};

const SECTIONS: TagSection[] = [
  { label: "Аромат", field: "aroma_tags", tags: AROMA_TAGS, noteField: "aroma_note" },
  { label: "Вкус", field: "taste_tags", tags: TASTE_TAGS, noteField: "taste_note" },
  { label: "Финиш", field: "finish_tags", tags: FINISH_TAGS, noteField: "finish_note" },
  { label: "Цвят / яснота", field: "color_tags", tags: COLOR_TAGS, noteField: null },
];

export default function RatingDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const ratingId = params.id;

  const [tags, setTags] = useState<Record<string, string[]>>({
    aroma_tags: [], taste_tags: [], finish_tags: [], color_tags: [],
  });
  const [notes, setNotes] = useState<Record<string, string>>({
    aroma_note: "", taste_note: "", finish_note: "",
  });
  const [venueName, setVenueName] = useState("");
  const [generalNote, setGeneralNote] = useState("");
  const [saving, setSaving] = useState(false);

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

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from("ratings")
      .update({
        aroma_tags: tags.aroma_tags.length ? tags.aroma_tags : null,
        taste_tags: tags.taste_tags.length ? tags.taste_tags : null,
        finish_tags: tags.finish_tags.length ? tags.finish_tags : null,
        color_tags: tags.color_tags.length ? tags.color_tags : null,
        aroma_note: notes.aroma_note || null,
        taste_note: notes.taste_note || null,
        finish_note: notes.finish_note || null,
        venue_name: venueName || null,
        notes: generalNote || null,
      })
      .eq("id", ratingId);

    if (!error) {
      router.push("/feed");
      router.refresh();
    } else {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-accent/20 bg-background px-4 py-3 safe-top">
        <button onClick={() => router.back()} className="text-walnut">
          ←
        </button>
        <h1 className="font-bold text-oak">Добави детайли</h1>
      </div>

      <div className="flex flex-col gap-6 px-4 py-5 pb-32">
        {SECTIONS.map((s) => (
          <section key={s.field}>
            <h2 className="mb-3 text-sm font-semibold text-oak">{s.label}</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {s.tags.map((tag) => {
                const active = (tags[s.field] ?? []).includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(s.field, tag)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-walnut text-cream"
                        : "bg-cream text-walnut"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            {s.noteField && (
              <input
                type="text"
                placeholder={`Бележка за ${s.label.toLowerCase()}…`}
                value={notes[s.noteField] ?? ""}
                onChange={(e) => setNotes((p) => ({ ...p, [s.noteField!]: e.target.value }))}
                className="input text-sm"
              />
            )}
          </section>
        ))}

        {/* Venue */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-oak">Място</h2>
          <input
            type="text"
            placeholder="Кафе / бар / събитие…"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            className="input text-sm"
          />
        </section>

        {/* General note */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-oak">Обща бележка</h2>
          <textarea
            placeholder="Впечатления, контекст, с кого…"
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            className="input min-h-[100px] resize-none text-sm"
          />
        </section>
      </div>

      {/* Fixed save button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-accent/20 bg-background px-4 py-4 safe-bottom">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl bg-walnut py-4 text-base font-bold text-cream disabled:opacity-60"
        >
          {saving ? "Запазване…" : "Запази детайлите"}
        </button>
      </div>
    </div>
  );
}
