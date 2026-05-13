"use client";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function RatingSlider({ value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Big score display */}
      <div className="flex items-baseline gap-1">
        <span className="text-6xl font-bold text-gold tabular-nums">{value.toFixed(1)}</span>
        <span className="text-lg text-accent">/10</span>
      </div>

      {/* Range input */}
      <div className="relative w-full px-1">
        <input
          type="range"
          min={1}
          max={10}
          step={0.5}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider w-full"
        />
        {/* Tick marks */}
        <div className="mt-1 flex justify-between px-0.5">
          {STEPS.map((n) => (
            <span key={n} className="text-[10px] text-accent/60">{n}</span>
          ))}
        </div>
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-walnut">{scoreLabel(value)}</p>
    </div>
  );
}

function scoreLabel(v: number): string {
  if (v <= 2) return "Много лоша";
  if (v <= 3.5) return "Лоша";
  if (v <= 5) return "Средна";
  if (v <= 6.5) return "Добра";
  if (v <= 8) return "Много добра";
  if (v <= 9) return "Отлична";
  return "Перфектна";
}
