/*biome-ignore-all lint: don't worry about this file*/

import { invoke } from "@tauri-apps/api/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type FileError,
  type FileRejection,
  useDropzone,
} from "react-dropzone";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

interface FileWithPreview extends File {
  preview?: string;
  errors: readonly FileError[];
}

export interface AudioFileRow {
  id: string;
  title: string;
  duration: number;
  file_path: string;
  cover_art_url: string;
  user_id: string;
}

interface UseSupabaseUploadOptions {
  /**
   * Name of bucket to upload files to in your Supabase project
   */
  bucketName: string;
  /**
   * Folder to upload files to in the specified bucket within your Supabase project.
   *
   * Defaults to uploading files to the root of the bucket
   *
   * e.g If specified path is `test`, your file will be uploaded as `test/file_name`
   */
  path?: string;
  /**
   * Allowed MIME types for each file upload (e.g `image/png`, `text/html`, etc). Wildcards are also supported (e.g `image/*`).
   *
   * Defaults to allowing uploading of all MIME types.
   */
  allowedMimeTypes?: string[];
  /**
   * Maximum upload size of each file allowed in bytes. (e.g 1000 bytes = 1 KB)
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed per upload.
   */
  maxFiles?: number;
  /**
   * The number of seconds the asset is cached in the browser and in the Supabase CDN.
   *
   * This is set in the Cache-Control: max-age=<seconds> header. Defaults to 3600 seconds.
   */
  cacheControl?: number;
  /**
   * When set to true, the file is overwritten if it exists.
   *
   * When set to false, an error is thrown if the object already exists. Defaults to `false`
   */
  upsert?: boolean;
  /**
   * Name of bucket to upload cover art to. If not provided, cover art extraction will be skipped.
   */
  coverArtBucketName?: string;
}

type UseSupabaseUploadReturn = ReturnType<typeof useSupabaseUpload>;

