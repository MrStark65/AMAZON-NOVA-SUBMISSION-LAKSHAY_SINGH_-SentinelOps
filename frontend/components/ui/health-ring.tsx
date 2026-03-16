"use client";

interface HealthRingProps {
  healthy: number;
  warning: number;
  critical: number;
}

export function HealthRing({ healthy, warning, critical }: HealthRingProps) {
  const total = healthy + warning + critical || 1;
  const healthPct = Math.round((healthy / total) * 100);

  const r = 52;
  const cx = 64;
  const cy = 64;
  const circumference = 2 * Math.PI * r;

  // Arc segments
  const healthyArc  = (healthy  / total) * circumference;
  const warningArc  = (warning  / total) * circumference;
  const criticalArc = (critical / total) * circumference;

  const healthyOffset  = 0;
  const warningOffset  = -(healthyArc);
  const criticalOffset = -(healthyArc + warningArc);

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1f2937" strokeWidth="12" />
          {/* Healthy */}
          {healthy > 0 && (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#10b981" strokeWidth="12"
              strokeDasharray={`${healthyArc} ${circumference}`}
              strokeDashoffset={healthyOffset}
              strokeLinecap="round" />
          )}
          {/* Warning */}
          {warning > 0 && (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="12"
              strokeDasharray={`${warningArc} ${circumference}`}
              strokeDashoffset={warningOffset}
              strokeLinecap="round" />
          )}
          {/* Critical */}
          {critical > 0 && (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ef4444" strokeWidth="12"
              strokeDasharray={`${criticalArc} ${circumference}`}
              strokeDashoffset={criticalOffset}
              strokeLinecap="round" />
          )}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xl font-bold font-terminal ${healthPct >= 70 ? "text-emerald-400" : healthPct >= 40 ? "text-yellow-400" : "text-red-400"}`}>
            {healthPct}%
          </span>
          <span className="text-[10px] text-gray-500">health</span>
        </div>
      </div>
      {/* Legend */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-gray-400">Healthy</span>
          <span className="ml-auto font-terminal text-emerald-400 font-bold">{healthy}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />
          <span className="text-gray-400">Warning</span>
          <span className="ml-auto font-terminal text-yellow-400 font-bold">{warning}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          <span className="text-gray-400">Critical</span>
          <span className="ml-auto font-terminal text-red-400 font-bold">{critical}</span>
        </div>
        <div className="pt-1 border-t border-gray-800 flex items-center gap-2 text-xs">
          <span className="text-gray-500">Total</span>
          <span className="ml-auto font-terminal text-gray-300 font-bold">{total}</span>
        </div>
      </div>
    </div>
  );
}
