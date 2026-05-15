"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (username.length < 3) {
      setError("Потребителското име трябва да е поне 3 символа.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      setError("Само малки букви, цифри и долна черта.");
      return;
    }

    setLoading(true);

    try {
      // Pass username in metadata — the DB trigger reads it directly
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          setError("Вече има регистриран акаунт с този имейл.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Регистрацията не успя. Опитай отново.");
        setLoading(false);
        return;
      }

      await supabase
        .from("profiles")
        .update({ age_verified_at: new Date().toISOString() })
        .eq("id", data.user.id);

      // If session exists (email confirmation disabled) — go directly to feed
      // If no session — user needs to confirm email first
      if (data.session) {
        router.push("/feed");
        router.refresh();
      } else {
        setError(null);
        setLoading(false);
        // Show confirmation message
        alert("Провери имейла си и потвърди регистрацията.");
        router.push("/login");
      }
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
            <p className="mt-1 text-sm text-walnut">Създай профил</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-oak" htmlFor="username">
              Потребителско име
            </label>
            <div className="input flex items-center gap-1 px-4 py-3">
              <span className="text-accent">@</span>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="flex-1 bg-transparent text-oak placeholder:text-accent/60 focus:outline-none"
                placeholder="rakiq_fan"
              />
            </div>
            <p className="mt-1 text-xs text-accent">Само малки букви, цифри и _</p>
          </div>

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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Минимум 8 символа"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={e => setAgeConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-walnut"
            />
            <span className="text-sm text-oak">
              Потвърждавам, че съм навършил/а <strong>18 години</strong>.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-walnut"
            />
            <span className="text-sm text-oak">
              Прочетох и приемам{" "}
              <Link href="/terms" target="_blank" className="font-semibold text-walnut underline underline-offset-2">
                Общите условия
              </Link>.
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !ageConfirmed || !termsAccepted}
            className="btn-primary mt-2"
          >
            {loading ? "Създаване…" : "Регистрирай се"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-walnut">
          Вече имаш профил?{" "}
          <Link href="/login" className="font-semibold text-walnut underline">
            Влез
          </Link>
        </p>
      </div>
    </main>
  );
}