const useSupabaseUpload = (options: UseSupabaseUploadOptions) => {
  const { user } = useAuth();
  const {
    bucketName,
    path,
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
    cacheControl = 3600,
    upsert = true,
    coverArtBucketName,
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) {
      return false;
    }
    if (errors.length === 0 && successes.length === files.length) {
      return true;
    }
    return false;
  }, [errors.length, successes.length, files.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          (file as FileWithPreview).preview = URL.createObjectURL(file);
          (file as FileWithPreview).errors = [];
          return file as FileWithPreview;
        });

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        (file as FileWithPreview).preview = URL.createObjectURL(file);
        (file as FileWithPreview).errors = errors;
        return file as FileWithPreview;
      });

      const newFiles = [...files, ...validFiles, ...invalidFiles];

      setFiles(newFiles);
    },
    [files, setFiles],
  );

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {},
    ),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1,
  });

  // Helper function to extract and upload cover art
  const extractAndUploadCoverArt = useCallback(
    async (file: File, song_id: string): Promise<string | null> => {
      if (!coverArtBucketName || !file.type.startsWith("audio/")) {
        return null;
      }

      try {
        // Read file as array buffer
        const arrayBuffer = await file.arrayBuffer();
        const fileBytes = Array.from(new Uint8Array(arrayBuffer));

        // Extract cover art using Rust
        const coverArtDataUrl = await invoke<string | null>(
          "extract_cover_art_from_bytes",
          {
            fileBytes,
            fileName: file.name,
          },
        );

        if (!coverArtDataUrl) {
          console.error("No cover art found");
          return null;
        }

        // Convert data URL to blob
        const response = await fetch(coverArtDataUrl);
        const blob = await response.blob();

        // Determine file extension from MIME type
        const mimeTypeRegex = /data:([^;]+);/;
        const mimeTypeMatch = mimeTypeRegex.exec(coverArtDataUrl);
        const mimeType = mimeTypeMatch?.[1] ?? "image/jpeg";
        const extension = mimeType.split("/")[1] ?? "jpg";

        // Create filename for cover art (e.g., "song.mp3" -> "song.jpg")
        const coverArtFileName = `${song_id}.${extension}`;

        // Upload to Supabase storage
        const coverArtPath = path
          ? `${path}/${coverArtFileName}`
          : coverArtFileName;

        const { data, error } = await supabase.storage
          .from(coverArtBucketName)
          .upload(coverArtPath, blob, {
            cacheControl: cacheControl.toString(),
            upsert,
            contentType: mimeType,
          });

        if (error) {
          console.log("could not upload cover art");
          console.error("Failed to upload cover art:", error);
          return null;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(coverArtBucketName).getPublicUrl(data.path);

        return publicUrl;
      } catch (error) {
        console.error("Error extracting/uploading cover art:", error);
        return null;
      }
    },
    [coverArtBucketName, path, cacheControl, upsert],
  );

  const getAudioDuration = useCallback(async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = Array.from(new Uint8Array(arrayBuffer));
    const duration = await invoke<number>("get_audio_duration", {
      fileBytes,
      fileName: file.name,
    });
    return duration;
  }, []);

  const onUpload = useCallback(async () => {
    if (!user) {
      console.error("User not found");
      return;
    }

    setLoading(true);

    // [Joshen] This is to support handling partial successes
    // If any files didn't upload for any reason, hitting "Upload" again will only upload the files that had errors
    const filesWithErrors = errors.map((x) => x.name);
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
            ...files.filter((f) => filesWithErrors.includes(f.name)),
            ...files.filter((f) => !successes.includes(f.name)),
          ]
        : files;

    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
        // add row to database
        const result = await supabase
          .from("audio_files")
          .insert({
            title: file.name.split(".").slice(0, -1).join(".") || file.name,
            duration: await getAudioDuration(file),
            user_id: user.id,
          })
          .select()
          .single<AudioFileRow>();

        if (result.error) {
          console.error("Error adding song to database:", result.error);
          return { name: file.name, message: result.error.message };
        }

        // Get the song id from the database
        const songId = result.data.id;

        // Preserve original file extension
        const fileExtension = file.name.split(".").pop() ?? "";
        const storageFileName = `${songId}.${fileExtension}`;

        // Update file_path in database to use UUID
        await supabase
          .from("audio_files")
          .update({
            file_path: path ? `${path}/${storageFileName}` : storageFileName,
          })
          .eq("id", songId);

        // Upload the audio file
        const { error } = await supabase.storage
          .from(bucketName)
          .upload(path ? `${path}/${storageFileName}` : storageFileName, file, {
            cacheControl: cacheControl.toString(),
            upsert,
          });

        if (error) {
          return { name: file.name, message: error.message };
        }

        // Extract and upload cover art if enabled
        if (coverArtBucketName) {
          const coverArtUrl = await extractAndUploadCoverArt(file, songId);
          if (coverArtUrl) {
            await supabase
              .from("audio_files")
              .update({ cover_art_url: coverArtUrl })
              .eq("id", songId);
          }
        }

        return { name: file.name, message: undefined };
      }),
    );

    const responseErrors = responses.filter((x) => x.message !== undefined);
    // if there were errors previously, this function tried to upload the files again so we should clear/overwrite the existing errors.
    setErrors(responseErrors);

    const responseSuccesses = responses.filter((x) => x.message === undefined);
    const newSuccesses = Array.from(
      new Set([...successes, ...responseSuccesses.map((x) => x.name)]),
    );
    setSuccesses(newSuccesses);

    setLoading(false);
  }, [
    files,
    path,
    bucketName,
    errors,
    successes,
    cacheControl,
    upsert,
    coverArtBucketName,
    extractAndUploadCoverArt,
  ]);

  useEffect(() => {
    if (files.length === 0) {
      setErrors([]);
    }

    // If the number of files doesn't exceed the maxFiles parameter, remove the error 'Too many files' from each file
    if (files.length <= maxFiles) {
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === "too-many-files")) {
          return {
            ...file,
            errors: file.errors.filter((e) => e.code !== "too-many-files"),
          } as FileWithPreview;
        }
        return file;
      });
      const hasChanges = newFiles.some(
        (file, index) => file.errors.length !== files[index]?.errors.length,
      );
      if (hasChanges) {
        setFiles(newFiles);
      }
    }
  }, [files.length, setFiles, maxFiles]);

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  };
};

export {
  useSupabaseUpload,
  type UseSupabaseUploadOptions,
  type UseSupabaseUploadReturn,
};
