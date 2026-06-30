// Next.js App Router catch-all NextAuth route.
// Delegates to the handlers exported from src/lib/auth.ts.
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;

// Force dynamic — never cache auth requests.
export const dynamic = "force-dynamic";
