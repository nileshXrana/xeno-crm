"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Menu, Zap } from "lucide-react";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-sidebar border-b border-border sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground tracking-tight leading-none">Xeno CRM</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">AI-Native</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Backdrop for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
