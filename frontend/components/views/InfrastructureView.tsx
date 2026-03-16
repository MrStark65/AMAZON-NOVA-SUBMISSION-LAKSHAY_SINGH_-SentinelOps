"use client";

import { ScanResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Server, Cpu, HardDrive, MemoryStick } from "lucide-react";
import { clsx } from "clsx";

interface Props { data: ScanResult | null }

const statusDot: Record<string, string> = {
  healthy:  "bg-emerald-400",
  warning:  "bg-yellow-400",
  critical: "bg-red-400 pulse-dot",
};

export function InfrastructureView({ data }: Props) {
  if (!data) return (
    <div className="text-gray-600 text-sm flex items-center gap-2 py-8 justify-center">
      <Server size={16} className="opacity-40" /> Run a scan first.
    </div>
  );

  const counts = { healthy: 0, warning: 0, critical: 0 };
  data.nodes.forEach(n => counts[n.status]++);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-4 py-2.5 rounded-lg bg-gray-800/30 border border-gray-800/60 text-xs">
        <span className="text-gray-500">{data.nodes.length} nodes scanned</span>
        <span className="text-gray-700">·</span>
        <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{counts.healthy} healthy</span>
        <span className="flex items-center gap-1.5 text-yellow-400"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{counts.warning} warning</span>
        <span className="flex items-center gap-1.5 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{counts.critical} critical</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 stagger">
        {data.nodes.map((node) => (
          <Card key={node.id}
            glow={node.status === "critical" ? "red" : node.status === "warning" ? undefined : "green"}
            hover animate
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className={clsx("w-7 h-7 rounded-lg flex items-center justify-center",
                    node.status === "critical" ? "bg-red-500/10" :
                    node.status === "warning"  ? "bg-yellow-500/10" : "bg-emerald-500/10"
                  )}>
                    <Server size={13} className={
                      node.status === "critical" ? "text-red-400" :
                      node.status === "warning"  ? "text-yellow-400" : "text-emerald-400"
                    } />
                  </div>
                  <span className={clsx("absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full", statusDot[node.status])} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-200 font-terminal">{node.name}</p>
                  <p className="text-[10px] text-gray-600">uptime {node.uptime}</p>
                </div>
              </div>
              <Badge
                label={node.status}
                variant={node.status === "critical" ? "critical" : node.status === "warning" ? "warning" : "healthy"}
              />
            </div>
            <div className="space-y-2">
              <ProgressBar value={node.cpu}    label="CPU" />
              <ProgressBar value={node.memory} label="Memory" />
              <ProgressBar value={node.disk}   label="Disk" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
