import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-accent/10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/feed" className="text-2xl font-bold tracking-tight text-oak">
            RAKIQ
          </Link>
          <span className="rounded-full bg-walnut/10 px-3 py-1 text-xs font-semibold text-walnut">
            Admin
          </span>
        </div>
      </header>
      <nav className="flex gap-4 px-4 py-3 text-sm text-walnut"><Link href="/admin/rakija">Продукти</Link><Link href="/admin/promotions">Предложения</Link><Link href="/admin/catalog">Произход и дубликати</Link></nav>
      <main className="p-4">{children}</main>
    </div>
  );
}
