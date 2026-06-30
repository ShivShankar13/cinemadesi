# CinemaDesi — Frontend Requirements
### Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui

> Hand this file to Claude Code to build the frontend from scratch. Build pages and components in the order listed. Every section references the backend API from `02_BACKEND_REQUIREMENTS.md`.

---

## Tech Stack (locked)

| Tech | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | Framework — SSR, routing, image optimization |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Pre-built components (install as needed) |
| TanStack Query | v5 | Server state, caching, mutations |
| Zustand | latest | Client state (auth user, UI state) |
| NextAuth.js | v5 | Session — Google OAuth + Credentials |
| Axios | latest | API client |
| date-fns | latest | Date formatting |
| react-hot-toast | latest | Toast notifications |
| lucide-react | latest | Icons |
| next/image | built-in | Film poster images |

---

## Project Setup

### Install commands
```bash
npx create-next-app@latest cinemadesi-web --typescript --tailwind --eslint --app --src-dir
cd cinemadesi-web
npx shadcn-ui@latest init
npm install @tanstack/react-query axios zustand next-auth date-fns react-hot-toast lucide-react
npm install -D @types/node
```

### shadcn/ui components to install
```bash
npx shadcn-ui@latest add button input label card badge avatar dialog sheet tabs
npx shadcn-ui@latest add dropdown-menu skeleton toast command popover
```

---

## Design System & Visual Language

> The UI must feel like a **premium editorial cinema magazine** — dark, rich, cinematic. Think Letterboxd meets A24's website meets a luxury OTT platform. Every screen should feel like it was designed by a product designer, not auto-generated. This is a portfolio project — the UI is what recruiters and users will judge first.

---

### Aesthetic Direction

**Mood:** Dark luxury. Cinematic depth. Editorial confidence.
**Reference feel:** A24 website, Criterion Collection, Apple TV+ dark mode, Letterboxd but richer.
**NOT:** Generic SaaS dashboard, flat white cards, purple gradient on white, cookie-cutter Material UI.

---

### Color Palette

```js
// tailwind.config.ts — extend colors
colors: {
  brand: {
    // Backgrounds — layered depth
    bg:        '#080808',   // page background — near black
    surface:   '#101010',   // primary card surface
    surface2:  '#161616',   // elevated card, modals
    surface3:  '#1E1E1E',   // hover states, input bg

    // Borders
    border:    '#1F1F1F',   // default border
    borderHi:  '#2E2E2E',   // highlighted border, focus ring

    // Accents
    gold:      '#E8B84B',   // ratings, highlights, active states
    goldDim:   '#A07C28',   // dimmed gold for borders
    goldGlow:  'rgba(232,184,75,0.12)', // gold glow background

    red:       '#E8504B',   // primary CTA buttons
    redDim:    'rgba(232,80,75,0.15)',  // red tint bg

    // Text
    text:      '#F0ECE3',   // primary text — warm white, not pure white
    textMuted: '#7A7570',   // secondary text
    textDim:   '#3A3530',   // disabled / very muted

    // Industry colors
    bollywood: '#E8504B',   // red
    tamil:     '#F97316',   // orange
    telugu:    '#22C55E',   // green
    malayalam: '#3B82F6',   // blue
    kannada:   '#EAB308',   // yellow
    marathi:   '#A855F7',   // purple
  }
}
```

---

### Typography

```js
// app/layout.tsx — Google Fonts via next/font
import { Playfair_Display, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '600', '700', '900'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
})
```

**Usage rules:**
- `font-serif` (Playfair Display): page titles, film titles on detail pages, section headers, hero text, modal titles
- `font-sans` (DM Sans): all body text, labels, buttons, nav, reviews, metadata
- **Never** use system fonts, Inter, Roboto, or Arial
- Large display text: `font-serif font-black tracking-tight` — tight letter-spacing for impact
- Metadata/labels: `font-sans text-xs font-semibold tracking-widest uppercase text-brand-textMuted`

---

### Spacing & Layout

- Page max-width: `max-w-7xl mx-auto px-6 lg:px-10`
- Section spacing: `py-12` between major sections
- Card padding: `p-5` or `p-6` — generous internal padding
- Grid gaps: `gap-4` for dense grids, `gap-6` for card grids
- **No tight cramped layouts** — breathing room is luxury

---

### Component Design Rules

