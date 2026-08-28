"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-6 py-12 max-w-md mx-auto">
        {/* Animated 404 Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <FileQuestion className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-2 bg-muted rounded-full blur-sm" />
        </div>

        {/* Error Code */}
        <h1 className="text-8xl font-bold text-primary mb-4 tracking-tighter">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the URL or return to the dashboard.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
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
