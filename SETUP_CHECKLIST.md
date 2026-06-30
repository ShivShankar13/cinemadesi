# CinemaDesi — Setup Checklist

> Tracks the **basic infra setup** (skeleton only — no auth, DB tables, or business logic yet).
> Tick each box as it's completed. Safe to pause/resume — pick up from the first unchecked item.

**Decisions locked for this phase:**
- Backend: Java 21 + Spring Boot 3.5.x (latest stable line), Maven, virtual threads on
- Frontend: Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS (v3 — stable shadcn ecosystem)
- Scope: skeleton only. No auth flow, no DB migrations, no business endpoints.

---

## Phase 0 — Project tracker

- [x] Create this `SETUP_CHECKLIST.md`

---

## Phase 1 — Backend skeleton (`backend/cinemadesi-api/`)

### 1.1 Maven project
- [x] `pom.xml` — Spring Boot 3.5.x parent, Java 21, dependencies from `02_BACKEND_REQUIREMENTS.md`
- [x] `.gitignore` (target/, .idea/, *.iml, etc.)
- [ ] `.mvn/` wrapper (skipped — use system `mvn` for now; can add later with `mvn wrapper:wrapper`)

### 1.2 Source tree
- [x] `src/main/java/com/cinemadesi/CinemaDesiApplication.java` (main class)
- [x] Empty package folders: `config/`, `controller/`, `service/`, `repository/`, `entity/`, `entity/enums/`, `dto/`, `dto/request/`, `dto/response/`, `mapper/`, `security/`, `exception/`
- [x] `src/main/resources/application.yml`
- [x] `src/main/resources/application-dev.yml`
- [x] `src/main/resources/db/migration/` (empty, ready for Flyway later)
- [x] `src/test/java/com/cinemadesi/CinemaDesiApplicationTests.java` (smoke test)

### 1.3 Base infra code
- [x] `dto/response/ErrorResponse.java` (record)
- [x] `exception/ResourceNotFoundException.java`
- [x] `exception/UnauthorizedException.java`
- [x] `exception/GlobalExceptionHandler.java` (handlers: 404, 401, 400-validation, 500)
- [x] `controller/HealthController.java` → `GET /api/v1/health` → `{"status":"UP"}`
- [x] `config/SecurityConfig.java` (temporary permit-all — replaced in Module 4)

### 1.4 Verify
- [ ] `mvn -q -DskipTests compile` — **deferred:** sandbox has Java 11 and no Maven. Run on your machine with Java 21 + Maven 3.9+.
- [x] Source-level sanity (XML well-formed, YAML parses, Java brace balance + package decls) — all green

---

## Phase 2 — Frontend skeleton (`frontend/cinemadesi-web/`)

### 2.1 Project files
- [x] `package.json` (Next 16, React 19, TS 5, Tailwind 3, deps from `03_FRONTEND_REQUIREMENTS.md`)
- [x] `tsconfig.json`
- [x] `next.config.ts`
- [x] `tailwind.config.ts` (with full `brand` color palette from spec)
- [x] `postcss.config.mjs`
- [x] `.gitignore`
- [x] `.env.local.example` (NEXT_PUBLIC_API_URL, NextAuth, Supabase placeholders)
- [x] `next-env.d.ts`

### 2.2 App Router base
- [x] `src/app/layout.tsx` — Playfair Display + DM Sans via `next/font`, root HTML, providers placeholder
- [x] `src/app/page.tsx` — minimal landing page (hero with brand wordmark + stat cards)
- [x] `src/app/globals.css` — design tokens, scrollbar, selection, focus ring, fadeUp/shimmer keyframes

### 2.3 Folder structure (empty placeholders)
- [x] `src/components/{layout,film,diary,groups,recommendations,shared}/.gitkeep`
- [x] `src/lib/.gitkeep` (+ `lib/utils.ts` with `cn()` helper)
- [x] `src/hooks/.gitkeep`
- [x] `src/store/.gitkeep`
- [x] `src/types/.gitkeep`

