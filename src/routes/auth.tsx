import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { GlassCard, PrimaryButton, GhostButton, FieldRow, TextField } from "@/components/primitives";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Paise" },
      {
        name: "description",
        content: "Sign in to Paise to keep your expenses, splits and reminders synced.",
      },
      { property: "og:title", content: "Sign in — Paise" },
      {
        property: "og:description",
        content: "Sign in to Paise to keep your expenses, splits and reminders synced.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/" });
  }, [loading, user, navigate]);

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      toast.error("Enter an email and a password with at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Account created — you're in");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      void navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error(result.error.message ?? "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-[34px] font-semibold tracking-tight">Paise</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your private money notebook — expenses, splits and reminders in one place.
        </p>
      </div>

      <GlassCard className="rise space-y-4 px-5 py-6">
        <FieldRow label="Email">
          <TextField
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </FieldRow>
        <FieldRow label="Password">
          <TextField
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </FieldRow>
        <PrimaryButton disabled={busy} onClick={() => void submit()}>
          {mode === "signup" ? "Create Account" : "Sign In"}
        </PrimaryButton>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <GhostButton className="w-full" disabled={busy} onClick={() => void google()}>
          Continue with Google
        </GhostButton>

        <button
          type="button"
          className="w-full text-center text-[13px] text-muted-foreground"
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
        >
          {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </GlassCard>
    </div>
  );
}
