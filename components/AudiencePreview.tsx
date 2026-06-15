"use client";

import { Coins, User } from "lucide-react";

interface SampleCustomer {
  _id: string;
  name: string;
  email: string;
  totalSpends: number;
  visits: number;
}

interface AudiencePreviewProps {
  sampleCustomers: SampleCustomer[];
  totalCount: number;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getSegmentTag(spends: number, visits: number) {
  if (spends > 20000 || visits > 8) {
    return { label: "VIP Shopper", cls: "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20" };
  }
  if (visits > 4) {
    return { label: "Consistent", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
  }
  return { label: "New Shopper", cls: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
}

export default function AudiencePreview({
  sampleCustomers,
  totalCount,
}: AudiencePreviewProps) {
  if (!sampleCustomers.length) return null;

  return (
    <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Audience Sample Preview ({sampleCustomers.length} of {totalCount})
        </p>
        <span className="text-[10px] text-muted-foreground font-semibold">
          Database Match Logs
        </span>
      </div>

      <div className="space-y-2.5">
        {sampleCustomers.map((c) => {
          const tag = getSegmentTag(c.totalSpends, c.visits);
          return (
            <div
              key={c._id}
              className="flex items-center justify-between p-3 bg-secondary/10 hover:bg-secondary/20 rounded-xl border border-border/30 transition-all animate-fade-in"
            >
              <div className="flex items-center gap-3 min-w-0 mr-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-foreground truncate">
                      {c.name}
                    </p>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${tag.cls}`}>
                      {tag.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{c.email}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 flex items-center gap-4">
                <div>
                  <p className="text-xs font-bold text-primary flex items-center justify-end gap-1">
                    <Coins className="w-3 h-3 text-primary" />
                    {formatINR(c.totalSpends)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {c.visits} orders
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {totalCount > sampleCustomers.length && (
          <div className="text-center py-2 bg-secondary/5 rounded-xl border border-dashed border-border/40">
            <p className="text-[10px] text-muted-foreground font-medium">
              +{(totalCount - sampleCustomers.length).toLocaleString()} additional shoppers matched in this segment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
