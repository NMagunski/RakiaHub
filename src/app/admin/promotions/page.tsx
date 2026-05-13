"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Suggestion = {
  id: string;
  match_count: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  rakija: {
    id: string;
    name: string;
    producer: string | null;
    fruit: string | null;
    type: string;
  } | null;
  reviewer: { username: string } | null;
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Чакащо",   cls: "bg-amber-50 text-amber-700" },
  approved: { label: "Одобрено", cls: "bg-green-50 text-green-700" },
  rejected: { label: "Отхвърлено", cls: "bg-red-50 text-red-700" },
};

const FRUIT_EMOJI: Record<string, string> = {
  plum: "🍑", grape: "🍇", apricot: "🍊", pear: "🍐",
  fig: "🫐", quince: "🍋", mixed: "🌿", other: "🥃",
};

export default function AdminPromotionsPage() {
  const supabase = createClient();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("promotion_suggestions")
      .select(`
        id, match_count, status, created_at, reviewed_at,
        rakija:rakija_id ( id, name, producer, fruit, type ),
        reviewer:reviewed_by ( username )
      `)
      .order("created_at", { ascending: false }) as unknown as { data: Suggestion[] | null };
    setItems(data ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function act(suggestion_id: string, action: "approve" | "reject") {
    setActing(suggestion_id);
    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, suggestion_id }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((s) =>
          s.id === suggestion_id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s
        )
      );
    }
    setActing(null);
  }

  const filtered = items.filter((s) => s.status === filter);
  const counts = { pending: 0, approved: 0, rejected: 0 };
  for (const s of items) counts[s.status]++;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-oak">Предложения за верификация</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              filter === s ? "bg-walnut text-cream" : "bg-white text-walnut border border-accent/30"
            }`}
          >
            {STATUS_LABEL[s].label}
            {counts[s] > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 text-xs ${filter === s ? "bg-cream/20" : "bg-accent/10"}`}>
                {counts[s]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-walnut">Зареждане…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">✓</p>
          <p className="font-medium text-oak">Няма {STATUS_LABEL[filter].label.toLowerCase()} предложения</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white px-5 py-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream text-2xl">
                  {FRUIT_EMOJI[s.rakija?.fruit ?? ""] ?? "🥃"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-oak">{s.rakija?.name ?? "—"}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_LABEL[s.status].cls}`}>
                      {STATUS_LABEL[s.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-walnut">{s.rakija?.producer ?? "Домашна"}</p>
                  <div className="mt-1 flex gap-3 text-xs text-accent">
                    <span>🏷️ Тип: {s.rakija?.type}</span>
                    <span>👥 Записи: {s.match_count}</span>
                    <span>📅 {new Date(s.created_at).toLocaleDateString("bg-BG")}</span>
                  </div>
                  {s.reviewer && s.reviewed_at && (
                    <p className="mt-1 text-xs text-accent/70">
                      Прегледано от @{s.reviewer.username} на {new Date(s.reviewed_at).toLocaleDateString("bg-BG")}
                    </p>
                  )}
                </div>
              </div>

              {s.status === "pending" && (
                <div className="mt-3 flex gap-2 border-t border-accent/10 pt-3">
                  <button
                    onClick={() => act(s.id, "approve")}
                    disabled={acting === s.id}
                    className="flex-1 rounded-xl bg-walnut py-2 text-sm font-semibold text-cream disabled:opacity-60"
                  >
                    {acting === s.id ? "…" : "Одобри → Комерсиална"}
                  </button>
                  <button
                    onClick={() => act(s.id, "reject")}
                    disabled={acting === s.id}
                    className="rounded-xl border border-accent/30 px-4 py-2 text-sm text-walnut disabled:opacity-60"
                  >
                    Отхвърли
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
