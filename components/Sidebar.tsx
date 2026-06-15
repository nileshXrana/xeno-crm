"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Megaphone,
  BarChart3,
  Database,
  Zap,
  Home,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col bg-sidebar border-r border-border z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground tracking-tight">Xeno CRM</p>
          <p className="text-xs text-muted-foreground">AI-Native</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/15 text-primary border-r-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`}
              />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Seed Data Button */}
      <div className="px-3 pb-4 border-t border-border pt-4">
        <a
          href="/api/seed"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-full"
        >
          <Database className="w-3.5 h-3.5" />
          Seed Demo Data
        </a>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          v1.0.0 · AI-Native CRM
        </p>
      </div>
    </aside>
  );
}
