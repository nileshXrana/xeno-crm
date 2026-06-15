"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  Megaphone,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Search,
  Filter,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignStat {
  campaignId: string;
  name: string;
  status: string;
  createdAt: string;
  stats: {
    pending: number;
    sent: number;
    delivered: number;
    failed: number;
    total: number;
  };
  rules?: Array<{
    field: string;
    operator: string;
    value: string | number;
    logic: string;
  }>;
  generatedMessage?: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    DRAFT: { label: "Draft", cls: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
    SENDING: { label: "Ingesting", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse" },
    SENT: { label: "Completed", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return (
    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${cls}`}>
      {label}
    </span>
  );
}

function DeliveryBar({
  delivered,
  failed,
  sent,
  pending,
  total,
}: {
  delivered: number;
  failed: number;
  sent: number;
  pending: number;
  total: number;
}) {
  if (total === 0) return <div className="h-2 bg-secondary rounded-full" />;
  const deliveredPct = (delivered / total) * 100;
  const failedPct = (failed / total) * 100;
  const sentPct = (sent / total) * 100;
  const pendingPct = (pending / total) * 100;

  return (
    <div className="h-2 rounded-full flex overflow-hidden bg-secondary border border-border/30">
      <div
        className="h-full bg-emerald-500 transition-all duration-500"
        style={{ width: `${deliveredPct}%` }}
        title={`Delivered: ${delivered}`}
      />
      <div
        className="h-full bg-blue-500 transition-all duration-500"
        style={{ width: `${sentPct}%` }}
        title={`Sent: ${sent}`}
      />
      <div
        className="h-full bg-yellow-500 transition-all duration-500"
        style={{ width: `${pendingPct}%` }}
        title={`Pending: ${pending}`}
      />
      <div
        className="h-full bg-red-500 transition-all duration-500"
        style={{ width: `${failedPct}%` }}
        title={`Failed: ${failed}`}
      />
    </div>
  );
}

function CampaignRow({ campaign }: { campaign: CampaignStat }) {
  const [expanded, setExpanded] = useState(false);
  const { stats } = campaign;
  const deliveryRate =
    stats.total > 0
      ? Math.round((stats.delivered / stats.total) * 100)
      : 0;

  // Real-time CLI Logs Emulator
  const getSimulatedLogs = () => {
    const logs = [];
    const time = new Date(campaign.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    logs.push(`[${time}] [DISPATCH] Initializing campaign batch queue...`);
    logs.push(`[${time}] [AUDIENCE] Matching dynamic segment. Query size: ${stats.total}`);
    
    if (stats.sent > 0 || stats.delivered > 0 || stats.failed > 0) {
      logs.push(`[${time}] [GATEWAY] Payload forwarded. StatusCode: 200 (SENT: ${stats.sent + stats.delivered + stats.failed})`);
    }
    if (stats.delivered > 0) {
      logs.push(`[${time}] [CALLBACK] Webhook loop trigger - Recipient receipt parsed: ${stats.delivered} DELIVERED`);
    }
    if (stats.failed > 0) {
      logs.push(`[${time}] [CALLBACK] Dropped connection: ${stats.failed} FAILED (Simulating 10% gateway fail rate)`);
    }
    if (stats.pending > 0) {
      logs.push(`[${time}] [INGEST] Awaiting feedback for remaining ${stats.pending} pending callbacks...`);
    } else {
      logs.push(`[${time}] [COMPLETED] Ingestion queue resolved. Broadcast task terminated.`);
    }
    
    return logs;
  };

  return (
    <div className="border border-border/40 rounded-2xl overflow-hidden mb-4 bg-card shadow-xs transition-all hover:border-border">
      {/* Row Header collapsed view */}
      <div
        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-secondary/15 transition-all"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Campaign icon */}
          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-4 h-4 text-primary" />
          </div>

          {/* Title and metadata */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold text-foreground truncate">
                {campaign.name}
              </p>
              <StatusBadge status={campaign.status} />
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1 font-medium flex-wrap">
              <span>{stats.total} recipients</span>
              <span>•</span>
              <span>
                {new Date(campaign.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic rule representation */}
        <div className="flex items-center gap-1.5 flex-wrap max-w-xs md:max-w-none">
          {campaign.rules && campaign.rules.length > 0 ? (
            campaign.rules.map((r, i) => (
              <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border/40 text-muted-foreground">
                {r.field} {r.operator} {r.value}
              </span>
            ))
          ) : (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-secondary border border-border/40 text-muted-foreground">
              All Shoppers
            </span>
          )}
        </div>

        {/* Small horizontal progress gauge */}
        <div className="flex items-center gap-4 flex-shrink-0 justify-between md:justify-end">
          <div className="w-24 flex flex-col gap-1 items-end">
            <div className="flex justify-between w-full text-[9px] font-bold text-muted-foreground">
              <span>Delivery</span>
              <span className="text-primary">{deliveryRate}%</span>
            </div>
            <div className="w-full">
              <DeliveryBar
                delivered={stats.delivered}
                failed={stats.failed}
                sent={stats.sent}
                pending={stats.pending}
                total={stats.total}
              />
            </div>
          </div>
          
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Expanded telemetry */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/30 bg-secondary/5/20 animate-fade-in space-y-5">
          {/* Detailed metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="text-center p-3 bg-secondary/15 rounded-xl border border-border/30">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Pending Queue</span>
              <p className="text-lg font-extrabold text-foreground mt-1.5 leading-none">{stats.pending}</p>
            </div>
            <div className="text-center p-3 bg-secondary/15 rounded-xl border border-border/30">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Dispatched</span>
              <p className="text-lg font-extrabold text-foreground mt-1.5 leading-none">{stats.sent}</p>
            </div>
            <div className="text-center p-3 bg-secondary/15 rounded-xl border border-border/30">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Delivered</span>
              <p className="text-lg font-extrabold text-emerald-600 mt-1.5 leading-none">{stats.delivered}</p>
            </div>
            <div className="text-center p-3 bg-secondary/15 rounded-xl border border-border/30">
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider block">Dropped</span>
              <p className="text-lg font-extrabold text-red-500 mt-1.5 leading-none">{stats.failed}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left Column: Template copy review */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Generated Campaign Copy Template
              </p>
              <div className="bg-card p-4 rounded-xl border border-border/40 text-[11px] font-semibold text-foreground font-mono leading-relaxed h-[130px] overflow-y-auto">
                {campaign.generatedMessage || "No generated template text compiled for this campaign."}
              </div>
            </div>

            {/* Right Column: Webhook CLI Console */}
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                Webhook Ingestion CLI Terminal
              </p>
              <div className="bg-neutral-950 text-neutral-400 p-4 rounded-xl font-mono text-[10px] leading-relaxed h-[130px] overflow-y-auto border border-neutral-800 shadow-inner">
                {getSimulatedLogs().map((log, index) => (
                  <p key={index} className={log.includes("DELIVERED") ? "text-emerald-500" : log.includes("FAILED") ? "text-red-400" : log.includes("INGEST") ? "text-yellow-500" : "text-neutral-400"}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery progression indicators */}
          <div className="pt-2">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1.5">
              <span>Delivery Ingestion Rate</span>
              <span className="text-primary font-bold">{deliveryRate}% Delivered</span>
            </div>
            <DeliveryBar
              delivered={stats.delivered}
              failed={stats.failed}
              sent={stats.sent}
              pending={stats.pending}
              total={stats.total}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, SENT, SENDING

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/crm/campaign/stats");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns ?? []);
        setFilteredCampaigns(data.campaigns ?? []);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handle filtering logic
  useEffect(() => {
    let result = campaigns;
    
    // Status Filter
    if (statusFilter !== "ALL") {
      result = result.filter(c => c.status === statusFilter);
    }

    // Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    setFilteredCampaigns(result);
  }, [searchQuery, statusFilter, campaigns]);

  const totalDelivered = campaigns.reduce((s, c) => s + c.stats.delivered, 0);
  const totalFailed = campaigns.reduce((s, c) => s + c.stats.failed, 0);
  const totalSent = campaigns.reduce((s, c) => s + c.stats.sent, 0);
  const totalPending = campaigns.reduce((s, c) => s + c.stats.pending, 0);
  const grandTotal = totalDelivered + totalFailed + totalSent + totalPending;
  const overallDeliveryRate =
    grandTotal > 0 ? Math.round((totalDelivered / grandTotal) * 100) : 0;

  // SVG circular ring values
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallDeliveryRate / 100) * circumference;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Analytics Dashboard</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Comprehensive telemetry of asynchronous delivery receipt webhook events
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="border-border hover:bg-secondary w-full sm:w-auto h-10 rounded-xl text-xs font-bold"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh Telemetry
        </Button>
      </div>

      {/* Aggregate summary Section (2-Column Grid) */}
      {!loading && campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Circular Success Ring Card (1 span) */}
          <div className="glass-card p-6 flex items-center gap-6 lg:col-span-1">
            <div className="relative flex-shrink-0">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="text-secondary"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  className="text-[#6366f1] transition-all duration-500"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-extrabold text-foreground">{overallDeliveryRate}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Delivery Ingestion Rate</h3>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                Aggregated successful delivery feedback receipts parsed across all dispatched loops.
              </p>
            </div>
          </div>

          {/* Metric Cards Grid (2 spans) */}
          <div className="lg:col-span-2 glass-card p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 justify-between">
            <div className="p-4 bg-secondary/15 border border-border/40 rounded-xl text-left">
              <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">Total Size</p>
              <p className="text-xl font-extrabold text-foreground mt-2 leading-none">{grandTotal.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-left">
              <p className="text-[9px] font-bold text-emerald-600 uppercase leading-none">Delivered</p>
              <p className="text-xl font-extrabold text-emerald-600 mt-2 leading-none">{totalDelivered.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/15 rounded-xl text-left">
              <p className="text-[9px] font-bold text-yellow-600 uppercase leading-none">Pending Ingest</p>
              <p className="text-xl font-extrabold text-yellow-600 mt-2 leading-none">{totalPending.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl text-left">
              <p className="text-[9px] font-bold text-red-500 uppercase leading-none">Dropped</p>
              <p className="text-xl font-extrabold text-red-500 mt-2 leading-none">{totalFailed.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Filters Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex items-center bg-secondary/35 border border-border/30 rounded-xl px-3.5 py-1.5 flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by descriptor title..."
            className="bg-transparent border-0 focus:outline-hidden text-xs font-bold w-full h-6 pl-2"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === "ALL"
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            All Campaigns
          </button>
          <button
            onClick={() => setStatusFilter("SENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === "SENDING"
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Active Ingestions
          </button>
          <button
            onClick={() => setStatusFilter("SENT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === "SENT"
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Campaign telemetry list */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-xl" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="glass-card p-16 text-center border border-dashed border-border/80 rounded-2xl">
            <Megaphone className="w-8 h-8 text-muted-foreground/60 mx-auto mb-3" />
            <p className="text-xs text-foreground font-semibold">No records matched</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {searchQuery ? "Clear search filters to see active records." : "Seeding demo records is recommended."}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Audited campaigns ({filteredCampaigns.length})
              </p>
            </div>
            {filteredCampaigns.map((c) => (
              <CampaignRow key={c.campaignId} campaign={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
