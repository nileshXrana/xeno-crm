"use client";

import { useState } from "react";
import { Zap, ShieldAlert, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Successful login, redirect to dashboard
        window.location.href = "/";
      } else {
        setError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      console.error("Login exception:", err);
      setError("Unable to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-fill dummy credentials
  const fillCredentials = () => {
    setUsername("admin@xeno.co");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10 animate-fade-in">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366f1] to-[#a855f7] items-center justify-center shadow-lg shadow-[#6366f1]/20 mb-2">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Xeno CRM
          </h1>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            AI-Native Campaign Gateway
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="glass-card p-8 bg-card/65 backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error handling */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-red-500 font-semibold">{error}</span>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Username or Email
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@xeno.co"
                  className="bg-secondary/35 border-border text-xs font-semibold h-10 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Security Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary/35 border-border text-xs font-semibold h-10 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6366f1] hover:bg-[#6366f1]/95 text-white font-bold text-xs h-10 rounded-xl transition-all shadow-md shadow-[#6366f1]/20 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                "Authenticate Session"
              )}
            </Button>
          </form>
        </div>

        {/* Dummy Credentials Card */}
        <div className="p-5 rounded-2xl bg-secondary/20 border border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              Recruiter Demo Credentials
            </p>
            <button
              onClick={fillCredentials}
              className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wide"
            >
              Auto Fill
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-foreground">
            <div>
              <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Username</span>
              <code className="bg-secondary px-2 py-0.5 rounded border border-border/40 font-mono text-[10px]">
                admin@xeno.co
              </code>
            </div>
            <div>
              <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-0.5">Password</span>
              <code className="bg-secondary px-2 py-0.5 rounded border border-border/40 font-mono text-[10px]">
                admin123
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
