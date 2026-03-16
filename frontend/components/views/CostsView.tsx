"use client";

import { ScanResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingDown, Clock, Lightbulb } from "lucide-react";

interface Props { data: ScanResult | null }

export function CostsView({ data }: Props) {
  if (!data) return (
    <div className="text-gray-600 text-sm flex items-center gap-2 py-8 justify-center">
      <DollarSign size={16} className="opacity-40" /> Run a scan first.
    </div>
  );

  const total = data.costWaste.reduce((s, c) => s + c.monthlyCost, 0);
  const annual = total * 12;

  return (
    <div className="space-y-4">
      {/* Hero waste card */}
      <Card glow="red" className="bg-gradient-to-br from-[#111827] to-[#0d1117]">
        <div className="flex items-center gap-6">
          {/* Savings ring */}
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="38" fill="none" stroke="#1f2937" strokeWidth="10" />
              <circle cx="48" cy="48" r="38" fill="none" stroke="#f97316" strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 38 * 0.72} ${2 * Math.PI * 38}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-orange-400 font-terminal">72%</span>
              <span className="text-[8px] text-gray-600">waste</span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Estimated Monthly Waste</p>
            <p className="text-4xl font-bold font-terminal text-orange-400">${total.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">${annual.toFixed(0)}/year if not fixed</p>
          </div>

          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
              <TrendingDown size={14} />
              <span>Save ${total.toFixed(0)}/mo</span>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">by fixing {data.costWaste.length} issues</p>
          </div>
        </div>
      </Card>

      {/* Waste items */}
      <div className="space-y-3 stagger">
        {data.costWaste.map((item, i) => (
          <Card key={i} hover animate>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                  <DollarSign size={13} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-200 font-terminal">{item.resource}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{item.type}</span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-600">
                      <Clock size={9} /> Idle {item.idleDays} days
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 mt-2">
                    <Lightbulb size={10} className="text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-blue-400 leading-relaxed">{item.recommendation}</p>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold font-terminal text-orange-400">${item.monthlyCost}</p>
                <p className="text-[10px] text-gray-600">per month</p>
              </div>
            </div>
            {/* Waste bar */}
            <div className="mt-3 h-1 w-full rounded-full bg-gray-800">
              <div className="h-1 rounded-full bg-gradient-to-r from-orange-600 to-red-500"
                style={{ width: `${Math.min((item.monthlyCost / total) * 100 * 2, 100)}%` }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
