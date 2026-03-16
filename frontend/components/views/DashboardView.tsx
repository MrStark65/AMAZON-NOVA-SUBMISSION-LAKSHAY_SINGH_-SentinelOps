"use client";

import { ScanResult } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { HealthRing } from "@/components/ui/health-ring";
import {
  Server, DollarSign, AlertTriangle, ShieldAlert,
  TrendingUp, Bot, TrendingDown, Minus, CheckCircle, Zap, Activity
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from "recharts";

interface Props { data: ScanResult | null }

export function DashboardView({ data }: Props) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-600 gap-4 grid-bg rounded-2xl border border-gray-800/50">
        <div className="p-4 rounded-2xl bg-gray-800/30 border border-gray-700/30">
          <Activity size={32} className="opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-400">No scan data yet</p>
          <p className="text-xs text-gray-600 mt-1">Click "Run Infrastructure Scan" to begin</p>
        </div>
      </div>
    );
  }

  const { summary, predictions, securityRisks, metrics, aiSummary, trend, agentLog } = data;

  const trendIcon = trend.trend === "rising"
    ? <TrendingUp size={12} className="text-red-400" />
    : trend.trend === "falling"
    ? <TrendingDown size={12} className="text-emerald-400" />
    : <Minus size={12} className="text-gray-400" />;

  return (
    <div className="space-y-5 stagger">
      {/* AI Summary Banner */}
      {aiSummary && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/5 border border-blue-500/20 fade-in-up">
          <div className="p-1.5 rounded-lg bg-blue-500/20 shrink-0 mt-0.5">
            <Bot size={13} className="text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider mb-0.5">Nova 2 Lite Analysis</p>
            <p className="text-sm text-blue-100/80 leading-relaxed">{aiSummary}</p>
          </div>
        </div>
      )}

      {/* Top row: stat cards + health ring */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 fade-in-up">
        <StatCard label="Healthy Nodes"  value={summary.healthyNodes}  icon={<Server size={16} />} color="green"  glow />
        <StatCard label="Warning Nodes"  value={summary.warningNodes}  icon={<Server size={16} />} color="yellow" />
        <StatCard label="Critical Nodes" value={summary.criticalNodes} icon={<Server size={16} />} color="red"    glow />
        <StatCard label="Monthly Waste"  value={summary.totalWaste}    icon={<DollarSign size={16} />} color="orange" prefix="$" />
        <StatCard label="Security Risks" value={summary.criticalRisks} icon={<ShieldAlert size={16} />} color="purple" />
      </div>

      {/* Health ring + metrics chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 fade-in-up">
        <Card className="flex items-center justify-center py-6">
          <HealthRing
            healthy={summary.healthyNodes}
            warning={summary.warningNodes}
            critical={summary.criticalNodes}
          />
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Metrics — Last 24h</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="w-2 h-0.5 bg-blue-400 rounded" /> CPU
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                <span className="w-2 h-0.5 bg-purple-400 rounded" /> Memory
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                {trendIcon}
                <span>{trend.trend}</span>
                {trend.eta_hours && <span className="text-red-400">· 90% in ~{trend.eta_hours}h</span>}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={metrics} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.4} />
              <Tooltip
                contentStyle={{ background: "#0d1117", border: "1px solid #1f2937", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#6b7280" }}
                cursor={{ stroke: "#374151", strokeWidth: 1 }}
              />
              <Area type="monotone" dataKey="cpu"    stroke="#3b82f6" fill="url(#gCpu)" name="CPU %"    strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="memory" stroke="#8b5cf6" fill="url(#gMem)" name="Memory %" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Predictions + Security */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in-up">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded bg-yellow-500/10">
              <AlertTriangle size={12} className="text-yellow-400" />
            </div>
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Failure Predictions</p>
          </div>
          <div className="space-y-3">
            {predictions.slice(0, 3).map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-200">{p.service}</p>
                    <p className="text-[10px] text-gray-500">{p.estimatedFailure}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-terminal ${p.probability >= 75 ? "text-red-400" : "text-orange-400"}`}>
                      {p.probability}%
                    </span>
                    <Badge label={p.severity} variant={p.severity} />
                  </div>
                </div>
                <div className="h-1 w-full rounded-full bg-gray-800">
                  <div
                    className={`h-1 rounded-full transition-all duration-1000 ${p.probability >= 75 ? "bg-red-500" : "bg-yellow-500"}`}
                    style={{ width: `${p.probability}%` }}
                  />
                </div>
              </div>
            ))}
            {predictions.length === 0 && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 py-2">
                <CheckCircle size={12} /> All services healthy
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded bg-red-500/10">
              <ShieldAlert size={12} className="text-red-400" />
            </div>
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Security Risks</p>
            {securityRisks.filter(r => r.severity === "critical").length > 0 && (
              <span className="ml-auto text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full pulse-red">
                {securityRisks.filter(r => r.severity === "critical").length} Critical
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {securityRisks.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-200 truncate">{r.title}</p>
                  <p className="text-[10px] text-gray-600 truncate">{r.resource}</p>
                </div>
                <Badge label={r.severity} variant={r.severity} />
              </div>
            ))}
            {securityRisks.length === 0 && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5 py-2">
                <CheckCircle size={12} /> No active risks
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Agent log */}
      {agentLog.length > 0 && (
        <Card glow="green" animate>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded bg-emerald-500/10">
              <Zap size={12} className="text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Agent Automation Log</p>
            <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
              {agentLog.length} fixed
            </span>
          </div>
          <div className="space-y-1.5">
            {agentLog.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle size={11} className="text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-gray-300">{log.action_taken}</span>
                <span className="text-gray-600 ml-auto shrink-0">{log.affected_resource}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
