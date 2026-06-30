"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

/**
 * Guard hook for pages that require auth. Redirects to /login with a
 * {@code ?next=} param while the session is being checked.
 */
export function useRequireAuth() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [status, router, pathname]);

  return { isLoading: status === "loading", isAuthed: status === "authenticated" };
}

/**
 * Fetches and caches the full {@link UserProfile} for the signed-in user.
 * Returns null if not signed in. Mirrors into the Zustand store so any
 * component can read it synchronously without re-fetching.
 */
export function useCurrentUser() {
  const { status } = useSession();
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: ["me"],
    queryFn: () => api.auth.me(),
    enabled: status === "authenticated",
    staleTime: 5 * 60_000,
  });

  React.useEffect(() => {
    if (query.data) setUser(query.data);
    if (status === "unauthenticated") setUser(null);
  }, [query.data, status, setUser]);

  return query;
}
