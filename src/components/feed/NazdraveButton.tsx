"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  ratingId: string;
  initialCount: number;
  initialReacted: boolean;
  userId: string;
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

export default function NazdraveButton({ ratingId, initialCount, initialReacted, userId }: Props) {
  const supabase = createClient();
  const [reacted, setReacted]   = useState(initialReacted);
  const [count, setCount]       = useState(initialCount);
  const [loading, setLoading]   = useState(false);
  const [popping, setPopping]   = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    const next = !reacted;
    setReacted(next);
    setCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

    if (next) {
      setPopping(true);
      setTimeout(() => setPopping(false), 400);
      await supabase.from("reactions").insert({ rating_id: ratingId, user_id: userId, type: "nazdrave" });
    } else {
      await supabase.from("reactions").delete().eq("rating_id", ratingId).eq("user_id", userId);
    }

    if (navigator.vibrate) navigator.vibrate(18);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={!userId}
      className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all active:scale-95 ${popping ? "animate-nazdrave" : ""}`}
      style={reacted ? {
        background: "linear-gradient(135deg, #6B4423, #2C1810)",
        color: "#FFFFFF",
        boxShadow: "0 2px 12px rgba(107,68,35,0.35)",
      } : {
        background: "rgba(107,68,35,0.08)",
        color: "#6B4423",
        border: "1.5px solid rgba(107,68,35,0.18)",
      }}
    >
      <GlassIcon filled={reacted} className="h-4.5 w-4.5 h-[18px] w-[18px] shrink-0" />
      <span>Наздраве{count > 0 && <span className={`ml-1 tabular-nums ${reacted ? "text-white/80" : "text-walnut/70"}`}>{count}</span>}</span>
    </button>
  );
}
