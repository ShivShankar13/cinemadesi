import type { Metadata } from "next";
import { API_URL } from "@/lib/constants";

interface ProfileShape {
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  totalFilmsWatched?: number;
}

async function fetchProfile(username: string): Promise<ProfileShape | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/users/${username}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ProfileShape;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfile(username);
  if (!profile) {
    return {
      title: `@${username}`,
      description: `${username} on CinemaDesi`,
    };
  }
  const name = profile.displayName || profile.username;
  const title = `${name} (@${profile.username})`;
  const description =
    profile.bio?.slice(0, 160) ??
    `${name} on CinemaDesi — ${profile.totalFilmsWatched ?? 0} films logged.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
  };
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
