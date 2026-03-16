"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  color: "green" | "yellow" | "red" | "orange" | "blue" | "purple";
  glow?: boolean;
  trend?: "up" | "down" | "stable";
}

const colorMap = {
  green:  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "glow-green" },
  yellow: { text: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  glow: "" },
  red:    { text: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     glow: "glow-red" },
  orange: { text: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20",  glow: "" },
  blue:   { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20",    glow: "glow-blue" },
  purple: { text: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20",  glow: "glow-purple" },
};

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

export function StatCard({ label, value, prefix = "", suffix = "", icon, color, glow }: StatCardProps) {
  const c = colorMap[color];
  const animated = useCountUp(value);

  return (
    <div className={clsx(
      "rounded-xl border p-4 bg-[#111827] fade-in-up",
      c.border,
      glow && c.glow,
    )}>
      <div className="flex items-start justify-between">
        <div className={clsx("p-2 rounded-lg", c.bg)}>
          <div className={c.text}>{icon}</div>
        </div>
        <div className={clsx("w-1.5 h-1.5 rounded-full mt-1 pulse-dot", color === "red" ? "bg-red-400" : color === "yellow" ? "bg-yellow-400" : "bg-emerald-400")} />
      </div>
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className={clsx("text-2xl font-bold font-terminal", c.text)}>
          {prefix}{animated}{suffix}
        </p>
      </div>
    </div>
  );
}
