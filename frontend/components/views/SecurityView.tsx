"use client";

import { ScanResult, Severity } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, Terminal } from "lucide-react";

interface Props { data: ScanResult | null }

const severityOrder: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const severityColors: Record<Severity, string> = {
  critical: "bg-red-500",
  high:     "bg-orange-500",
  medium:   "bg-yellow-500",
  low:      "bg-blue-500",
};

export function SecurityView({ data }: Props) {
  if (!data) return (
    <div className="text-gray-600 text-sm flex items-center gap-2 py-8 justify-center">
      <ShieldAlert size={16} className="opacity-40" /> Run a scan first.
    </div>
  );

  const sorted = [...data.securityRisks].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  sorted.forEach(r => counts[r.severity]++);

  return (
    <div className="space-y-4">
      {/* Severity breakdown bar */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Risk Breakdown</p>
          {sorted.length === 0 && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <ShieldCheck size={12} /> All clear
            </span>
          )}
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
          {(["critical","high","medium","low"] as Severity[]).map(s =>
            counts[s] > 0 ? (
              <div key={s} className={`${severityColors[s]} rounded-full transition-all duration-700`}
                style={{ width: `${(counts[s] / sorted.length) * 100}%` }} />
            ) : null
          )}
          {sorted.length === 0 && <div className="bg-emerald-500 rounded-full w-full" />}
        </div>
        <div className="flex gap-4">
          {(["critical","high","medium","low"] as Severity[]).map(s => (
            <div key={s} className="flex items-center gap-1.5 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${severityColors[s]}`} />
              <span className="text-gray-500 capitalize">{s}</span>
              <span className="font-terminal text-gray-300 font-bold">{counts[s]}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Risk cards */}
      <div className="space-y-3 stagger">
        {sorted.map((risk) => (
          <Card key={risk.id} glow={risk.severity === "critical" ? "red" : undefined} animate>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-2 rounded-lg ${risk.severity === "critical" ? "bg-red-500/10" : "bg-orange-500/10"}`}>
                  <ShieldAlert size={13} className={risk.severity === "critical" ? "text-red-400" : "text-orange-400"} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-200">{risk.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{risk.description}</p>
                  <p className="text-[10px] text-gray-600 mt-1 font-terminal">{risk.resource}</p>
                  {"remediation" in risk && (risk as any).remediation && (
                    <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                      <Terminal size={10} className="text-emerald-400 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-emerald-400 font-terminal leading-relaxed break-all">
                        {(risk as any).remediation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge label={risk.severity} variant={risk.severity} />
                <p className="text-[10px] text-gray-600">{risk.detected}</p>
              </div>
            </div>
          </Card>
        ))}
        {sorted.length === 0 && (
          <Card glow="green">
            <div className="flex items-center gap-3 py-4 justify-center text-emerald-400">
              <ShieldCheck size={18} />
              <p className="text-sm">No security risks detected</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
