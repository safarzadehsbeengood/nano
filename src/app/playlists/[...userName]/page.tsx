"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useParams } from "next/navigation";

export default function PlaylistsPage() {
  const { userName } = useParams();

  return <AuthGuard>
    <div>Playlists for {userName}</div>
  </AuthGuard>;
}