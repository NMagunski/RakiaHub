"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Reactor } from "@/lib/queries/feed";

type Props = {
  ratingId: string;
  initialCount: number;
  initialReacted: boolean;
  userId: string;
  reactors?: Reactor[];
};

function GlassIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {filled ? (
        <>
          <path
            d="M9 4h6L13.6 11.2C13.2 13.4 12.8 15.2 12 16.4V19h1.2v1.5H10.8V19H12v-2.6C11.2 15.2 10.8 13.4 10.4 11.2Z"
            fill="currentColor"
          />
          <path d="M10.6 9.5h2.8" stroke="white" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        </>
      ) : (
        <>
          <path
            d="M9 4h6L13.6 11.2C13.2 13.4 12.8 15.2 12 16.4V19h1.2v1.5H10.8V19H12v-2.6C11.2 15.2 10.8 13.4 10.4 11.2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M10.6 9.5h2.8" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}

export default function NazdraveButton({ ratingId, initialCount, initialReacted, userId, reactors = [] }: Props) {
  const supabase = createClient();
  const [reacted, setReacted]       = useState(initialReacted);
  const [count, setCount]           = useState(initialCount);
  const [loading, setLoading]       = useState(false);
  const [error, setError] = useState("");
  const [popping, setPopping]       = useState(false);
  const [showReactors, setShowReactors] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    const next = !reacted;
    setReacted(next);
    setCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

    setError("");
    try {
      const result = next
        ? await supabase.from("reactions").insert({ rating_id: ratingId, user_id: userId, type: "nazdrave" })
        : await supabase.from("reactions").delete().eq("rating_id", ratingId).eq("user_id", userId);
      if (result.error) throw result.error;
      if (next) { setPopping(true); setTimeout(() => setPopping(false), 400); }
    } catch {
      setReacted(!next); setCount(c => next ? Math.max(0, c - 1) : c + 1);
      setError("Реакцията не е запазена. Опитай отново.");
    } finally { setLoading(false); }
    if (navigator.vibrate) navigator.vibrate(18);
  }

  return (
    <div className="relative flex flex-wrap items-center gap-1" onKeyDown={e => { if (e.key === "Escape") setShowReactors(false); }}>
      {error && <span role="alert" className="w-full text-xs text-walnut">{error}</span>}
      <button
        onClick={toggle}
        disabled={!userId || loading}
        aria-pressed={reacted}
        className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all active:scale-95 ${popping ? "animate-nazdrave" : ""}`}
        style={reacted ? {
          background: "linear-gradient(135deg, rgb(var(--walnut)), rgb(var(--oak)))",
          color: "#FFFFFF",
          boxShadow: "0 2px 12px rgba(107,68,35,0.35)",
        } : {
          background: "rgb(var(--accent)/.1)",
          color: "rgb(var(--walnut))",
          border: "1.5px solid rgba(107,68,35,0.18)",
        }}
      >
        <GlassIcon filled={reacted} className="h-[18px] w-[18px] shrink-0" />
        <span>Наздраве</span>
      </button>

      {/* Count — separate tap target that opens reactor list */}
      {count === 0 && <span className="px-1 text-xs text-muted" aria-label="0 реакции">0</span>}
      {count > 0 && (
        <button
          aria-expanded={showReactors}
          onClick={(e) => { e.stopPropagation(); setShowReactors((v) => !v); }}
          className="rounded-full px-2 py-1 text-xs font-bold tabular-nums transition-colors"
          style={{ color: reacted ? "rgb(var(--walnut))" : "rgba(107,68,35,0.65)", background: "rgba(107,68,35,0.07)" }}
        >
          <span className="sr-only">Реакции: </span>{count}
        </button>
      )}

      {/* Reactor popover */}
      {showReactors && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowReactors(false)} />
          <div
            ref={popoverRef}
            className="absolute bottom-full left-0 z-20 mb-2 min-w-[160px] rounded-2xl p-2"
            style={{
              background: "rgb(var(--background))",
              boxShadow: "0 4px 24px rgba(44,24,16,0.14), 0 1px 4px rgba(44,24,16,0.08)",
              border: "1px solid rgba(44,24,16,0.08)",
            }}
          >
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgb(var(--muted))" }}>
              Наздраве от
            </p>
            <button type="button" className="text-xs underline p-1" onClick={() => setShowReactors(false)}>Затвори</button>
            {reactors.length === 0 && <p className="text-xs p-2">Твоята наздравица е добавена.</p>}
            {reactors.map((r) => (
              <div key={r.username} className="flex items-center gap-2 rounded-xl px-2 py-1.5">
                <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full" style={{ background: "rgba(107,68,35,0.10)" }}>
                  {r.avatar_url ? (
                    <Image src={r.avatar_url} alt={r.username} width={24} height={24} className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-walnut">
                      {r.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-oak">@{r.username}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
