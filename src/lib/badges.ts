import type { Rating } from "@/types/app";

export type Badge = {
  id: string;
  emoji: string;
  name: string;
  description: string;
};

const BADGE_DEFS: Array<Badge & { check: (ratings: Rating[]) => boolean }> = [
  {
    id: "novak",
    emoji: "🥃",
    name: "Новак",
    description: "Добавена първа оценка",
    check: (r) => r.length >= 1,
  },
  {
    id: "zapalen",
    emoji: "🔥",
    name: "Запален",
    description: "10 или повече оценки",
    check: (r) => r.length >= 10,
  },
  {
    id: "somelier",
    emoji: "⭐",
    name: "Сомелиер",
    description: "50 или повече оценки",
    check: (r) => r.length >= 50,
  },
  {
    id: "master",
    emoji: "🏆",
    name: "Майстор",
    description: "100 или повече оценки",
    check: (r) => r.length >= 100,
  },
  {
    id: "explorer",
    emoji: "🌿",
    name: "Изследовател",
    description: "Оценени 4 различни вида плодове",
    check: (r) => {
      const fruits = new Set(r.map((x) => (x as Rating & { rakija?: { fruit?: string | null } }).rakija?.fruit).filter(Boolean));
      return fruits.size >= 4;
    },
  },
  {
    id: "perfectionist",
    emoji: "💎",
    name: "Перфекционист",
    description: "3 или повече оценки с резултат ≥ 9.5",
    check: (r) => r.filter((x) => x.score >= 9.5).length >= 3,
  },
  {
    id: "narrator",
    emoji: "📝",
    name: "Разказвач",
    description: "5 или повече оценки с бележки",
    check: (r) => r.filter((x) => x.notes && x.notes.trim().length > 0).length >= 5,
  },
];

export type RatingForBadges = Rating & {
  rakija?: { fruit?: string | null } | null;
};

export function computeBadges(ratings: RatingForBadges[]): Badge[] {
  return BADGE_DEFS.filter((def) => def.check(ratings as Rating[])).map(
    ({ id, emoji, name, description }) => ({ id, emoji, name, description })
  );
}
