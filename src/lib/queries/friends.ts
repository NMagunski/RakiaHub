import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function getFriends(client: Client, userId: string) {
  const { data, error } = await client
    .from("friendships")
    .select(`
      id, status, created_at,
      requester:requester_id ( id, username, avatar_url, display_name ),
      addressee:addressee_id ( id, username, avatar_url, display_name )
    `)
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");

  if (error) throw error;
  return (data ?? []) as unknown as FriendshipRow[];
}

export async function getPendingRequests(client: Client, userId: string) {
  const { data, error } = await client
    .from("friendships")
    .select(`
      id, status, created_at,
      requester:requester_id ( id, username, avatar_url, display_name )
    `)
    .eq("addressee_id", userId)
    .eq("status", "pending");

  if (error) throw error;
  return (data ?? []) as unknown as PendingRow[];
}

export async function getSentRequests(client: Client, userId: string) {
  const { data } = await client
    .from("friendships")
    .select("addressee_id, status")
    .eq("requester_id", userId);
  return data ?? [];
}

export async function searchUsers(client: Client, query: string, currentUserId: string) {
  const { data } = await client
    .from("profiles")
    .select("id, username, avatar_url, display_name")
    .ilike("username", `%${query}%`)
    .neq("id", currentUserId)
    .limit(10);
  return data ?? [];
}

export type FriendshipRow = {
  id: string;
  status: string;
  created_at: string;
  requester: { id: string; username: string; avatar_url: string | null; display_name: string | null };
  addressee: { id: string; username: string; avatar_url: string | null; display_name: string | null };
};

export type PendingRow = {
  id: string;
  status: string;
  created_at: string;
  requester: { id: string; username: string; avatar_url: string | null; display_name: string | null };
};
