"use client";

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

export default function AudiencePreview({
  sampleCustomers,
  totalCount,
}: AudiencePreviewProps) {
  if (!sampleCustomers.length) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
        Sample customers in this segment ({sampleCustomers.length} of {totalCount})
      </p>
      <div className="space-y-2">
        {sampleCustomers.map((c) => (
          <div
            key={c._id}
            className="flex items-center gap-3 p-2.5 bg-secondary/40 rounded-lg border border-border/30"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {c.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {c.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{c.email}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs font-semibold text-primary">
                {formatINR(c.totalSpends)}
              </p>
              <p className="text-xs text-muted-foreground">
                {c.visits} visits
              </p>
            </div>
          </div>
        ))}
        {totalCount > sampleCustomers.length && (
          <p className="text-xs text-muted-foreground text-center py-1">
            +{totalCount - sampleCustomers.length} more customers
          </p>
        )}
      </div>
    </div>
  );
}
