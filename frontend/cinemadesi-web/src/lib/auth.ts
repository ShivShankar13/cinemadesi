import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { api } from "./api";
import type { UserProfile } from "@/types";

// Augment the session/JWT with our access token + lightweight user.
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    userId?: string;
    username?: string;
    expiresAt?: number;
  }
}

/**
 * Auth.js v5 (next-auth@5) configuration.
 *
 * <p>Credentials flow:
 *   form → POST /api/v1/auth/login → backend returns accessToken + user.
 *   We stash both onto the JWT; every fetch via {@code api.ts} reads it.
 * </p>
 *
 * <p>Google flow:
 *   Provider returns its own ID token in {@code account.id_token}; we
 *   exchange it for an app JWT via POST /api/v1/auth/oauth/google.
 * </p>
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const res = await api.auth.login({
            email:    String(credentials.email),
            password: String(credentials.password),
          });
          return {
            id: res.user.id,
            email: res.user.email,
            name: res.user.displayName ?? res.user.username,
            image: res.user.avatarUrl ?? undefined,
            // Smuggle these through to jwt() via the user object.
            // (NextAuth v5 accepts arbitrary extra fields on the user.)
            accessToken: res.accessToken,
            username: res.user.username,
            expiresInSeconds: res.expiresInSeconds,
          } as unknown as User;
        } catch {
          return null;
        }
      },
    }),

    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ account, user }) {
      // For Google OAuth, exchange the Google ID token for our app JWT.
      if (account?.provider === "google" && account.id_token) {
        try {
          const res = await api.auth.google(account.id_token as string);
          // Stash on the user so jwt() picks it up below.
          (user as unknown as ExtraAuthFields).accessToken = res.accessToken;
          (user as unknown as ExtraAuthFields).username = res.user.username;
          (user as unknown as ExtraAuthFields).expiresInSeconds =
            res.expiresInSeconds;
          (user as unknown as { id?: string }).id = res.user.id;
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const extra = user as unknown as ExtraAuthFields;
        token.accessToken = extra.accessToken;
        token.username    = extra.username;
        token.userId      = (user as { id?: string }).id;
        if (extra.expiresInSeconds) {
          token.expiresAt = Date.now() + extra.expiresInSeconds * 1000;
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (token.userId) session.user.id = token.userId;
      if (token.username) session.user.username = token.username;
      return session;
    },
  },
});

// Local types — kept here so they don't pollute @/types.
type User = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
} & ExtraAuthFields;

type ExtraAuthFields = {
  accessToken?: string;
  username?: string;
  expiresInSeconds?: number;
};

export type { UserProfile };
