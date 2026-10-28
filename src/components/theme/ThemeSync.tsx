"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
export default function ThemeSync() {
  useEffect(() => {
    const client = createClient();
    async function sync() {
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;
      const { data } = await client.from("profiles").select("theme").eq("id", user.id).single();
      if (data?.theme === "amber" || data?.theme === "atlas") {
        document.documentElement.dataset.theme = data.theme;
        localStorage.setItem("rakiq-theme", data.theme);
        window.dispatchEvent(new Event("theme-changed"));
      }
    }
    void sync();
    const { data: { subscription } } = client.auth.onAuthStateChange(() => { void sync(); });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}
