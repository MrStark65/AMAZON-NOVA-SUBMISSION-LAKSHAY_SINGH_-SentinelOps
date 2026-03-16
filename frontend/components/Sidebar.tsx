"use client";

import React from "react";
import { clsx } from "clsx";
import {
  LayoutDashboard, Server, AlertTriangle, ShieldAlert,
  DollarSign, Bot, Activity, Mic, Zap, ChevronRight
} from "lucide-react";

export type View = "dashboard" | "infrastructure" | "predictions" | "security" | "costs" | "assistant" | "voice" | "agent";

type SectionItem = { id: View; label: string; Icon: React.ElementType };
type Section = { label: string; items: SectionItem[] };

const sections: Section[] = [
  {
    label: "Monitoring",
    items: [
      { id: "dashboard",      label: "Dashboard",         Icon: LayoutDashboard },
      { id: "infrastructure", label: "Infrastructure",     Icon: Server },
      { id: "predictions",    label: "Failure Prediction", Icon: AlertTriangle },
    ],
  },
  {
    label: "Security & Cost",
    items: [
      { id: "security", label: "Security Risks",    Icon: ShieldAlert },
      { id: "costs",    label: "Cost Optimization", Icon: DollarSign },
    ],
  },
  {
    label: "AI Features",
    items: [
      { id: "assistant", label: "AI Assistant",      Icon: Bot },
      { id: "voice",     label: "Voice AI",          Icon: Mic },
      { id: "agent",     label: "Agent Automation",  Icon: Zap },
    ],
  },
];

interface SidebarProps {
  active: View;
  onChange: (v: View) => void;
  criticalCount?: number;
}

export function Sidebar({ active, onChange, criticalCount = 0 }: SidebarProps) {
  return (
    <aside suppressHydrationWarning className="w-56 shrink-0 flex flex-col bg-[#0d1117] border-r border-gray-800/80 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-800/80">
        <div className="relative">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Activity size={14} className="text-blue-400" />
          </div>
          {/* Live indicator */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
        </div>
        <div>
          <p className="font-bold text-white text-sm tracking-wide leading-none">SentinelOps</p>
          <p className="text-[10px] text-gray-500 mt-0.5">AI Platform</p>
        </div>
        <span className="ml-auto text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full font-medium">
          LIVE
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = active === item.id;
                const isCritical = item.id === "predictions" && criticalCount > 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    className={clsx(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 group",
                      isActive
                        ? "nav-active text-blue-400 font-medium"
                        : "text-gray-500 hover:text-gray-200 hover:bg-gray-800/40"
                    )}
                  >
                    <span className={clsx("shrink-0", isActive ? "text-blue-400" : "text-gray-600 group-hover:text-gray-400")}>
                      <item.Icon size={15} />
                    </span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isCritical && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 pulse-dot shrink-0" />
                    )}
                    {isActive && <ChevronRight size={11} className="shrink-0 opacity-50" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800/80">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-gray-600">All systems operational</span>
        </div>
        <p className="text-[10px] text-gray-700 mt-1">v1.0.0 · Hackathon Demo</p>
      </div>
    </aside>
  );
}
