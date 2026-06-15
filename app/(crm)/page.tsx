"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Megaphone,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
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
  icon: Icon,
  color,
  delay = 0,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  delay?: number;
}) {
  return (
    <div
      className="stat-card glass-card p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
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
          recentCampaigns: campaigns.slice(0, 5),
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

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              Welcome to Xeno CRM
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-Native Customer Relationship Management
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Campaigns"
            value={stats?.totalCampaigns ?? 0}
            icon={Megaphone}
            color="bg-primary/10 text-primary"
            delay={0}
          />
          <StatCard
            label="Messages Delivered"
            value={stats?.totalDelivered ?? 0}
            icon={CheckCircle2}
            color="bg-green-100 text-green-600"
            delay={80}
          />
          <StatCard
            label="Messages Failed"
            value={stats?.totalFailed ?? 0}
            icon={XCircle}
            color="bg-red-100 text-red-500"
            delay={160}
          />
          <StatCard
            label="Pending Delivery"
            value={stats?.totalPending ?? 0}
            icon={Users}
            color="bg-amber-100 text-amber-600"
            delay={240}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/campaigns" className="block">
          <div className="glass-card p-6 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Create Campaign
            </h3>
            <p className="text-xs text-muted-foreground">
              Build audience segments, generate AI messages, and launch campaigns.
            </p>
          </div>
        </Link>

        <Link href="/customers" className="block">
          <div className="glass-card p-6 hover:border-primary/40 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Browse Customers
            </h3>
            <p className="text-xs text-muted-foreground">
              View all customers, spending history, and visit patterns.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Campaigns */}
      {stats && stats.recentCampaigns.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Campaigns
            </h2>
            <Link
              href="/analytics"
              className="text-xs text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentCampaigns.map((c) => {
              const deliveryRate =
                c.stats.total > 0
                  ? Math.round((c.stats.delivered / c.stats.total) * 100)
                  : 0;
              return (
                <div
                  key={c.campaignId}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-foreground truncate">
                      {c.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.stats.total} recipients ·{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 bg-secondary rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all"
                        style={{ width: `${deliveryRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {deliveryRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
