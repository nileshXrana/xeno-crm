"use client";

import { useEffect, useState } from "react";
import { History, Megaphone, CheckCircle2, XCircle, Clock, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export default function CampaignHistoryPage() {
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/campaign/stats");
      const data = await res.json();
      if (data.success) setCampaigns(data.campaigns ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaign History</h1>
            <p className="text-sm text-muted-foreground">{campaigns.length} campaigns sent</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="outline" size="sm" disabled={loading} className="border-border">
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/campaigns">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Megaphone className="w-3.5 h-3.5 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Megaphone className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium mb-1">No campaigns yet</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first campaign to get started.</p>
          <Link href="/campaigns">
            <Button size="sm" className="bg-primary text-primary-foreground">
              Create Campaign
            </Button>
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs text-muted-foreground uppercase tracking-wider">Campaign</th>
                <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider">Pending</th>
                <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider">Sent</th>
                <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider">Delivered</th>
                <th className="text-center p-4 text-xs text-muted-foreground uppercase tracking-wider">Failed</th>
                <th className="text-right p-4 text-xs text-muted-foreground uppercase tracking-wider">Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, idx) => {
                const rate = c.stats.total > 0 ? Math.round((c.stats.delivered / c.stats.total) * 100) : 0;
                return (
                  <tr
                    key={c.campaignId}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <td className="p-4">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-bold text-foreground">{c.stats.total}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-semibold status-pending px-2 py-0.5 rounded-full">{c.stats.pending}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-semibold status-sent px-2 py-0.5 rounded-full">{c.stats.sent}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-semibold status-delivered px-2 py-0.5 rounded-full">{c.stats.delivered}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-semibold status-failed px-2 py-0.5 rounded-full">{c.stats.failed}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`text-sm font-bold ${rate >= 70 ? "text-green-400" : rate >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
