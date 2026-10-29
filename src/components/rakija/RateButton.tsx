"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const RatingBottomSheet = dynamic(() => import("@/components/rating/RatingBottomSheet"), { ssr: false });
type Props = { rakijaId: string; rakijaName: string; rakijaProducer: string | null; initialScore?: number };

export default function RateButton({ rakijaId, rakijaName, rakijaProducer, initialScore }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false), [score, setScore] = useState(initialScore || 7), [busy, setBusy] = useState(false), [error, setError] = useState(""), [saved, setSaved] = useState(false);
  const request = useRef<string | null>(null);
  async function save() {
    if (busy) return;
    setBusy(true); setError("");
    request.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/ratings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rakija_id: rakijaId, score, request_id: request.current }) });
      if (!response.ok) throw new Error(response.status === 401 ? "Влез в профила си, за да запазиш дегустация." : "Запазването не успя. Опитай отново.");
      request.current = null; setSaved(true);
      window.dispatchEvent(new Event("rating-saved"));
      router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Запазването не успя."); }
    finally { setBusy(false); }
  }
  return <section className="product-rate" aria-label="Лична дегустация">
    <label htmlFor="product-score">Оцени тази ракия</label>
    <div className="product-range"><input id="product-score" type="range" min="1" max="10" step="0.5" disabled={busy} value={score} className="slider" style={{ "--val": score } as React.CSSProperties} onChange={e => { setScore(Number(e.target.value)); setSaved(false); request.current = null; }} /><output htmlFor="product-score">{score.toFixed(1)}</output></div>
    <div className="product-scale"><span>1<br/>Не ми харесва</span><span>5<br/>Средна</span><span>10<br/>Превъзходна</span></div>
    {saved ? <div role="status" className="rating-saved">Дегустацията е записана. <Link href="/passport">Виж в паспорта →</Link><button onClick={() => setSaved(false)}>Нова дегустация</button></div> : <button className="btn-primary" disabled={busy} onClick={save}>{busy ? "Запазване…" : "Запази оценката"}</button>}
    {error && <p role="alert" className="text-sm text-red-700 mt-3">{error}</p>}
    <button aria-label="Оцени тази ракия" className="rating-details-button" onClick={() => setOpen(true)}>Оцени тази ракия<span>Добави бележки, вкусове и място →</span></button>
    {open && <RatingBottomSheet onClose={() => setOpen(false)} initialScore={score} preselected={{ kind: "existing", id: rakijaId, name: rakijaName, producer: rakijaProducer }} />}
  </section>;
}
