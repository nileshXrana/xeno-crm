"use client";

import { useEffect, useState } from "react";
import { History, Megaphone, CheckCircle2, RefreshCw, Calendar, TrendingUp } from "lucide-react";
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
    } catch (e) {
      console.error("Failed to load history stats:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Campaign History</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Review and audit all campaign dispatches and delivery counts
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          <Button 
            onClick={load} 
            variant="outline" 
            size="sm" 
            disabled={loading} 
            className="border-border hover:bg-secondary text-xs font-bold py-2 rounded-xl h-10 w-full sm:w-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Log
          </Button>
          <Link href="/campaigns" className="w-full sm:w-auto">
            <Button size="sm" className="bg-[#6366f1] hover:bg-[#6366f1]/95 text-white font-bold text-xs py-2 px-4 rounded-xl h-10 w-full flex items-center justify-center gap-1.5 shadow-sm shadow-[#6366f1]/20">
              <Megaphone className="w-3.5 h-3.5" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Database Sheet View */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-card p-16 text-center border-t border-border/20">
          <Megaphone className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">No campaigns dispatched yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-6">Create a segment query and launch a campaign to populate history.</p>
          <Link href="/campaigns">
            <Button size="sm" className="bg-primary text-white font-bold text-xs py-2 px-5 rounded-xl">
              Create First Campaign
            </Button>
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/60 hover:bg-transparent">
                  <th className="text-left p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Campaign Descriptor</th>
                  <th className="text-center p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target Size</th>
                  <th className="text-center p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending</th>
                  <th className="text-center p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sent</th>
                  <th className="text-center p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delivered</th>
                  <th className="text-center p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Failed</th>
                  <th className="text-right p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delivery Rate</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, idx) => {
                  const rate = c.stats.total > 0 ? Math.round((c.stats.delivered / c.stats.total) * 100) : 0;
                  return (
                    <tr
                      key={c.campaignId}
                      className="border-b border-border/40 hover:bg-secondary/25 transition-all animate-fade-in"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="p-4">
                        <div>
                          <p className="text-xs font-bold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(c.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold text-foreground">{c.stats.total}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold status-pending px-2 py-0.5 rounded-full">{c.stats.pending}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold status-sent px-2 py-0.5 rounded-full">{c.stats.sent}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold status-delivered px-2 py-0.5 rounded-full">{c.stats.delivered}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold status-failed px-2 py-0.5 rounded-full">{c.stats.failed}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-xs font-bold ${rate >= 70 ? "text-emerald-500" : rate >= 40 ? "text-amber-500" : "text-red-500"}`}>
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
