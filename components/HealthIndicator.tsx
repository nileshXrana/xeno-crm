"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Zap } from "lucide-react";

interface HealthStatus {
  status: string;
  db: {
    status: string;
    latencyMs?: number;
    error?: string;
  };
  timestamp: string;
}

export default function HealthIndicator() {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth({ status: "error", db: { status: "unreachable" }, timestamp: new Date().toISOString() });
      }
    }
    check();
    // Recheck every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  const isOk = health.status === "ok" && health.db.status === "connected";

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
      isOk ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isOk ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
      <span className="font-medium">{isOk ? `DB Connected` : "DB Error"}</span>
      {isOk && health.db.latencyMs !== undefined && (
        <span className="opacity-60">{health.db.latencyMs}ms</span>
      )}
    </div>
  );
}
