"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/app";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers((data as Profile[]) ?? []);
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
                    <button
                      onClick={() => toggleAdmin(u)}
                      className="text-sm text-walnut underline"
                    >
                      {u.is_admin ? "Премахни admin" : "Направи admin"}
                    </button>
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
