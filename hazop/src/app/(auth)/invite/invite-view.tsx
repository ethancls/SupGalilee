"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, CheckCircle2, XCircle, Mail, UserPlus } from "lucide-react";

interface InvitationData {
  id: string;
  email: string;
  role: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  };
  invitedBy: {
    name: string;
    email: string;
  };
}

export function InviteView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "expired" | "accepted" | "accepting">("loading");
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check invitation validity and user auth status
    const checkInvitation = async () => {
      if (!token) {
        setStatus("invalid");
        setError("No invitation token provided");
        return;
      }

      try {
        const res = await fetch(`/api/invitations/${token}`);
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            setStatus("invalid");
            setError("This invitation link is invalid or has already been used.");
          } else if (data.error?.includes("expired")) {
            setStatus("expired");
            setError("This invitation has expired. Please ask for a new one.");
          } else {
            setStatus("invalid");
            setError(data.error || "Invalid invitation");
          }
          return;
        }

        setInvitation(data.invitation);
        setIsLoggedIn(data.isLoggedIn);
        setUserEmail(data.userEmail);
        setStatus("valid");
      } catch {
        setStatus("invalid");
        setError("Failed to verify invitation");
      }
    };

    checkInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setStatus("accepting");

    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to accept invitation");
        setStatus("valid");
        return;
      }

      setStatus("accepted");
      
      // Redirect to the organization after a short delay
      setTimeout(() => {
        router.push(`/org/${invitation?.organization.slug}`);
      }, 2000);
    } catch {
      setError("Failed to accept invitation");
      setStatus("valid");
    }
  };

  const handleLoginAndAccept = () => {
    // Store the invite token in session storage to accept after login
    sessionStorage.setItem("pendingInvite", token || "");
    router.push(`/login?email=${encodeURIComponent(invitation?.email || "")}&redirect=/invite?token=${token}`);
  };

  const handleRegisterAndAccept = () => {
    // Store the invite token in session storage to accept after registration
    sessionStorage.setItem("pendingInvite", token || "");
    router.push(`/register?email=${encodeURIComponent(invitation?.email || "")}&redirect=/invite?token=${token}`);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid" || status === "expired") {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>{status === "expired" ? "Invitation Expired" : "Invalid Invitation"}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "accepted") {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Welcome to {invitation?.organization.name}!</CardTitle>
            <CardDescription>
              You have successfully joined the organization. Redirecting...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>You&apos;re Invited!</CardTitle>
          <CardDescription>
            <span className="font-medium text-foreground">{invitation?.invitedBy.name}</span> has invited you to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="text-center p-4 rounded-lg bg-muted/50 border">
            <h3 className="text-xl font-semibold">{invitation?.organization.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;ll join as <span className="font-medium capitalize">{invitation?.role.toLowerCase()}</span>
            </p>
          </div>

          {/* Email Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Invitation sent to</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">{invitation?.email}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isLoggedIn ? (
              // User is logged in
              userEmail === invitation?.email ? (
                // Email matches - can accept directly
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleAccept}
                  disabled={status === "accepting"}
                >
                  {status === "accepting" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </Button>
              ) : (
                // Email doesn't match
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm">
                    <p className="text-amber-800 dark:text-amber-200">
                      You&apos;re logged in as <strong>{userEmail}</strong> but this invitation is for <strong>{invitation?.email}</strong>.
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    onClick={handleAccept}
                    disabled={status === "accepting"}
                  >
                    {status === "accepting" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Accept with {userEmail}
                      </>
                    )}
                  </Button>
                </div>
              )
            ) : (
              // User is not logged in
              <>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleLoginAndAccept}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Login to Accept
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  size="lg"
                  onClick={handleRegisterAndAccept}
                >
                  Create an Account
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
