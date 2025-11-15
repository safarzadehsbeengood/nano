"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { SongCard } from "@/components/song-card";
import { useAuth } from "@/contexts/auth-context";
import type { Song } from "@/contexts/player-context";
import { supabase } from "@/lib/supabase";

export default function SongsPage() {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSongs = async () => {
      try {
        // List all files in the user's folder
        const { data, error } = await supabase.storage
          .from("audio-files")
          .list(user.id, {
            limit: 100,
            offset: 0,
            sortBy: { column: "name", order: "asc" },
          });

        if (error) {
          console.error("Error fetching songs:", error);
          return;
        }

        // Convert storage files to Song objects
        const songList: Song[] = data
          .filter((file) => file.name && !file.name.startsWith("."))
          .map((file) => {
            const filePath = `${user.id}/${file.name}`;
            const { data: urlData } = supabase.storage
              .from("audio-files")
              .getPublicUrl(filePath);

            return {
              id: filePath,
              name: file.name,
              url: urlData.publicUrl,
              filePath,
              size: (file.metadata as { size?: number } | null)?.size,
            };
          });

        setSongs(songList);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSongs();
  }, [user]);

  return (
    <AuthGuard>
      <div className="p-12">
        <h1 className="text-4xl font-semibold mb-4">Your Songs</h1>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : songs.length === 0 ? (
          <p className="text-muted-foreground">
            No songs found. Upload some songs to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
