import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function checkPromotionThreshold(
  client: SupabaseClient<Database>,
  rakijaId: string
) {
  await client.rpc("check_promotion_threshold", { p_rakija_id: rakijaId });
}
