"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const RatingBottomSheet = dynamic(() => import("@/components/rating/RatingBottomSheet"), { ssr: false });

type Props = {
  rakijaId: string;
  rakijaName: string;
  rakijaProducer: string | null;
};

export default function RateButton({ rakijaId, rakijaName, rakijaProducer }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary flex items-center justify-center gap-2"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
          <path
            d="M9 3h6M10 3v2.5c0 .5-.5 1-1 1.5L7 9v11a1 1 0 001 1h8a1 1 0 001-1V9l-2-2c-.5-.5-1-1-1-1.5V3"
            stroke="#EDD9C0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          />
          <path d="M7 14h10" stroke="#EDD9C0" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Оцени тази ракия
      </button>

      {open && (
        <RatingBottomSheet
          onClose={() => setOpen(false)}
          preselected={{ kind: "existing", id: rakijaId, name: rakijaName, producer: rakijaProducer }}
        />
      )}
    </>
  );
}
