"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import RakijaForm from "@/components/admin/RakijaForm";
import type { Rakija } from "@/types/app";

export default function AdminRakijaPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Rakija[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Rakija> | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("rakija")
      .select("*")
      .eq("type", "commercial")
      .order("name");
    setItems((data as Rakija[]) ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Изтрий тази ракия?")) return;
    await supabase.from("rakija").delete().eq("id", id);
    load();
  }

  const filtered = items.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.producer ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (editing || showNew) {
    return (
      <div className="max-w-lg">
        <button onClick={() => { setEditing(null); setShowNew(false); }} className="mb-4 text-sm text-walnut underline">
          ← Назад
        </button>
        <h2 className="mb-4 text-lg font-bold text-oak">
          {editing ? "Редактирай ракия" : "Добави нова ракия"}
        </h2>
        <RakijaForm
          initial={editing ?? undefined}
          onSaved={() => { setEditing(null); setShowNew(false); load(); }}
          onCancel={() => { setEditing(null); setShowNew(false); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-oak">Ракии ({items.length})</h1>
        <button
          onClick={() => setShowNew(true)}
          className="rounded-xl bg-walnut px-4 py-2 text-sm font-semibold text-cream"
        >
          + Добави
        </button>
      </div>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Търси…"
        className="mb-4 w-full rounded-xl border border-accent/30 bg-white px-4 py-2 text-sm text-oak focus:border-walnut focus:outline-none"
      />

      {loading ? (
        <p className="text-walnut">Зареждане…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-accent/20 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent/20 text-left text-xs font-medium uppercase tracking-wide text-accent">
                <th className="px-4 py-3">Наименование</th>
                <th className="px-4 py-3">Производител</th>
                <th className="px-4 py-3">Вид</th>
                <th className="px-4 py-3">ABV</th>
                <th className="px-4 py-3">Рейтинг</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-cream/30">
                  <td className="px-4 py-3 font-medium text-oak">
                    {r.name}
                    {r.is_verified && <span className="ml-1 text-xs text-verified">✓</span>}
                  </td>
                  <td className="px-4 py-3 text-walnut">{r.producer ?? "—"}</td>
                  <td className="px-4 py-3 text-walnut">{r.fruit ?? "—"}</td>
                  <td className="px-4 py-3 text-walnut">{r.abv ? `${r.abv}%` : "—"}</td>
                  <td className="px-4 py-3">
                    {r.global_rating ? (
                      <span className="font-semibold text-gold">{r.global_rating}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setEditing(r)} className="text-walnut underline">Редактирай</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-500 underline">Изтрий</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-walnut">Няма резултати</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
