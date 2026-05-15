export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import FruitIcon from "@/components/ui/FruitIcon";
import type { Rakija } from "@/types/app";

type WishlistItem = {
  id: string;
  rakija_id: string;
  created_at: string;
  rakija: Pick<Rakija, "id" | "name" | "producer" | "fruit"> | null;
};

export default async function WishlistPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = user
    ? await supabase
        .from("wishlists")
        .select("id, rakija_id, created_at, rakija:rakija_id(id, name, producer, fruit)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const wishlist = (data ?? []) as WishlistItem[];

  return (
    <div className="px-4 pt-5 pb-8">
      <h1 className="mb-5 font-serif text-2xl font-bold text-oak">Искам да пробвам</h1>

      {wishlist.length === 0 ? (
        <div className="mt-24 flex flex-col items-center gap-3 text-center">
          <span className="text-5xl">🔖</span>
          <p className="font-semibold text-oak">Списъкът е празен</p>
          <p className="text-sm text-walnut">Намери ракия в Търсене и я запази за по-късно.</p>
          <Link
            href="/discover"
            className="mt-2 rounded-2xl bg-walnut px-5 py-2.5 text-sm font-semibold text-cream"
          >
            Към търсене
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {wishlist.map((item) => (
            <Link
              key={item.id}
              href={`/rakija/${item.rakija_id}`}
              className="card flex items-center gap-3 px-4 py-3"
            >
              <FruitIcon fruit={item.rakija?.fruit ?? null} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-oak text-sm">{item.rakija?.name}</p>
                {item.rakija?.producer && (
                  <p className="truncate text-xs text-walnut mt-0.5">{item.rakija.producer}</p>
                )}
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-accent/40">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
