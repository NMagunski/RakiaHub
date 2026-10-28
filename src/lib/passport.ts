export type Origin = { id: string; name: string; country_id: string; region_id: string | null; origin_verified: boolean };
export type Tasting = { id: string; rakija_id: string; score: number; tasted_at: string; created_at?: string; notes: string | null; venue_name: string | null; is_private: boolean };
export function passportSummary(tastings: Tasting[], products: Origin[]) {
  const ids = new Set(tastings.map(t => t.rakija_id));
  const origins = products.filter(p => ids.has(p.id) && p.origin_verified);
  return { products: ids.size, countries: new Set(origins.map(p => p.country_id).filter(Boolean)).size, regions: new Set(origins.map(p => p.region_id).filter(Boolean)).size };
}
export function latestTasting(rows: Tasting[]) {
  return [...rows].sort((a,b)=>b.tasted_at.localeCompare(a.tasted_at)||(b.created_at||"").localeCompare(a.created_at||"")||b.id.localeCompare(a.id))[0];
}
