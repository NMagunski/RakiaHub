"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [ready, setReady]     = useState(false);
  const [newPw, setNewPw]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const INVALID = "Невалиден или изтекъл линк. Поискай нов от страницата за вход.";

      // 1. Check if a session was already established (e.g. by auto-detection)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) { setReady(true); return; }
      } catch { /* fall through */ }

      // 2. Try to exchange the PKCE code from the URL
      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        if (!cancelled) setError(INVALID);
        return;
      }

      try {
        const { data, error: e } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (!e && data?.session) {
          setReady(true);
        } else {
          // Code might have already been consumed by the client's auto-detection;
          // do a final session check before showing an error.
          const { data: { session } } = await supabase.auth.getSession();
          if (cancelled) return;
          if (session) setReady(true);
          else setError(INVALID);
        }
      } catch {
        if (!cancelled) setError(INVALID);
      }
    }

    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 6)    { setError("Минимум 6 символа"); return; }
    if (newPw !== confirm)   { setError("Паролите не съвпадат"); return; }
    setSaving(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setSaving(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => router.push("/feed"), 2000);
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(175deg, #F5EAD5 0%, #FBF5EC 100%)" }}
    >
      <div className="w-full max-w-sm rounded-3xl p-8" style={{ background: "#FFFFFF", boxShadow: "0 4px 40px rgba(44,24,16,0.10)" }}>
        {done ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(61,122,61,0.12)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#3D7A3D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <p className="font-semibold text-oak">Паролата е сменена!</p>
            <p className="text-sm text-muted">Пренасочваме те към приложението…</p>
          </div>
        ) : error && !ready ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(192,57,43,0.08)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#9B2C2C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="font-semibold text-oak">Проблем с линка</p>
            <p className="text-sm text-muted">{error}</p>
          </div>
        ) : !ready ? (
          <div className="flex flex-col items-center gap-3 text-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-walnut" />
            <p className="text-sm text-muted">Зареждане…</p>
          </div>
        ) : (
          <>
            <h1 className="mb-1 font-serif text-xl font-bold text-oak">Нова парола</h1>
            <p className="mb-6 text-sm text-muted">Въведи новата си парола по-долу.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="input pr-12"
                  placeholder="Нова парола"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5"
                  style={{ color: "#8A7968" }}
                  aria-label={showPw ? "Скрий" : "Покажи"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                placeholder="Потвърди паролата"
                autoComplete="new-password"
                required
              />
              {error && (
                <p className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(192,57,43,0.08)", color: "#9B2C2C" }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Запазване…" : "Запази новата парола"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
