"use client";

import { useMemo } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { usePlayer } from "@/contexts/player-context";

export default function Player() {
  const { currentSong, setIsPlaying } = usePlayer();

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    // Optionally, you could auto-play next song here
  };

  // Use key prop to force re-render when song changes
  const playerKey = useMemo(
    () => currentSong?.id ?? "no-song",
    [currentSong?.id],
  );

  if (!currentSong) {
    return (
      <div className="bg-background border-t p-4 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No song selected</p>
      </div>
    );
  }

  return (
    <div className="bg-background border-t">
      <div className="px-4 pt-3 pb-2">
        <p className="text-sm font-medium text-foreground truncate">
          {currentSong.name} ({currentSong.index})
        </p>
      </div>
      <AudioPlayer
        key={playerKey}
        autoPlay={true}
        src={currentSong.url}
        className="bg-background"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        showJumpControls={false}
      />
    </div>
  );
}
