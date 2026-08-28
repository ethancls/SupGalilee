"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Building2, Check, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateOrgModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (org: { id: string; name: string; slug: string }) => void;
}

// Slug validation regex: 3-50 chars, starts with letter, lowercase letters/numbers/hyphens
const SLUG_REGEX = /^[a-z][a-z0-9-]{1,48}[a-z0-9]$/;

export function CreateOrgModal({ open, onOpenChange, onSuccess }: CreateOrgModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<"idle" | "valid" | "invalid" | "taken">("idle");
  const [slugError, setSlugError] = useState("");
  const [error, setError] = useState("");

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);
  };

  const checkSlugAvailability = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 3) {
      setSlugStatus("idle");
      return;
    }

    if (!SLUG_REGEX.test(slugToCheck)) {
      setSlugStatus("invalid");
      setSlugError("Must be 3-50 characters, start with a letter, contain only lowercase letters, numbers, and hyphens");
      return;
    }

    setIsCheckingSlug(true);
    try {
      const res = await fetch(`/api/organizations/check-slug?slug=${encodeURIComponent(slugToCheck)}`);
      const data = await res.json();
      
      if (data.available) {
        setSlugStatus("valid");
        setSlugError("");
      } else {
        setSlugStatus(data.valid ? "taken" : "invalid");
        setSlugError(data.error || "This slug is not available");
      }
    } catch {
      setSlugStatus("idle");
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  // Debounced slug check
  useEffect(() => {
    if (!slug) {
      setSlugStatus("idle");
      return;
    }

    const timer = setTimeout(() => {
      checkSlugAvailability(slug);
    }, 500);

    return () => clearTimeout(timer);
  }, [slug, checkSlugAvailability]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Auto-generate slug if user hasn't manually edited it
    if (!slugTouched) {
      setSlug(generateSlug(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(value);
    setSlugTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (slugStatus !== "valid") {
      setError("Please enter a valid and available slug");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create organization");
        return;
      }

      // Store the new org as current
      localStorage.setItem("currentOrgId", data.id);
      
      // Reset form
      setName("");
      setDescription("");
      setSlug("");
      setSlugTouched(false);
      setSlugStatus("idle");
      setError("");
      
      // Close modal
      onOpenChange(false);
      
      // Callback
      if (onSuccess) {
        onSuccess(data);
      }
      
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setName("");
      setDescription("");
      setSlug("");
      setSlugTouched(false);
      setSlugStatus("idle");
      setSlugError("");
      setError("");
      onOpenChange(false);
    }
  };

  const canSubmit = name.trim() && slug && slugStatus === "valid" && !isLoading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Create Organization
          </DialogTitle>
          <DialogDescription>
            Create a new organization to collaborate with your team on HAZOP studies.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder="Acme Corporation"
              value={name}
              onChange={handleNameChange}
              required
              autoFocus
            />
            <p className="text-sm text-muted-foreground">
              This is the name that will be displayed to all members.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description">Description (optional)</Label>
            <Input
              id="org-description"
              placeholder="A brief description of your organization"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-slug">URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">/org/</span>
              <div className="relative flex-1">
                <Input
                  id="org-slug"
                  placeholder="acme-corp"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  className={cn(
                    "pr-8",
                    slugStatus === "valid" && "border-green-500 focus-visible:ring-green-500",
                    (slugStatus === "invalid" || slugStatus === "taken") && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {isCheckingSlug && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isCheckingSlug && slugStatus === "valid" && <Check className="h-4 w-4 text-green-500" />}
                  {!isCheckingSlug && (slugStatus === "invalid" || slugStatus === "taken") && <X className="h-4 w-4 text-destructive" />}
                </div>
              </div>
            </div>
            {slugError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {slugError}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This cannot be changed after creation. Use lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
