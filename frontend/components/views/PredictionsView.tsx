"use client";

import { ScanResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface Props { data: ScanResult | null }

export function PredictionsView({ data }: Props) {
  if (!data) return (
    <div className="text-gray-600 text-sm flex items-center gap-2 py-8 justify-center">
      <AlertTriangle size={16} className="opacity-40" /> Run a scan first.
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-gray-800/30 border border-gray-800/60 text-xs text-gray-500">
        <AlertTriangle size={11} className="text-yellow-400" />
        AI-predicted failures using Isolation Forest + trend analysis on live metrics
      </div>

      {data.predictions.length === 0 && (
        <Card glow="green">
          <div className="flex items-center gap-3 py-4 justify-center text-emerald-400">
            <CheckCircle size={18} />
            <p className="text-sm">No failure predictions — all services healthy</p>
          </div>
        </Card>
      )}

      <div className="space-y-3 stagger">
        {data.predictions.map((p, i) => (
          <Card key={i} glow={p.severity === "critical" ? "red" : undefined} animate>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-2 rounded-lg ${p.severity === "critical" ? "bg-red-500/10" : "bg-yellow-500/10"}`}>
                  <AlertTriangle size={13} className={p.severity === "critical" ? "text-red-400" : "text-yellow-400"} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200 font-terminal">{p.service}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.reason}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-600">
                    <Clock size={10} />
                    <span>Estimated failure: {p.estimatedFailure}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <Badge label={p.severity} variant={p.severity} />
                <div className="text-right">
                  <p className={`text-2xl font-bold font-terminal ${p.probability >= 75 ? "text-red-400" : "text-orange-400"}`}>
                    {p.probability}%
                  </p>
                  <p className="text-[10px] text-gray-600">crash probability</p>
                </div>
              </div>
            </div>
            {/* Probability bar with gradient */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-1000 ${
                  p.probability >= 75 ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-gradient-to-r from-yellow-600 to-orange-500"
                }`}
                style={{ width: `${p.probability}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
