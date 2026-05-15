import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Rakija = Database["public"]["Tables"]["rakija"]["Row"];
export type Rating = Database["public"]["Tables"]["ratings"]["Row"];
export type Friendship = Database["public"]["Tables"]["friendships"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type PromotionSuggestion =
  Database["public"]["Tables"]["promotion_suggestions"]["Row"];
export type Wishlist = Database["public"]["Tables"]["wishlists"]["Row"];

export type RakijaType = Rakija["type"];
export type FriendshipStatus = Friendship["status"];

export type FeedItem = Rating & {
  profiles: Pick<Profile, "id" | "username" | "avatar_url">;
  rakija: Pick<Rakija, "id" | "name" | "producer" | "type">;
  reactions: { count: number; user_reacted: boolean };
};

export const AROMA_TAGS = [
  "fruity",
  "plum",
  "apricot",
  "oaky",
  "floral",
  "spirity",
  "earthy",
  "honey",
  "vanilla",
] as const;

export const TASTE_TAGS = [
  "sweet",
  "dry",
  "smooth",
  "sharp",
  "balanced",
  "buttery",
  "spicy",
  "bitter",
] as const;

export const FINISH_TAGS = [
  "short",
  "long",
  "warm",
  "bitter",
  "smooth",
  "spicy",
  "dry",
] as const;

export const COLOR_TAGS = [
  "clear",
  "golden",
  "amber",
  "cloudy",
  "dark",
] as const;

export const FRUIT_TYPES = [
  "plum",
  "grape",
  "apricot",
  "pear",
  "fig",
  "quince",
  "mixed",
  "other",
] as const;

export type AromaTag = (typeof AROMA_TAGS)[number];
export type TasteTag = (typeof TASTE_TAGS)[number];
export type FinishTag = (typeof FINISH_TAGS)[number];
export type ColorTag = (typeof COLOR_TAGS)[number];
export type FruitType = (typeof FRUIT_TYPES)[number];
