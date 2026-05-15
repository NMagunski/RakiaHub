"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WishlistButton({
  rakijaId,
  initialState,
}: {
  rakijaId: string;
  initialState: boolean;
}) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialState);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setWishlisted((w) => !w);
    setLoading(true);
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rakijaId }),
    });
    if (!res.ok) {
      setWishlisted((w) => !w);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-medium transition-colors disabled:opacity-50"
      style={
        wishlisted
          ? { borderColor: "rgba(107,68,35,0.5)", background: "rgba(107,68,35,0.07)", color: "#6B4423" }
          : { borderColor: "rgba(107,68,35,0.25)", background: "transparent", color: "#6B4423" }
      }
    >
      <svg
        viewBox="0 0 24 24"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
      {wishlisted ? "В моя списък" : "Искам да пробвам"}
    </button>
  );
}
