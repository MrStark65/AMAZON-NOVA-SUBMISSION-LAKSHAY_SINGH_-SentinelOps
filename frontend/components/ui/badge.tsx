import { clsx } from "clsx";

type Variant = "critical" | "high" | "medium" | "low" | "healthy" | "warning" | "default";

const variants: Record<Variant, string> = {
  critical: "bg-red-500/20 text-red-400 border border-red-500/30",
  high:     "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  medium:   "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  low:      "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  healthy:  "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  warning:  "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  default:  "bg-gray-500/20 text-gray-400 border border-gray-500/30",
};

export function Badge({ label, variant = "default" }: { label: string; variant?: Variant }) {
  return (
    <span className={clsx("px-2 py-0.5 rounded-full text-xs font-medium", variants[variant])}>
      {label}
    </span>
  );
}
