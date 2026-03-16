"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bot, Play, CheckCircle, Clock, Loader2, Zap, RotateCcw } from "lucide-react";
import { runAgentTask, getAgentSuggestions } from "@/lib/api";
import { ScanResult } from "@/lib/types";

const TASK_LABELS: Record<string, { label: string; description: string; color: string }> = {
  stop_idle_instance:      { label: "Stop Idle Instance",       description: "Detect idle EC2 → snapshot → stop → report",        color: "text-orange-400" },
  fix_public_bucket:       { label: "Fix Public S3 Bucket",     description: "Detect public bucket → apply private ACL → notify",  color: "text-red-400"    },
  restart_failing_service: { label: "Restart Failing Service",  description: "Detect high crash risk → drain → restart → monitor", color: "text-yellow-400" },
  scale_memory_service:    { label: "Scale Memory Service",     description: "Detect memory exhaustion → increase limit → deploy", color: "text-blue-400"   },
};

interface AgentResult {
  task_type: string; task: string; status: string;
  steps_taken: string[]; output: string; demo_mode: boolean;
}

interface Props { scanData: ScanResult | null; onRescan: () => void }

export function AgentView({ scanData, onRescan }: Props) {
  const [running, setRunning]       = useState<string | null>(null);
  const [results, setResults]       = useState<Record<string, AgentResult>>({});
  const [suggestions, setSuggestions] = useState<{ task_type: string; task: string }[]>([]);

  // Pre-populate already-fixed tasks from scan data
  useEffect(() => {
    if (scanData?.fixedTasks) {
      const pre: Record<string, AgentResult> = {};
      scanData.fixedTasks.forEach(t => {
        if (TASK_LABELS[t]) {
          pre[t] = {
            task_type: t, task: TASK_LABELS[t].label,
            status: "completed", steps_taken: getSteps(t),
            output: "Fixed by agent. Dashboard updated.", demo_mode: true,
          };
        }
      });
      setResults(pre);
    }
  }, [scanData]);

  useEffect(() => {
    if (scanData) {
      getAgentSuggestions().then(r => setSuggestions(r.suggestions)).catch(() => {});
    }
  }, [scanData]);

  async function executeTask(taskType: string) {
    setRunning(taskType);
    try {
      const result = await runAgentTask(taskType) as AgentResult;
      setResults(prev => ({ ...prev, [taskType]: result }));
      // Re-scan so dashboard reflects the fix
      onRescan();
    } catch {
      setResults(prev => ({ ...prev, [taskType]: {
        task_type: taskType, task: "", status: "failed",
        steps_taken: [], output: "Agent task failed. Check backend connection.", demo_mode: true,
      }}));
    } finally {
      setRunning(null);
    }
  }

  async function resetDemo() {
    await fetch("/api/agent/reset", { method: "POST" });
    setResults({});
    onRescan();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card glow="blue">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10">
            <Zap size={22} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">Nova Act — AI Agent Automation</p>
            <p className="text-xs text-gray-500">Autonomous multi-step DevOps actions. Fixes persist on dashboard across restarts.</p>
          </div>
          <button onClick={resetDemo}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-xs text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors">
            <RotateCcw size={11} /> Reset Demo
          </button>
        </div>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
            <Bot size={11} /> Nova 2 Lite recommends:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s.task_type} onClick={() => executeTask(s.task_type)}
                disabled={!!results[s.task_type] || !!running}
                className="text-xs px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 disabled:opacity-40 transition-colors">
                {TASK_LABELS[s.task_type]?.label ?? s.task_type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.entries(TASK_LABELS).map(([taskType, meta]) => {
          const result  = results[taskType];
          const isFixed = result?.status === "completed" || result?.status === "planned";
          const isRunning = running === taskType;

          return (
            <Card key={taskType} className={isFixed ? "border-emerald-500/20 glow-green" : ""}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className={`text-sm font-medium ${isFixed ? "text-emerald-400" : meta.color}`}>
                    {isFixed && "✓ "}{meta.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                </div>
                {!isFixed && (
                  <button onClick={() => executeTask(taskType)} disabled={!!running}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs text-gray-300 transition-colors shrink-0">
                    {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    {isRunning ? "Running..." : "Run"}
                  </button>
                )}
              </div>

              {result && (
                <div className="mt-3 pt-3 border-t border-gray-800 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={12} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400 capitalize">{result.status}</span>
                  </div>
                  {result.steps_taken.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <Clock size={10} className="mt-0.5 shrink-0 text-gray-600" />
                      <span>{step}</span>
                    </div>
                  ))}
                  {result.output && <p className="text-xs text-blue-400 pt-1">{result.output}</p>}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Agent log from scan */}
      {scanData?.agentLog && scanData.agentLog.length > 0 && (
        <Card>
          <p className="text-xs font-medium text-gray-400 mb-3">Agent Action Log</p>
          <div className="space-y-2">
            {scanData.agentLog.map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle size={11} className="text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-gray-300">{log.action_taken}</span>
                  <span className="text-gray-600 ml-2">→ {log.affected_resource}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function getSteps(taskType: string): string[] {
  const steps: Record<string, string[]> = {
    stop_idle_instance:      ["Identified idle instance ID","Verified idle for 14+ days","Created snapshot backup","Stopped instance via EC2 API","Generated cost savings report"],
    fix_public_bucket:       ["Identified public S3 bucket","Audited bucket policy and ACL","Applied private ACL","Enabled versioning and logging","Generated security report"],
    restart_failing_service: ["Identified high crash probability service","Captured logs and metrics snapshot","Gracefully drained connections","Restarted service container","Monitored recovery for 5 minutes"],
    scale_memory_service:    ["Identified memory exhaustion service","Checked resource limits","Increased memory limit by 50%","Deployed updated configuration","Verified memory stabilized"],
  };
  return steps[taskType] ?? [];
}
