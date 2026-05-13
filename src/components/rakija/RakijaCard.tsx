import Link from "next/link";
import type { Rakija } from "@/types/app";
import FruitIcon from "@/components/ui/FruitIcon";

type Props = {
  rakija: Pick<Rakija, "id" | "name" | "producer" | "fruit" | "region" | "country" | "type" | "abv" | "global_rating" | "rating_count" | "is_verified">;
};

const FRUIT_BG: Record<string, string> = {
  plum: "слива", grape: "грозде", apricot: "кайсия",
  pear: "круша", fig: "смокиня", quince: "дюля",
  mixed: "смесена", other: "друга",
};

export default function RakijaCard({ rakija }: Props) {
  return (
    <Link
      href={`/rakija/${rakija.id}`}
      className="card flex items-center gap-3 px-4 py-3 active:scale-[0.98] transition-transform"
    >
      <FruitIcon fruit={rakija.fruit} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-semibold text-oak">{rakija.name}</p>
          {rakija.is_verified && (
            <span className="shrink-0 rounded-full bg-verified/10 px-1.5 py-0.5 text-[10px] font-medium text-verified">
              ✓
            </span>
          )}
        </div>
        <p className="truncate text-sm text-walnut">
          {[rakija.producer, FRUIT_BG[rakija.fruit ?? ""] ?? rakija.fruit, rakija.region]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {rakija.global_rating ? (
          <>
            <p className="text-base font-bold text-gold">{rakija.global_rating}</p>
            <p className="text-[10px] text-accent">{rakija.rating_count} оц.</p>
          </>
        ) : (
          <p className="text-xs text-accent/60">без оц.</p>
        )}
      </div>
    </Link>
  );
}
