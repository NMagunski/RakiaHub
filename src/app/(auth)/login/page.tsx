"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setForgotSent(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("Невалиден имейл или парола."); setLoading(false); return; }
      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError("Неочаквана грешка: " + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{
        background: "linear-gradient(175deg, #F5EAD5 0%, #FBF5EC 45%, #FBF5EC 100%)",
      }}
    >
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-16 pb-10">
        {/* Logo mark */}
        <div
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(145deg, #6B4423 0%, #2C1810 100%)",
            boxShadow: "0 8px 32px rgba(107,68,35,0.35), 0 2px 8px rgba(44,24,16,0.20)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9" aria-hidden>
            <path
              d="M9 3h6M10 3v2.5c0 .5-.4 1-.9 1.4L7.5 8.5V20a1 1 0 001 1h7a1 1 0 001-1V8.5L14.9 6.9C14.4 6.5 14 6 14 5.5V3"
              stroke="#EDD9C0"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M7.5 14h9" stroke="#EDD9C0" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="font-serif font-bold text-oak text-center" style={{ fontSize: "1.75rem", lineHeight: 1.25 }}>
          Открий вкуса<br />на България
        </h1>
        <p className="mt-2 text-center text-sm font-medium" style={{ color: "#8A7968" }}>
          Оцени, събери и сподели всяка глътка ракия
        </p>
      </div>

      {/* Form card */}
      <div className="flex-1 rounded-t-3xl px-6 pt-8 pb-10" style={{ background: "#FFFFFF", boxShadow: "0 -4px 40px rgba(44,24,16,0.08)" }}>

        {/* Forgot password mode */}
        {forgotMode && (
          forgotSent ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(61,122,61,0.12)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#3D7A3D" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <p className="font-semibold text-oak">Провери имейла си</p>
              <p className="text-sm text-muted">Изпратихме линк за възстановяване на паролата.</p>
              <button onClick={() => { setForgotMode(false); setForgotSent(false); }} className="text-sm font-semibold text-walnut underline underline-offset-2">
                Обратно към вход
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="flex flex-col gap-4">
              <div>
                <p className="mb-4 text-sm text-muted">Въведи имейла си и ще ти изпратим линк за нова парола.</p>
                <label className="label" htmlFor="forgot-email">Имейл</label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  inputMode="email"
                  autoComplete="email"
                />
              </div>
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(192,57,43,0.08)", color: "#9B2C2C" }}>
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Изпращане…" : "Изпрати линк"}
              </button>
              <button type="button" onClick={() => { setForgotMode(false); setError(null); }} className="text-sm text-muted underline underline-offset-2">
                Обратно към вход
              </button>
            </form>
          )
        )}

        {!forgotMode && <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="label" htmlFor="email">Имейл</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              inputMode="email"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label mb-0" htmlFor="password">Парола</label>
              <button type="button" onClick={() => { setForgotMode(true); setError(null); }} className="text-xs font-medium text-walnut underline underline-offset-2">
                Забравена парола?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors"
                style={{ color: "#8A7968" }}
                aria-label={showPass ? "Скрий паролата" : "Покажи паролата"}
              >
                {showPass ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.18)", color: "#9B2C2C" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                </svg>
                Влизане…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Влез в профила
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            )}
          </button>
        </form>}

        {!forgotMode && (
          <p className="mt-6 text-center text-sm" style={{ color: "#8A7968" }}>
            Нямаш профил?{" "}
            <Link href="/register" className="font-semibold text-walnut underline underline-offset-2">
              Регистрирай се
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
