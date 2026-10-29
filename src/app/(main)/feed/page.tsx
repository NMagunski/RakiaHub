"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import BalkanMap from "@/components/design/BalkanMap";
import BotanicalSprig from "@/components/design/BotanicalSprig";
import { createClient } from "@/lib/supabase/client";
import { getFeed, getReactionCounts, type FeedRating, type Reactor } from "@/lib/queries/feed";
import RatingCard from "@/components/feed/RatingCard";

const PULL_THRESHOLD = 72;

export default function FeedPage() {
  const supabase = createClient();
  const [scope, setScope] = useState<"friends" | "mine">("friends");
  const revision = useRef(0);
  const [error, setError] = useState("");
  const [items, setItems] = useState<FeedRating[]>([]);
  const [reactionMap, setReactionMap] = useState<Record<string, { count: number; user_reacted: boolean; reactors: Reactor[] }>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function deleteRating(id: string) {
    const response = await fetch("/api/ratings", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error("Delete failed");
    setItems(prev => prev.filter(item => item.id !== id));
  }

  const load = useCallback(async (isRefresh = false) => {
    const request = ++revision.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      if (request !== revision.current) return;
      setUserId(user.id);

      const feed = await getFeed(supabase, scope, user.id);
      const reactions = await getReactionCounts(supabase, feed.map((i) => i.id));
      if (request !== revision.current) return;
      setItems(feed);
      setReactionMap(reactions);
    } catch {
      if (request === revision.current) setError("Наздравиците не бяха заредени. Опитай отново.");
    } finally {
      if (request === revision.current) { setLoading(false); setRefreshing(false); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // This ref is a request generation counter, not a DOM ref.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); return () => { revision.current++; }; }, [load]);

  useEffect(() => {
    const onRatingSaved = () => load(true);
    window.addEventListener("rating-saved", onRatingSaved);
    return () => window.removeEventListener("rating-saved", onRatingSaved);
  }, [load]);

  // Pull-to-refresh touch handlers — scoped to feed container only,
  // so fixed overlays (bottom sheet) outside this DOM subtree never trigger it.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      if (window.scrollY !== 0) return;
      touchStartY.current = e.touches[0].clientY;
      pulling.current = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!pulling.current) return;
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 0 && window.scrollY === 0) {
        setPullY(Math.min(delta * 0.5, PULL_THRESHOLD + 16));
      }
    }

    function onTouchEnd() {
      if (pullY >= PULL_THRESHOLD) load(true);
      pulling.current = false;
      setPullY(0);
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [pullY, load]);

  return (
    <div ref={containerRef} className="nazdravitsi-page">
      <BotanicalSprig className="feed-botanical" />
      <header className="nazdravitsi-heading"><div><p className="login-kicker">СПОДЕЛЕНИ МОМЕНТИ</p><h1>Наздравици</h1><p>Споделени вкусове и нови истории.</p></div><Link href="/discover">Открий нова ракия →</Link></header>
      <div className="nazdravitsi-layout"><section aria-label="Дегустации" className="nazdravitsi-main">
      <div className="feed-tabs" role="group" aria-label="Чии наздравици">{([['friends','Приятели'],['mine','Моите']] as const).map(([id,label]) => <button key={id} aria-pressed={scope === id} onClick={() => setScope(id)}>{label}</button>)}</div>
      {error && <div className="card m-4 p-4" role="alert">{error} <button className="underline" onClick={()=>load()}>Повтори</button></div>}
      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullY > 0 ? pullY : refreshing ? 48 : 0 }}
      >
        <div className={`h-5 w-5 rounded-full border-2 border-accent border-t-walnut ${refreshing || pullY >= PULL_THRESHOLD ? "animate-spin" : ""}`} />
      </div>

      <div className="feed-cards" aria-busy={loading || refreshing}>
        {loading ? (
          <><span role="status" className="sr-only">Зареждане на наздравици…</span><FeedSkeleton /></>
        ) : error ? null : items.length === 0 ? (
          <EmptyFeed mine={scope === "mine"} />
        ) : (
          items.map((item) => (
            <RatingCard
              key={`${item.id}:${reactionMap[item.id]?.count}:${reactionMap[item.id]?.user_reacted}`}
              rating={item}
              reactions={reactionMap[item.id] ?? { count: 0, user_reacted: false, reactors: [] }}
              currentUserId={userId ?? ""}
              onDelete={deleteRating}
            />
          ))
        )}
      </div>
      </section><aside className="feed-sidebar"><section><h2>Моят паспорт</h2><BalkanMap decorative className="feed-passport-map" /><p>Всяка дегустация е нова страница в твоето пътешествие.</p><Link href="/passport">Отвори паспорта →</Link></section><section><h2>Намери приятели</h2><p>Свържи се с хора, които споделят твоя вкус.</p><Link href="/friends">Намери приятели →</Link></section></aside></div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-cream" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 animate-pulse rounded bg-cream" />
            </div>
            <div className="h-3 w-10 animate-pulse rounded bg-cream" />
          </div>
          <div className="flex items-center gap-3 px-4 pb-4">
            <div className="h-11 w-11 animate-pulse rounded-xl bg-cream" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-cream" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-cream" />
            </div>
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-cream" />
          </div>
          <div className="border-t border-accent/10 px-4 py-3">
            <div className="h-7 w-24 animate-pulse rounded-full bg-cream" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyFeed({ mine }: { mine: boolean }) {
  return <div className="feed-empty"><span aria-hidden="true">🥂</span><h2>{mine ? "Твоите наздравици започват тук" : "Още няма наздравици от приятели"}</h2><p>{mine ? "Оцени първата си ракия и запази спомена в паспорта." : "Намери приятели и виж техните споделени дегустации."}</p><Link href={mine ? "/discover" : "/friends"}>{mine ? "Открий ракия →" : "Намери приятели →"}</Link></div>;
}
