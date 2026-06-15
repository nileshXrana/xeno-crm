"use client";

import { useEffect, useState } from "react";
import { Users, Search, TrendingUp, Calendar, ShoppingBag } from "lucide-react";
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
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground">
            {customers.length} total customers in your CRM
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Total Customers</span>
          </div>
          <p className="text-2xl font-bold">{customers.length}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalSpends)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground">Avg Visits</span>
          </div>
          <p className="text-2xl font-bold">{avgVisits}</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-9 bg-secondary border-border"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {search ? "No customers match your search." : "No customers yet. Seed demo data to get started."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs uppercase">Name</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">Contact</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase text-right">Total Spends</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase text-center">Visits</TableHead>
                <TableHead className="text-muted-foreground text-xs uppercase">Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, idx) => (
                <TableRow
                  key={c._id}
                  className="border-border/50 hover:bg-secondary/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {c.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-foreground">{c.email}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(c.totalSpends)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-secondary text-xs font-bold">
                      {c.visits}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(c.lastVisitDate)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
