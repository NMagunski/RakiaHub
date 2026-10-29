"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NazdraveButton from "./NazdraveButton";
import ShareButton from "@/components/ui/ShareButton";
import { TAG_LABELS } from "@/lib/tasting-labels";
import ProductArtwork from "@/components/rakija/ProductArtwork";
import type { FeedRating, Reactor } from "@/lib/queries/feed";

type Props = {
  rating: FeedRating;
  reactions: { count: number; user_reacted: boolean; reactors: Reactor[] };
  currentUserId: string;
  onDelete?: (id: string) => Promise<void>;
};

export default function RatingCard({ rating, reactions, currentUserId, onDelete }: Props) {
  const { rakija, profiles } = rating;
  const [menu, setMenu] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const tags = Array.from(new Set([...(rating.aroma_tags ?? []), ...(rating.taste_tags ?? []), ...(rating.finish_tags ?? []), ...(rating.color_tags ?? [])])).slice(0, 6);
  const own = profiles?.id === currentUserId && onDelete;
  async function remove() {
    if (!onDelete || deleting) return;
    setDeleting(true); setError("");
    try { await onDelete(rating.id); }
    catch { setError("Оценката не беше изтрита. Опитай отново."); setDeleting(false); }
  }
  return <article className="tasting-card">
    <header className="tasting-author">
      <div className="tasting-avatar">{profiles?.avatar_url ? <Image src={profiles.avatar_url} alt="" width={32} height={32} /> : (profiles?.username?.[0]?.toUpperCase() || "?")}</div>
      {profiles ? <Link href={`/u/${profiles.username}`}>@{profiles.username}</Link> : <span>Потребител</span>}
      <span aria-hidden="true">·</span><time dateTime={rating.created_at}>{new Date(rating.created_at).toLocaleDateString("bg-BG", { day: "numeric", month: "short", year: "numeric" })}</time>
      {own && <div className="tasting-menu" onKeyDown={e => { if (e.key === "Escape") { setMenu(false); setConfirming(false); e.currentTarget.querySelector("button")?.focus(); } }}>
        <button type="button" aria-label="Действия за собствената оценка" aria-expanded={menu} onClick={() => setMenu(!menu)}>···</button>
        {menu && <div className="tasting-menu-panel">{confirming ? <><p>Да изтрием ли оценката?</p><button disabled={deleting} onClick={remove}>{deleting ? "Изтриване…" : "Да, изтрий"}</button><button disabled={deleting} onClick={() => { setConfirming(false); setMenu(false); }}>Отказ</button></> : <button onClick={() => setConfirming(true)}>Изтрий оценката</button>}</div>}
      </div>}
    </header>
    <div className="tasting-body">
      {rakija && <Link href={`/rakija/${rakija.id}`} className="tasting-picture" aria-label={`Виж ${rakija.name}`}><ProductArtwork landscape product={rakija} sizes="(max-width: 420px) 85vw, 230px" /></Link>}
      <div className="tasting-content">
        <div>{rakija ? <Link href={`/rakija/${rakija.id}`} className="tasting-name">{rakija.name}</Link> : <h2 className="tasting-name">Недостъпен продукт</h2>}
        {rakija?.producer && <p className="tasting-producer">{rakija.producer}</p>}
        {(rakija?.region || rakija?.country) && <p className="tasting-origin">⌖ {[rakija.region, ({Bulgaria:"България",Serbia:"Сърбия","North Macedonia":"Северна Македония"} as Record<string,string>)[rakija.country || ""] || rakija.country].filter(Boolean).join(" · ")}</p>}</div>
        <div className="tasting-score"><span>Лична оценка</span><strong>{Number(rating.score).toFixed(1)}<small> /10</small></strong></div>
        {rating.notes && <p className="tasting-note">{rating.notes}</p>}
        {(rating.aroma_note || rating.taste_note || rating.finish_note) && <div className="tasting-detail-notes">{[["Аромат",rating.aroma_note],["Вкус",rating.taste_note],["Финал",rating.finish_note]].map(([label,note]) => note && <p key={label}><strong>{label}: </strong>{note}</p>)}</div>}
        {tags.length > 0 && <div className="tasting-tags">{tags.map(tag => <span key={tag}>{TAG_LABELS[tag] || tag}</span>)}</div>}
        {rating.venue_name && <p className="tasting-origin">Място: {rating.venue_name}</p>}
      </div>
    </div>
    <footer className="tasting-actions"><NazdraveButton ratingId={rating.id} initialCount={reactions.count} initialReacted={reactions.user_reacted} userId={currentUserId} reactors={reactions.reactors} />{rakija && <ShareButton title={`${rakija.name} — ${rating.score}/10`} text={rating.notes || undefined} url={typeof window === "undefined" ? `/rakija/${rakija.id}` : `${window.location.origin}/rakija/${rakija.id}`} className="tasting-share" />}</footer>
    {error && <p role="alert" className="tasting-error">{error}</p>}
  </article>;
}