### 2.4 Verify
- [x] File-structure sanity check (layout.tsx + page.tsx + globals.css + config files all present)
- [x] JSON parses (package.json, tsconfig.json); brace/paren balance OK across all .ts/.tsx
- [ ] `npm install && npm run build` — **deferred:** run on your machine. Node 22 + npm 10 needed.

---

## Phase 3 — Backend domain layer (entities + DTOs + controller skeletons)

> Service logic intentionally deferred — controllers throw `501 Not Implemented` until wired up in the next session. Flyway migrations also deferred (entities don't depend on them at compile time, but the app won't start without them).

### 3.1 Enums (`entity/enums/`)
- [x] `WatchMode { THEATRE, OTT, HOME }`
- [x] `OttPlatform { NETFLIX, PRIME, HOTSTAR, ZEE5, SONYLIV, MXPLAYER, OTHER }`
- [x] `Industry { BOLLYWOOD, TAMIL, TELUGU, MALAYALAM, KANNADA, MARATHI, OTHER }` (+ `fromTmdbLanguage()` helper)
- [x] `GroupRole { ADMIN, MEMBER }`
- [x] `RecommendationStatus { PENDING, SAVED, DISMISSED }`

### 3.2 Entities (`entity/`)
- [x] `BaseEntity` — `@MappedSuperclass`, UUID id (Hibernate `@UuidGenerator`), equals/hashCode
- [x] `User` — `users` table, audited (`created_at`, `updated_at`), nullable `password_hash` for OAuth-only accounts
- [x] `Film` — `films` table, genres as `List<String>` via `@JdbcTypeCode(SqlTypes.ARRAY)`
- [x] `WatchEntry` — `watch_entries`, rating `BigDecimal`, watchMode/ottPlatform as `@Enumerated(STRING)`
- [x] `WatchlistItem` — `watchlist_items`, moodTags as `List<String>`, `added_at` timestamp, unique (user, film)
- [x] `Group` — `groups` table (Java class name `Group`)
- [x] `GroupMember` — `group_members`, role as `@Enumerated(STRING)`, `joined_at`, unique (group, user)
- [x] `Follow` — `follows` table, unique (follower, following)
- [x] `Recommendation` — `recommendations`, status as `@Enumerated(STRING)`
- [x] `FilmList` — `lists` table (Java class name `FilmList` to avoid `java.util.List` clash)
- [x] `ListFilm` — `list_films` join entity, unique (list, film)

### 3.3 Request DTOs (`dto/request/`)
- [x] `RegisterRequest`, `LoginRequest`
- [x] `UpdateProfileRequest`
- [x] `LogFilmRequest`, `UpdateDiaryEntryRequest`
- [x] `AddToWatchlistRequest`, `UpdateMoodTagsRequest`, `MarkWatchedRequest`
- [x] `CreateGroupRequest`, `UpdateGroupRequest`, `InviteMemberRequest`
- [x] `RecommendFilmRequest` (with `@AssertTrue` cross-field check), `UpdateRecommendationStatusRequest`
- [x] `CreateListRequest`, `UpdateListRequest`, `AddFilmToListRequest`

### 3.4 Response DTOs (`dto/response/`)
- [x] `ErrorResponse` (done in Phase 1)
- [x] `AuthResponse`
- [x] `UserSummaryResponse`, `UserProfileResponse`
- [x] `FilmSummaryResponse`, `FilmResponse`
- [x] `DiaryEntryResponse`
- [x] `WatchlistItemResponse`
- [x] `GroupSummaryResponse`, `GroupResponse`, `GroupMemberResponse`, `GroupWatchlistItemResponse`
- [x] `RecommendationResponse`
- [x] `ListResponse`, `ListFilmResponse`
- [x] `PagedResponse<T>` (generic, with `from(Page)` + `from(Page, mapper)` factories)

