"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { usePlayer } from "@/contexts/player-context";
import { supabase } from "@/lib/supabase";

export default function Player() {
  const { currentSong, setIsPlaying, isPlaying, setCurrentTime, restoredTime } =
    usePlayer();
  // biome-ignore lint: any is fine here
  const playerRef = useRef<any>(null);
  const hasRestoredTime = useRef(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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

  // Generate signed URL when song changes
  useEffect(() => {
    if (!currentSong) {
      setAudioUrl(null);
      return;
    }

    const generateUrl = async () => {
      const { data, error } = await supabase.storage
        .from("audio-files")
        .createSignedUrl(currentSong.filePath, 3600); // 1 hour expiration

      if (error) {
        console.error("Error creating signed URL:", error);
        setAudioUrl(null);
        return;
      }

      setAudioUrl(data.signedUrl);
    };

    void generateUrl();
  }, [currentSong]);

  // Track current time and update context
  useEffect(() => {
    if (!playerRef.current) return;
    //  eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const audioEl: HTMLMediaElement | undefined =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      playerRef.current?.audio?.current;
    if (!audioEl) return;

    const updateTime = () => {
      setCurrentTime(audioEl.currentTime);
    };

    audioEl.addEventListener("timeupdate", updateTime);
    return () => {
      audioEl.removeEventListener("timeupdate", updateTime);
    };
  }, [setCurrentTime]);

  // Reset restoration flag when song changes
  useEffect(() => {
    hasRestoredTime.current = false;
  }, []);

  // Restore time position when song is loaded
  useEffect(() => {
    if (!playerRef.current || !currentSong) return;
    //  eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const audioEl: HTMLMediaElement | undefined =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      playerRef.current?.audio?.current;
    if (!audioEl) return;

    if (restoredTime !== null && !hasRestoredTime.current) {
      const handleLoadedMetadata = () => {
        audioEl.currentTime = restoredTime;
        hasRestoredTime.current = true;
      };

      if (audioEl.readyState >= 1) {
        // Metadata already loaded
        audioEl.currentTime = restoredTime;
        hasRestoredTime.current = true;
      } else {
        audioEl.addEventListener("loadedmetadata", handleLoadedMetadata);
        return () => {
          audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
      }
    }
  }, [currentSong, restoredTime]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    //  eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const audioEl: HTMLMediaElement | undefined =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      playerRef.current?.audio?.current;
    if (!audioEl) return;

    if (isPlaying) {
      const p = audioEl.play();
      if (typeof p.catch === "function") {
        p.catch(() => {
          /* ignore */
        });
      }
    } else {
      audioEl.pause();
    }
  }, [isPlaying]);

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
          {currentSong.name}
        </p>
      </div>
      {audioUrl ? (
        <AudioPlayer
          key={playerKey}
          autoPlay={restoredTime === null}
          src={audioUrl}
          ref={playerRef}
          className="bg-background"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          showJumpControls={false}
        />
      ) : (
        <div className="p-4 text-center text-muted-foreground text-sm">
          Loading audio...
        </div>
      )}
    </div>
  );
}
