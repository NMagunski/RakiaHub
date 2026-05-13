"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getFeed, getReactionCounts, type FeedRating } from "@/lib/queries/feed";
import RatingCard from "@/components/feed/RatingCard";

const PULL_THRESHOLD = 72;

export default function FeedPage() {
  const supabase = createClient();
  const [items, setItems] = useState<FeedRating[]>([]);
  const [reactionMap, setReactionMap] = useState<Record<string, { count: number; user_reacted: boolean }>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0);
  const pulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  async function deleteRating(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch("/api/ratings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);

      const feed = await getFeed(supabase);
      const reactions = await getReactionCounts(supabase, feed.map((i) => i.id));
      setItems(feed);
      setReactionMap(reactions);
    } catch (e) {
      console.error("Feed error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { load(); }, [load]);

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
    <div ref={containerRef} className="flex flex-col">
      {/* Pull-to-refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: pullY > 0 ? pullY : refreshing ? 48 : 0 }}
      >
        <div className={`h-5 w-5 rounded-full border-2 border-accent border-t-walnut ${refreshing || pullY >= PULL_THRESHOLD ? "animate-spin" : ""}`} />
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {loading ? (
          <FeedSkeleton />
        ) : items.length === 0 ? (
          <EmptyFeed />
        ) : (
          items.map((item) => (
            <RatingCard
              key={item.id}
              rating={item}
              reactions={reactionMap[item.id] ?? { count: 0, user_reacted: false }}
              currentUserId={userId ?? ""}
              onDelete={deleteRating}
            />
          ))
        )}
      </div>
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

function EmptyFeed() {
  return (
    <div className="mt-16 flex flex-col items-center gap-3 text-center px-6">
      <span className="text-5xl">🥃</span>
      <p className="text-lg font-semibold text-oak">Добре дошъл в RakiaHub!</p>
      <p className="text-sm text-walnut">
        Натисни бутилката долу вдясно и оцени първата си напитка.
      </p>
    </div>
  );
}
