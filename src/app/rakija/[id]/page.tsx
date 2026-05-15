export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getRakijaById } from "@/lib/queries/rakija";
import { notFound } from "next/navigation";
import FruitIcon from "@/components/ui/FruitIcon";
import BackButton from "@/components/rakija/BackButton";
import RateButton from "@/components/rakija/RateButton";
import WishlistButton from "@/components/rakija/WishlistButton";

const FRUIT_BG: Record<string, string> = {
  plum: "Сливова", grape: "Гроздова", apricot: "Кайсиева",
  pear: "Крушова", fig: "Смокинева", quince: "Дюлева",
  mixed: "Смесена", other: "Друга",
};

const TAG_LABELS: Record<string, string> = {
  // aroma
  fruity: "Плодово", plum: "Слива", apricot: "Кайсия", oaky: "Дъбово",
  floral: "Цветно", spirity: "Спиртово", earthy: "Земно", honey: "Мед", vanilla: "Ванилия",
  // taste
  sweet: "Сладко", dry: "Сухо", smooth: "Мек", sharp: "Остър",
  balanced: "Балансиран", buttery: "Масленост", spicy: "Пикантно", bitter: "Горчиво",
  // finish
  short: "Кратък", long: "Дълъг", warm: "Топъл",
  // color
  clear: "Бистра", golden: "Златиста", amber: "Кехлибарена", cloudy: "Мътна", dark: "Тъмна",
};

export default async function RakijaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  let rakija;
  try {
    rakija = await getRakijaById(supabase, params.id);
  } catch {
    notFound();
  }

  // Fetch current user's rating for this rakija (if logged in)
  const { data: { user } } = await supabase.auth.getUser();
  let myRating: {
    id: string; score: number;
    aroma_tags: string[] | null; taste_tags: string[] | null;
    finish_tags: string[] | null; color_tags: string[] | null;
    aroma_note: string | null; taste_note: string | null;
    finish_note: string | null; venue_name: string | null; notes: string | null;
  } | null = null;

  if (user) {
    const { data } = await supabase
      .from("ratings")
      .select("id, score, aroma_tags, taste_tags, finish_tags, color_tags, aroma_note, taste_note, finish_note, venue_name, notes")
      .eq("rakija_id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
    myRating = data;
  }

  let isWishlisted = false;
  if (user) {
    const { data: wl } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("rakija_id", params.id)
      .maybeSingle();
    isWishlisted = !!wl;
  }

  const allMyTags = [
    ...(myRating?.aroma_tags ?? []),
    ...(myRating?.taste_tags ?? []),
    ...(myRating?.finish_tags ?? []),
    ...(myRating?.color_tags ?? []),
  ];

  return (
    <div className="px-4 pt-4 pb-8">
      {/* Nav */}
      <div className="mb-5">
        <BackButton />
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <FruitIcon fruit={rakija.fruit} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-xl font-bold text-oak">{rakija.name}</h1>
            {rakija.is_verified && (
              <span className="rounded-full bg-verified/10 px-2 py-0.5 text-xs font-medium text-verified">
                Верифицирана
              </span>
            )}
          </div>
          {rakija.producer && (
            <p className="text-sm text-walnut">{rakija.producer}</p>
          )}
        </div>
      </div>

      {/* Rating badge */}
      {rakija.global_rating ? (
        <div className="card mb-6 flex items-center gap-4 px-5 py-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-gold">{rakija.global_rating}</p>
            <p className="text-xs text-accent">от 10</p>
          </div>
          <div className="h-10 w-px bg-accent/20" />
          <div>
            <p className="font-medium text-oak">{rakija.rating_count} оценки</p>
            <p className="text-sm text-walnut">глобален рейтинг</p>
          </div>
        </div>
      ) : (
        <div className="card mb-6 px-5 py-4 text-center">
          <p className="text-2xl mb-2">🥃</p>
          <p className="font-medium text-oak">Бъди първия!</p>
          <p className="text-sm text-walnut mt-1">Все още няма оценки за тази ракия.</p>
        </div>
      )}

      {/* Rate button */}
      <div className="mb-3">
        <RateButton
          rakijaId={rakija.id}
          rakijaName={rakija.name}
          rakijaProducer={rakija.producer}
        />
      </div>

      {/* Wishlist button */}
      <div className="mb-6">
        <WishlistButton rakijaId={rakija.id} initialState={isWishlisted} />
      </div>

      {/* My rating details */}
      {myRating && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">Моята оценка</h2>
          <div className="card px-4 py-4 space-y-3">
            {/* Score */}
            <div className="flex items-center gap-3">
              <div
                className="flex flex-col items-center justify-center rounded-xl px-3 py-2"
                style={{ background: "linear-gradient(145deg, #D4A574, #C8882A)", minWidth: "3rem" }}
              >
                <span className="text-lg font-bold text-white leading-none">{myRating.score}</span>
                <span className="text-[9px] text-white/65 leading-none">/10</span>
              </div>
              {myRating.venue_name && (
                <p className="text-xs text-muted flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 shrink-0">
                    <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"/>
                    <circle cx="12" cy="9" r="2.5"/>
                  </svg>
                  {myRating.venue_name}
                </p>
              )}
            </div>

            {/* Tags */}
            {allMyTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allMyTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2.5 py-1 text-xs font-medium text-walnut"
                    style={{ background: "rgba(107,68,35,0.08)", border: "1px solid rgba(107,68,35,0.14)" }}
                  >
                    {TAG_LABELS[tag] ?? tag}
                  </span>
                ))}
              </div>
            )}

            {/* Per-section notes */}
            {(myRating.aroma_note || myRating.taste_note || myRating.finish_note) && (
              <div className="space-y-1.5 rounded-xl px-3 py-2.5" style={{ background: "rgba(107,68,35,0.05)", border: "1px solid rgba(107,68,35,0.09)" }}>
                {myRating.aroma_note && (
                  <p className="text-xs leading-relaxed text-walnut">
                    <span className="font-semibold">Аромат: </span>{myRating.aroma_note}
                  </p>
                )}
                {myRating.taste_note && (
                  <p className="text-xs leading-relaxed text-walnut">
                    <span className="font-semibold">Вкус: </span>{myRating.taste_note}
                  </p>
                )}
                {myRating.finish_note && (
                  <p className="text-xs leading-relaxed text-walnut">
                    <span className="font-semibold">Финал: </span>{myRating.finish_note}
                  </p>
                )}
              </div>
            )}

            {/* General notes */}
            {myRating.notes && (
              <p className="text-sm italic leading-relaxed text-muted">
                &ldquo;{myRating.notes}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Rakija details */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">Детайли</h2>
        <div className="card divide-y divide-accent/10">
          {rakija.fruit && <Row label="Вид" value={FRUIT_BG[rakija.fruit] ?? rakija.fruit} />}
          {rakija.region && <Row label="Регион" value={rakija.region} />}
          {rakija.country && <Row label="Страна" value={rakija.country} />}
          {rakija.abv && <Row label="Алкохол" value={`${rakija.abv}%`} />}
          {rakija.vintage_year && <Row label="Реколта" value={String(rakija.vintage_year)} />}
        </div>

        {rakija.description && (
          <div className="card px-4 py-4">
            <p className="text-sm leading-relaxed text-walnut">{rakija.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-accent">{label}</span>
      <span className="text-sm font-medium text-oak">{value}</span>
    </div>
  );
}
