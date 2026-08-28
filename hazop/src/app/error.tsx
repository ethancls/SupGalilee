"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6 py-12 max-w-md mx-auto">
        {/* Error Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-destructive" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-muted rounded-full blur-sm" />
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-foreground mb-3">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        {/* HAZOP Labs Branding */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="HAZOP Labs" className="w-6 h-6" />
            <span className="font-semibold">HAZOP</span>
            <span className="text-sm font-medium text-primary">Labs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
