"use client";

import { useState, useEffect } from "react";
import { Sidebar, View } from "@/components/Sidebar";
import { ScanButton } from "@/components/ScanButton";
import { DashboardView } from "@/components/views/DashboardView";
import { InfrastructureView } from "@/components/views/InfrastructureView";
import { PredictionsView } from "@/components/views/PredictionsView";
import { SecurityView } from "@/components/views/SecurityView";
import { CostsView } from "@/components/views/CostsView";
import { AssistantView } from "@/components/views/AssistantView";
import { VoiceView } from "@/components/views/VoiceView";
import { AgentView } from "@/components/views/AgentView";
import { runScan } from "@/lib/api";
import type { ScanResult } from "@/lib/types";

const VIEW_TITLES: Record<View, string> = {
  dashboard:      "Dashboard",
  infrastructure: "Infrastructure Health",
  predictions:    "Failure Prediction",
  security:       "Security Risks",
  costs:          "Cost Optimization",
  assistant:      "AI Assistant — Nova 2 Lite",
  voice:          "Voice AI — Nova 2 Sonic",
  agent:          "Agent Automation — Nova Act",
};

const VIEW_SUBTITLES: Record<View, string> = {
  dashboard:      "Real-time infrastructure overview",
  infrastructure: "Node health and resource utilization",
  predictions:    "AI-predicted failures before they happen",
  security:       "Misconfigurations and vulnerabilities",
  costs:          "Idle resources and waste detection",
  assistant:      "Ask anything about your infrastructure",
  voice:          "Spoken queries powered by Nova 2 Sonic",
  agent:          "Autonomous remediation with Nova Act",
};

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="font-terminal text-xs text-gray-600">{time}</span>;
}

export default function Home() {
  const [view, setView]       = useState<View>("dashboard");
  const [scanning, setScanning] = useState(false);
  const [scanData, setScanData] = useState<ScanResult | null>(null);
  const [error, setError]     = useState<string | null>(null);

  async function handleScan() {
    setScanning(true);
    setError(null);
    try {
      const result = await runScan();
      setScanData(result);
    } catch {
      setError("Scan failed. Make sure the backend is running on port 8000.");
    } finally {
      setScanning(false);
    }
  }

  const criticalCount = scanData?.summary.criticalNodes ?? 0;

  return (
    <div className="flex min-h-screen bg-[#0a0e1a] grid-bg" suppressHydrationWarning>
      <Sidebar active={view} onChange={setView} criticalCount={criticalCount} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between pl-12 md:pl-6 pr-4 md:pr-6 py-3 md:py-3.5 border-b border-gray-800/80 bg-[#0a0e1a]/90 backdrop-blur-md gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm font-semibold text-gray-100 truncate">{VIEW_TITLES[view]}</h1>
              {scanData && criticalCount > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full pulse-red shrink-0">
                  {criticalCount} critical
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-600 mt-0.5 hidden sm:block">{VIEW_SUBTITLES[view]}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <LiveClock />
            {scanData && (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Last scan: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            )}
            <ScanButton onScan={handleScan} scanning={scanning} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}
          {view === "dashboard"      && <DashboardView data={scanData} />}
          {view === "infrastructure" && <InfrastructureView data={scanData} />}
          {view === "predictions"    && <PredictionsView data={scanData} />}
          {view === "security"       && <SecurityView data={scanData} />}
          {view === "costs"          && <CostsView data={scanData} />}
          {view === "assistant"      && <AssistantView scanData={scanData} />}
          {view === "voice"          && <VoiceView scanData={scanData} />}
          {view === "agent"          && <AgentView scanData={scanData} onRescan={handleScan} />}
        </div>
      </main>
    </div>
  );
}
