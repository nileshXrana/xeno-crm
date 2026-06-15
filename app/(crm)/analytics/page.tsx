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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    DRAFT: { label: "Draft", cls: "status-pending" },
    SENDING: { label: "Sending", cls: "status-sent" },
    SENT: { label: "Sent", cls: "status-delivered" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "" };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
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
    <div className="h-2 rounded-full flex overflow-hidden bg-secondary">
      <div
        className="h-full bg-green-500 transition-all duration-500"
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
    <div className="border border-border/50 rounded-xl overflow-hidden mb-3 animate-fade-in">
      <div
        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        {/* Campaign icon */}
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Megaphone className="w-4 h-4 text-primary" />
        </div>

        {/* Name + date */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {campaign.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(campaign.createdAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        {/* Status */}
        <StatusBadge status={campaign.status} />

        {/* Delivery rate */}
        <div className="hidden md:flex flex-col items-end gap-1 w-32">
          <p className="text-xs text-muted-foreground">
            {stats.total} recipients
          </p>
          <DeliveryBar
            delivered={stats.delivered}
            failed={stats.failed}
            sent={stats.sent}
            pending={stats.pending}
            total={stats.total}
          />
        </div>

        <span className="text-sm font-bold text-primary w-12 text-right">
          {deliveryRate}%
        </span>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Expanded stats */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 animate-fade-in">
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
              <p className="text-xl font-bold status-pending rounded-md px-1">
                {stats.pending}
              </p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Send className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-muted-foreground">Sent</span>
              </div>
              <p className="text-xl font-bold status-sent rounded-md px-1">
                {stats.sent}
              </p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-muted-foreground">Delivered</span>
              </div>
              <p className="text-xl font-bold status-delivered rounded-md px-1">
                {stats.delivered}
              </p>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <XCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-muted-foreground">Failed</span>
              </div>
              <p className="text-xl font-bold status-failed rounded-md px-1">
                {stats.failed}
              </p>
            </div>
          </div>

          {/* Color legend */}
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <DeliveryBar
              delivered={stats.delivered}
              failed={stats.failed}
              sent={stats.sent}
              pending={stats.pending}
              total={stats.total}
            />
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Delivered
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Sent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
              Pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Failed
            </span>
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
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Campaign delivery statistics and performance
            </p>
          </div>
        </div>
        <Button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="border-border hover:bg-secondary"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh Stats
        </Button>
      </div>

      {/* Aggregate summary */}
      {!loading && campaigns.length > 0 && (
        <div className="glass-card p-5 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            All Campaigns · Overall Performance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Campaigns</p>
              <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Delivered</p>
              <p className="text-2xl font-bold text-green-400">{totalDelivered}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sent</p>
              <p className="text-2xl font-bold text-blue-400">{totalSent}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{totalPending}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-400">{totalFailed}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Overall Delivery Rate</span>
              <span className="text-primary font-bold">{overallDeliveryRate}%</span>
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
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-xl" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            No campaigns yet
          </p>
          <p className="text-xs text-muted-foreground">
            Create your first campaign on the{" "}
            <a href="/campaigns" className="text-primary hover:underline">
              Campaigns page
            </a>
            .
          </p>
        </div>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
            {campaigns.length} Campaign{campaigns.length !== 1 ? "s" : ""}
          </p>
          {campaigns.map((c) => (
            <CampaignRow key={c.campaignId} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
