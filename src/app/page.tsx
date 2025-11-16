"use client";

import { Music, Upload } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <Music className="w-8 h-8 text-pink-400" />
            Nano
          </h1>
          <nav className="flex gap-3">
            <Link
              href="/songs"
              className="px-4 py-2 rounded-md bg-slate-700/40 hover:bg-slate-700/60"
            >
              Your Library
            </Link>
            <Link
              href="/upload"
              className="px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-500 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </Link>
          </nav>
        </header>

        <main className="gap-8 items-center">
          <section className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
              Your Audio, Anywhere.
            </h2>
            <p className="text-slate-300 max-w-xl">
              Stream your personal music collection with a minimalist player
              built for focus and flow. Upload tracks, build playlists, and pick
              up where you left off.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
