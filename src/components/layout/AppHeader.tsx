export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 safe-top" style={{ background: "rgba(240,223,192,0.75)", backdropFilter: "blur(20px) saturate(1.6)", WebkitBackdropFilter: "blur(20px) saturate(1.6)", borderBottom: "1px solid rgba(255,255,255,0.50)" }}>
      <div className="flex items-center justify-center px-4 py-4">
        <span className="text-2xl font-bold tracking-tight text-gradient">RakiaHub</span>
      </div>
    </header>
  );
}
