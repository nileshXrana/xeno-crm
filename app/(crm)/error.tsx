"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-2">
          {error.message ?? "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}
        <Button
          onClick={reset}
          variant="outline"
          size="sm"
          className="border-border hover:bg-secondary"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  );
}
