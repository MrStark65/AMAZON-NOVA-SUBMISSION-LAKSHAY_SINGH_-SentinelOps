"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Loader2, Radio, Square } from "lucide-react";
import { voiceQuery } from "@/lib/api";
import { ScanResult } from "@/lib/types";

const VOICE_SUGGESTIONS = [
  "Why is my server crashing?",
  "Which service will fail next?",
  "How can I reduce my cloud bill?",
  "What are the critical security risks?",
];

interface Props { scanData: ScanResult | null }

export function VoiceView({ scanData }: Props) {
  const [question, setQuestion]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [speaking, setSpeaking]   = useState(false);
  const [response, setResponse]   = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  function speak(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Pick a good voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Alex")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  async function ask(q?: string) {
    const query = q ?? question.trim();
    if (!query || loading) return;
    setQuestion(query);
    setLoading(true);
    setResponse(null);
    stopSpeaking();

    try {
      const context = scanData
        ? `${scanData.summary.criticalNodes} critical nodes, ${scanData.summary.warningNodes} warning. Waste: $${scanData.summary.totalWaste}. Risks: ${scanData.summary.criticalRisks} critical.`
        : "";

      const res = await voiceQuery(query, context);
      setResponse(res.text_response);
      speak(res.text_response);
    } catch {
      const fallback = "Voice service unavailable. Make sure the backend is running.";
      setResponse(fallback);
      speak(fallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <Card glow="blue">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <Radio size={22} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">Nova 2 Sonic — Voice AI</p>
            <p className="text-xs text-gray-500">Ask questions about your infrastructure and get spoken answers</p>
          </div>
          {speaking && (
            <div className="ml-auto flex items-center gap-2">
              <span className="flex gap-0.5">
                {[1,2,3,4].map(i => (
                  <span key={i} className="w-0.5 bg-blue-400 rounded-full animate-pulse"
                    style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </span>
              <span className="text-xs text-blue-400">Speaking...</span>
            </div>
          )}
        </div>
      </Card>

      {/* Suggestions */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          {VOICE_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-blue-500/50 hover:text-blue-400 transition-colors">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
          placeholder="Ask a voice question..."
          className="flex-1 bg-[#111827] border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500/50"
        />
        {speaking ? (
          <button onClick={stopSpeaking}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg transition-colors">
            <Square size={15} className="text-white" />
          </button>
        ) : (
          <button onClick={() => ask()} disabled={!question.trim() || loading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors">
            {loading ? <Loader2 size={15} className="text-white animate-spin" /> : <Mic size={15} className="text-white" />}
          </button>
        )}
      </div>

      {/* Response */}
      {response && (
        <Card glow="blue">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
              <Volume2 size={15} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Nova 2 Sonic response</p>
              <p className="text-sm text-gray-200 leading-relaxed">{response}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
