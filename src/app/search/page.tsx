"use client";

import { AuthGuard } from "@/components/auth-guard";

export default function SearchPage() {
  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-4xl font-semibold mb-4">Search</h1>
        <p className="text-muted-foreground">
          Search functionality will be available here.
        </p>
      </div>
    </AuthGuard>
  );
}
