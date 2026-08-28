import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsView } from "./settings-view";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  return <SettingsView user={user} />;
}
