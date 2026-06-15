"use client";

import { useEffect, useState } from "react";
import { Users, Search, TrendingUp, Calendar, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalSpends: number;
  visits: number;
  lastVisitDate: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getSegmentTag(spends: number, visits: number) {
  if (spends > 20000 || visits > 8) {
    return { label: "VIP Segment", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
  }
  if (visits > 4) {
    return { label: "Consistent", cls: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
  }
  if (visits > 2) {
    return { label: "Casual Client", cls: "bg-purple-500/10 text-purple-600 border-purple-500/20" };
  }
  return { label: "New Lead", cls: "bg-slate-500/10 text-slate-600 border-slate-500/20" };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crm/customers")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.customers);
          setFiltered(data.customers);
        }
      })
      .catch((e) => console.error("Customers fetch exception:", e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      )
    );
  }, [search, customers]);

  const totalSpends = customers.reduce((s, c) => s + c.totalSpends, 0);
  const avgVisits =
    customers.length > 0
      ? (customers.reduce((s, c) => s + c.visits, 0) / customers.length).toFixed(1)
      : "0";

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border/50 pb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Shopper Registry</h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Explore demographic properties, total monetary spends, and engagement criteria
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Customers */}
        <div className="glass-card p-6 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Database Records
              </p>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {loading ? "..." : customers.length}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/25">
              <Users className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-green-500" />
            Fully indexed shopper logs
          </p>
        </div>

        {/* Total Revenue */}
        <div className="glass-card p-6 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Gross Pipeline Spends
              </p>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {loading ? "..." : formatCurrency(totalSpends)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/25">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-green-500" />
            Monetized order value
          </p>
        </div>

        {/* Avg Visits */}
        <div className="glass-card p-6 flex flex-col justify-between h-32 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Visit Frequency
              </p>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">
                {loading ? "..." : `${avgVisits} orders`}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/25">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-green-500" />
            Average orders per shopper
          </p>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-card p-4">
        <div className="relative flex items-center bg-secondary/35 border border-border/30 rounded-xl px-3.5 py-1">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by shopper name, email, or telephone contact..."
            className="bg-transparent border-0 focus-visible:ring-0 text-xs font-bold w-full h-8 pl-2"
          />
        </div>
      </div>

      {/* Database Sheet View */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center border-t border-border/20">
            <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No records matched</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Modify search filter string to broaden match scope." : "Seeding database first is recommended."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider p-4">Shopper Identity</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider p-4">Segment Engagement</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider p-4">Contact Details</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider text-right p-4">Monetary Spends</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider text-center p-4">Order Visit Log</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider p-4">Last Event Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c, idx) => {
                  const tag = getSegmentTag(c.totalSpends, c.visits);
                  return (
                    <TableRow
                      key={c._id}
                      className="border-border/40 hover:bg-secondary/25 transition-all animate-fade-in"
                      style={{ animationDelay: `${idx * 20}ms` }}
                    >
                      <TableCell className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {c.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-foreground">{c.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${tag.cls}`}>
                          {tag.label}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        <div>
                          <p className="text-xs font-semibold text-foreground">{c.email}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{c.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right p-4">
                        <span className="text-xs font-bold text-primary">
                          {formatCurrency(c.totalSpends)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center p-4">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-secondary text-[10px] font-bold border border-border/40">
                          {c.visits} orders
                        </span>
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(c.lastVisitDate)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
