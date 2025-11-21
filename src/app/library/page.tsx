"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { SongCard } from "@/components/song-card";
import { useAuth } from "@/contexts/auth-context";
import { type Song, usePlayer } from "@/contexts/player-context";
import type { AudioFileRow } from "@/hooks/use-supabase-upload";
import { supabase } from "@/lib/supabase";

export default function LibraryPage() {
  const { user } = useAuth();
  const { setPlaylist } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSongs = async () => {
      try {
        // Query database for audio files
        const { data, error } = await supabase
          .from("audio_files")
          .select("*")
          .eq("user_id", user.id)
          .order("title", { ascending: true });

        if (error) {
          console.error("Error fetching songs:", error);
          return;
        }

        // Convert database records to Song objects
        const songList: Song[] = data.map(
          (record: AudioFileRow, index: number) => {
            const { data: urlData } = supabase.storage
              .from("audio-files")
              .getPublicUrl(record.file_path);

            return {
              id: record.id,
              index: index,
              name: record.title,
              url: urlData.publicUrl,
              filePath: record.file_path,
              coverArtUrl: record.cover_art_url,
              duration: record.duration,
            };
          },
        );

        setSongs(songList);
        // Set the playlist so auto-play can work
        setPlaylist(songList);
      } catch (error) {
        console.error("Error fetching songs:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchSongs();
  }, [user, setPlaylist]);

  return (
    <AuthGuard>
      <div className="p-12">
        <h1 className="text-4xl font-semibold mb-4">Your Library</h1>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : songs.length === 0 ? (
          <p className="text-muted-foreground">
            No songs found. Upload some songs to your library to get started!
          </p>
        ) : (
          <div className="">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