### 3.5 Controller skeletons (`controller/`)
> Each method wired with the correct HTTP verb + path + request body type, but body throws `ResponseStatusException(NOT_IMPLEMENTED)` until services land.
- [x] `HealthController` (done in Phase 1)
- [x] `AuthController` — register, login, refresh, me
- [x] `FilmController` — search, byId, trending, industries (industries is real — returns enum values)
- [x] `UserController` — profile, patchMe, diary, watchlist, lists, follow/unfollow, followers, following
- [x] `DiaryController` — create, patch, delete, feed
- [x] `WatchlistController` — list, add, remove, markWatched, updateMoodTags
- [x] `GroupController` — my, create, get, patch, addMember, removeMember, merged watchlist, common, feed
- [x] `RecommendationController` — create, inbox, sent, updateStatus
- [x] `ListController` — my, public, create, get, patch, delete, addFilm, removeFilm

### 3.6 Verify
- [x] Brace / paren / package-decl sanity across all new Java files
- [x] All 62 internal imports resolve (every `import com.cinemadesi.*` points to an existing file)
- [x] Every top-level type name matches its file name

---

## Phase 4 — Backend data + service layer

> Everything needed to make the API actually work end-to-end (minus a real frontend). Indexes are added in lockstep with the repo methods that query by them.

### 4.1 Flyway migrations (`src/main/resources/db/migration/`)
- [x] `V1__init_users_and_films.sql` — verbatim from spec
- [x] `V2__watch_entries_and_watchlist.sql` — verbatim from spec
- [x] `V3__groups_and_follows.sql` — verbatim from spec
- [x] `V4__recommendations_and_lists.sql` — verbatim from spec
- [x] `V5__add_password_hash_and_indexes.sql` — `password_hash` column on users, composite `(user_id, created_at DESC)` on watch_entries, recommendations to/from/group indexes, lists user_id + partial public, list_films(list_id, sort_order), pg_trgm + GIN on films.title

### 4.2 Repositories (`repository/`)
- [x] `UserRepository` — findByEmail, findByUsername, findBySupabaseUid, existsBy*
- [x] `FilmRepository` — findByTmdbId, findByIndustry, JPQL ILIKE search (uses V5 pg_trgm GIN index)
- [x] `WatchEntryRepository` — by user (paged + ordered, `@EntityGraph` joins user+film), feed by user-IN, by film, group feed JPQL, reviews-for-film JPQL, countByUser
- [x] `WatchlistItemRepository` — by user (paged+ordered), by user+film, exists check, group merged-watchlist JPQL
- [x] `GroupRepository` — findGroupsByMemberId via member join
- [x] `GroupMemberRepository` — by group, by user, by group+user, role check, count
- [x] `FollowRepository` — pair check, counts, findFollowingIds for feed
- [x] `RecommendationRepository` — toUser, fromUser, toGroup (all ORDER BY createdAt DESC)
- [x] `FilmListRepository` — by user, public lists (partial index)
- [x] `ListFilmRepository` — by list ordered by sortOrder, deleteByListAndFilm

### 4.3 Security + helpers (`security/`, `config/`)
- [x] `UserPrincipal` (record)
- [x] `JwtUtil` — JJWT 0.12 API (HS256)
- [x] `JwtAuthFilter` extends `OncePerRequestFilter` — writes JSON 401 on bad token
- [x] Real `SecurityConfig` — JWT filter chain, permits `/auth/**`, `GET /films/**`, `/health`, `/api-docs`, `/swagger-ui`, CORS from `app.cors.allowed-origins`
- [x] `PasswordEncoder` bean — BCrypt strength 12 (in `SecurityConfig`)
- [x] `CurrentUserProvider` — pulls `UserPrincipal` from `SecurityContextHolder`, `require()` throws `UnauthorizedException`
- [x] `TMDBConfig` — qualified `RestClient` bean

