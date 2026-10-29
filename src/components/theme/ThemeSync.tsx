"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ThemeSync() {
  useEffect(() => {
    const client = createClient();
    let active = true;
    let generation = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    async function sync(userId: string, revision: number) {
      const { data } = await client.from("profiles").select("theme").eq("id", userId).single();
      if (!active || revision !== generation) return;
      if (data?.theme === "amber" || data?.theme === "atlas") {
        document.documentElement.dataset.theme = data.theme;
        try { localStorage.setItem("rakiq-theme", data.theme); } catch {}
        window.dispatchEvent(new Event("theme-changed"));
      }
    }
    // Schedule outside Supabase's auth callback: SDK requests inside it can
    // wait for the same auth lock that is currently dispatching the callback.
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      const revision = ++generation;
      if (!session?.user || event === "TOKEN_REFRESHED") return;
      const userId = session.user.id;
      const timer = setTimeout(() => {
        timers.delete(timer);
        void sync(userId, revision).catch(() => {});
      }, 0);
      timers.add(timer);
    });
    return () => { active = false; subscription.unsubscribe(); timers.forEach(clearTimeout); };
  }, []);
  return null;
}
