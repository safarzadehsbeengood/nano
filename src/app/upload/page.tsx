"use client";

import { CheckCircle2, Loader2, Music, Upload, XCircle } from "lucide-react";
import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { user } = useAuth();

  if (!user) {
    return <p>Please log in or sign up.</p>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((file) =>
        file.type.startsWith("audio/"),
      );
      setFiles(selectedFiles);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setUploadStatus({
        success: false,
        message: "Please select at least one audio file",
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const uploadPromises = files.map(async (file) => {
        // create file path
        const filePath = `${user.id}/${file.name}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(`audio-files`)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        return { fileName: file.name, filePath };
      });

      const results = await Promise.all(uploadPromises);

      setUploadStatus({
        success: true,
        message: `Successfully uploaded ${results.length} file(s)`,
      });
      setFiles([]);
      // Reset file input
      const fileInput = document.getElementById(
        "audio-upload",
      ) as HTMLInputElement;
      fileInput.value = "";
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload files. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 items-center w-full max-w-2xl">
          <div className="flex flex-col gap-2 items-center">
            <Music className="size-12 text-primary mb-2" />
            <h1 className="text-3xl font-semibold">Upload Audio Files</h1>
            <p className="text-muted-foreground text-center">
              Select audio files to upload to Supabase Storage
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio-upload">Audio Files</Label>
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Supported formats: MP3, WAV, OGG, M4A, and other audio formats
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({files.length})</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                    >
                      <Music className="size-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{file.name}</span>
                      <span className="text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadStatus && (
              <div
                className={`flex items-center gap-2 p-4 rounded-md ${
                  uploadStatus.success
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                }`}
              >
                {uploadStatus.success ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <XCircle className="size-5" />
                )}
                <span>{uploadStatus.message}</span>
              </div>
            )}

            <Button
              onClick={() => {
                void handleUpload();
              }}
              disabled={uploading || files.length === 0}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
