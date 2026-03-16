"use client";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
}

function getColor(value: number) {
  if (value >= 85) return "bg-red-500";
  if (value >= 65) return "bg-yellow-500";
  return "bg-emerald-500";
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-gray-800">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
