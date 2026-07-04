"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="h-96 rounded-2xl border border-brand-border bg-brand-surface/70" />}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const passwordValid = password.length >= 8;
  const matches = password.length > 0 && password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!matches) {
      toast.error("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      await api.auth.resetPassword({ token, password });
      toast.success("Password updated. Sign in with your new password.");
      router.push("/login");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "That reset link is invalid or expired.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-2xl border border-brand-border bg-brand-surface/70 p-8 backdrop-blur-md">
        <h1 className="font-serif text-2xl font-bold">Missing reset link</h1>
        <p className="mt-2 text-sm text-brand-textMuted">
          This page needs a token in the URL. Use the link from the email we sent.
        </p>
        <Button asChild className="mt-5" variant="outline">
          <Link href="/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-brand-border bg-brand-surface/70 p-8 backdrop-blur-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]"
    >
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-goldDim bg-brand-goldGlow text-brand-gold">
        <KeyRound className="h-5 w-5" />
      </div>

      <h1 className="font-serif text-3xl font-bold tracking-tight">
        Set a new password
      </h1>
      <p className="mt-1 text-sm text-brand-textMuted">
        Once you save, you'll be signed out everywhere and need to sign back in.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoFocus
            className={cn(
              password && !passwordValid && "border-brand-red focus:border-brand-red"
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={cn(
              confirm && !matches && "border-brand-red focus:border-brand-red"
            )}
          />
          {confirm && !matches && (
            <p className="text-[11px] text-brand-red">Passwords don't match</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting || !passwordValid || !matches}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              Update password
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
