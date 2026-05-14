"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import FruitIcon from "@/components/ui/FruitIcon";
import { useToast } from "@/context/ToastContext";
import { computeBadges } from "@/lib/badges";
import type { Profile, Rating, Rakija } from "@/types/app";

type RatingWithRakija = Rating & {
  rakija: Pick<Rakija, "id" | "name" | "producer" | "fruit"> | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [ratings, setRatings] = useState<RatingWithRakija[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [tab, setTab] = useState<"history" | "settings">("history");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [pwSaving, setPwSaving]       = useState(false);
  const [newEmail, setNewEmail]       = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting]       = useState(false);
  const { show: showToast } = useToast();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, ratingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("ratings")
          .select("*, rakija:rakija_id(id, name, producer, fruit)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setDisplayName(profileRes.data.display_name ?? "");
        setNewUsername(profileRes.data.username);
      }
      setRatings((ratingsRes.data as RatingWithRakija[]) ?? []);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);
      setProfile((p) => p ? { ...p, avatar_url: publicUrl } : p);
    }
    setUploadingAvatar(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    if (newUsername !== profile.username) {
      if (newUsername.length < 3 || !/^[a-z0-9_]+$/.test(newUsername)) {
        showToast("Невалидно потребителско име.", "error");
        return;
      }
      const { data: taken } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", newUsername)
        .neq("id", profile.id)
        .maybeSingle();
      if (taken) {
        showToast("Потребителското име е заето.", "error");
        return;
      }
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName || null, username: newUsername })
      .eq("id", profile.id);

    if (error) {
      showToast(error.message, "error");
    } else {
      setProfile((p) => p ? { ...p, username: newUsername, display_name: displayName || null } : p);
      showToast("Профилът е запазен ✓");
    }
    setSaving(false);
  }

  async function handleDeleteRating(id: string) {
    setRatings((prev) => prev.filter((r) => r.id !== id));
    await fetch("/api/ratings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPw.length < 6)        { showToast("Минимум 6 символа", "error"); return; }
    if (newPw !== confirmPw)     { showToast("Паролите не съвпадат", "error"); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Паролата е сменена ✓");
    setNewPw(""); setConfirmPw("");
  }

  async function handleEmailUpdate(e: React.FormEvent) {
    e.preventDefault();
    setEmailSaving(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setEmailSaving(false);
    if (error) { showToast(error.message, "error"); return; }
    showToast("Провери новия имейл за потвърждение");
    setNewEmail("");
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "ИЗТРИЙ") return;
    setDeleting(true);
    const res = await fetch("/api/account", { method: "DELETE" });
    if (!res.ok) { showToast("Грешка при изтриване на акаунта", "error"); setDeleting(false); return; }
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const uniqueRakijas = new Set(ratings.map(r => r.rakija?.id).filter(Boolean)).size;
  const avgScore = ratings.length > 0
    ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
    : null;
  const badges = useMemo(() => computeBadges(ratings), [ratings]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-walnut" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Profile header */}
      <div className="px-4 pt-6 pb-5">
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => fileRef.current?.click()}
            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-cream ring-2 ring-accent/20 ring-offset-2 ring-offset-background"
          >
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-walnut">
                {profile.username[0].toUpperCase()}
              </span>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-tl-xl bg-walnut">
              <svg viewBox="0 0 24 24" fill="none" stroke="#EDD9C0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-oak leading-tight">
              {profile.display_name || profile.username}
            </p>
            {profile.display_name && (
              <p className="text-sm text-accent mt-0.5">@{profile.username}</p>
            )}
            <p className="text-xs text-accent/60 mt-1">
              Член от {new Date(profile.created_at).toLocaleDateString("bg-BG", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="card px-3 py-3 text-center">
            <p className="text-2xl font-bold text-oak">{ratings.length}</p>
            <p className="text-xs text-accent mt-0.5">Оценки</p>
          </div>
          <div className="card px-3 py-3 text-center">
            <p className="text-2xl font-bold text-oak">{uniqueRakijas}</p>
            <p className="text-xs text-accent mt-0.5">Напитки</p>
          </div>
          <div className="card px-3 py-3 text-center">
            <p className="text-2xl font-bold text-gold">{avgScore ?? "—"}</p>
            <p className="text-xs text-accent mt-0.5">Средна</p>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">Значки</p>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  title={b.description}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.60)", color: "#7A5230" }}
                >
                  <span>{b.emoji}</span>
                  <span>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public profile link */}
        <Link
          href={`/u/${profile.username}`}
          className="mt-3 flex items-center gap-1.5 text-xs text-accent/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
          </svg>
          rakiq.app/u/{profile.username}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-accent/20 px-4">
        {(["history", "settings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`mr-5 pb-3 text-sm font-semibold transition-colors border-b-2 ${
              tab === t ? "border-walnut text-walnut" : "border-transparent text-accent"
            }`}
          >
            {t === "history" ? "История" : "Настройки"}
          </button>
        ))}
      </div>

      {/* History tab */}
      {tab === "history" && (
        <div className="flex flex-col gap-2 px-4 py-4">
          {ratings.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <span className="text-5xl">🥃</span>
              <p className="font-semibold text-oak">Все още няма оценки</p>
              <p className="text-sm text-walnut">Натисни бутилката и оцени първата напитка</p>
            </div>
          ) : (
            ratings.map((r) => (
              <div key={r.id} className="card flex items-center gap-3 px-4 py-3">
                <Link href={`/rakija/${r.rakija?.id}`} className="flex flex-1 items-center gap-3 min-w-0">
                  <FruitIcon fruit={r.rakija?.fruit ?? null} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-oak text-sm">{r.rakija?.name}</p>
                    <p className="truncate text-xs text-walnut mt-0.5">
                      {r.rakija?.producer ?? ""}
                      {r.venue_name ? ` · 📍${r.venue_name}` : ""}
                    </p>
                    <p className="text-xs text-accent/60 mt-0.5">
                      {new Date(r.created_at).toLocaleDateString("bg-BG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-center justify-center h-9 w-9 rounded-xl bg-gold/10">
                    <span className="text-sm font-bold text-gold leading-none">{r.score}</span>
                    <span className="text-[9px] text-gold/60 leading-none mt-0.5">/10</span>
                  </div>
                </Link>
                {confirmDeleteId === r.id ? (
                  <div className="shrink-0 ml-1 flex items-center gap-2">
                    <button
                      onClick={() => { handleDeleteRating(r.id); setConfirmDeleteId(null); }}
                      className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white"
                    >
                      Да
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-lg border border-accent/30 px-2.5 py-1 text-xs text-accent"
                    >
                      Не
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(r.id)}
                    className="shrink-0 ml-1 flex items-center justify-center rounded-lg p-2 text-accent/50 active:text-red-500 transition-colors"
                    aria-label="Изтрий"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === "settings" && (
        <div className="px-4 py-4 flex flex-col gap-4">
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-accent" htmlFor="newUsername">
                Потребителско име
              </label>
              <div className="input flex items-center gap-1 px-4 py-3">
                <span className="text-accent">@</span>
                <input
                  id="newUsername"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase())}
                  className="flex-1 bg-transparent text-oak placeholder:text-accent/60 focus:outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-accent" htmlFor="displayName">
                Показвано име <span className="normal-case font-normal">(по желание)</span>
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="input"
                placeholder="Никола"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Запазване…" : "Запази промените"}
            </button>
          </form>

          {/* Change password */}
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-3 border-t border-accent/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Смяна на парола</p>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="input"
              placeholder="Нова парола"
              autoComplete="new-password"
              minLength={6}
            />
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="input"
              placeholder="Потвърди паролата"
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={pwSaving || !newPw || !confirmPw}
              className="btn-primary"
            >
              {pwSaving ? "Запазване…" : "Смени паролата"}
            </button>
          </form>

          {/* Email update */}
          <form onSubmit={handleEmailUpdate} className="flex flex-col gap-3 border-t border-accent/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Смяна на имейл</p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="input"
              placeholder="Нов имейл адрес"
              autoComplete="email"
              required
            />
            <button
              type="submit"
              disabled={emailSaving || !newEmail}
              className="btn-primary"
            >
              {emailSaving ? "Изпращане…" : "Изпрати потвърждение"}
            </button>
            <p className="text-xs text-muted">Ще получиш имейл на новия адрес за потвърждение.</p>
          </form>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-200 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Изтриване на акаунт</p>
            <p className="text-xs text-muted leading-relaxed">
              Всички твои оценки, реакции и данни ще бъдат изтрити безвъзвратно.
              Напиши <strong className="text-oak">ИЗТРИЙ</strong> за да потвърдиш.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="input text-sm"
              placeholder="ИЗТРИЙ"
              autoComplete="off"
            />
            <button
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "ИЗТРИЙ" || deleting}
              className="w-full rounded-2xl py-3 text-sm font-bold text-white disabled:opacity-40"
              style={{ background: "#DC2626" }}
            >
              {deleting ? "Изтриване…" : "Изтрий акаунта завинаги"}
            </button>
          </div>

          <div className="border-t border-accent/10 pt-2 flex flex-col gap-2">
            {profile.is_admin && (
              <Link
                href="/admin/dashboard"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-oak py-3 text-sm font-semibold text-cream"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Admin панел
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="w-full rounded-xl border border-accent/30 py-3 text-sm font-medium text-walnut"
            >
              Изход
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
