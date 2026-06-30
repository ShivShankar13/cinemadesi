# CinemaDesi

> Indian cinema social platform — Letterboxd × Reddit × WhatsApp Groups for Bollywood, South, and OTT culture.

A film diary for Indian audiences. Log films, rate and review, build watch groups with friends, push recommendations, and discover regional cinema across Bollywood / Tamil / Telugu / Malayalam / Kannada / Marathi.

This repo holds two apps:

```
backend/cinemadesi-api    Spring Boot 3.5 · Java 21 · Postgres
frontend/cinemadesi-web   Next.js 16 · React 19 · TypeScript · Tailwind · shadcn/ui
```

See `SETUP_CHECKLIST.md` for the build journal and what's done at each phase.

---

## Quick start

### 1. Backend

Prerequisites: Java 21, Maven 3.9+, Postgres 15+.

```bash
cd backend/cinemadesi-api

# Required env (use a .env loader or export inline)
export DATABASE_URL=jdbc:postgresql://localhost:5432/cinemadesi
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET="$(openssl rand -base64 32)"   # must be >=32 bytes

# Optional — feature-gated
export TMDB_API_KEY=...                          # film search/trending
export GOOGLE_CLIENT_ID=...                      # OAuth audience check
export CORS_ALLOWED_ORIGINS=http://localhost:3000

mvn spring-boot:run
```

API listens on `http://localhost:8080`.

- Health check: `GET /api/v1/health`
- Swagger UI:   `http://localhost:8080/swagger-ui`
- OpenAPI doc:  `http://localhost:8080/api-docs`

Flyway runs all six migrations (V1–V6) on first startup.

### 2. Frontend

Prerequisites: Node 20+.

```bash
cd frontend/cinemadesi-web

cp .env.local.example .env.local
# Fill in:
#   NEXT_PUBLIC_API_URL=http://localhost:8080
#   NEXTAUTH_SECRET=...      # openssl rand -base64 32
#   NEXTAUTH_URL=http://localhost:3000
#   GOOGLE_CLIENT_ID=...     # optional
#   GOOGLE_CLIENT_SECRET=... # optional

npm install
npm run dev
```

App runs on `http://localhost:3000`.

---

## Architecture cheat sheet

**Backend layers** (read in this order):

```
controller/  → service/  →  repository/  →  entity/
                ↑              ↑
            mapper/        Flyway migrations (db/migration/)
```

- `security/` — JWT util, filter, current-user provider, Google token verifier
- `config/` — SecurityConfig (real JWT chain), TMDBConfig (RestClient), OpenApiConfig (bearerAuth)
- `dto/request/` + `dto/response/` — Jakarta-validated records

**Frontend route map**:

```
/                       Auth-aware (landing for guests, feed for users)
/login, /register       Auth (Credentials + Google)
/discover               Industry tabs + trending + cmdk palette
/film/[id]              Backdrop hero, log/save/recommend
/profile/[username]     Tabs: Diary / Watchlist / Lists
/watchlist              Mood-tag filters
/groups, /groups/[id]   Common-film finder ("Decide for me")
/recommendations        Inbox / Sent tabs
/lists, /lists/[id]     My + Public, list detail with films
/settings               Account
```

State:
- TanStack Query for server state (cache, mutations, infinite scroll)
- Zustand for the current-user mirror
- NextAuth v5 for sessions (JWT exchange via `POST /auth/oauth/google`)

---

## Build phases (what got built when)

See `SETUP_CHECKLIST.md` for the full list. Summary:

| Phase | Backend                                              | Frontend                                              |
|------:|------------------------------------------------------|-------------------------------------------------------|
| 1     | Skeleton, health, exception handler                  | Project init                                          |
| 2     | —                                                    | Tailwind theme, fonts, layout shell                   |
| 3     | Entities, enums, DTOs, controller skeletons          | —                                                     |
| 4     | Migrations, repos w/ indexes, services, JWT, MapStruct | —                                                   |
| 4.5   | Google OAuth, OpenAPI bearer, scheduled trending     | —                                                     |
| 6     | —                                                    | Foundation: API client, NextAuth, shadcn primitives, design system, layout, landing |
| 7.1   | —                                                    | Auth pages, hooks, FilmSearch, FeedItem, LogFilmModal, home, discover |
| 7.2   | —                                                    | Film detail, profile, watchlist, groups, recommendations, CommonFilmFinder |
| 7.3   | —                                                    | Lists, EditProfile, Settings, infinite scroll        |

Tests are intentionally not built (yet) per the original scope.

---

## What's not built

- Tests (JUnit + Mockito + Testcontainers; React Testing Library)
- Avatar upload (only URL paste for now — Cloudinary integration deferred)
- Account deletion (settings page surfaces this as "coming soon")
- Password change in security section
- Email digest for the recommendation inbox

---

## License

MIT.
