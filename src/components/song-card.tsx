"use client";

import { Download, Loader2, MoreVertical, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Song, usePlayer } from "@/contexts/player-context";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface SongCardProps {
  song: Song;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function SongCard({ song, className }: SongCardProps) {
  const { currentSong, setCurrentSong, setIsPlaying, isPlaying } = usePlayer();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [loadingSong, setLoadingSong] = useState<boolean>(false);
  const isSelected = currentSong?.index === song.index;

  const handlePlay = () => {
    setLoadingSong(true);
    setCurrentSong(song);
    setIsPlaying(true);
    setLoadingSong(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const { data, error } = await supabase.storage
      .from("audio-files")
      .download(song.filePath);
    if (error) {
      console.error("Error downloading song:", error);
      setIsDownloading(false);
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = song.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsDownloading(false);
  };

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 p-3 backdrop-blur-sm h-12",
        "hover:bg-accent/50 hover:border-accent-foreground/20 hover:shadow-md",
        isSelected && "bg-primary/5 border-primary/50 shadow-sm",
        className,
      )}
    >
      <div
        className={`relativeinset-0 opacity-${isSelected ? "100" : "0"} group-hover:opacity-100 flex items-center justify-center`}
      >
        <Button
          variant="default"
          size="icon"
          className={cn(
            "size-10 rounded-2xl bg-transparent hover:bg-background flex items-center justify-center",
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (isSelected) {
              setIsPlaying(!isPlaying);
            } else {
              handlePlay();
            }
          }}
        >
          {isSelected && (isPlaying || loadingSong) ? (
            <Pause fill="currentColor" className="size-4 text-foreground" />
          ) : (
            <Play fill="currentColor" className="size-4 text-foreground" />
          )}
        </Button>
      </div>

      {/* Cover Art */}
      <div className="relative flex-shrink-0">
        <div className="relative size-10 rounded-lg overflow-hidden bg-muted shadow-sm flex items-center justify-center">
          <Image
            src={song.coverArtUrl}
            alt={song.name}
            className="size-full object-cover"
            width={32}
            height={32}
          />
        </div>
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0 flex flex-row justify-between gap-1">
        <h3
          className={cn(
            "font-semibold truncate text-foreground",
            isSelected && "text-primary",
          )}
        >
          {song.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {song.duration > 0 && (
            <span className="font-mono">{formatDuration(song.duration)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                void handleDownload();
              }}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  Download
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active indicator */}
      {/* {isSelected && (
        <div className="w-1 absolute left-0.5 top-0 bottom-0 rounded-l-xl bg-primary" />
      )} */}
    </div>
  );
}
