"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Plus } from "lucide-react";
import { CreateOrgModal } from "@/components/org/create-org-modal";
import { useRouter } from "next/navigation";

interface WelcomeViewProps {
  userName: string;
}

export function WelcomeView({ userName }: WelcomeViewProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const firstName = userName.split(" ")[0];

  const handleOrgCreated = (org: { id: string; name: string; slug: string }) => {
    router.push(`/org/${org.slug}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {firstName}!
          </h1>
          <p className="text-muted-foreground">
            You&apos;re not part of any organization yet. Create one or wait for an invitation.
          </p>
        </div>

        {/* Options */}
        <div className="grid gap-4">
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                Create an Organization
              </CardTitle>
              <CardDescription>
                Start a new organization for your team, company, or university
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                Join via Invitation
              </CardTitle>
              <CardDescription>
                If someone invited you, check your email for an invitation link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Invitations are sent to your email address. Click the link in the email to join an organization.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateOrgModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSuccess={handleOrgCreated}
      />
    </div>
  );
}
