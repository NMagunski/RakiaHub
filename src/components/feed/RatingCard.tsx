"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NazdraveButton from "./NazdraveButton";
import FruitIcon from "@/components/ui/FruitIcon";

import type { Reactor } from "@/lib/queries/feed";

type Props = {
  rating: {
    id: string;
    score: number;
    aroma_tags: string[] | null;
    taste_tags: string[] | null;
    finish_tags: string[] | null;
    color_tags: string[] | null;
    aroma_note: string | null;
    taste_note: string | null;
    finish_note: string | null;
    venue_name: string | null;
    notes: string | null;
    created_at: string;
    rakija: { id: string; name: string; producer: string | null; fruit: string | null; type: string } | null;
    profiles: { id: string; username: string; avatar_url: string | null } | null;
  };
  reactions: { count: number; user_reacted: boolean; reactors: Reactor[] };
  currentUserId: string;
  onDelete?: (id: string) => void;
};

function ScoreBadge({ score }: { score: number }) {
  const isGold   = score >= 9.0;
  const isAmber  = score >= 7.0 && score < 9.0;

  const bg = isGold
    ? "linear-gradient(145deg, #D4A574 0%, #C8882A 100%)"
    : isAmber
    ? "linear-gradient(145deg, #C8956D 0%, #A0724A 100%)"
    : "linear-gradient(145deg, #8A7968 0%, #6B6459 100%)";

  const shadow = isGold
    ? "0 2px 14px rgba(200,136,42,0.45), 0 1px 0 rgba(255,255,255,0.18) inset"
    : "0 2px 8px rgba(44,24,16,0.18), 0 1px 0 rgba(255,255,255,0.12) inset";

  return (
    <div
      className="shrink-0 flex flex-col items-center justify-center h-13 w-13 rounded-2xl"
      style={{ background: bg, boxShadow: shadow, minWidth: "3.25rem", minHeight: "3.25rem" }}
    >
      <span className="text-xl font-bold text-white leading-none tracking-tight">{score}</span>
      <span className="text-[10px] leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>/10</span>
    </div>
  );
}

const TAG_BG = "rgba(107,68,35,0.08)";
const TAG_BORDER = "rgba(107,68,35,0.14)";

export default function RatingCard({ rating, reactions, currentUserId, onDelete }: Props) {
  const { rakija, profiles } = rating;
  const [confirming, setConfirming] = useState(false);

  const allTags = [
    ...(rating.aroma_tags ?? []),
    ...(rating.taste_tags ?? []),
    ...(rating.finish_tags ?? []),
    ...(rating.color_tags ?? []),
  ].slice(0, 5);

  const dateStr = new Date(rating.created_at).toLocaleDateString("bg-BG", {
    day: "numeric", month: "short",
  });

  return (
    <article className="card animate-fade-in overflow-hidden">
      {/* User row */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-walnut overflow-hidden ring-2 ring-walnut/10" style={{ background: "rgba(107,68,35,0.10)" }}>
          {profiles?.avatar_url ? (
            <Image src={profiles.avatar_url} alt={profiles.username} width={32} height={32} className="object-cover" />
          ) : (
            profiles?.username[0].toUpperCase() ?? "?"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/u/${profiles?.username}`} className="text-sm font-semibold text-walnut hover:underline">
            @{profiles?.username}
          </Link>
          <span className="text-sm" style={{ color: "#8A7968" }}> оцени</span>
        </div>
        <span className="text-xs" style={{ color: "rgba(138,121,104,0.7)" }}>{dateStr}</span>
      </div>

      {/* Rakija row */}
      <Link href={`/rakija/${rakija?.id}`} className="flex items-center gap-3 px-4 pb-4">
        <FruitIcon fruit={rakija?.fruit ?? null} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif font-semibold text-oak leading-snug" style={{ fontSize: "1.0625rem" }}>
            {rakija?.name}
          </p>
          {rakija?.producer && (
            <p className="truncate text-xs mt-0.5 font-medium" style={{ color: "#8A7968" }}>{rakija.producer}</p>
          )}
          {rating.venue_name && (
            <p className="truncate text-xs mt-0.5 flex items-center gap-1" style={{ color: "rgba(138,121,104,0.80)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0">
                <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              {rating.venue_name}
            </p>
          )}
        </div>
        <ScoreBadge score={rating.score} />
      </Link>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3.5">
          {allTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-1 text-xs font-medium text-walnut"
              style={{ background: TAG_BG, border: `1px solid ${TAG_BORDER}` }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* General note */}
      {rating.notes && (
        <p className="px-4 pb-3.5 text-sm italic leading-relaxed line-clamp-2" style={{ color: "#8A7968" }}>
          &ldquo;{rating.notes}&rdquo;
        </p>
      )}

      {/* Detail notes (aroma / taste / finish) */}
      {(rating.aroma_note || rating.taste_note || rating.finish_note) && (
        <div className="mx-4 mb-3.5 space-y-1 rounded-xl px-3 py-2.5" style={{ background: "rgba(107,68,35,0.05)", border: "1px solid rgba(107,68,35,0.09)" }}>
          {rating.aroma_note && (
            <p className="text-xs leading-relaxed" style={{ color: "#6B4423" }}>
              <span className="font-semibold">Аромат: </span>{rating.aroma_note}
            </p>
          )}
          {rating.taste_note && (
            <p className="text-xs leading-relaxed" style={{ color: "#6B4423" }}>
              <span className="font-semibold">Вкус: </span>{rating.taste_note}
            </p>
          )}
          {rating.finish_note && (
            <p className="text-xs leading-relaxed" style={{ color: "#6B4423" }}>
              <span className="font-semibold">Финал: </span>{rating.finish_note}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center px-4 py-2.5"
        style={{ borderTop: "1px solid rgba(44,24,16,0.07)" }}
      >
        <NazdraveButton
          ratingId={rating.id}
          initialCount={reactions.count}
          initialReacted={reactions.user_reacted}
          userId={currentUserId}
          reactors={reactions.reactors}
        />

        {onDelete && rating.profiles?.id === currentUserId && (
          confirming ? (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-oak">Изтрий?</span>
              <button
                onClick={() => { onDelete(rating.id); setConfirming(false); }}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-white"
                style={{ background: "#C0392B" }}
              >
                Да
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg border px-2.5 py-1 text-xs font-medium text-muted"
                style={{ borderColor: "rgba(44,24,16,0.15)" }}
              >
                Не
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors"
              style={{ color: "rgba(138,121,104,0.55)" }}
              aria-label="Изтрий оценката"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
              </svg>
            </button>
          )
        )}
      </div>
    </article>
  );
}
