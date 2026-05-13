type Size = "sm" | "md" | "lg";

const SIZE_OUTER: Record<Size, string> = {
  sm: "h-9 w-9 rounded-xl",
  md: "h-11 w-11 rounded-xl",
  lg: "h-16 w-16 rounded-2xl",
};
const ICON_SIZE: Record<Size, string> = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-9 w-9",
};

function PlumIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="12" cy="13.5" rx="6.5" ry="7" />
      <path d="M12 6.5C12 6.5 13.8 4 16.5 4.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function GrapeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="9.2"  cy="15.2" r="2.6"/>
      <circle cx="14.8" cy="15.2" r="2.6"/>
      <circle cx="12"   cy="10.8" r="2.6"/>
      <circle cx="6.8"  cy="10.8" r="2.1"/>
      <circle cx="17.2" cy="10.8" r="2.1"/>
      <circle cx="12"   cy="19.6" r="2.1"/>
      <path d="M12 8.2C12.5 7 14.2 5.2 16.2 5.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function ApricotIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 4.5C8.4 4.5 5.5 7.4 5.5 11.5c0 4.2 2.6 7 6.5 7s6.5-2.8 6.5-7c0-4.1-2.9-7-6.5-7z"/>
      <path d="M12 4.5C12 4.5 13.2 2.5 15.5 3" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M8.5 11.5C10 9.8 14 9.8 15.5 11.5" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function PearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 4c-1.1 0-2 .9-2 2 0 .9.5 1.7 1.2 2.2C8.5 9 6 11.8 6 15c0 3.3 2.7 5.5 6 5.5s6-2.2 6-5.5c0-3.2-2.5-6-5.2-6.8C13.5 7.7 14 6.9 14 6c0-1.1-.9-2-2-2z"/>
      <path d="M12 4C12 4 13.2 2.2 15 2.8" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function FigIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.5c-1.2 0-2.2 1-2.2 2.2 0 .9.5 1.7 1.3 2.1C8.7 8.5 6.2 11.2 6.2 14.8c0 3.4 2.5 5.7 5.8 5.7s5.8-2.3 5.8-5.7c0-3.6-2.5-6.3-4.9-7C13.7 7.4 14.2 6.6 14.2 5.7c0-1.2-1-2.2-2.2-2.2z"/>
      <path d="M10.5 13.5C11 11.8 13 11.8 13.5 13.5" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function QuinceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 4.2c-2.5 0-4.3 1.6-4.3 3.8 0 .4.1.8.2 1.1H7.5C6 9.1 5.5 10 5.5 11.2c0 4 3.2 7.3 6.5 7.3s6.5-3.3 6.5-7.3c0-1.2-.5-2.1-2-2.1h-.4c.1-.3.2-.7.2-1.1 0-2.2-1.8-3.8-4.3-3.8z"/>
      <path d="M12 4.2C12 4.2 12.3 2.3 14 2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function MixedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <circle cx="8.5"  cy="15" r="3.2"/>
      <circle cx="15.5" cy="15" r="3.2"/>
      <circle cx="12"   cy="9"  r="3.2"/>
      <path d="M12 5.8C12.5 4.8 14 3.2 15.8 3.8" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function GlassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9 4h6L13.8 11C13.4 13.2 13 15 12 16.2V19h1v1H11v-1h1v-2.8C11 15 10.6 13.2 10.2 11Z"/>
      <path d="M10.2 9.5h3.6" stroke="white" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

const FRUIT_ICONS: Record<string, (props: { className?: string }) => JSX.Element> = {
  plum:    PlumIcon,
  grape:   GrapeIcon,
  apricot: ApricotIcon,
  pear:    PearIcon,
  fig:     FigIcon,
  quince:  QuinceIcon,
  mixed:   MixedIcon,
  other:   GlassIcon,
};

export default function FruitIcon({ fruit, size = "md" }: { fruit: string | null; size?: Size }) {
  const Icon = FRUIT_ICONS[fruit ?? ""] ?? GlassIcon;
  return (
    <div
      className={`flex shrink-0 items-center justify-center ${SIZE_OUTER[size]}`}
      style={{ background: "rgba(107,68,35,0.10)" }}
    >
      <Icon className={`${ICON_SIZE[size]} text-walnut`} />
    </div>
  );
}
