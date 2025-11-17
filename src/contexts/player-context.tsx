"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Song {
  id: string;
  index: number;
  name: string;
  url?: string; // Make optional since we'll generate it on demand
  filePath: string;
  coverArtUrl: string;
  duration: number;
}

interface CachedSongData {
  song: Song;
  currentTime: number;
}

interface PlayerContextType {
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  restoredTime: number | null;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const LAST_PLAYED_SONG_KEY = "nano:last-played-song";

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSongState] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [restoredTime, setRestoredTime] = useState<number | null>(null);

  // Load last played song from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const cached = localStorage.getItem(LAST_PLAYED_SONG_KEY);
      if (cached) {
        const data = JSON.parse(cached) as CachedSongData;
        setCurrentSongState(data.song);
        setRestoredTime(data.currentTime);
        setCurrentTime(data.currentTime);
        // Start paused when restoring
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error loading cached song:", error);
      // Clear invalid cache
      localStorage.removeItem(LAST_PLAYED_SONG_KEY);
    }
  }, []);

  // Save current song and time to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (currentSong) {
      try {
        const data: CachedSongData = {
          song: currentSong,
          currentTime,
        };
        localStorage.setItem(LAST_PLAYED_SONG_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Error saving song to cache:", error);
      }
    } else {
      // Clear cache when no song is selected
      localStorage.removeItem(LAST_PLAYED_SONG_KEY);
    }
  }, [currentSong, currentTime]);

  const setCurrentSong = (song: Song | null) => {
    setCurrentSongState(song);
    // Reset restored time when manually selecting a new song
    setRestoredTime(null);
    if (song) {
      setCurrentTime(0);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        restoredTime,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
