export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getRakijaById } from "@/lib/queries/rakija";
import { notFound } from "next/navigation";
import { SPIRIT_CATEGORIES } from "@/lib/catalog";
import ProductArtwork from "@/components/rakija/ProductArtwork";
import BackButton from "@/components/rakija/BackButton";
import RateButton from "@/components/rakija/RateButton";
import WishlistButton from "@/components/rakija/WishlistButton";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import ShareButton from "@/components/ui/ShareButton";

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
  } catch (error) {
    if ((error as {code?:string}).code === "PGRST116" || (error as {code?:string}).code === "22P02") notFound();
    throw error;
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
      .order("tasted_at", { ascending: false }).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(1)
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
    <div className="product-page">
      <div className="product-hero">
        <ProductArtwork product={rakija} sizes="(max-width:760px) 100vw, 760px" priority />
        <div className="product-hero-nav"><BackButton /><ShareButton title={rakija.name} text={rakija.producer ? `${rakija.producer} · RAKIQ` : "RAKIQ"} url={`https://rakia-hub.vercel.app/rakija/${rakija.id}`} className="product-share" /></div>
      </div>
      <section className="product-panel">
        <div className="product-panel-handle" aria-hidden="true" />
        <p className="eyebrow">{FRUIT_BG[rakija.fruit || ""] || 'Откритие'} · {rakija.abv ? `${rakija.abv}% vol.` : 'RAKIQ'}</p>
        <h1>{rakija.name}</h1>
        <p className="product-origin">{[rakija.region, ({BG:'България',RS:'Сърбия',MK:'Северна Македония'} as Record<string,string>)[rakija.country_id || ''] || rakija.country].filter(Boolean).join(' · ')}</p>
        {rakija.producer && <p className="product-producer">{rakija.producer}{rakija.is_verified && <span> · Проверен продукт ✓</span>}</p>}
        <div className="product-rating-summary"><span className="product-star" aria-hidden="true">★</span><div><strong>{rakija.global_rating ? Number(rakija.global_rating).toFixed(1) : '—'}</strong><span> /10</span><p>Обща оценка</p></div><div className="product-rating-count"><span>{rakija.rating_count} {rakija.rating_count===1?"оценка":"оценки"}</span><Link href="/passport">Моят дневник →</Link></div></div>
        <RateButton rakijaId={rakija.id} rakijaName={rakija.name} rakijaProducer={rakija.producer} initialScore={myRating?.score} />
        <div className="product-wishlist"><WishlistButton rakijaId={rakija.id} initialState={isWishlisted} /></div>
      {/* My rating details */}
      {myRating && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">Моята оценка</h2>
          <div className="card px-4 py-4 space-y-3">
            {/* Score */}
            <div className="flex items-center gap-3">
              <div
                className="flex flex-col items-center justify-center rounded-xl px-3 py-2"
                style={{ background: "linear-gradient(145deg, #D4A574, rgb(var(--gold)))", minWidth: "3rem" }}
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

      {rakija.image_url && rakija.image_source && rakija.image_rights && <p className="product-image-credit">{rakija.image_attribution} · <a href={rakija.image_source} target="_blank" rel="noreferrer">Източник на снимката ↗</a> · {rakija.image_rights}</p>}
      {/* Rakija details */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">Детайли</h2>
        <div className="card divide-y divide-accent/10">
          <Row label="Категория" value={SPIRIT_CATEGORIES[rakija.category || "rakija"] || rakija.category} />
          {rakija.fruit && <Row label="Вид" value={FRUIT_BG[rakija.fruit || ""] ?? rakija.fruit} />}
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
      </section>
      <BottomNav />
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
