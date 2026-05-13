import Link from "next/link";

const CARDS = [
  { href: "/admin/rakija", label: "Ракии", desc: "Добавяй и редактирай комерсиални ракии", emoji: "🥃" },
  { href: "/admin/users", label: "Потребители", desc: "Управлявай акаунти и admin роли", emoji: "👥" },
  { href: "/admin/promotions", label: "Промоции", desc: "Преглеждай предложения за верификация", emoji: "⬆️" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-oak">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map(c => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl bg-white p-5 shadow-sm transition-transform active:scale-[0.98]"
          >
            <div className="mb-3 text-3xl">{c.emoji}</div>
            <p className="font-semibold text-oak">{c.label}</p>
            <p className="mt-1 text-sm text-walnut">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
