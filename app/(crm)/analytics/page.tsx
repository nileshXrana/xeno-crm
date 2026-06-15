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
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    DRAFT: { label: "Draft Segment", cls: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
    SENDING: { label: "Ingesting", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    SENT: { label: "Completed", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return (
    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${cls}`}>
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
    <div className="h-2.5 rounded-full flex overflow-hidden bg-secondary border border-border/30">
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

  return (
    <div className="border border-border/40 rounded-2xl overflow-hidden mb-4 bg-card shadow-xs transition-all hover:border-border">
      <div
        className="p-5 flex items-center gap-4 cursor-pointer hover:bg-secondary/10 transition-all"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Campaign icon */}
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Megaphone className="w-4 h-4 text-primary" />
        </div>

        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">
            {campaign.name}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(campaign.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        {/* Status */}
        <div className="flex-shrink-0">
          <StatusBadge status={campaign.status} />
        </div>

        {/* Delivery rate bar on wide screens */}
        <div className="hidden lg:flex flex-col items-end gap-1.5 w-40">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">
            {stats.total} target size
          </p>
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

        <div className="text-right flex-shrink-0 w-16">
          <span className="text-xs font-extrabold text-primary">
            {deliveryRate}%
          </span>
          <p className="text-[9px] text-muted-foreground uppercase leading-none mt-0.5 font-bold">delivered</p>
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border/30 bg-secondary/5/30 animate-fade-in space-y-5">
          {/* Step Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="text-center p-3 bg-secondary/20 rounded-xl border border-border/30">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                Pending
              </div>
              <p className="text-lg font-bold text-foreground mt-1 leading-none">
                {stats.pending.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-xl border border-border/30">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                <Send className="w-3.5 h-3.5 text-blue-500" />
                Sent
              </div>
              <p className="text-lg font-bold text-foreground mt-1 leading-none">
                {stats.sent.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-xl border border-border/30">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Delivered
              </div>
              <p className="text-lg font-bold text-foreground mt-1 leading-none">
                {stats.delivered.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-secondary/20 rounded-xl border border-border/30">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] font-bold text-red-500 uppercase tracking-wide">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                Failed
              </div>
              <p className="text-lg font-bold text-foreground mt-1 leading-none">
                {stats.failed.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Visual Ingestion Audit Timeline */}
          <div className="p-4 rounded-xl bg-card border border-border/40 space-y-3.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Asynchronous Ingestion Log Pipeline
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1.5">
              {/* Event Step 1 */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">1</div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-foreground">Segment Query Completed</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">Matched {stats.total} shoppers</p>
                </div>
              </div>
              
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />

              {/* Event Step 2 */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-500">2</div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-foreground">Payload Handover</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">Dispatched to gateway stub</p>
                </div>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />

              {/* Event Step 3 */}
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${stats.delivered > 0 ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500" : "bg-neutral-500/10 border border-neutral-500/30 text-neutral-500"}`}>3</div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-foreground">Callback Received</p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">Webhook parsed delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery rate bar breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Dynamic Delivery Breakdown Progress</span>
              <span className="text-primary font-bold">{deliveryRate}% Delivered</span>
            </div>
            <DeliveryBar
              delivered={stats.delivered}
              failed={stats.failed}
              sent={stats.sent}
              pending={stats.pending}
              total={stats.total}
            />
            
            <div className="flex gap-4 text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex-wrap pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Delivered ({stats.delivered})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Sent ({stats.sent})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                Pending ({stats.pending})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                Failed ({stats.failed})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/crm/campaign/stats");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns ?? []);
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

  const totalDelivered = campaigns.reduce((s, c) => s + c.stats.delivered, 0);
  const totalFailed = campaigns.reduce((s, c) => s + c.stats.failed, 0);
  const totalSent = campaigns.reduce((s, c) => s + c.stats.sent, 0);
  const totalPending = campaigns.reduce((s, c) => s + c.stats.pending, 0);
  const grandTotal = totalDelivered + totalFailed + totalSent + totalPending;
  const overallDeliveryRate =
    grandTotal > 0 ? Math.round((totalDelivered / grandTotal) * 100) : 0;

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
        
        {/* Actions */}
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
          Refresh Stats Telemetry
        </Button>
      </div>

      {/* Aggregate summary */}
      {!loading && campaigns.length > 0 && (
        <div className="glass-card p-6 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Cross-Campaign Performance Aggregates
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="p-4 bg-secondary/15 border border-border/40 rounded-xl text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Campaigns</p>
              <p className="text-2xl font-extrabold text-foreground mt-1.5 leading-none">{campaigns.length}</p>
            </div>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Delivered</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1.5 leading-none">{totalDelivered}</p>
            </div>
            <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Sent</p>
              <p className="text-2xl font-extrabold text-blue-600 mt-1.5 leading-none">{totalSent}</p>
            </div>
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/15 rounded-xl text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Pending</p>
              <p className="text-2xl font-extrabold text-yellow-600 mt-1.5 leading-none">{totalPending}</p>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/15 rounded-xl text-left">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Failed</p>
              <p className="text-2xl font-extrabold text-red-500 mt-1.5 leading-none">{totalFailed}</p>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground mb-1.5">
              <span>Overall Successful Delivery Aggregation</span>
              <span className="text-primary font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                {overallDeliveryRate}%
              </span>
            </div>
            <DeliveryBar
              delivered={totalDelivered}
              failed={totalFailed}
              sent={totalSent}
              pending={totalPending}
              total={grandTotal}
            />
          </div>
        </div>
      )}

      {/* Campaign list */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-xl" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="glass-card p-16 text-center border-t border-border/20">
            <Megaphone className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No campaign metrics compiled yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create and launch a campaign from the builder to track delivery status.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Audited Campaigns ({campaigns.length})
              </p>
            </div>
            {campaigns.map((c) => (
              <CampaignRow key={c.campaignId} campaign={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