### 4.4 Mappers (`mapper/`) — all `@Mapper(componentModel = "spring")`
- [x] `UserMapper` — toSummary + composed toProfile with stats
- [x] `FilmMapper` — toSummary / toResponse
- [x] `DiaryMapper` — WatchEntry → DiaryEntryResponse
- [x] `WatchlistMapper`
- [x] `GroupMapper` — toMember + composed toResponse / toSummary
- [x] `RecommendationMapper` — with custom Group → GroupSummary helper
- [x] `ListMapper` — toFilmResponse + composed toResponse

### 4.5 Services (`service/`) — all with `@Transactional`
- [x] `TMDBService` — search + get-by-id + trending via RestClient; degrades to empty results when API key is missing
- [x] `AuthService` — register, login, refresh, me (BCrypt + JWT)
- [x] `FilmService` — DB-first search, TMDB fallback + cache
- [x] `UserService` — profile, update, follow/unfollow, followers/following, isFollowedByMe
- [x] `DiaryService` — log (validates OTT platform when watchMode=OTT), update, delete (ownership-checked)
- [x] `FeedService` — home feed across followed users (empty page when following nobody)
- [x] `WatchlistService` — add (idempotent), remove, mark-watched (creates diary entry + deletes item atomically), mood tags
- [x] `GroupService` — create (creator auto-admin), update (admin-only), invite, remove (admin or self-leave), merged watchlist, common films (≥2 members), group feed
- [x] `RecommendationService` — send (validates group membership), inbox/sent, SAVED → idempotent watchlist item with `recommendedBy`
- [x] `ListService` — CRUD with visibility checks (private lists invisible to non-owners), add/remove films

### 4.6 Wire controllers
- [x] AuthController → AuthService
- [x] FilmController → FilmService
- [x] UserController → UserService + DiaryService + WatchlistService + ListService
- [x] DiaryController → DiaryService / FeedService
- [x] WatchlistController → WatchlistService
- [x] GroupController → GroupService
- [x] RecommendationController → RecommendationService
- [x] ListController → ListService

### 4.7 Verify
- [x] Brace/paren/imports sanity across all 94 new Java files
- [x] **Every repo query field has a matching index** — automated audit, all 35 repo methods green ✓

---

## Phase 4.5 — Gap closure

> Real gaps found in the end-of-Phase-4 review. All closed.

- [x] **Google OAuth endpoint** — `POST /api/v1/auth/oauth/google` accepts a Google ID token from NextAuth, verifies via Google's tokeninfo endpoint (audience, issuer, email_verified), find-or-creates the user, returns app JWT
  - V6 migration adds `users.google_id` column + unique index
  - `User.googleId` field, `UserRepository.findByGoogleId`
  - `GoogleAuthRequest` DTO
  - `GoogleTokenVerifier` security component
  - `AuthService.loginWithGoogle` with email→googleId linking + auto-username generation
  - `app.google.client-id` in application.yml
- [x] **OpenAPI bearerAuth scheme** (`config/OpenApiConfig.java`) — Swagger UI now shows the Authorize button; JWT persists across calls
- [x] **Scheduled TMDB trending refresh** (`service/TrendingRefreshJob.java`) — `@EnableScheduling` on main app, cron configurable via `app.tmdb.trending-refresh-cron`, zoned to Asia/Kolkata
- [x] **FilmService industry filter bug** — `FilmRepository.searchByTitleAndIndustry` filters at SQL level before pagination; `FilmService.search` now routes through `runSearch(query, industry, pageable)`

---

## Phase 6 — Frontend foundation (Next.js 16 + design system)

> Modernised stack beyond spec: Framer Motion (animations), Sonner (toasts — replaces react-hot-toast), next-themes, vaul (mobile drawers), cmdk (search palette), Radix primitives. Real API calls with graceful fallback.

### 6.1 Package + tooling
- [x] `package.json` updated: framer-motion, sonner, next-themes, vaul, cmdk, full Radix set, class-variance-authority, tailwindcss-animate
- [x] `tailwind.config.ts` extended: mesh-hero gradient, marquee/glow keyframes, container, animate plugin
- [x] `components.json` for shadcn CLI compatibility

