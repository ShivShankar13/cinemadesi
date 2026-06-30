import { create } from "zustand";
import type { UserProfile } from "@/types";

/**
 * Light Zustand store for the in-memory authenticated user.
 *
 * NextAuth owns the session/token — this just caches the rich
 * {@link UserProfile} returned by GET /auth/me so components don't
 * re-fetch it everywhere. Hydrated by the SessionInitializer on mount
 * once next-auth says we're signed in.
 */
interface AuthState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
