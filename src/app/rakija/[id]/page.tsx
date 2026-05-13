import { createClient } from "@/lib/supabase/server";
import { getRakijaById } from "@/lib/queries/rakija";
import { notFound } from "next/navigation";
import FruitIcon from "@/components/ui/FruitIcon";
import BackButton from "@/components/rakija/BackButton";
import RateButton from "@/components/rakija/RateButton";

const FRUIT_BG: Record<string, string> = {
  plum: "Сливова", grape: "Гроздова", apricot: "Кайсиева",
  pear: "Крушова", fig: "Смокинева", quince: "Дюлева",
  mixed: "Смесена", other: "Друга",
};

export default async function RakijaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  let rakija;
  try {
    rakija = await getRakijaById(supabase, params.id);
  } catch {
    notFound();
  }

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
            <h1 className="text-xl font-bold text-oak">{rakija.name}</h1>
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
      <div className="mb-6">
        <RateButton
          rakijaId={rakija.id}
          rakijaName={rakija.name}
          rakijaProducer={rakija.producer}
        />
      </div>

      {/* Details */}
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
