"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Megaphone,
  BarChart3,
  Zap,
  Home,
  History,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/campaigns", label: "New Campaign", icon: Megaphone },
  { href: "/campaigns/history", label: "History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 flex flex-col bg-sidebar border-r border-border/80 z-50 transition-transform duration-300 md:translate-x-0 ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-sm shadow-[#6366f1]/20">
          <Zap className="w-4 h-4 text-white animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground tracking-tight leading-tight">Xeno CRM</p>
          <p className="text-[10px] text-muted-foreground tracking-wide font-medium">AI-NATIVE ENGINE</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" :
            href === "/campaigns" ? pathname === "/campaigns" :
            pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all ${
                isActive
                  ? "bg-primary/8 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-l-2 border-transparent"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? "text-primary scale-110" : "group-hover:scale-105"}`}
              />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          v1.0.0 · Production
        </span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>
    </aside>
  );
}
