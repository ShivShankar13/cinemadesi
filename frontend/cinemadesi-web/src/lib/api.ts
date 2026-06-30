import axios, { type AxiosError, type AxiosInstance } from "axios";
import { getSession, signOut } from "next-auth/react";
import type {
  AuthResponse,
  DiaryEntry,
  Film,
  FilmList,
  FilmSummary,
  Group,
  GroupSummary,
  GroupWatchlistItem,
  Industry,
  PagedResponse,
  Recommendation,
  RecommendationStatus,
  UserProfile,
  UserSummary,
  WatchlistItem,
} from "@/types";
import { API_URL } from "./constants";

// ---------------------------------------------------------------------------
// Axios instance with auth interceptor
// ---------------------------------------------------------------------------

const http: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT from NextAuth session on every request (client-side).
http.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const session = await getSession();
    const token = (session as unknown as { accessToken?: string } | null)
      ?.accessToken;
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// On 401, sign out + bounce to /login. On other errors, normalise the message.
http.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<{ message?: string }>) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      await signOut({ callbackUrl: "/login", redirect: true });
    }
    return Promise.reject(err);
  }
);

// ---------------------------------------------------------------------------
// Typed resource helpers
// ---------------------------------------------------------------------------

const get = <T,>(url: string, params?: Record<string, unknown>) =>
  http.get<T>(url, { params }).then((r) => r.data);
const post = <T,>(url: string, body?: unknown) =>
  http.post<T>(url, body).then((r) => r.data);
const patch = <T,>(url: string, body?: unknown) =>
  http.patch<T>(url, body).then((r) => r.data);
const del = <T = void,>(url: string) =>
  http.delete<T>(url).then((r) => r.data);