#### Cards
```
bg-brand-surface border border-brand-border rounded-xl
hover: border-brand-borderHi + subtle translateY(-2px) transition
```
- Rounded corners: `rounded-xl` (not `rounded-md`) for a softer premium feel
- No harsh box shadows — use `shadow-none` or extremely subtle `shadow-black/40`
- On hover: border brightens + slight lift. Never color-change the background.

#### Film Poster Cards
```
aspect-[2/3] rounded-lg overflow-hidden relative group cursor-pointer
```
- Hover: `scale-[1.03]` transition + dark gradient overlay slides up from bottom
- Overlay shows: title, year, rating (if logged), + quick actions (watchlist icon)
- Poster corners: `rounded-lg` — slightly more rounded than rectangular
- Missing poster fallback: dark gradient with film title centered in serif font

#### Buttons
```
// Primary CTA
bg-brand-red text-white font-semibold rounded-lg px-5 py-2.5
hover: bg-red-600 transition-colors

// Secondary
bg-brand-surface border border-brand-border text-brand-text rounded-lg px-5 py-2.5
hover: border-brand-borderHi bg-brand-surface2

// Ghost
text-brand-textMuted hover:text-brand-text transition-colors

// Gold accent (e.g. "Add to Watchlist" when hovered on poster)
bg-brand-goldGlow border border-brand-goldDim text-brand-gold rounded-lg
```
- All buttons: `transition-all duration-150`
- No gradients on buttons — flat colors, strong contrast
- Icon buttons: `w-9 h-9 rounded-lg flex items-center justify-center`

#### Inputs
```
bg-brand-surface3 border border-brand-border rounded-lg px-4 py-2.5
text-brand-text placeholder:text-brand-textMuted
focus: border-brand-gold outline-none ring-0
```
- Focus state: gold border, not blue
- No white backgrounds on inputs — always dark surface

#### Badges / Pills
```
// Industry badge
text-[11px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full

// General badge
text-xs font-medium px-2 py-0.5 rounded-md
```

---

### Motion & Animations

Add these to `globals.css` and use them throughout:

```css
/* Page entry */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fadeUp 0.4s ease forwards; }

/* Staggered children */
.stagger-1 { animation-delay: 0.05s; }
.stagger-2 { animation-delay: 0.10s; }
.stagger-3 { animation-delay: 0.15s; }
.stagger-4 { animation-delay: 0.20s; }

/* Shimmer skeleton */
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #161616 25%, #1E1E1E 50%, #161616 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Poster hover overlay */
.poster-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
}
```

**Rules:**
- Page load: sections animate in with `fadeUp` staggered — hero first, then content below
- Film grid: cards stagger in (delay 50ms each, max 6 cards)
- Modals: `scale-95 opacity-0` → `scale-100 opacity-100` with 200ms ease-out
- Poster hover overlay: slides up from bottom with `translateY(100%)` → `translateY(0)` on group-hover
- Star rating: stars fill with a left-to-right sweep on selection
- Toast notifications: slide in from bottom-right
- Tab switching: content fades in (no slide — too aggressive)

---

### Specific Page Visual Requirements

#### Navbar
```
fixed top-0 left-0 right-0 z-50
bg-brand-bg/80 backdrop-blur-xl border-b border-brand-border
height: h-16
```
- Logo: "CinemaDesi" in Playfair Display, brand-gold accent on "Desi"
- Subtle blur/glass effect — not solid black
- Search bar in center (desktop): `w-96` pill-shaped, opens command palette
- Right: notification bell with red dot badge, user avatar

#### Home Feed — Hero Area
- Large greeting: `"Good evening, [name]"` in Playfair Display
- Subtle radial gradient glow behind it (gold, very faint)
- "What did you watch today?" prompt with LogFilmModal trigger

#### Film Detail Page — Backdrop Treatment
```
// Full-width backdrop at top, 40vh height
// Heavy dark gradient overlay: transparent top → brand-bg bottom
// Film info floats over this area
// Poster has subtle drop shadow: shadow-[0_8px_40px_rgba(0,0,0,0.8)]
```

#### Discover Page
- Industry tabs as horizontal scroll on mobile, full row on desktop
- Active tab: gold underline + text-brand-gold (not background highlight)
- Section titles: `font-serif text-2xl font-bold` with a thin gold left border (`border-l-2 border-brand-gold pl-3`)

