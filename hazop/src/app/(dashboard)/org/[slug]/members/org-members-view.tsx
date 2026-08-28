"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import {
  Users,
  Plus,
  Mail,
  Trash2,
  Loader2,
  Clock,
  UserX,
  Crown,
  ShieldCheck,
  User,
  Eye,
  ChevronDown,
  Check,
  RefreshCw,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: User;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface OrgMembersViewProps {
  organization: Organization;
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
  isAdmin: boolean;
}

export function OrgMembersView({
  organization,
  members,
  invitations,
  currentUserId,
  isAdmin,
}: OrgMembersViewProps) {
  const router = useRouter();
  const [isInviting, setIsInviting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [resendingInvitation, setResendingInvitation] = useState<string | null>(null);

  const handleInvite = async () => {
    setInviting(true);

    try {
      const res = await fetch(`/api/organizations/${organization.id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (res.ok) {
        setIsInviting(false);
        setInviteEmail("");
        setInviteRole("MEMBER");
        router.refresh();
      }
    } catch {
      console.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemovingMember(true);

    try {
      await fetch(`/api/organizations/${organization.id}/members/${memberToRemove.id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch {
      console.error("Failed to remove member");
    } finally {
      setRemovingMember(false);
      setMemberToRemove(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    setResendingInvitation(invitationId);

    try {
      await fetch(`/api/organizations/${organization.id}/invitations/${invitationId}/resend`, {
        method: "POST",
      });
      router.refresh();
    } catch {
      console.error("Failed to resend invitation");
    } finally {
      setResendingInvitation(null);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await fetch(`/api/organizations/${organization.id}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      router.refresh();
    } catch {
      console.error("Failed to update role");
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await fetch(`/api/organizations/${organization.id}/invitations/${invitationId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch {
      console.error("Failed to revoke invitation");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-3.5 w-3.5" />;
      case "ADMIN":
        return <ShieldCheck className="h-3.5 w-3.5" />;
      case "VIEWER":
        return <Eye className="h-3.5 w-3.5" />;
      default:
        return <User className="h-3.5 w-3.5" />;
    }
  };

  const getRoleVariant = (role: string): "default" | "secondary" | "outline" => {
    switch (role) {
      case "OWNER":
        return "default";
      case "ADMIN":
        return "secondary";
      default:
        return "outline";
    }
  };

  const roleOptions = [
    { value: "ADMIN", label: "Admin" },
    { value: "MEMBER", label: "Member" },
    { value: "VIEWER", label: "Viewer" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Members"
        description={`Manage team members for ${organization.name}`}
        actions={isAdmin ? (
          <Dialog open={isInviting} onOpenChange={setIsInviting}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {organization.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviting(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : undefined}
      />

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            {members.length} people with access to this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isAdmin && <TableHead className="w-16"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.avatar || undefined} />
                        <AvatarFallback>
                          {member.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                      {member.userId === currentUserId && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isAdmin && member.role !== "OWNER" && member.userId !== currentUserId ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="cursor-pointer">
                            <Badge variant={getRoleVariant(member.role)} className="gap-1">
                              {getRoleIcon(member.role)}
                              <span className="capitalize">{member.role.toLowerCase()}</span>
                              <ChevronDown className="h-3 w-3 opacity-50" />
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {roleOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => handleUpdateRole(member.id, option.value)}
                              className="cursor-pointer"
                            >
                              <span>{option.label}</span>
                              {option.value === member.role && (
                                <Check className="h-4 w-4 ml-auto" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Badge variant={getRoleVariant(member.role)} className="gap-1">
                        {getRoleIcon(member.role)}
                        <span className="capitalize">{member.role.toLowerCase()}</span>
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {member.role !== "OWNER" && member.userId !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setMemberToRemove({ id: member.id, name: member.user.name })}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name} from {organization.name}? They will lose access to all projects and resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removingMember}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={removingMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removingMember ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pending Invitations */}
      {isAdmin && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations
            </CardTitle>
            <CardDescription>
              {invitations.length} invitation{invitations.length > 1 ? 's' : ''} awaiting response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {invitation.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleVariant(invitation.role)} className="gap-1">
                        {getRoleIcon(invitation.role)}
                        <span className="capitalize">{invitation.role.toLowerCase()}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleResendInvitation(invitation.id)}
                          disabled={resendingInvitation === invitation.id}
                          title="Resend invitation"
                        >
                          {resendingInvitation === invitation.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRevokeInvitation(invitation.id)}
                          title="Revoke invitation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
