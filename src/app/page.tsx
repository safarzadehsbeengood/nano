"use client";

import { Library, Music, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { AudioFileRow } from "@/hooks/use-supabase-upload";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { user } = useAuth();

  const [songs, setSongs] = useState<AudioFileRow[]>([]);

  const fetchSongs = useCallback(async () => {
    const { data, error } = await supabase
      .from("audio_files")
      .select("*")
      .eq("user_id", user?.id)
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching songs:", error);
      return;
    }

    setSongs(data as AudioFileRow[]);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void fetchSongs();
  }, [user, fetchSongs]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 sm:py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Music className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-semibold tracking-tight">Nano</h1>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight">
              Welcome back
              {user && (
                <span className="block text-4xl sm:text-5xl text-muted-foreground font-normal mt-2">
                  {user.email?.split("@")[0]}
                </span>
              )}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {user
                ? "Your personal music collection, ready to play."
                : "Stream your personal music collection with a minimalist player built for focus and flow."}
            </p>
          </div>

          {!user && (
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/login"
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Get Started
              </Link>
              <Link
                href="/songs"
                className="px-6 py-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors font-medium"
              >
                Browse Library
              </Link>
            </div>
          )}
        </div>

        {/* Stats and Quick Actions */}
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <Library className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-medium text-muted-foreground">
                  Total Songs
                </h3>
              </div>
              <p className="text-3xl font-bold">{songs.length}</p>
            </div>

            <Link
              href="/songs"
              className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Music className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-medium text-muted-foreground">
                  Your Library
                </h3>
              </div>
              <p className="text-3xl font-bold">View All</p>
            </Link>

            <Link
              href="/upload"
              className="p-6 rounded-xl border bg-card/50 backdrop-blur-sm hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Upload className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="text-sm font-medium text-muted-foreground">
                  Upload
                </h3>
              </div>
              <p className="text-3xl font-bold">Add Music</p>
            </Link>
          </div>
        )}

        {/* Empty State for Non-Authenticated Users */}
        {!user && (
          <div className="mt-16 p-12 rounded-xl border bg-card/50 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Music className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-3">
              Start Your Music Journey
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Sign in to upload your favorite tracks and create your personal
              music library.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Sign In to Get Started
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
