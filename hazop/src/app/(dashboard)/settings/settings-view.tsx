"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusButton } from "@/components/ui/status-button";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import {
  User,
  Shield,
  ImageIcon,
  X,
} from "lucide-react";
import { PasswordStrengthBar } from "@/components/auth/password-strength-bar";

const MAX_AVATAR_URL_LENGTH = 2048;

// Validate avatar URL for security (XSS/CSRF prevention only)
function validateAvatarUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === "") {
    return { valid: true }; // Empty is allowed (removes avatar)
  }

  const trimmedUrl = url.trim();

  // Check URL length
  if (trimmedUrl.length > MAX_AVATAR_URL_LENGTH) {
    return { valid: false, error: `URL too long (max ${MAX_AVATAR_URL_LENGTH} characters)` };
  }

  // Allow data URLs for images
  if (trimmedUrl.startsWith("data:image/")) {
    const mimeMatch = trimmedUrl.match(/^data:image\/([\w+-]+);/);
    if (mimeMatch) {
      const mimeType = mimeMatch[1].toLowerCase();
      if (!["png", "jpeg", "jpg", "gif", "webp", "svg+xml"].includes(mimeType)) {
        return { valid: false, error: "Invalid image format in data URL" };
      }
    }
    return { valid: true };
  }

  // Must be HTTPS for security (or relative URL)
  if (!trimmedUrl.startsWith("https://") && !trimmedUrl.startsWith("/")) {
    return { valid: false, error: "Avatar URL must use HTTPS protocol" };
  }

  // Block XSS/injection patterns
  const dangerousPatterns = [
    "javascript:",
    "<script",
    "onerror=",
    "onload=",
    "onclick=",
    "onmouseover=",
    "data:text/html",
  ];
  
  const lowerUrl = trimmedUrl.toLowerCase();
  for (const pattern of dangerousPatterns) {
    if (lowerUrl.includes(pattern)) {
      return { valid: false, error: "Invalid URL" };
    }
  }

  // Basic URL format validation
  try {
    new URL(trimmedUrl);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  return { valid: true };
}

interface SettingsViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    platformRole: string;
  };
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [profileSaveStatus, setProfileSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [passwordSaveStatus, setPasswordSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
  });
  const [avatarError, setAvatarError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const handleAvatarUrlChange = (url: string) => {
    setProfileData((prev) => ({ ...prev, avatar: url }));
    setAvatarError("");
    
    // Validate and update preview
    const validation = validateAvatarUrl(url);
    if (validation.valid) {
      setAvatarPreview(url);
    } else {
      setAvatarError(validation.error || "Invalid URL");
    }
  };

  const handleRemoveAvatar = () => {
    setProfileData((prev) => ({ ...prev, avatar: "" }));
    setAvatarPreview("");
    setAvatarError("");
  };

  const handleSaveProfile = async () => {
    // Validate avatar before saving
    const avatarValidation = validateAvatarUrl(profileData.avatar);
    if (!avatarValidation.valid) {
      setAvatarError(avatarValidation.error || "Invalid avatar URL");
      return;
    }

    setSaving(true);
    setProfileSaveStatus("idle");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          avatar: profileData.avatar || null,
        }),
      });

      if (res.ok) {
        setProfileSaveStatus("success");
        setTimeout(() => setProfileSaveStatus("idle"), 2000);
        router.refresh();
      } else {
        setProfileSaveStatus("error");
      }
    } catch {
      setProfileSaveStatus("error");
      console.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSaveStatus("idle");
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to change password");
        setPasswordSaveStatus("error");
      } else {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPasswordSaveStatus("success");
        setTimeout(() => setPasswordSaveStatus("idle"), 2000);
      }
    } catch {
      setPasswordError("An error occurred");
      setPasswordSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar size="xl">
                    <AvatarImage src={avatarPreview} alt={user.name} />
                    <AvatarFallback name={user.name} />
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Avatar URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="avatar"
                      placeholder="https://example.com/avatar.png"
                      value={profileData.avatar}
                      onChange={(e) => handleAvatarUrlChange(e.target.value)}
                      className={avatarError ? "border-destructive" : ""}
                    />
                    {profileData.avatar && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleRemoveAvatar}
                        title="Remove avatar"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {avatarError ? (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription className="text-xs">
                        {avatarError}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Enter an HTTPS URL to an image (e.g., Google, Gravatar, or any image host).
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <StatusButton
                  onClick={handleSaveProfile}
                  status={saving ? "loading" : profileSaveStatus}
                  loadingText="Saving..."
                  successText="Saved"
                  idleText="Save Changes"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {passwordError}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                />
                <PasswordStrengthBar password={passwordData.newPassword} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <StatusButton
                  onClick={handleChangePassword}
                  status={saving ? "loading" : passwordSaveStatus}
                  loadingText="Updating..."
                  successText="Updated"
                  idleText="Update Password"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Current Session</p>
                  <p className="text-xs text-muted-foreground">
                    This device · Active now
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
