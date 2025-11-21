"use client";

import { Music } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/dropzone";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

export default function UploadPage() {
  const { user } = useAuth();

  const props = useSupabaseUpload({
    bucketName: "audio-files",
    path: user?.id,
    allowedMimeTypes: ["audio/*"],
    maxFiles: 100,
    maxFileSize: 1000 * 1000 * 50, // 50MB,
    coverArtBucketName: "cover-art", // Extract and upload cover art to this bucket
  });

  return (
    <AuthGuard>
      <div className="h-calc(100vh-64px) flex items-center justify-center align-middle p-20">
        <main className="flex flex-col gap-2 items-center w-full max-w-2xl">
          <div className="flex flex-col gap-2 items-center">
            <Music className="size-12 text-primary mb-2" />
            <h1 className="text-3xl font-semibold">Upload Audio Files</h1>
            <p className="text-muted-foreground text-center">
              Select audio files to upload to your library
            </p>
          </div>
          <div className="space-y-2">
            <Dropzone {...props}>
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
