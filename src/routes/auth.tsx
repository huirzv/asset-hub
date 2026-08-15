import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { slugify } from "@/lib/format";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Assetly" },
      {
        name: "description",
        content:
          "Sign in to Assetly to upload assets, save favorites and build collections.",
      },
      { property: "og:title", content: "Sign in — Assetly" },
      {
        property: "og:description",
        content: "Join the free, community-driven game asset library.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (userId) navigate({ to: "/" });
  }, [userId, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const username = slugify(displayName || email.split("@")[0] || "creator");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: displayName || username,
              username,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome to Assetly.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Authentication failed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="rounded-xl border border-border bg-surface p-6">
        <LogoMark className="h-7 w-7" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in to Assetly" : "Create your account"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Upload assets, save favorites and build collections. Always free.
        </p>

        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={google}
          type="button"
        >
          Continue with Google
        </Button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or use email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" ? (
            <div>
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Nova Studio"
                className="mt-1.5"
                required
              />
            </div>
          ) : null}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              className="mt-1.5"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to Assetly?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-foreground underline underline-offset-4"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to keep uploads legal and clearly licensed.{" "}
        <Link to="/explore" search={{}} className="underline underline-offset-4">
          Browse assets instead
        </Link>
      </p>
    </div>
  );
}
