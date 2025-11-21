"use client";

import { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  
  useEffect(() => {
    if (user?.user_metadata) {
      const currentUsername = user.user_metadata.username as string | undefined;
      setUsername(currentUsername ?? "");
    }
  }, [user]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        setError("Username cannot be empty");
        setLoading(false);
        return;
      }

      const usernamePattern = /^[a-zA-Z0-9_]+$/;
      if (!usernamePattern.test(trimmedUsername)) {
        setError("Username can only contain letters, numbers, and underscores");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          username: trimmedUsername,
        },
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        // Refresh the page to update the user context
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-4xl font-semibold mb-4">Settings</h1>
        
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Profile</h2>
            
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setSuccess(false);
                    setError(null);
                  }}
                  disabled={loading}
                  required
                  pattern="[a-zA-Z0-9_]+"
                  title="Username can only contain letters, numbers, and underscores"
                />
                <p className="text-sm text-muted-foreground">
                  Your username is used to identify your playlists and profile. Only letters, numbers, and underscores are allowed.
                </p>
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                  Username updated successfully!
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Username"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
