export default function AppHeader() {
  return (
    <header
      className="sticky top-0 z-30 safe-top"
      style={{
        background: "rgba(251,245,236,0.88)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        borderBottom: "1px solid rgba(44,24,16,0.07)",
        boxShadow: "0 1px 12px rgba(44,24,16,0.05)",
      }}
    >
      <div className="flex items-center justify-center gap-2.5 px-4 py-3.5">
        {/* Bottle icon */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, #6B4423 0%, #2C1810 100%)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
            <path
              d="M9 3h6M10 3v2.5c0 .5-.4 1-.9 1.4L7.5 8.5V20a1 1 0 001 1h7a1 1 0 001-1V8.5L14.9 6.9C14.4 6.5 14 6 14 5.5V3"
              stroke="#EDD9C0"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M7.5 14h9" stroke="#EDD9C0" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="flex flex-col items-start leading-none">
          <span className="font-serif font-bold tracking-tight text-oak" style={{ fontSize: "1.2rem", lineHeight: 1.2 }}>
            RakiaHub
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "#8A7968", letterSpacing: "0.12em" }}>
            Оцени · Сподели · Наздраве
          </span>
        </div>
      </div>
    </header>
  );
}
