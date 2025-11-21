"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeOff,
} from "lucide-react";
import Image from "next/image";
import { usePlayer } from "@/contexts/player-context";
import { supabase } from "@/lib/supabase";

export default function Player() {
  const {
    currentSong,
    setIsPlaying,
    isPlaying,
    setCurrentTime,
    restoredTime,
    playNextSong,
    playPreviousSong,
  } = usePlayer();
  // biome-ignore lint: any is fine here
  const playerRef = useRef<any>(null);
  const hasRestoredTime = useRef(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const savedVolume = useRef<number>(1); // Default to full volume (1.0)

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    playNextSong();
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

  // Track current time and update context, also track volume changes
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

    const updateVolume = () => {
      savedVolume.current = audioEl.volume;
    };

    // Restore saved volume
    audioEl.volume = savedVolume.current;

    audioEl.addEventListener("timeupdate", updateTime);
    audioEl.addEventListener("volumechange", updateVolume);
    return () => {
      audioEl.removeEventListener("timeupdate", updateTime);
      audioEl.removeEventListener("volumechange", updateVolume);
    };
  }, [setCurrentTime]);

  // Reset restoration flag when song changes
  useEffect(() => {
    hasRestoredTime.current = false;
  }, []);

  // Restore time position and volume when song is loaded
  useEffect(() => {
    if (!playerRef.current || !currentSong) return;
    //  eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const audioEl: HTMLMediaElement | undefined =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      playerRef.current?.audio?.current;
    if (!audioEl) return;

    const restoreVolume = () => {
      audioEl.volume = savedVolume.current;
    };

    if (restoredTime !== null && !hasRestoredTime.current) {
      const handleLoadedMetadata = () => {
        audioEl.currentTime = restoredTime;
        restoreVolume();
        hasRestoredTime.current = true;
      };

      if (audioEl.readyState >= 1) {
        // Metadata already loaded
        audioEl.currentTime = restoredTime;
        restoreVolume();
        hasRestoredTime.current = true;
      } else {
        audioEl.addEventListener("loadedmetadata", handleLoadedMetadata);
        return () => {
          audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
      }
    } else {
      // Restore volume even if we're not restoring time
      const handleLoadedMetadata = () => {
        restoreVolume();
      };

      if (audioEl.readyState >= 1) {
        restoreVolume();
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
      <div className="pt-2 w-full">
        <div className="relative overflow-hidden flex flex-row items-center justify-center">
          <Image
            className="size-10 rounded-lg"
            src={currentSong.coverArtUrl}
            alt={currentSong.name}
            width={32}
            height={32}
          />
          <p className="text-md ml-2 font-medium text-foreground truncate">
            {currentSong.name}
          </p>
        </div>
      </div>
      {audioUrl ? (
        <AudioPlayer
          key={playerKey}
          autoPlay={restoredTime === null}
          src={audioUrl}
          ref={playerRef}
          layout="stacked"
          // className="bg-background mx-2 rounded-lg flex w-full justify-center items-center"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          showJumpControls={false}
          showSkipControls={true}
          volume={savedVolume.current}
          onClickNext={playNextSong}
          onClickPrevious={playPreviousSong}
          customIcons={{
            next: <SkipForward className="size-8   text-foreground" />,
            previous: <SkipBack className="size-8 text-foreground" />,
            loop: <Repeat className="size-4 text-foreground" />,
            loopOff: <Repeat1 className="size-4 text-foreground" />,
            volume: <Volume2 className="size-6 text-foreground" />,
            volumeMute: <VolumeOff className="size-6 text-foreground" />,
            play: <Play className="size-8 text-foreground" />,
            pause: <Pause className="size-8 text-foreground" />,
          }}
        />
      ) : (
        <div className="p-4 text-center text-muted-foreground text-sm">
          Loading audio...
        </div>
      )}
    </div>
  );
}
