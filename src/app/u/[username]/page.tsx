import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FruitIcon from "@/components/ui/FruitIcon";
import { computeBadges } from "@/lib/badges";
import type { RatingForBadges } from "@/lib/badges";

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, created_at")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: ratings } = await supabase
    .from("ratings")
    .select("id, score, notes, created_at, rakija:rakija_id(id, name, producer, fruit)")
    .eq("user_id", profile.id)
    .eq("is_private", false)
    .order("created_at", { ascending: false })
    .limit(50);

  const ratingList = (ratings ?? []) as RatingForBadges[];
  const badges = computeBadges(ratingList);

  const uniqueRakijas = new Set(ratingList.map((r) => (r as RatingForBadges & { rakija?: { id: string } | null }).rakija?.id).filter(Boolean)).size;
  const avgScore = ratingList.length > 0
    ? (ratingList.reduce((s, r) => s + r.score, 0) / ratingList.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen px-4 pt-8 pb-12 max-w-lg mx-auto">
      {/* Back */}
      <Link
        href="/discover"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Назад
      </Link>

      {/* Avatar + name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream ring-2 ring-accent/20">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-walnut">
              {profile.username[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-oak leading-tight">
            {profile.display_name || profile.username}
          </p>
          {profile.display_name && (
            <p className="text-sm text-accent mt-0.5">@{profile.username}</p>
          )}
          <p className="text-xs text-accent/60 mt-1">
            Член от {new Date(profile.created_at).toLocaleDateString("bg-BG", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="card px-3 py-3 text-center">
          <p className="text-2xl font-bold text-oak">{ratingList.length}</p>
          <p className="text-xs text-accent mt-0.5">Оценки</p>
        </div>
        <div className="card px-3 py-3 text-center">
          <p className="text-2xl font-bold text-oak">{uniqueRakijas}</p>
          <p className="text-xs text-accent mt-0.5">Напитки</p>
        </div>
        <div className="card px-3 py-3 text-center">
          <p className="text-2xl font-bold text-gold">{avgScore ?? "—"}</p>
          <p className="text-xs text-accent mt-0.5">Средна</p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">Значки</p>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <div
                key={b.id}
                title={b.description}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.60)", color: "#7A5230" }}
              >
                <span>{b.emoji}</span>
                <span>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent ratings */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
          Последни оценки
        </p>
        {ratingList.length === 0 ? (
          <div className="card px-4 py-6 text-center">
            <p className="text-sm text-walnut">Няма публични оценки</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ratingList.map((r) => {
              const rakija = (r as RatingForBadges & { rakija?: { id: string; name: string; producer: string | null; fruit: string | null } | null }).rakija;
              return (
                <Link
                  key={r.id}
                  href={`/rakija/${rakija?.id}`}
                  className="card flex items-center gap-3 px-4 py-3"
                >
                  <FruitIcon fruit={rakija?.fruit ?? null} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-oak text-sm">{rakija?.name}</p>
                    {rakija?.producer && (
                      <p className="truncate text-xs text-walnut mt-0.5">{rakija.producer}</p>
                    )}
                    <p className="text-xs text-accent/60 mt-0.5">
                      {new Date(r.created_at).toLocaleDateString("bg-BG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-center justify-center h-9 w-9 rounded-xl bg-gold/10">
                    <span className="text-sm font-bold text-gold leading-none">{r.score}</span>
                    <span className="text-[9px] text-gold/60 leading-none mt-0.5">/10</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
