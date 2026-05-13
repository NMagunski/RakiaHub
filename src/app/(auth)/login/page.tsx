"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError("Невалиден имейл или парола.");
        setLoading(false);
        return;
      }

      router.push("/feed");
      router.refresh();
    } catch (err) {
      setError("Неочаквана грешка: " + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,168,83,0.14) 0%, #FAF3E8 70%)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-walnut shadow-md">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
              <path d="M9 3h6M10 3v2.5c0 .5-.5 1-1 1.5L7 9v11a1 1 0 001 1h8a1 1 0 001-1V9l-2-2c-.5-.5-1-1-1-1.5V3"
                stroke="#EDD9C0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14h10" stroke="#EDD9C0" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-oak">RakiaHub</h1>
            <p className="mt-1 text-sm text-walnut">Влез в профила си</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-oak" htmlFor="email">
              Имейл
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-oak" htmlFor="password">
              Парола
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2"
          >
            {loading ? "Влизане…" : "Влез"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-walnut">
          Нямаш профил?{" "}
          <Link href="/register" className="font-semibold text-walnut underline">
            Регистрирай се
          </Link>
        </p>
      </div>
    </main>
  );
}
