"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type InviteData = {
  id: string;
  created_by: string;
  profiles: { username: string; avatar_url: string | null } | null;
};

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "used" | "expired" | "accepted" | "self">("loading");
  const [accepting, setAccepting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: { user } }, inviteRes] = await Promise.all([
        supabase.auth.getUser(),
        fetch(`/api/invite?token=${token}`),
      ]);

      setCurrentUser(user);

      if (!inviteRes.ok) {
        const json = await inviteRes.json();
        if (json.error === "Already used") setStatus("used");
        else if (json.error === "Expired") setStatus("expired");
        else setStatus("invalid");
        return;
      }

      const data: InviteData = await inviteRes.json();
      setInvite(data);

      if (user && user.id === data.created_by) {
        setStatus("self");
      } else {
        setStatus("valid");
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleAccept() {
    if (!currentUser || !invite) return;
    setAccepting(true);

    // Send a friend request to the invite creator, then immediately accept it by updating
    // The cleanest flow: send request from current user → accept it server-side in one step
    // We'll use a dedicated accept-invite endpoint via the friends API
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", addressee_id: invite.created_by }),
    });

    if (!res.ok) {
      const json = await res.json();
      // If friendship already exists, still proceed
      if (!json.error?.includes("duplicate") && !json.error?.includes("unique")) {
        setAccepting(false);
        return;
      }
    }

    // Mark invite as used
    await supabase
      .from("invite_links")
      .update({ used_by: currentUser.id })
      .eq("token", token as string);

    setStatus("accepted");
    setAccepting(false);
  }

  const inviterName = invite?.profiles?.username ?? "Някой";
  const inviterAvatar = invite?.profiles?.avatar_url ?? null;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-walnut" />
      </div>
    );
  }

  if (status === "invalid" || status === "used" || status === "expired") {
    const messages: Record<string, { icon: string; title: string; body: string }> = {
      invalid: { icon: "🔗", title: "Невалидна покана", body: "Линкът не съществува." },
      used: { icon: "✓", title: "Поканата е използвана", body: "Този линк вече е бил използван." },
      expired: { icon: "⏰", title: "Поканата е изтекла", body: "Линкът е валиден само 7 дни." },
    };
    const m = messages[status];
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background text-center">
        <p className="text-5xl mb-4">{m.icon}</p>
        <h1 className="text-xl font-bold text-oak mb-2">{m.title}</h1>
        <p className="text-sm text-walnut mb-8">{m.body}</p>
        <Link href="/feed" className="rounded-xl bg-walnut px-6 py-3 text-sm font-semibold text-cream">
          Към приложението
        </Link>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background text-center">
        <p className="text-5xl mb-4">🥂</p>
        <h1 className="text-xl font-bold text-oak mb-2">Заявката е изпратена!</h1>
        <p className="text-sm text-walnut mb-8">Ще виждаш оценките на {inviterName} когато приеме.</p>
        <button onClick={() => router.push("/friends")} className="rounded-xl bg-walnut px-6 py-3 text-sm font-semibold text-cream">
          Към приятели
        </button>
      </div>
    );
  }

  if (status === "self") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background text-center">
        <p className="text-5xl mb-4">😅</p>
        <h1 className="text-xl font-bold text-oak mb-2">Твоята покана</h1>
        <p className="text-sm text-walnut mb-8">Не можеш да използваш собствената си покана.</p>
        <Link href="/friends" className="rounded-xl bg-walnut px-6 py-3 text-sm font-semibold text-cream">
          Към приятели
        </Link>
      </div>
    );
  }

  // status === "valid"
  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background text-center">
        <p className="text-5xl mb-4">🥃</p>
        <h1 className="text-xl font-bold text-oak mb-2">Покана за Rakiq</h1>
        <p className="text-sm text-walnut mb-2">
          <span className="font-semibold">@{inviterName}</span> те кани да оценявате напитки заедно.
        </p>
        <p className="text-sm text-accent mb-8">Влез или се регистрирай, за да приемеш.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href={`/login?next=/invite/${token}`} className="rounded-xl bg-walnut py-3 text-sm font-semibold text-cream text-center">
            Влез
          </Link>
          <Link href={`/register?next=/invite/${token}`} className="rounded-xl border border-walnut py-3 text-sm font-semibold text-walnut text-center">
            Регистрирай се
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-background text-center">
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-cream mb-4">
        {inviterAvatar ? (
          <Image src={inviterAvatar} alt={inviterName} fill className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-walnut">
            {inviterName[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <h1 className="text-xl font-bold text-oak mb-2">Покана от @{inviterName}</h1>
      <p className="text-sm text-walnut mb-8">Добавете се като приятели и споделяйте оценки.</p>
      <button
        onClick={handleAccept}
        disabled={accepting}
        className="w-full max-w-xs rounded-xl bg-walnut py-3 text-sm font-semibold text-cream disabled:opacity-60"
      >
        {accepting ? "Изпращане…" : "Приеми поканата"}
      </button>
    </div>
  );
}
