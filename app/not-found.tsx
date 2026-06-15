import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-6xl font-bold gradient-text mb-3">404</h1>
        <p className="text-lg text-foreground font-medium mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-8">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
