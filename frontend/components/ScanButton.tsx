"use client";

import { useState } from "react";
import { Scan, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface ScanButtonProps {
  onScan: () => Promise<void>;
  scanning: boolean;
}

export function ScanButton({ onScan, scanning }: ScanButtonProps) {
  return (
    <button
      onClick={onScan}
      disabled={scanning}
      className={clsx(
        "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all",
        scanning
          ? "bg-blue-500/20 text-blue-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
      )}
    >
      {scanning ? <Loader2 size={16} className="animate-spin" /> : <Scan size={16} />}
      {scanning ? "Scanning Infrastructure..." : "Run Infrastructure Scan"}
    </button>
  );
}
