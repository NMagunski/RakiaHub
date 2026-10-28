"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ThemePicker() {
  const [theme, setTheme] = useState("amber");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme || "amber");
    sync(); window.addEventListener("theme-changed", sync);
    return () => window.removeEventListener("theme-changed", sync);
  }, []);
  async function choose(value: "amber" | "atlas") {
    setTheme(value); document.documentElement.dataset.theme = value;
    localStorage.setItem("rakiq-theme", value);
    const client = createClient();
    const { data: { user } } = await client.auth.getUser();
    if (user) {
      const { error } = await client.from("profiles").update({ theme: value }).eq("id", user.id);
      setMessage(error ? "Запазено на устройството. Профилът не беше обновен." : "Темата е запазена.");
    }
  }
  return <section className="card p-4"><h2 className="font-serif text-xl mb-3">Твоят стил</h2><div className="grid grid-cols-2 gap-3">{([['amber','Amber Club','Крем, кехлибар и топлина'],['atlas','Balkan Atlas','Гора, ботаника и открития']] as const).map(([id,name,description]) => <button key={id} aria-pressed={theme===id} onClick={() => choose(id)} className={`rounded-xl border p-3 text-left ${theme===id?'border-walnut bg-cream':'border-cream'}`}><strong className="block">{name}</strong><span className="text-xs text-muted">{description}</span></button>)}</div><p role="status" className="text-xs mt-2">{message}</p></section>;
}
