"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Bot, User, Send, Loader2 } from "lucide-react";
import { chatWithAI } from "@/lib/api";
import { ScanResult } from "@/lib/types";

interface Message { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "Why is our system slowing down?",
  "Which service is most likely to fail next?",
  "How can we reduce cloud costs?",
  "What are the critical security risks?",
];

interface Props { scanData: ScanResult | null }

export function AssistantView({ scanData }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, I'm your AI DevOps assistant. Ask me anything about your infrastructure, costs, or security risks. Run a scan first for context-aware answers." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const context = scanData ? JSON.stringify(scanData) : undefined;
      const response = await chatWithAI(msg, context);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't reach the AI backend. Make sure the backend is running." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)] md:h-[calc(100vh-140px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${m.role === "assistant" ? "bg-blue-500/20" : "bg-gray-700"}`}>
              {m.role === "assistant" ? <Bot size={14} className="text-blue-400" /> : <User size={14} className="text-gray-300" />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "assistant"
                ? "bg-[#111827] border border-gray-800 text-gray-200"
                : "bg-blue-600 text-white"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-blue-500/20">
              <Bot size={14} className="text-blue-400" />
            </div>
            <div className="bg-[#111827] border border-gray-800 rounded-xl px-4 py-2.5">
              <Loader2 size={14} className="animate-spin text-blue-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about your infrastructure..."
          className="flex-1 bg-[#111827] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}
