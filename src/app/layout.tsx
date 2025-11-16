"use client";
import { Quantico, Roboto } from "next/font/google";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import Player from "@/components/audio-player";
import { ThemeProvider } from "@/components/theme-provider";
import TitleBar from "@/components/title-bar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/auth-context";
import { PlayerProvider } from "@/contexts/player-context";

const quantico = Quantico({
  variable: "--font-quantico",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${quantico.variable} ${roboto.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PlayerProvider>
              <TitleBar />
              <SidebarProvider className="h-[calc(100svh-2rem-80px)] mt-8 overflow-hidden">
                <AppSidebar />
                <SidebarTrigger />
                <main className="flex-1 overflow-y-auto min-h-0 pb-32">
                  {children}
                </main>
              </SidebarProvider>
              <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
                <Player />
              </div>
            </PlayerProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
