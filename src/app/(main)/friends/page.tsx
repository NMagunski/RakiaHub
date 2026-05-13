"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getFriends, getPendingRequests, getSentRequests, searchUsers } from "@/lib/queries/friends";
import type { FriendshipRow, PendingRow } from "@/lib/queries/friends";

type SearchUser = { id: string; username: string; avatar_url: string | null; display_name: string | null };

function Avatar({ src, name, size = 10 }: { src: string | null; name: string; size?: number }) {
  const cls = `relative h-${size} w-${size} shrink-0 overflow-hidden rounded-full bg-cream`;
  return (
    <div className={cls}>
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-walnut">
          {name[0]?.toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function FriendsPage() {
  const supabase = createClient();

  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends");
  const [friends, setFriends] = useState<FriendshipRow[]>([]);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);

  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async (uid: string) => {
    const [f, p, s] = await Promise.all([
      getFriends(supabase, uid),
      getPendingRequests(supabase, uid),
      getSentRequests(supabase, uid),
    ]);
    setFriends(f);
    setPending(p);
    setSentIds(s.map((r) => r.addressee_id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setCurrentUserId(user.id);
      loadData(user.id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!query.trim() || !currentUserId) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      const res = await searchUsers(supabase, query.trim(), currentUserId);
      setResults(res as SearchUser[]);
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, currentUserId]);

  async function sendRequest(addressee_id: string) {
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", addressee_id }),
    });
    setSentIds((prev) => [...prev, addressee_id]);
  }

  async function respondRequest(friendship_id: string, action: "accept" | "decline") {
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, friendship_id }),
    });
    if (action === "accept" && currentUserId) {
      loadData(currentUserId);
    } else {
      setPending((prev) => prev.filter((p) => p.id !== friendship_id));
    }
  }

  async function removeFriend(friendship_id: string) {
    await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", friendship_id }),
    });
    setFriends((prev) => prev.filter((f) => f.id !== friendship_id));
  }

  async function generateInvite() {
    setGeneratingInvite(true);
    const res = await fetch("/api/invite", { method: "POST" });
    const json = await res.json();
    if (json.token) {
      const url = `${window.location.origin}/invite/${json.token}`;
      setInviteUrl(url);
    }
    setGeneratingInvite(false);
  }

  async function copyInvite() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const friendIds = new Set(
    friends.flatMap((f) => [f.requester.id, f.addressee.id]).filter((id) => id !== currentUserId)
  );

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-oak">Приятели</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-accent/20 px-4">
        {(["friends", "requests", "search"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative mr-5 pb-2.5 text-sm font-medium transition-colors border-b-2 ${
              t === tab ? "border-walnut text-walnut" : "border-transparent text-accent"
            }`}
          >
            {t === "friends" ? "Списък" : t === "requests" ? "Заявки" : "Търсене"}
            {t === "requests" && pending.length > 0 && (
              <span className="absolute -top-1 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-walnut text-[9px] font-bold text-cream">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Friends list */}
      {tab === "friends" && (
        <div className="flex flex-col px-4 py-4 gap-3">
          {friends.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-4xl mb-3">🤝</p>
              <p className="font-medium text-oak">Все още нямаш приятели</p>
              <p className="text-sm text-walnut mt-1">Потърси по потребителско или изпрати покана</p>
            </div>
          ) : (
            friends.map((f) => {
              const other = f.requester.id === currentUserId ? f.addressee : f.requester;
              return (
                <div key={f.id} className="card flex items-center gap-3 px-4 py-3">
                  <Avatar src={other.avatar_url} name={other.username} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-oak text-sm truncate">{other.display_name || `@${other.username}`}</p>
                    {other.display_name && <p className="text-xs text-accent">@{other.username}</p>}
                  </div>
                  <button
                    onClick={() => removeFriend(f.id)}
                    className="text-xs text-accent border border-accent/30 rounded-lg px-3 py-1.5"
                  >
                    Премахни
                  </button>
                </div>
              );
            })
          )}

          {/* Invite section */}
          <div className="card mt-4 px-4 py-4">
            <p className="font-semibold text-oak text-sm mb-1">Покани приятел</p>
            <p className="text-xs text-accent mb-3">Генерирай линк валиден 7 дни</p>
            {inviteUrl ? (
              <div className="flex gap-2">
                <p className="flex-1 truncate rounded-lg bg-cream px-3 py-2 text-xs text-walnut">{inviteUrl}</p>
                <button
                  onClick={copyInvite}
                  className="shrink-0 rounded-lg bg-walnut px-3 py-2 text-xs font-semibold text-cream"
                >
                  {copied ? "Копирано!" : "Копирай"}
                </button>
              </div>
            ) : (
              <button
                onClick={generateInvite}
                disabled={generatingInvite}
                className="w-full rounded-xl bg-walnut py-2.5 text-sm font-semibold text-cream disabled:opacity-60"
              >
                {generatingInvite ? "Генериране…" : "Генерирай покана"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pending requests */}
      {tab === "requests" && (
        <div className="flex flex-col px-4 py-4 gap-3">
          {pending.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-4xl mb-3">📬</p>
              <p className="font-medium text-oak">Няма нови заявки</p>
            </div>
          ) : (
            pending.map((p) => (
              <div key={p.id} className="card flex items-center gap-3 px-4 py-3">
                <Avatar src={p.requester.avatar_url} name={p.requester.username} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-oak text-sm truncate">
                    {p.requester.display_name || `@${p.requester.username}`}
                  </p>
                  {p.requester.display_name && <p className="text-xs text-accent">@{p.requester.username}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondRequest(p.id, "accept")}
                    className="rounded-lg bg-walnut px-3 py-1.5 text-xs font-semibold text-cream"
                  >
                    Приеми
                  </button>
                  <button
                    onClick={() => respondRequest(p.id, "decline")}
                    className="rounded-lg border border-accent/30 px-3 py-1.5 text-xs text-accent"
                  >
                    Откажи
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Search */}
      {tab === "search" && (
        <div className="flex flex-col px-4 py-4 gap-3">
          <div className="input flex items-center gap-2 px-4 py-3">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4 text-accent mr-2 shrink-0">
              <circle cx="11" cy="11" r="7" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Потребителско име…"
              className="flex-1 bg-transparent text-oak placeholder:text-accent/60 focus:outline-none text-sm"
            />
          </div>

          {searching && (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-walnut" />
            </div>
          )}

          {!searching && results.map((u) => {
            const isFriend = friendIds.has(u.id);
            const isSent = sentIds.includes(u.id);
            return (
              <div key={u.id} className="card flex items-center gap-3 px-4 py-3">
                <Avatar src={u.avatar_url} name={u.username} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-oak text-sm truncate">{u.display_name || `@${u.username}`}</p>
                  {u.display_name && <p className="text-xs text-accent">@{u.username}</p>}
                </div>
                {isFriend ? (
                  <span className="text-xs text-accent/60">Приятел</span>
                ) : isSent ? (
                  <span className="text-xs text-accent/60">Изпратено</span>
                ) : (
                  <button
                    onClick={() => sendRequest(u.id)}
                    className="rounded-lg bg-walnut px-3 py-1.5 text-xs font-semibold text-cream"
                  >
                    Добави
                  </button>
                )}
              </div>
            );
          })}

          {!searching && query.trim() && results.length === 0 && (
            <p className="text-center text-sm text-accent py-6">Няма резултати за &ldquo;{query}&rdquo;</p>
          )}
        </div>
      )}
    </div>
  );
}
