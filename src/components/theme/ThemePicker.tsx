"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ThemePicker({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState("amber");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme || "amber");
    sync(); window.addEventListener("theme-changed", sync);
    return () => window.removeEventListener("theme-changed", sync);
  }, []);
  async function choose(value: "amber" | "atlas") {
    if (saving) return;
    setSaving(true);
    setMessage("");
    setTheme(value); document.documentElement.dataset.theme = value;
    try { localStorage.setItem("rakiq-theme", value); } catch {}
    window.dispatchEvent(new Event("theme-changed"));
    try {
    const client = createClient();
    const { data: { user } } = await client.auth.getUser();
    if (user) {
      const { error } = await client.from("profiles").update({ theme: value }).eq("id", user.id);
      setMessage(error ? "Запазено на устройството. Профилът не беше обновен." : "Темата е запазена.");
    } else setMessage("Темата е запазена на устройството.");
    } catch { setMessage("Темата е приложена. Запазването в профила не успя."); }
    finally { setSaving(false); }
  }
  if (compact) return <div className="login-theme-choice" role="group" aria-label="Избери тема">{([['amber','Amber Club'],['atlas','Balkan Atlas']] as const).map(([id,label]) => <button key={id} type="button" disabled={saving} aria-pressed={theme===id} onClick={() => choose(id)}><span aria-hidden="true" className={`theme-dot ${id}`} />{label}</button>)}<span className="sr-only" role="status">{message}</span></div>;
  return <section className="card p-4"><h2 className="font-serif text-xl mb-3">Твоят стил</h2><div className="grid grid-cols-2 gap-3">{([['amber','Amber Club','Крем, кехлибар и топлина'],['atlas','Balkan Atlas','Гора, ботаника и открития']] as const).map(([id,name,description]) => <button key={id} disabled={saving} aria-pressed={theme===id} onClick={() => choose(id)} className={`rounded-xl border p-3 text-left ${theme===id?'border-walnut bg-cream':'border-cream'}`}><div className={`theme-preview ${id}`} aria-hidden="true"><span>RAKIQ</span></div><strong className="block">{name}</strong><span className="text-xs text-muted">{description}</span></button>)}</div><p role="status" className="text-xs mt-2">{message}</p></section>;
}
