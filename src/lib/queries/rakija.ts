import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

type SearchOptions = {
  fruit?: string | null;
  country?: string | null;
  region?: string | null;
  offset?: number;
  triedOnly?: boolean;
  verifiedOnly?: boolean;
  sortBy?: "rating_count" | "global_rating" | "name";
};

export async function searchRakija(client: Client, query: string, options?: SearchOptions) {
  const { data, error } = await client.rpc("search_catalog", {
    q: query.trim().slice(0, 160), fruit_filter: options?.fruit || undefined,
    country_filter: options?.country || undefined, region_filter: options?.region || undefined,
    verified_filter: options?.verifiedOnly ?? false, sort_key: options?.sortBy ?? "rating_count",
    page_offset: options?.offset ?? 0, tried_only: options?.triedOnly ?? false,
  });
  if (error) throw error;
  return data ?? [];
}

export async function getRakijaById(client: Client, id: string) {
  const { data, error } = await client
    .from("rakija")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
