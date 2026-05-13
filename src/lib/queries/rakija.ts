import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

type SearchOptions = {
  fruit?: string | null;
  verifiedOnly?: boolean;
  sortBy?: "rating_count" | "global_rating" | "name";
};

export async function searchRakija(client: Client, query: string, options?: SearchOptions) {
  const q = query.trim();
  const sortBy = options?.sortBy ?? "rating_count";

  let builder = client
    .from("rakija")
    .select("id, name, producer, fruit, region, country, type, abv, global_rating, rating_count, is_verified")
    .in("type", ["commercial", "personal"])
    .order(sortBy, { ascending: sortBy === "name", nullsFirst: false })
    .limit(40);

  if (q) {
    builder = builder.or(
      `name.ilike.%${q}%,producer.ilike.%${q}%,fruit.ilike.%${q}%,region.ilike.%${q}%`
    );
  }
  if (options?.fruit) {
    builder = builder.eq("fruit", options.fruit);
  }
  if (options?.verifiedOnly) {
    builder = builder.eq("is_verified", true);
  }

  const { data, error } = await builder;
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
