import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Same mesh as landing — keeps it on-brand */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-mesh-hero opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-10 flex flex-col items-center gap-2 text-center">
          <Logo size="xl" />
          <p className="text-sm text-brand-textMuted">
            Indian cinema. Logged for keeps.
          </p>
        </div>

        {children}

        <p className="mt-10 text-center text-xs text-brand-textMuted">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-brand-text underline-offset-4 hover:underline">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-brand-text underline-offset-4 hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
