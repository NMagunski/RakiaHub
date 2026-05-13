"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  {
    href: "/feed",
    label: "Фийд",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9"/>
      </svg>
    ),
  },
  {
    href: "/discover",
    label: "Търсене",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 1.8} className="h-6 w-6">
        <circle cx="11" cy="11" r="7"/>
        <path strokeLinecap="round" d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    href: "/friends",
    label: "Приятели",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
      </svg>
    ),
    badge: true,
  },
  {
    href: "/profile",
    label: "Профил",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let userId: string | null = null;

    async function checkPending() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;
      const { count } = await supabase
        .from("friendships")
        .select("id", { count: "exact", head: true })
        .eq("addressee_id", userId)
        .eq("status", "pending");
      setPendingCount(count ?? 0);
    }

    checkPending();

    const channel = supabase
      .channel("nav-friendships")
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => {
        checkPending();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
      style={{
        background: "rgba(251,245,236,0.92)",
        backdropFilter: "blur(24px) saturate(1.8)",
        WebkitBackdropFilter: "blur(24px) saturate(1.8)",
        borderTop: "1px solid rgba(44,24,16,0.07)",
        boxShadow: "0 -1px 0 rgba(44,24,16,0.05), 0 -4px 20px rgba(44,24,16,0.05)",
      }}
    >
      <div className="flex items-center justify-around px-1 py-1.5">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center gap-0.5 min-w-[64px] py-1.5 px-3 rounded-2xl transition-all duration-200"
              style={active ? {
                background: "rgba(107,68,35,0.12)",
              } : {}}
            >
              {/* Active indicator dot */}
              {active && (
                <span
                  className="absolute top-1.5 h-1 w-5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #6B4423, #2C1810)" }}
                />
              )}

              <span className={`mt-2 transition-colors duration-200 ${active ? "text-walnut" : "text-muted"}`}>
                {tab.icon(active)}
              </span>

              {tab.badge && pendingCount > 0 && (
                <span
                  className="absolute top-1 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #6B4423, #2C1810)" }}
                >
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}

              <span
                className="text-[10px] font-semibold tracking-wide transition-colors duration-200"
                style={{ color: active ? "#6B4423" : "rgba(138,121,104,0.75)" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
