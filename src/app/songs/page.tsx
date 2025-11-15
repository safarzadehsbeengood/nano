"use client";

import { AuthGuard } from "@/components/auth-guard";

export default function SongsPage() {
  return (
    <AuthGuard>
      <div className="p-12">
        <h1 className="text-4xl font-semibold mb-4">Songs</h1>
        <p className="text-muted-foreground">Your songs will appear here.</p>
      </div>
    </AuthGuard>
  );
}
