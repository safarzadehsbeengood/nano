"use client";

import { Music, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Song, usePlayer } from "@/contexts/player-context";
import { cn } from "@/lib/utils";

interface SongCardProps {
  song: Song;
  className?: string;
}

export function SongCard({ song, className }: SongCardProps) {
  const { currentSong, setCurrentSong } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const handlePlay = () => {
    setCurrentSong(song);
  };

  return (
    // biome-ignore lint: don't need keyboard events
    <div
      className={cn(
        "group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer",
        isActive && "bg-accent border-primary",
        className,
      )}
      onClick={handlePlay}
    >
      <div className="flex-shrink-0">
        <div className="size-12 rounded-md bg-muted flex items-center justify-center">
          <Music className="size-6 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate text-foreground">{song.name}</h3>
        {song.duration && (
          <p className="text-sm text-muted-foreground">
            {formatDuration(song.duration)}
          </p>
        )}
      </div>

      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className={cn("size-10", isActive && "text-primary")}
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
        >
          <Play className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
