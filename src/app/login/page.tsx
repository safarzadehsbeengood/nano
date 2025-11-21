"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
          setError("Username is required");
          setLoading(false);
          return;
        }
        const usernamePattern = /^[a-zA-Z0-9_]+$/;
        if (!usernamePattern.test(trimmedUsername)) {
          setError(
            "Username can only contain letters, numbers, and underscores",
          );
          setLoading(false);
          return;
        }

        const { error: authError } = await signUp(
          email,
          password,
          trimmedUsername,
        );

        if (authError) {
          setError(authError.message);
        } else {
          // Show email confirmation message and redirect to login
          setShowEmailConfirmation(true);
          setTimeout(() => {
            setIsSignUp(false);
            setShowEmailConfirmation(false);
            setEmail("");
            setPassword("");
            setUsername("");
            setError(null);
          }, 3000);
        }
      } else {
        const { error: authError } = await signIn(email, password);

        if (authError) {
          setError(authError.message);
        } else {
          const redirectTo =
            typeof window !== "undefined"
              ? (new URLSearchParams(window.location.search).get("redirect") ??
                "/")
              : "/";
          router.push(redirectTo);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp
              ? "Sign up to get started"
              : "Sign in to your account to continue"}
          </p>
        </div>

        <div className="space-y-4">
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  required
                  disabled={loading}
                  pattern="[a-zA-Z0-9_]+"
                  title="Username can only contain letters, numbers, and underscores"
                />
                <p className="text-sm text-muted-foreground">
                  Only letters, numbers, and underscores are allowed
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {showEmailConfirmation && (
              <div className="p-4 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md space-y-2">
                <p className="font-medium">Account created successfully!</p>
                <p>
                  Please check your email to confirm your account. You&apos;ll
                  be redirected to the login page shortly.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </>
              ) : isSignUp ? (
                "Sign up"
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            {isSignUp ? (
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                  }}
                  className="text-primary hover:underline"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  className="text-primary hover:underline"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
