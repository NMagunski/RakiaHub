import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import RatingFAB from "@/components/layout/RatingFAB";
import { ToastProvider } from "@/context/ToastContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col" style={{ background: "transparent" }}>
        <AppHeader />
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
        <RatingFAB />
      </div>
    </ToastProvider>
  );
}
