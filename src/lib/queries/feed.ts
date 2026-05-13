import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

export type Reactor = { username: string; avatar_url: string | null };

export type FeedRating = {
  id: string;
  score: number;
  aroma_tags: string[] | null;
  taste_tags: string[] | null;
  finish_tags: string[] | null;
  color_tags: string[] | null;
  aroma_note: string | null;
  taste_note: string | null;
  finish_note: string | null;
  venue_name: string | null;
  notes: string | null;
  is_private: boolean;
  created_at: string;
  rakija: { id: string; name: string; producer: string | null; fruit: string | null; type: string } | null;
  profiles: { id: string; username: string; avatar_url: string | null } | null;
};

export async function getFeed(client: Client): Promise<FeedRating[]> {
  const { data, error } = await client
    .from("ratings")
    .select(`
      id,
      score,
      aroma_tags,
      taste_tags,
      finish_tags,
      color_tags,
      aroma_note,
      taste_note,
      finish_note,
      venue_name,
      notes,
      is_private,
      created_at,
      rakija:rakija_id ( id, name, producer, fruit, type ),
      profiles:user_id ( id, username, avatar_url )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as unknown as FeedRating[];
}

export async function getReactionCounts(
  client: Client,
  ratingIds: string[]
): Promise<Record<string, { count: number; user_reacted: boolean; reactors: Reactor[] }>> {
  if (!ratingIds.length) return {};

  const { data } = await client
    .from("reactions")
    .select("rating_id, user_id, profiles:user_id(username, avatar_url)")
    .in("rating_id", ratingIds);

  const { data: { user } } = await client.auth.getUser();
  const uid = user?.id;

  const map: Record<string, { count: number; user_reacted: boolean; reactors: Reactor[] }> = {};
  for (const r of (data ?? []) as Array<{ rating_id: string; user_id: string; profiles: Reactor | null }>) {
    if (!map[r.rating_id]) map[r.rating_id] = { count: 0, user_reacted: false, reactors: [] };
    map[r.rating_id].count++;
    if (r.user_id === uid) map[r.rating_id].user_reacted = true;
    if (r.profiles && map[r.rating_id].reactors.length < 5) {
      map[r.rating_id].reactors.push(r.profiles);
    }
  }
  return map;
}
