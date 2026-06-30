"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.auth.forgotPassword(email);
      setSent(true);
    } catch {
      // The endpoint always returns 200 anyway (anti-enumeration).
      // Network errors are the only path here.
      toast.error("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-brand-border bg-brand-surface/70 p-8 backdrop-blur-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]"
    >
      <Link
        href="/login"
        className="mb-5 inline-flex items-center gap-1 text-xs text-brand-textMuted hover:text-brand-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>

      <h1 className="font-serif text-3xl font-bold tracking-tight">
        Reset your password
      </h1>
      <p className="mt-1 text-sm text-brand-textMuted">
        We'll email you a link to set a new one.
      </p>

      {sent ? (
        <div className="mt-7 rounded-xl border border-brand-goldDim bg-brand-goldGlow p-5">
          <Mail className="h-5 w-5 text-brand-gold" />
          <h2 className="mt-3 font-serif text-lg font-semibold text-brand-text">
            Check your email
          </h2>
          <p className="mt-1 text-sm text-brand-textMuted">
            If that email is registered, a reset link is on its way. The link
            expires in 30 minutes.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-7 space-y-4">
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
              autoFocus
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || !email}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                Send reset link
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </motion.div>
  );
}