### 6.2 Foundation
- [x] `types/index.ts` — every TS type mirrors a backend DTO
- [x] `lib/constants.ts` — INDUSTRY_COLORS, MOOD_TAGS, OTT_PLATFORMS, TMDB prefix
- [x] `lib/api.ts` — axios + JWT interceptor (NextAuth session), 401 → signOut, typed `api.*` resource map
- [x] `lib/auth.ts` — NextAuth v5: Credentials + Google; signIn callback exchanges Google ID token for app JWT
- [x] `app/api/auth/[...nextauth]/route.ts`
- [x] `store/authStore.ts` — Zustand cache for full UserProfile
- [x] `components/providers.tsx` — SessionProvider + QueryClient + ThemeProvider + Sonner Toaster + RQ devtools

### 6.3 shadcn primitives (`components/ui/`)
- [x] `button` (variants: default / gold / outline / ghost / destructive / link)
- [x] `input`, `label`, `card`, `badge`, `avatar`, `skeleton`
- [x] `dialog`, `sheet`, `tabs`, `dropdown-menu`, `tooltip`

### 6.4 Cinema design-system primitives (`components/film/`)
- [x] `IndustryBadge` — color-coded glowing dot + label
- [x] `StarRating` — interactive, half-star precision, gold glow on fill
- [x] `FilmPoster` — next/image with graceful fallback gradient
- [x] `FilmCard` — Framer Motion lift, gradient hover overlay, quick-add gold button, "new" sparkle, rating corner badge
- [x] `FilmGrid` — responsive 3/4/5/6 col with matching-shape skeletons

### 6.5 Layout (`components/layout/` + `components/shared/`)
- [x] `Logo` with pulsing gold "Desi" wordmark
- [x] `UserAvatar` with initials fallback
- [x] `EmptyState` — cinematic empty/error
- [x] `Navbar` — fixed glass-blur, animated layoutId pill on active route, search pill, auth-aware right side
- [x] `Sidebar` — desktop side rail with section icons + industry quick filters
- [x] `MobileNav` — bottom nav with gold drop-shadow on active

### 6.6 Landing page + root layout
- [x] `app/page.tsx` — mesh gradient hero with film-grain noise, animated underline reveal, stat strip, scrolling regional marquee, feature trio with hover glow, CTA strip, footer
- [x] `app/layout.tsx` — mounts Providers + Navbar + MobileNav, dark mode default, expanded SEO metadata

### 6.7 Verify
- [x] Brace/paren balance + imports across all 33 new files

---

## Phase 7 — Frontend pages (chunk 1: auth + home + discover)

### 7.1 Auth pages (`app/(auth)/`)
- [x] `(auth)/layout.tsx` — centered, mesh-gradient backdrop, logo at top, terms footer
- [x] `(auth)/login/page.tsx` — Credentials form + Google button, redirects to `?next=`, Sonner errors
- [x] `(auth)/register/page.tsx` — live username regex validation with check/x indicator, password length check; on submit calls backend register + auto signs in via Credentials

### 7.2 TanStack Query hooks (`hooks/`)
- [x] `useDebounce` — generic 300ms debouncer
- [x] `useAuth` — `useRequireAuth` redirect guard + `useCurrentUser` hydrates Zustand
- [x] `useFilms` — debounced search (min 2 chars), trending, film byId
- [x] `useFeed` — `useInfiniteQuery` for home feed
- [x] `useWatchlist` — list / add / remove / mark-watched + `useQuickAddToWatchlist`
- [x] `useDiary` — `useLogFilm` invalidates feed + watchlist + me

### 7.3 Core components
- [x] `FilmSearch` (cmdk command palette) — global `/` hotkey, debounced, keyboard navigable, poster thumbnails in results
- [x] `FeedItem` — diary entry with spoiler blur ("tap to reveal"), 3-line review collapse, quick "Save" button
- [x] `LogFilmModal` — date, half-star rating, watch-mode picker (Theatre / OTT / Home), OTT dropdown shown conditionally, spoiler toggle, 5000-char counter

