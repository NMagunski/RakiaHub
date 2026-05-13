type Size = "sm" | "md" | "lg";

const SIZE_OUTER: Record<Size, string> = {
  sm: "h-9 w-9 rounded-xl text-lg",
  md: "h-11 w-11 rounded-xl text-xl",
  lg: "h-16 w-16 rounded-2xl text-3xl",
};

const FRUIT_EMOJI: Record<string, string> = {
  plum:    "🍑",
  grape:   "🍇",
  apricot: "🍊",
  pear:    "🍐",
  fig:     "🫐",
  quince:  "🍋",
  mixed:   "🌿",
  other:   "🥃",
};

export default function FruitIcon({ fruit, size = "md" }: { fruit: string | null; size?: Size }) {
  const emoji = FRUIT_EMOJI[fruit ?? ""] ?? "🥃";
  return (
    <div className={`flex shrink-0 items-center justify-center bg-cream ${SIZE_OUTER[size]}`}>
      {emoji}
    </div>
  );
}
