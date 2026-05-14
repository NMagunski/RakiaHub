"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/app";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [{ data: userData }, { data: profilesData }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setCurrentUserId(userData.user?.id ?? null);
    setUsers((profilesData as Profile[]) ?? []);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  async function toggleAdmin(user: Profile) {
    await supabase
      .from("profiles")
      .update({ is_admin: !user.is_admin })
      .eq("id", user.id);
    load();
  }

  async function deleteUser(userId: string) {
    setDeletingId(userId);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (res.ok) load();
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-oak">Потребители ({users.length})</h1>

      {loading ? (
        <p className="text-walnut">Зареждане…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-accent/20 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-accent/20 text-left text-xs font-medium uppercase tracking-wide text-accent">
                <th className="px-4 py-3">Потребител</th>
                <th className="px-4 py-3">Имейл ID</th>
                <th className="px-4 py-3">Регистриран</th>
                <th className="px-4 py-3">Роля</th>
                <th className="px-4 py-3">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent/10">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-cream/30">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-oak">@{u.username}</p>
                      {u.display_name && <p className="text-xs text-walnut">{u.display_name}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-walnut">{u.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-walnut">
                    {new Date(u.created_at).toLocaleDateString("bg-BG")}
                  </td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <span className="rounded-full bg-walnut/10 px-2 py-0.5 text-xs font-medium text-walnut">Admin</span>
                    ) : (
                      <span className="text-xs text-accent">Потребител</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleAdmin(u)}
                        className="text-sm text-walnut underline underline-offset-2"
                      >
                        {u.is_admin ? "Премахни admin" : "Направи admin"}
                      </button>

                      {u.id !== currentUserId && (
                        confirmDeleteId === u.id ? (
                          <span className="flex items-center gap-2 text-sm text-red-700">
                            Изтрий?
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={deletingId === u.id}
                              className="font-bold underline underline-offset-2 disabled:opacity-50"
                            >
                              {deletingId === u.id ? "…" : "Да"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="font-bold underline underline-offset-2"
                            >
                              Не
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(u.id)}
                            className="text-sm font-medium text-red-600 underline underline-offset-2"
                          >
                            Изтрий
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
