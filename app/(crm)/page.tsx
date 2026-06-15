"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Megaphone,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Sparkles,
  Activity,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalCampaigns: number;
  totalDelivered: number;
  totalFailed: number;
  totalPending: number;
  recentCampaigns: Array<{
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
  }>;
}

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  colorClass,
  borderColor,
  delay = 0,
}: {
  label: string;
  value: number | string;
  subtext?: string;
  icon: React.ElementType;
  colorClass: string;
  borderColor: string;
  delay?: number;
}) {
  return (
    <div
      className="stat-card glass-card p-6 animate-fade-in flex flex-col justify-between h-36"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${colorClass} ${borderColor} border`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {subtext && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2 font-medium">
          <TrendingUp className="w-3 h-3 text-green-500" />
          {subtext}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      setLoading(true);
      const res = await fetch("/api/crm/campaign/stats");
      const data = await res.json();
      if (data.success) {
        const campaigns = data.campaigns ?? [];
        const totalDelivered = campaigns.reduce(
          (sum: number, c: { stats: { delivered: number } }) => sum + c.stats.delivered,
          0
        );
        const totalFailed = campaigns.reduce(
          (sum: number, c: { stats: { failed: number } }) => sum + c.stats.failed,
          0
        );
        const totalPending = campaigns.reduce(
          (sum: number, c: { stats: { pending: number } }) => sum + c.stats.pending,
          0
        );
        setStats({
          totalCampaigns: campaigns.length,
          totalDelivered,
          totalFailed,
          totalPending,
          recentCampaigns: campaigns.slice(0, 4),
        });
      }
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const totalDispatched = (stats?.totalDelivered ?? 0) + (stats?.totalFailed ?? 0) + (stats?.totalPending ?? 0);
  const deliveryRate = totalDispatched > 0 ? Math.round(((stats?.totalDelivered ?? 0) / totalDispatched) * 100) : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Dynamic Upper Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Control Panel
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              AI-Native Campaigns & Webhook Loop Orchestration
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Campaigns"
            value={stats?.totalCampaigns ?? 0}
            subtext="All systems operational"
            icon={Megaphone}
            colorClass="bg-primary/5 text-primary"
            borderColor="border-primary/25"
            delay={0}
          />
          <StatCard
            label="Delivered Receipts"
            value={stats?.totalDelivered ?? 0}
            subtext={`${deliveryRate}% overall success rate`}
            icon={CheckCircle2}
            colorClass="bg-emerald-500/5 text-emerald-600"
            borderColor="border-emerald-500/25"
            delay={100}
          />
          <StatCard
            label="Dropped Deliveries"
            value={stats?.totalFailed ?? 0}
            subtext="Simulating 10% gateway fail rate"
            icon={XCircle}
            colorClass="bg-red-500/5 text-red-500"
            borderColor="border-red-500/25"
            delay={200}
          />
          <StatCard
            label="Pending Ingestion"
            value={stats?.totalPending ?? 0}
            subtext="Awaiting carrier feedback callbacks"
            icon={Activity}
            colorClass="bg-amber-500/5 text-amber-500"
            borderColor="border-amber-500/25"
            delay={300}
          />
        </div>
      )}

      {/* Two-Column Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Quick Actions & System Info (1 span) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card p-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href="/campaigns" className="block group">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Launch Campaign</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Filter, draft with AI co-pilot, and dispatch</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link href="/customers" className="block group">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Browse Segments</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Explore customer database profiles</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>

              <Link href="/analytics" className="block group">
                <div className="p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-foreground">Detailed Ingestion Logs</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Track real-time webhook status</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </div>
          </div>

          <div className="glass-card p-6 bg-linear-to-b from-card to-secondary/10">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Decoupled Gateway stub
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When a campaign is dispatched, individual requests are routed to the **Channel service stub**. The stub processes messages asynchronously, returning a receipt callback to the **CRM Webhook receiver** after a simulated latency delay.
            </p>
          </div>
        </div>

        {/* Column 2: Recent Campaigns Performance (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
                Campaign Execution Console
              </h2>
              <Link
                href="/analytics"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Full Analytics <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 skeleton" />
                ))}
              </div>
            ) : stats && stats.recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {stats.recentCampaigns.map((c) => {
                  const deliveryRate =
                    c.stats.total > 0
                      ? Math.round((c.stats.delivered / c.stats.total) * 100)
                      : 0;
                  return (
                    <div
                      key={c.campaignId}
                      className="p-4 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground truncate">
                            {c.name}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === "SENT"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <span>{c.stats.total} target segment</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(c.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-bold text-foreground">{deliveryRate}%</p>
                          <p className="text-[10px] text-muted-foreground">delivered</p>
                        </div>
                        <div className="w-24 bg-secondary rounded-full h-2 overflow-hidden border border-border/30">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${deliveryRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-border/80 rounded-2xl">
                <Megaphone className="w-8 h-8 text-muted-foreground/60 mx-auto mb-3" />
                <p className="text-xs text-foreground font-semibold">No active campaigns</p>
                <p className="text-[11px] text-muted-foreground mt-1 mb-4">Launch your first campaign segment to see statistics</p>
                <Link href="/campaigns">
                  <span className="inline-flex items-center justify-center text-xs font-bold bg-primary text-white hover:bg-primary/95 px-4 py-2 rounded-xl transition-all cursor-pointer">
                    New Campaign Segment
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
