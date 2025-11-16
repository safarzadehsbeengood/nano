"use client";

import { Music, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Song, usePlayer } from "@/contexts/player-context";
import { cn } from "@/lib/utils";

interface SongCardProps {
  song: Song;
  className?: string;
}

export function SongCard({ song, className }: SongCardProps) {
  const { currentSong, setCurrentSong, setIsPlaying, isPlaying } = usePlayer();
  const isSelected = currentSong?.index === song.index;

  const handlePlay = () => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    // biome-ignore lint: don't need keyboard events
    <div
      className={cn(
        "group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer",
        isSelected && "bg-accent border-primary",
        className,
      )}
      onClick={() => {
        if (isSelected) {
          // toggle play/pause for the selected song
          setIsPlaying(!isPlaying);
        } else {
          handlePlay();
        }
      }}
    >
      <div className="flex-shrink-0">
        <div className="size-12 rounded-md bg-muted flex items-center justify-center">
          <Music className="size-6 text-muted-foreground" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate text-foreground">
          {song.name}
        </h3>
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
          className={cn("size-10 cursor-pointer", isSelected && "text-primary")}
          onClick={(e) => {
            e.stopPropagation();
            if (isSelected) {
              setIsPlaying(!isPlaying);
            } else {
              handlePlay();
            }
          }}
        >
          {isSelected && isPlaying ? (
            <Pause className="size-3" />
          ) : (
            <Play className="size-3" />
          )}
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
