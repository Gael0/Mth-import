"use client";

import Image from "next/image";

// Anneau de progression style Apple Watch avec le logo icône MTH au centre
export default function ProgressRing({ progress, size = 180 }: { progress: number; size?: number }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E5E5" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#FF7A00" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <Image src="/mth_M_hero_1.png" alt="MTH" width={56} height={56} className="rounded-2xl" />
        <span className="text-2xl font-bold text-navy">{progress}%</span>
      </div>
    </div>
  );
}
