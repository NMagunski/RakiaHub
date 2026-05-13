"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Rakija } from "@/types/app";
import { FRUIT_TYPES } from "@/types/app";

type Props = {
  initial?: Partial<Rakija>;
  onSaved: () => void;
  onCancel: () => void;
};

const FRUIT_BG: Record<string, string> = {
  plum: "Сливова", grape: "Гроздова", apricot: "Кайсиева",
  pear: "Крушова", fig: "Смокинева", quince: "Дюлева",
  mixed: "Смесена", other: "Друга",
};

export default function RakijaForm({ initial, onSaved, onCancel }: Props) {
  const supabase = createClient();
  const isEdit = !!initial?.id;

  const [name, setName] = useState(initial?.name ?? "");
  const [producer, setProducer] = useState(initial?.producer ?? "");
  const [fruit, setFruit] = useState(initial?.fruit ?? "plum");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [country, setCountry] = useState(initial?.country ?? "Bulgaria");
  const [abv, setAbv] = useState(initial?.abv?.toString() ?? "");
  const [vintageYear, setVintageYear] = useState(initial?.vintage_year?.toString() ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isVerified, setIsVerified] = useState(initial?.is_verified ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name: name.trim(),
      producer: producer.trim() || null,
      fruit: fruit || null,
      region: region.trim() || null,
      country: country.trim(),
      abv: abv ? parseFloat(abv) : null,
      vintage_year: vintageYear ? parseInt(vintageYear) : null,
      description: description.trim() || null,
      is_verified: isVerified,
      type: "commercial" as const,
    };

    try {
      if (isEdit) {
        const { error } = await supabase.from("rakija").update(payload).eq("id", initial!.id!);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rakija").insert(payload);
        if (error) throw error;
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка при запис");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Наименование *</label>
          <input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="Троянска Сливова" />
        </div>
        <div className="col-span-2">
          <label className="label">Производител</label>
          <input className="input" value={producer} onChange={e => setProducer(e.target.value)} placeholder="Винпром Троян" />
        </div>
        <div>
          <label className="label">Вид плод</label>
          <select className="input" value={fruit} onChange={e => setFruit(e.target.value)}>
            {FRUIT_TYPES.map(f => (
              <option key={f} value={f}>{FRUIT_BG[f] ?? f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Алкохол (%)</label>
          <input className="input" type="number" min="0" max="96" step="0.1" value={abv} onChange={e => setAbv(e.target.value)} placeholder="40.0" />
        </div>
        <div>
          <label className="label">Регион</label>
          <input className="input" value={region} onChange={e => setRegion(e.target.value)} placeholder="Балкан" />
        </div>
        <div>
          <label className="label">Страна</label>
          <input className="input" value={country} onChange={e => setCountry(e.target.value)} placeholder="Bulgaria" />
        </div>
        <div>
          <label className="label">Реколта</label>
          <input className="input" type="number" min="1900" max="2099" value={vintageYear} onChange={e => setVintageYear(e.target.value)} placeholder="2022" />
        </div>
        <div className="flex items-center gap-2 self-end pb-1">
          <input type="checkbox" id="verified" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} className="h-4 w-4 accent-verified" />
          <label htmlFor="verified" className="text-sm text-oak">Верифицирана</label>
        </div>
        <div className="col-span-2">
          <label className="label">Описание</label>
          <textarea className="input min-h-[80px] resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder="Кратко описание…" />
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-accent/40 py-3 text-sm font-medium text-walnut">
          Отказ
        </button>
        <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-walnut py-3 text-sm font-semibold text-cream disabled:opacity-60">
          {saving ? "Запазване…" : isEdit ? "Обнови" : "Добави"}
        </button>
      </div>
    </form>
  );
}
