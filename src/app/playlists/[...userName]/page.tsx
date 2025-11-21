"use client";

import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";

export default function PlaylistsPage() {
  const { userName } = useParams();

  return (
    <AuthGuard>
      <div>Playlists for {userName}</div>
    </AuthGuard>
  );
}
