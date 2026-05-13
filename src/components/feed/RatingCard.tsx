"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NazdraveButton from "./NazdraveButton";
import FruitIcon from "@/components/ui/FruitIcon";

type Props = {
  rating: {
    id: string;
    score: number;
    aroma_tags: string[] | null;
    taste_tags: string[] | null;
    finish_tags: string[] | null;
    venue_name: string | null;
    notes: string | null;
    created_at: string;
    rakija: { id: string; name: string; producer: string | null; fruit: string | null; type: string } | null;
    profiles: { id: string; username: string; avatar_url: string | null } | null;
  };
  reactions: { count: number; user_reacted: boolean };
  currentUserId: string;
  onDelete?: (id: string) => void;
};

export default function RatingCard({ rating, reactions, currentUserId, onDelete }: Props) {
  const { rakija, profiles } = rating;
  const [confirming, setConfirming] = useState(false);

  const allTags = [
    ...(rating.aroma_tags ?? []),
    ...(rating.taste_tags ?? []),
    ...(rating.finish_tags ?? []),
  ].slice(0, 4);

  const dateStr = new Date(rating.created_at).toLocaleDateString("bg-BG", {
    day: "numeric", month: "short",
  });

  return (
    <article className="card animate-fade-in">
      {/* User row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-bold text-walnut overflow-hidden ring-2 ring-white/80">
          {profiles?.avatar_url ? (
            <Image src={profiles.avatar_url} alt={profiles.username} width={32} height={32} className="object-cover" />
          ) : (
            profiles?.username[0].toUpperCase() ?? "?"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-oak">@{profiles?.username}</span>
          <span className="text-sm text-accent/70"> оцени</span>
        </div>
        <span className="text-xs text-accent/50">{dateStr}</span>
      </div>

      {/* Rakija row */}
      <Link href={`/rakija/${rakija?.id}`} className="flex items-center gap-3 px-4 pb-3">
        <FruitIcon fruit={rakija?.fruit ?? null} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-oak">{rakija?.name}</p>
          {rakija?.producer && (
            <p className="truncate text-xs text-walnut/80 mt-0.5">{rakija.producer}</p>
          )}
          {rating.venue_name && (
            <p className="truncate text-xs text-accent/60 mt-0.5">📍 {rating.venue_name}</p>
          )}
        </div>
        {/* Score badge */}
        <div
          className="shrink-0 flex flex-col items-center justify-center h-12 w-12 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(212,168,83,0.18) 0%, rgba(212,168,83,0.06) 100%)",
            boxShadow: "0 2px 12px rgba(212,168,83,0.30), inset 0 1px 0 rgba(255,255,255,0.6)",
            border: "1px solid rgba(212,168,83,0.25)",
          }}
        >
          <span className="text-xl font-bold leading-none" style={{ color: "#B8892E" }}>{rating.score}</span>
          <span className="text-[10px] leading-none mt-0.5" style={{ color: "rgba(184,137,46,0.6)" }}>/10</span>
        </div>
      </Link>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {allTags.map((tag) => (
            <span key={tag} className="rounded-full px-2.5 py-1 text-xs font-medium text-walnut" style={{ background: "rgba(237,217,192,0.60)", border: "1px solid rgba(196,149,106,0.2)" }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Note */}
      {rating.notes && (
        <p className="px-4 pb-3 text-sm italic text-walnut/70 line-clamp-2">&ldquo;{rating.notes}&rdquo;</p>
      )}

      {/* Footer */}
      <div className="flex items-center px-4 py-2.5" style={{ borderTop: "1px solid rgba(196,149,106,0.12)" }}>
        <NazdraveButton
          ratingId={rating.id}
          initialCount={reactions.count}
          initialReacted={reactions.user_reacted}
          userId={currentUserId}
        />

        {onDelete && rating.profiles?.id === currentUserId && (
          confirming ? (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-oak">Изтрий?</span>
              <button
                onClick={() => { onDelete(rating.id); setConfirming(false); }}
                className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white"
              >
                Да
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-accent/30 px-2.5 py-1 text-xs text-accent"
              >
                Не
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-accent/50 transition-colors active:text-red-500"
              aria-label="Изтрий оценката"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
              </svg>
            </button>
          )
        )}
      </div>
    </article>
  );
}
