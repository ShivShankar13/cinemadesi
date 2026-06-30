import { auth } from "@/lib/auth";
import { LandingHero } from "@/components/landing/LandingHero";
import { AuthHomeFeed } from "@/components/home/AuthHomeFeed";

/**
 * Auth-aware root. Server component: peeks at the session and renders
 * either the public landing (anonymous) or the home feed (signed in).
 *
 * <p>Both children handle their own client-side data fetching — we
 * don't ship two giant trees to anonymous users.</p>
 */
export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    return <AuthHomeFeed />;
  }
  return <LandingHero />;
}
