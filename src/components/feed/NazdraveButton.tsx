"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  ratingId: string;
  initialCount: number;
  initialReacted: boolean;
  userId: string;
};

export default function NazdraveButton({ ratingId, initialCount, initialReacted, userId }: Props) {
  const supabase = createClient();
  const [reacted, setReacted] = useState(initialReacted);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const next = !reacted;
    setReacted(next);
    setCount((c) => (next ? c + 1 : c - 1));

    if (next) {
      await supabase.from("reactions").insert({
        rating_id: ratingId,
        user_id: userId,
        type: "nazdrave",
      });
    } else {
      await supabase
        .from("reactions")
        .delete()
        .eq("rating_id", ratingId)
        .eq("user_id", userId);
    }

    if (navigator.vibrate) navigator.vibrate(20);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        reacted
          ? "bg-walnut text-cream"
          : "bg-cream text-walnut"
      }`}
    >
      <span>🥃</span>
      <span>Наздраве{count > 0 ? ` ${count}` : ""}</span>
    </button>
  );
}
