import type { Metadata } from "next";
import { API_URL } from "@/lib/constants";

interface FilmShape {
  id: string;
  title: string;
  originalTitle?: string | null;
  releaseDate?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  overview?: string | null;
  industry?: string | null;
}

async function fetchFilm(id: string): Promise<FilmShape | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/films/${id}`, {
      // Cache for 5min — film metadata is mostly static once cached.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as FilmShape;
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const film = await fetchFilm(id);
  if (!film) {
    return {
      title: "Film — CinemaDesi",
      description: "Indian cinema, logged.",
    };
  }
  const year = film.releaseDate?.slice(0, 4);
  const title = `${film.title}${year ? ` (${year})` : ""}`;
  const description =
    film.overview?.slice(0, 160) ??
    `${film.title} — log, rate and review on CinemaDesi.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.movie",
      images: film.posterUrl ? [{ url: film.posterUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function FilmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
