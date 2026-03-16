import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "blue" | "red" | "green" | "purple";
  hover?: boolean;
  animate?: boolean;
}

export function Card({ children, className, glow, hover, animate }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-gray-800/80 bg-[#111827] p-4",
        glow === "blue"   && "glow-blue border-blue-500/20",
        glow === "red"    && "glow-red border-red-500/20",
        glow === "green"  && "glow-green border-emerald-500/20",
        glow === "purple" && "glow-purple border-purple-500/20",
        hover   && "card-hover cursor-pointer",
        animate && "fade-in-up",
        className
      )}
    >
      {children}
    </div>
  );
}