export const api = {
  auth: {
    register: (body: {
      email: string;
      password: string;
      username: string;
      displayName?: string;
    }) => post<AuthResponse>("/auth/register", body),
    login: (body: { email: string; password: string }) =>
      post<AuthResponse>("/auth/login", body),
    google: (idToken: string) =>
      post<AuthResponse>("/auth/oauth/google", { idToken }),
    me: () => get<UserProfile>("/auth/me"),
    forgotPassword: (email: string) =>
      post<{ message: string }>("/auth/forgot-password", { email }),
    resetPassword: (body: { token: string; password: string }) =>
      post<{ message: string }>("/auth/reset-password", body),
  },

  films: {
    search: (params: {
      q: string;
      industry?: Industry;
      page?: number;
      size?: number;
    }) => get<PagedResponse<FilmSummary>>("/films/search", params),
    byId: (id: string) => get<Film>(`/films/${id}`),
    trending: (industry?: Industry) =>
      get<FilmSummary[]>("/films/trending", industry ? { industry } : undefined),
    industries: () => get<Industry[]>("/films/industries"),
    reviews: (id: string, page = 0, size = 10) =>
      get<PagedResponse<DiaryEntry>>(`/films/${id}/reviews`, { page, size }),
  },

  users: {
    search: (q: string, limit = 8) =>
      get<UserSummary[]>("/users/search", { q, limit }),
    byUsername: (username: string) =>
      get<UserProfile>(`/users/${username}`),
    updateMe: (body: { displayName?: string; bio?: string; avatarUrl?: string }) =>
      patch<UserProfile>("/users/me", body),
    diary: (username: string, page = 0, size = 20) =>
      get<PagedResponse<DiaryEntry>>(`/users/${username}/diary`, { page, size }),
    watchlist: (username: string) =>
      get<WatchlistItem[]>(`/users/${username}/watchlist`),
    lists: (username: string) =>
      get<FilmList[]>(`/users/${username}/lists`),
    follow: (userId: string) => post<void>(`/users/follow/${userId}`),
    unfollow: (userId: string) => del(`/users/follow/${userId}`),
    followers: (username: string) =>
      get<UserSummary[]>(`/users/${username}/followers`),
    following: (username: string) =>
      get<UserSummary[]>(`/users/${username}/following`),
  },

  diary: {
    log: (body: {
      filmId: string;
      watchedAt: string;
      rating?: number;
      reviewText?: string;
      watchMode?: string;
      ottPlatform?: string;
      containsSpoilers?: boolean;
    }) => post<DiaryEntry>("/diary", body),
    update: (
      entryId: string,
      body: Partial<{
        watchedAt: string;
        rating: number;
        reviewText: string;
        watchMode: string;
        ottPlatform: string;
        containsSpoilers: boolean;
      }>
    ) => patch<DiaryEntry>(`/diary/${entryId}`, body),
    delete: (entryId: string) => del(`/diary/${entryId}`),
    feed: (page = 0, size = 20) =>
      get<PagedResponse<DiaryEntry>>("/diary/feed", { page, size }),
  },

  watchlist: {
    getAll: () => get<WatchlistItem[]>("/watchlist"),
    add: (body: { filmId: string; moodTags?: string[] }) =>
      post<WatchlistItem>("/watchlist", body),
    remove: (itemId: string) => del(`/watchlist/${itemId}`),
    markWatched: (
      itemId: string,
      body: {
        watchedAt: string;
        rating?: number;
        reviewText?: string;
        watchMode?: string;
        ottPlatform?: string;
      }
    ) => patch<DiaryEntry>(`/watchlist/${itemId}/watched`, body),
    updateMoodTags: (itemId: string, moodTags: string[]) =>
      patch<WatchlistItem>(`/watchlist/${itemId}/mood-tags`, { moodTags }),
  },

  groups: {
    myGroups: () => get<GroupSummary[]>("/groups/my"),
    create: (body: { name: string; description?: string; coverImageUrl?: string }) =>
      post<Group>("/groups", body),
    byId: (groupId: string) => get<Group>(`/groups/${groupId}`),
    update: (
      groupId: string,
      body: Partial<{ name: string; description: string; coverImageUrl: string }>
    ) => patch<Group>(`/groups/${groupId}`, body),
    invite: (groupId: string, body: { userId: string; role?: "ADMIN" | "MEMBER" }) =>
      post<unknown>(`/groups/${groupId}/members`, body),
    removeMember: (groupId: string, userId: string) =>
      del(`/groups/${groupId}/members/${userId}`),
    mergedWatchlist: (groupId: string) =>
      get<GroupWatchlistItem[]>(`/groups/${groupId}/watchlist`),
    commonFilms: (groupId: string) =>
      get<GroupWatchlistItem[]>(`/groups/${groupId}/common`),
    feed: (groupId: string, page = 0, size = 20) =>
      get<PagedResponse<DiaryEntry>>(`/groups/${groupId}/feed`, { page, size }),
  },

  recommendations: {
    inbox: () => get<Recommendation[]>("/recommendations/inbox"),
    sent: () => get<Recommendation[]>("/recommendations/sent"),
    send: (body: {
      filmId: string;
      toUserId?: string;
      toGroupId?: string;
      note?: string;
    }) => post<Recommendation>("/recommendations", body),
    updateStatus: (recId: string, status: RecommendationStatus) =>
      patch<Recommendation>(`/recommendations/${recId}/status`, { status }),
  },

  lists: {
    myLists: () => get<FilmList[]>("/lists/my"),
    publicLists: (page = 0, size = 20) =>
      get<PagedResponse<FilmList>>("/lists/public", { page, size }),
    create: (body: { title: string; description?: string; isPublic?: boolean }) =>
      post<FilmList>("/lists", body),
    byId: (listId: string) => get<FilmList>(`/lists/${listId}`),
    update: (
      listId: string,
      body: Partial<{ title: string; description: string; isPublic: boolean }>
    ) => patch<FilmList>(`/lists/${listId}`, body),
    delete: (listId: string) => del(`/lists/${listId}`),
    addFilm: (
      listId: string,
      body: { filmId: string; note?: string; sortOrder?: number }
    ) => post(`/lists/${listId}/films`, body),
    removeFilm: (listId: string, filmId: string) =>
      del(`/lists/${listId}/films/${filmId}`),
  },
};

export { http };
