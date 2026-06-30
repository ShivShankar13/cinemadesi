// All shared types — mirror the backend DTOs in com.cinemadesi.dto.*

export type Industry =
  | "BOLLYWOOD"
  | "TAMIL"
  | "TELUGU"
  | "MALAYALAM"
  | "KANNADA"
  | "MARATHI"
  | "OTHER";

export type WatchMode = "THEATRE" | "OTT" | "HOME";

export type OttPlatform =
  | "NETFLIX"
  | "PRIME"
  | "HOTSTAR"
  | "ZEE5"
  | "SONYLIV"
  | "MXPLAYER"
  | "OTHER";

export type RecommendationStatus = "PENDING" | "SAVED" | "DISMISSED";

export type GroupRole = "ADMIN" | "MEMBER";

// ---------- Films ----------

export interface FilmSummary {
  id: string;
  tmdbId: number;
  title: string;
  industry: Industry;
  language: string | null;
  releaseDate: string | null;
  posterUrl: string | null;
}

export interface Film extends FilmSummary {
  originalTitle: string | null;
  backdropUrl: string | null;
  overview: string | null;
  genres: string[] | null;
  director: string | null;
  runtimeMinutes: number | null;
}

// ---------- Users ----------

export interface UserSummary {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface UserProfile extends UserSummary {
  bio: string | null;
  email: string;
  totalFilmsWatched: number;
  totalFollowers: number;
  totalFollowing: number;
  isFollowedByMe: boolean | null;
}

// ---------- Auth ----------

export interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  user: UserProfile;
}

// ---------- Diary / Watchlist ----------

export interface DiaryEntry {
  id: string;
  film: FilmSummary;
  user: UserSummary;
  watchedAt: string;
  rating: number | null;
  reviewText: string | null;
  watchMode: WatchMode | null;
  ottPlatform: OttPlatform | null;
  containsSpoilers: boolean;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  film: FilmSummary;
  addedAt: string;
  moodTags: string[] | null;
  recommendedBy: UserSummary | null;
}

// ---------- Groups ----------

export interface GroupSummary {
  id: string;
  name: string;
  coverImageUrl: string | null;
  memberCount: number;
  previewMembers: UserSummary[];
}

export interface GroupMember {
  id: string;
  user: UserSummary;
  role: GroupRole;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  createdBy: UserSummary | null;
  members: GroupMember[];
  memberCount: number;
  createdAt: string;
}

export interface GroupWatchlistItem {
  film: FilmSummary;
  addedBy: UserSummary[];
  memberCount: number;
}

// ---------- Recommendations ----------

export interface Recommendation {
  id: string;
  fromUser: UserSummary;
  toUser: UserSummary | null;
  toGroup: GroupSummary | null;
  film: FilmSummary;
  note: string | null;
  status: RecommendationStatus;
  createdAt: string;
}

// ---------- Lists ----------

export interface ListFilmEntry {
  id: string;
  film: FilmSummary;
  sortOrder: number | null;
  note: string | null;
}

export interface FilmList {
  id: string;
  owner: UserSummary | null;
  title: string;
  description: string | null;
  isPublic: boolean | null;
  films: ListFilmEntry[];
  filmCount: number;
  createdAt: string;
}

// ---------- Pagination ----------

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ---------- API error envelope ----------

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}
