import type { ScanResult } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : "/api";

export async function runScan(): Promise<ScanResult> {
  const res = await fetch(`${BASE}/scan`, { method: "POST" });
  if (!res.ok) throw new Error("Scan failed");
  return res.json();
}

export async function chatWithAI(message: string, context?: string): Promise<string> {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context }),
  });
  if (!res.ok) throw new Error("Chat failed");
  const data = await res.json();
  return data.response;
}

export async function voiceQuery(question: string, infraContext?: string): Promise<{ text_response: string; audio_base64: string | null; demo_mode: boolean }> {
  const res = await fetch(`${BASE}/voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, infra_context: infraContext ?? "" }),
  });
  if (!res.ok) throw new Error("Voice query failed");
  return res.json();
}

export async function runAgentTask(taskType: string, context?: object): Promise<object> {
  const res = await fetch(`${BASE}/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task_type: taskType, context: context ?? {} }),
  });
  if (!res.ok) throw new Error("Agent task failed");
  return res.json();
}

export async function getAgentSuggestions(): Promise<{ suggestions: { task_type: string; task: string; steps: string[] }[] }> {
  const res = await fetch(`${BASE}/agent/suggest`, { method: "POST" });
  if (!res.ok) throw new Error("Agent suggest failed");
  return res.json();
}

export async function getMetrics(): Promise<ScanResult["metrics"]> {
  const res = await fetch(`${BASE}/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}