#### Group Common Film Finder
- Films shown in a spotlight-style layout — center film is large, others smaller
- "Decide for Me" button: `bg-brand-gold text-black font-bold` — stands out
- On click: spin/shuffle animation before landing on a film

#### Star Rating Component
- Stars are `⭐` emoji style but custom SVG — warm gold (#E8B84B) filled, dark (#2E2E2E) empty
- Half-star support: clip-path on fill
- On hover: stars light up one by one left to right
- Size variants: `sm` (12px), `md` (18px), `lg` (24px)

---

### Skeleton Loading States

Every loading state must match the exact layout shape:

```
// Film card skeleton
<div className="aspect-[2/3] rounded-lg skeleton" />
<div className="h-4 w-3/4 rounded skeleton mt-2" />
<div className="h-3 w-1/2 rounded skeleton mt-1" />

// Feed item skeleton
<div className="flex gap-3 p-4">
  <div className="w-10 h-10 rounded-full skeleton" />
  <div className="flex-1 space-y-2">
    <div className="h-4 w-1/3 rounded skeleton" />
    <div className="h-3 w-full rounded skeleton" />
    <div className="h-3 w-2/3 rounded skeleton" />
  </div>
</div>
```

---

### Global CSS additions (globals.css)

```css
/* Smooth scrolling */
html { scroll-behavior: smooth; }

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #080808; }
::-webkit-scrollbar-thumb { background: #2E2E2E; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #3E3E3E; }

/* Text selection */
::selection { background: rgba(232,184,75,0.25); color: #F0ECE3; }

/* Remove blue focus outlines — use gold instead */
*:focus-visible { outline: 2px solid #E8B84B; outline-offset: 2px; border-radius: 4px; }
```

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx                     ← root layout, fonts, providers
│   ├── globals.css
│   ├── (auth)/
│   │   ├── layout.tsx                 ← centered auth layout
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx                 ← main layout with Navbar + Sidebar
│   │   ├── page.tsx                   ← home feed (/)
│   │   ├── discover/
│   │   │   └── page.tsx
│   │   ├── film/
│   │   │   └── [id]/
│   │   │       └── page.tsx           ← film detail (SSR for SEO)
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       └── page.tsx
│   │   ├── watchlist/
│   │   │   └── page.tsx
│   │   ├── groups/
│   │   │   ├── page.tsx               ← my groups
│   │   │   └── [groupId]/
│   │   │       └── page.tsx           ← group detail
│   │   └── recommendations/
│   │       └── page.tsx               ← recommendation inbox
│   └── api/
│       └── auth/[...nextauth]/
│           └── route.ts
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   ├── film/
│   │   ├── FilmCard.tsx
│   │   ├── FilmGrid.tsx
│   │   ├── FilmPoster.tsx
│   │   ├── FilmSearch.tsx             ← command palette style
│   │   ├── LogFilmModal.tsx           ← log/rate/review dialog
│   │   ├── StarRating.tsx
│   │   └── IndustryBadge.tsx
│   ├── diary/
│   │   ├── DiaryEntry.tsx
│   │   └── FeedItem.tsx
│   ├── groups/
│   │   ├── GroupCard.tsx
│   │   ├── CreateGroupModal.tsx
│   │   ├── MemberWatchlist.tsx
│   │   └── CommonFilmFinder.tsx
│   ├── recommendations/
│   │   ├── RecommendModal.tsx
│   │   └── RecommendationCard.tsx
│   └── shared/
│       ├── UserAvatar.tsx
│       ├── PagedList.tsx              ← reusable paginated list
│       └── EmptyState.tsx
├── lib/
│   ├── api.ts                         ← axios instance + interceptors
│   ├── auth.ts                        ← NextAuth config
│   └── utils.ts                       ← cn(), formatDate(), etc.
├── hooks/
│   ├── useAuth.ts
│   ├── useFilms.ts
│   ├── useDiary.ts
│   ├── useWatchlist.ts
│   ├── useGroups.ts
│   └── useRecommendations.ts
├── store/
│   └── authStore.ts                   ← Zustand: current user
└── types/
    └── index.ts                       ← all shared TypeScript types
```

---

## Module 1 — Types & API Client

### types/index.ts
Define all TypeScript interfaces matching backend DTOs:

```typescript
export interface Film {
  id: string;
  tmdbId: number;
  title: string;
  originalTitle: string;
  language: string;
  industry: Industry;
  releaseDate: string;
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  genres: string[];
  director: string;
  runtimeMinutes: number;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  totalFilmsWatched: number;
  totalFollowers: number;
  totalFollowing: number;
  isFollowedByMe?: boolean;
}

export interface WatchEntry {
  id: string;
  film: FilmSummary;
  watchedAt: string;
  rating: number | null;
  reviewText: string | null;
  watchMode: WatchMode | null;
  ottPlatform: OttPlatform | null;
  containsSpoilers: boolean;
  user: UserSummary;
  createdAt: string;
}

export interface WatchlistItem {
  id: string;
  film: FilmSummary;
  addedAt: string;
  moodTags: string[];
  recommendedBy: UserSummary | null;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  createdBy: UserSummary;
  coverImageUrl: string | null;
  memberCount: number;
  members: UserSummary[];
  createdAt: string;
}

export interface GroupWatchlistItem {
  film: FilmSummary;
  addedBy: UserSummary[];
  memberCount: number;
}

export interface Recommendation {
  id: string;
  fromUser: UserSummary;
  film: FilmSummary;
  note: string | null;
  status: RecommendationStatus;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type Industry = 'BOLLYWOOD' | 'TAMIL' | 'TELUGU' | 'MALAYALAM' | 'KANNADA' | 'MARATHI' | 'OTHER';
export type WatchMode = 'THEATRE' | 'OTT' | 'HOME';
export type OttPlatform = 'NETFLIX' | 'PRIME' | 'HOTSTAR' | 'ZEE5' | 'SONYLIV' | 'MXPLAYER' | 'OTHER';
export type RecommendationStatus = 'PENDING' | 'SAVED' | 'DISMISSED';
```

### lib/api.ts
```typescript
// Axios instance with:
// - baseURL from NEXT_PUBLIC_API_URL
// - request interceptor: attach JWT from NextAuth session
// - response interceptor: on 401, sign out and redirect to /login
// Export typed helper functions for each resource:
// films, users, diary, watchlist, groups, recommendations, lists
```

---

## Module 2 — Auth

### lib/auth.ts (NextAuth config)
- **Credentials provider:** POST to `/api/v1/auth/login`, return user + JWT
- **Google provider:** POST result to `/api/v1/auth/oauth/google`, return user + JWT
- Store JWT in session token
- Session callback: attach `accessToken` and `user` to session

### Pages to build

**`(auth)/login/page.tsx`**
- Email + password form (shadcn Input, Button, Label)
- "Continue with Google" button (Google icon)
- Link to register
- On success: redirect to `/`
- Show error toast on failure

**`(auth)/register/page.tsx`**
- Email, password, username, display name fields
- Username: lowercase letters, numbers, underscore only — show live validation
- On success: auto-login and redirect to `/`

### store/authStore.ts (Zustand)
```typescript
interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
}
```

---

## Module 3 — Layout & Navigation

### `(main)/layout.tsx`
- Wrap with `QueryClientProvider` and session provider
- `Navbar` at top
- Main content area with optional `Sidebar`

### `components/layout/Navbar.tsx`
Contains:
- Logo "CinemaDesi" (serif font, brand-gold accent)
- `FilmSearch` component (command palette, opens on click or `/` shortcut)
- Nav links: Home, Discover, My Groups
- Notification bell icon (recommendations count badge)
- User avatar dropdown: Profile, Watchlist, Sign out

### `components/layout/Sidebar.tsx` (desktop only)
- Quick links: Home Feed, Discover, My Watchlist, My Groups, Recommendations Inbox
- Industry quick filters: Bollywood, Tamil, Telugu, Malayalam, Kannada

---

## Module 4 — Film Components

### `components/film/FilmCard.tsx`
Props: `film: FilmSummary, showIndustry?: boolean`

Design:
- Poster image (`aspect-[2/3]`, `rounded-md`, hover scale-105 with transition)
- On hover: overlay with quick-add-to-watchlist button (+ icon) and film title
- Below poster: title (truncated 1 line), industry badge, release year
- If user has watched: show their star rating as small overlay on poster corner

### `components/film/FilmGrid.tsx`
Props: `films: FilmSummary[], loading?: boolean`
- Responsive grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6`
- Show `FilmCard` skeletons when loading

### `components/film/LogFilmModal.tsx`
Triggered from FilmCard or FilmDetail. Dialog with:
- Film poster + title at top
- Date picker (watched on)
- Star rating selector (0.5–5 stars, interactive, brand-gold)
- Review textarea (optional)
- Watch mode selector: Theatre 🎬 / OTT 📺 / Home 🏠
- OTT platform dropdown (shown only if OTT selected)
- Spoiler toggle
- Submit → `POST /api/v1/diary` → toast success → invalidate feed query

### `components/film/StarRating.tsx`
Props: `value: number, onChange?: (v: number) => void, size?: 'sm'|'md'|'lg'`
- Interactive when `onChange` provided, display-only otherwise
- Support half-stars
- Gold filled / grey empty stars

### `components/film/IndustryBadge.tsx`
Colored badge per industry:
- BOLLYWOOD → red/pink
- TAMIL → orange
- TELUGU → emerald
- MALAYALAM → blue
- KANNADA → yellow
- MARATHI → purple

---

## Module 5 — Home Feed Page (`/`)

Server component wrapper → fetch first page of feed server-side for fast paint.

**Layout:**
- Left: activity feed (diary entries from people you follow)
- Right: "Trending this week" sidebar (3–5 films by industry)

**Feed items** (`components/diary/FeedItem.tsx`):
Each item shows:
- User avatar + username + "watched" + time ago
- Film poster (small, 60px wide) + title
- Star rating (if given)
- Review excerpt (max 3 lines, "Read more" expands)
- Spoiler warning blur if `containsSpoilers: true`
- Quick action: "Add to Watchlist" button

**Empty state** (not following anyone yet):
- Illustration + "Follow some film lovers to see their activity"
- "Discover users" CTA + "Explore films" CTA

---

## Module 6 — Discover Page (`/discover`)

**Sections:**
1. Search bar (large, prominent) — powered by `FilmSearch`
2. Industry filter tabs: All · Bollywood · Tamil · Telugu · Malayalam · Kannada · Marathi
3. "Trending this week" grid (12 films, filtered by selected industry)
4. "Recently added to watchlists" section

**FilmSearch (command palette):**
- Open on search bar click or global `/` shortcut
- Debounced input → `GET /api/v1/films/search?q=`
- Show film poster thumbnail, title, year, industry badge in results
- On select: navigate to `/film/:id`
- Keyboard navigable (arrow keys + Enter)

---

## Module 7 — Film Detail Page (`/film/[id]`)

**Server Component** — fetch film data server-side for SEO.

**Layout:**
- Backdrop image at top (blurred, dark overlay)
- Poster + film info side by side
- Film info: title, original title, industry badge, language, release year, genres, director, runtime, overview

**User actions bar** (client component inside):
- "Log this film" button → opens `LogFilmModal`
- "Add to Watchlist" button → `POST /api/v1/watchlist`
- "Recommend to friend/group" button → opens `RecommendModal`
- If already logged: show user's rating + "Edit log"

**Community reviews section:**
- List of public `WatchEntry` items for this film
- Each shows: user avatar, username, rating stars, review text, date watched
- Spoiler reviews hidden behind "Show spoiler review" toggle
- Pagination

---

## Module 8 — Profile Page (`/profile/[username]`)

**Tabs:** Diary · Watchlist · Lists

**Header:**
- Cover area (dark gradient)
- Avatar, display name, username, bio
- Stats row: X films · X followers · X following
- Follow / Unfollow button (if not own profile)

**Diary tab:**
- Paginated list of `WatchEntry` items
- Filter: All / Reviewed only / By rating

**Watchlist tab:**
- Grid of film posters
- Each has "Mark as watched" quick action

**Lists tab:**
- Cards showing user's public lists with film count

---

## Module 9 — Watchlist Page (`/watchlist`)

**Authenticated only.**

**Layout:**
- Filter bar: All · By mood tag · By OTT platform
- Film grid with watchlist cards

**WatchlistCard:**
- Film poster + title
- Mood tags (colored pills)
- "Recommended by [name]" label if applicable
- "Mark as Watched" button → opens quick-log dialog (date + optional rating)
- Remove from watchlist (×) icon

**Mood tag filter:**
Chips at top: All · Feel Good · Cry It Out · Laugh · Thriller · Intense · Light

---

## Module 10 — Groups Pages

### My Groups (`/groups`)
- "Create Group" button → opens `CreateGroupModal`
- Grid of `GroupCard` components
- Empty state: "No groups yet. Create one and invite your friends."

### `GroupCard`
- Cover image or gradient placeholder
- Group name, member count, member avatars (stacked, max 4)
- "X films in common" badge

### `CreateGroupModal`
- Name field, description field
- Submit → `POST /api/v1/groups` → redirect to new group page

### Group Detail (`/groups/[groupId]`)

**Tabs:** Feed · Watchlist · Common Films · Members

**Feed tab:**
- Activity feed of all members' recent diary entries
- Same FeedItem component as home feed

**Watchlist tab (`MemberWatchlist`):**
- Shows all films across all members' watchlists
- Each film shows which members have it (avatar stack)
- Sort: Most wanted (by member count) / Recently added

**Common Films tab (`CommonFilmFinder`):**
- Films on 2+ members' watchlists
- Highlighted with "X/Y members want to watch"
- "Decide for me" button → randomly picks one film from the list with a fun animation
- Each film has "Let's watch this" button → opens a group poll (Phase 2)

**Members tab:**
- List of members with their avatar, username, films watched count
- Admin can remove members
- "Invite member" → search for user by username

---

## Module 11 — Recommendations Page (`/recommendations`)

**Tabs:** Inbox · Sent

**Inbox tab:**
- List of `RecommendationCard` components
- Each shows: sender avatar + name, film poster + title, note, time ago
- Actions: "Add to Watchlist" (→ SAVED) · "Dismiss" (→ DISMISSED)
- Badge count on navbar bell icon = count of PENDING recommendations

**Sent tab:**
- Films you've recommended, with status pill (Pending / Saved / Dismissed)

### `RecommendModal`
Triggered from film pages/cards:
- Film shown at top
- Toggle: "Friend" or "Group"
- Friend: username search + select
- Group: dropdown of user's groups
- Optional note textarea (max 200 chars)
- Submit → `POST /api/v1/recommendations` → toast "Recommendation sent!"

---

## Module 12 — TanStack Query Hooks

Create custom hooks in `hooks/` for each resource. Example pattern:

```typescript
// hooks/useWatchlist.ts
export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.watchlist.getAll(),
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.watchlist.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Added to watchlist');
    },
  });
}
```

Hooks to create:
- `useFilmSearch(query)` — debounced 300ms
- `useFeed(page)` — paginated home feed
- `useWatchlist()` + `useAddToWatchlist()` + `useMarkWatched()`
- `useGroups()` + `useGroup(id)` + `useGroupWatchlist(id)` + `useCommonFilms(id)`
- `useRecommendations()` + `useSendRecommendation()` + `useUpdateRecommendationStatus()`
- `useDiary(username)` + `useLogFilm()`
- `useUserProfile(username)` + `useFollow(userId)`

---

## Module 13 — SEO & Metadata

Film detail pages must have proper metadata for search indexing:

```typescript
// app/(main)/film/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const film = await getFilm(params.id);
  return {
    title: `${film.title} (${film.releaseDate.substring(0,4)}) — CinemaDesi`,
    description: film.overview.substring(0, 160),
    openGraph: {
      images: [film.posterUrl],
      type: 'website',
    },
  };
}
```

Also add metadata for: home page, discover page, profile pages.

---

## Module 14 — Error & Loading States

Every page and component must handle:
- **Loading:** Use shadcn `Skeleton` components matching the layout shape
- **Error:** Show `EmptyState` component with message and retry button
- **Empty:** Show `EmptyState` with contextual message and CTA

### `EmptyState` component
Props: `icon: LucideIcon, title: string, description: string, action?: { label: string, href?: string, onClick?: () => void }`

---

## Implementation Notes

1. **Never use `<img>` tags** — always use `next/image` with `fill` or explicit dimensions for film posters
2. **Film posters** — prefix TMDB paths with `https://image.tmdb.org/t/p/w500`
3. **All mutations** — show loading spinner on button, disable during request, toast on success/error
4. **Auth guard** — create `useRequireAuth()` hook that redirects to `/login` if no session. Apply to all `(main)` pages that need auth
5. **Optimistic updates** — use TanStack Query `onMutate` for watchlist add/remove for instant UI feedback
6. **Infinite scroll** — use `useInfiniteQuery` for feed and diary pages instead of pagination buttons
7. **Mobile responsive** — design mobile-first. Film grid collapses to 3 columns on mobile. Sidebar hidden on mobile (bottom nav instead)
8. **Accessibility** — all interactive elements must have `aria-label`. Dialog must trap focus. Images must have `alt` text.
