"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (res?.error) {
      toast.error("Invalid email or password");
      return;
    }
    toast.success("Welcome back");
    router.push(next);
    router.refresh();
  };

  const handleGoogle = () => signIn("google", { callbackUrl: next });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-brand-border bg-brand-surface/70 p-8 backdrop-blur-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]"
    >
      <h1 className="font-serif text-3xl font-bold tracking-tight">
        Welcome back
      </h1>
      <p className="mt-1 text-sm text-brand-textMuted">
        Sign in to pick up your diary.
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg border border-brand-border bg-brand-surface2 px-5 py-2.5 text-sm font-medium text-brand-text transition-all hover:border-brand-borderHi hover:bg-brand-surface3 active:scale-[0.98]"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-brand-textMuted">
        <div className="h-px flex-1 bg-brand-border" />
        or
        <div className="h-px flex-1 bg-brand-border" />
      </div>

      <form onSubmit={handleCredentials} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-brand-textMuted hover:text-brand-text"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-textMuted">
        New here?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-gold underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden
      className="shrink-0"
    >
      <path
        fill="#FFC107"
        d="M17.64 9.2c0-.63-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91A8.78 8.78 0 0 0 17.64 9.2z"
      />
      <path
        fill="#FF3D00"
        d="M9 18a8.6 8.6 0 0 0 5.95-2.18l-2.91-2.26a5.4 5.4 0 0 1-8.04-2.83H1V13a9 9 0 0 0 8 5z"
      />
      <path
        fill="#4CAF50"
        d="M3.96 10.72A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.28-1.72V5H1A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.03l3-2.31z"
      />
      <path
        fill="#1976D2"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.34l2.58-2.59A9 9 0 0 0 1 5l3 2.28A5.4 5.4 0 0 1 9 3.58z"
      />
    </svg>
  );
}
