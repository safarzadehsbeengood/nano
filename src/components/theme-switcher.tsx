"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder button with the same dimensions during SSR
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-6 border-none bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-6 border-none bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
      onClick={(_e) => {
        // e.stopPropagation();
        setTheme(
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light",
        );
      }}
    >
      {theme === "light" && <Sun className="size-4 scale-100 transition-all" />}
      {theme === "dark" && (
        <Moon className="size-4 scale-100 transition-all -rotate-90" />
      )}
      {theme === "system" && (
        <Monitor className="size-4 scale-100 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
