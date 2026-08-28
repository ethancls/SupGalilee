import { Suspense } from "react";
import { InviteView } from "./invite-view";

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <InviteView />
    </Suspense>
  );
}