### 7.4 Pages
- [x] `app/page.tsx` — **server component** branches on `auth()`: anonymous → `LandingHero`, signed-in → `AuthHomeFeed` (so anonymous users don't ship feed JS)
- [x] `components/landing/LandingHero.tsx` — extracted client landing
- [x] `components/home/AuthHomeFeed.tsx` — greeting hero with time-of-day, infinite feed (left), trending sidebar (right, lg+), empty states for no-follows / error
- [x] `app/discover/page.tsx` — industry tabs (gold underline via Framer `layoutId`), trending grid with quick-add, FilmSearch palette button

### 7.5 Verify
- [x] 48 frontend source files — all brace/paren/bracket balanced; all `@/` imports resolve

---

## Phase 7 — chunk 2 (rest of the pages)

### 7.6 Hooks
- [x] `useUser` — profile, diary (infinite), watchlist, lists, **optimistic follow/unfollow**
- [x] `useGroups` — my, byId, mergedWatchlist, commonFilms, infinite feed, create, invite, removeMember
- [x] `useRecommendations` — inbox, sent, send, updateStatus (SAVED also invalidates watchlist)

### 7.7 Modals
- [x] `RecommendModal` — friend (by username) or group target toggle, optional note (200 char counter)
- [x] `CreateGroupModal` — name + description, redirects to new group on success

### 7.8 Cards + utility components
- [x] `FollowButton` — optimistic follow/unfollow with loading spinner
- [x] `WatchlistCard` — mood-tag pills, "rec by" attribution, mark-watched (opens LogFilmModal), remove
- [x] `GroupCard` — cover or mesh gradient, stacked member avatars, member count
- [x] `RecommendationCard` — Inbox actions (Add to watchlist / Dismiss) or Sent status pill
- [x] `CommonFilmFinder` — **"Decide for me"** with weighted-random shuffle spin (cycle accelerates then settles)

### 7.9 Pages
- [x] `/film/[id]` — full-bleed backdrop hero, poster with heavy shadow, log/save/recommend actions, community reviews placeholder
- [x] `/profile/[username]` — cover gradient, avatar ring, stats row, Diary/Watchlist/Lists tabs, FollowButton (or "Edit profile" if me)
- [x] `/watchlist` — mood-tag filter chips with per-tag counts, grid of WatchlistCards
- [x] `/groups` — grid of GroupCards, "New group" CTA → CreateGroupModal
- [x] `/groups/[groupId]` — header with stacked member avatars, **Tabs: Common / Watchlist / Feed / Members**
- [x] `/recommendations` — Inbox / Sent tabs, pending count badge on Inbox

### 7.10 SEO metadata
- [x] `app/film/[id]/layout.tsx` — server `generateMetadata` fetches the film, sets OG image + description (5-min revalidate)
- [x] `app/profile/[username]/layout.tsx` — server `generateMetadata` for profiles (2-min revalidate)

### 7.11 Verify
- [x] 66 frontend source files — brace/paren/bracket balanced; all `@/` imports resolve

---

## Phase 7 — chunk 3 (gap closure)

### 7.12 Lists surface
- [x] `hooks/useLists.ts` — my, byId, infinite public, create, update, delete, addFilm, removeFilm
- [x] `components/lists/ListModal.tsx` — handles both create + edit (with `list` prop), public/private visibility toggle
- [x] `components/lists/ListCard.tsx` — 4-poster collage preview, owner attribution, public/private badge
- [x] `app/lists/page.tsx` — Tabs: My lists / Browse public
- [x] `app/lists/[listId]/page.tsx` — full detail with film grid, edit/delete (owner), per-film remove

### 7.13 Profile editing + Settings
- [x] `hooks/useUser.useUpdateMe` — patch profile, updates `me` + per-username caches
- [x] `components/profile/EditProfileModal.tsx` — display name, avatar URL, bio (500-char counter)
- [x] Wire "Edit profile" button on `/profile/[username]` (only when `isMe`)
- [x] `app/settings/page.tsx` — Profile / Notifications / Security / Danger sections + Sign out

### 7.14 Infinite scroll
- [x] `hooks/useIntersection.ts` — IntersectionObserver-based sentinel
- [x] Wired into `AuthHomeFeed` (home feed), `/profile/[username]` (diary tab), `/groups/[groupId]` (feed tab)

### 7.15 Verify
- [x] 74 frontend source files — brace/paren/bracket balanced; all `@/` imports resolve

---

## Phase 5 — Wrap-up

- [x] All items above ticked (except tests, intentionally deferred)
- [x] Top-level `README.md` — quick-start commands, env vars, architecture cheat sheet, build-phase table

---

## Phase 8 — Gap-fill (7 "real gaps" closed)

> Filled the backend-ready-but-UI-missing items, plus the three that needed small backend additions (community reviews endpoint, user search, password reset).

### 8.1 Backend additions
- [x] **V7 migration** — `password_resets` table + pg_trgm GIN indexes on `users(username)` and partial GIN on `users(display_name)`
- [x] `PasswordResetToken` entity + repo (lookup by SHA-256 hash via V7 UNIQUE)
- [x] `UserRepository.searchByUsernameOrDisplayName` — ILIKE backed by V7 trigram indexes
- [x] `UserService.search` + `GET /api/v1/users/search?q=&limit=` (typeahead, max 20)
- [x] `FilmService.communityReviews` + `GET /api/v1/films/:id/reviews` (uses V2 `idx_watch_entries_film_id`)
- [x] `AuthService.forgotPassword` (always-200 anti-enumeration; logs `[PASSWORD RESET]` URL for dev) + `resetPassword`
- [x] `POST /auth/forgot-password` + `POST /auth/reset-password` (covered by existing `/auth/**` permitAll rule)
- [x] `app.frontend.base-url` env var for the reset-URL builder
- [x] Frontend `api.ts` updated with the three new endpoints

### 8.2 UserTypeahead
- [x] `hooks/useUserSearch` — debounced (250ms)
- [x] `components/shared/UserTypeahead.tsx` — keyboard-navigable, chip on select, `excludeIds` prop

### 8.3 UI gaps 1–7 (filled)
- [x] **#1 Invite member to group** — `InviteMemberModal` opens from Members tab (admin only). Self-leave button for non-admin members. Admin can remove other members from the member list.
- [x] **#2 Add film to a list** — `AddToListModal` with single-select picker + inline "Create new list". Wired to film detail page.
- [x] **#3 Edit / delete diary entry** — `LogFilmModal` refactored to dual-mode (`entry` prop). FeedItem now shows a dropdown menu (Edit / Delete) on own entries via hover.
- [x] **#4 Edit mood tags** — `MoodTagsModal` on WatchlistCard. Click the tag row (or "add mood tags" hint when empty).
- [x] **#5 Community reviews** — `CommunityReviews` component (infinite scroll, spoiler blur, 4-line collapse) replaces the placeholder on `/film/[id]`.
- [x] **#6 Forgot password** — `/forgot-password` + `/reset-password?token=…` pages with always-200 anti-enumeration success state. Reset link logged to backend console until an email provider is wired.
- [x] **#7 User search** — `UserTypeahead` backs RecommendModal (replaces the plain username input) and the new InviteMemberModal.

### 8.4 Verify
- [x] 102 Java + 83 TS/TSX files — all brace/paren/imports clean
- [x] Every new repo query field has a backing index (V7 trigram + UNIQUE; V2 film_id idx covers reviews)

---

## Project totals (final)

- **102** Java files (backend)
- **83** TypeScript/TSX files (frontend)
- **7** Flyway migrations
- **192** source files total — all structurally validated
