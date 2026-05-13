"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const RatingBottomSheet = dynamic(() => import("@/components/rating/RatingBottomSheet"), {
  ssr: false,
});

export default function RatingFAB() {
  const [open, setOpen] = useState(false);
  const [tilted, setTilted] = useState(false);

  function handleClick() {
    setTilted(true);
    setTimeout(() => {
      setTilted(false);
      setOpen(true);
    }, 350);

    if (navigator.vibrate) navigator.vibrate(30);
  }

  return (
    <>
      <button
        onClick={handleClick}
        aria-label="Добави оценка"
        className="fixed bottom-20 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-walnut shadow-lg transition-transform active:scale-95"
        style={{
          transform: tilted ? "rotate(-25deg)" : "rotate(0deg)",
          transition: "transform 0.35s cubic-bezier(.36,.07,.19,.97)",
        }}
      >
        <BottleIcon />
      </button>

      {open && <RatingBottomSheet onClose={() => setOpen(false)} />}
    </>
  );
}

function BottleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
      <path
        d="M9 3h6M10 3v2.5c0 .5-.5 1-1 1.5L7 9v11a1 1 0 001 1h8a1 1 0 001-1V9l-2-2c-.5-.5-1-1-1-1.5V3"
        stroke="#EDD9C0"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 14h10"
        stroke="#EDD9C0"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
