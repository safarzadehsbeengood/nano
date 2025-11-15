"use client";
import { invoke } from "@tauri-apps/api/core";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [greeted, setGreeted] = useState<string | null>(null);
  const greet = useCallback((): void => {
    invoke<string>("greet")
      .then((s) => {
        setGreeted(s);
      })
      .catch((err: unknown) => {
        console.error(err);
      });
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center max-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-semibold">Welcome to Nano!</h1>
        <p className="text-center sm:text-left">
          This is a minimal Tauri + Next.js application template.
        </p>

        <div className="flex flex-col gap-2 items-start">
          <Button
            onClick={greet}
            title="Call &quot;greet&quot; from Rust"
            className="cursor-pointer"
          >
            Call Rust Function
          </Button>
          <p className="break-words w-md">
            {greeted ?? "Click the button to call the Rust function"}
          </p>
        </div>
      </main>
    </div>
  );
}
