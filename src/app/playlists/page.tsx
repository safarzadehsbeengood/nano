"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export default function PlaylistsPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
  }

  return (
    <AuthGuard>
    <div>
      <h1>Playlists</h1>
      <p>Playlists for {user?.user_metadata.username}</p>
    </div>
    </AuthGuard>
  );
}