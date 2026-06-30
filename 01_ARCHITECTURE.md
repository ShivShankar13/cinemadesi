# CinemaDesi — Architecture & Tech Stack

> Indian cinema social platform. Letterboxd × Reddit × WhatsApp Groups — built for Bollywood, South, and OTT culture.

---

## 1. Project Overview

**What it is:** A social film logging platform for Indian audiences — log films, rate and review, build watch groups with friends, discover regional cinema, and push recommendations to each other.

**Target users:** Indian film lovers aged 18–35, across Bollywood, Tamil, Telugu, Malayalam, Kannada, Marathi cinema and OTT platforms.

**Resume positioning:** Full-stack Next.js 14 + Java 21 + Spring Boot 3 + PostgreSQL (Supabase) project with real-time features, REST APIs, social graph, and external API integration (TMDB).

---

## 2. Tech Stack

### Frontend
| Tech | Version | Purpose |
|---|---|---|
| Next.js | 14 (App Router) | Framework — SSR, SSG, SEO, routing |
| React | 18 | UI library |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | latest | Component library |
| Zustand | latest | Client state management |
| TanStack Query | v5 | Server state, caching, mutations |
| NextAuth.js | v5 | Auth session management |

### Backend
| Tech | Version | Purpose |
|---|---|---|
| Java | 21 | Runtime (LTS, virtual threads) |
| Spring Boot | 3.x | Application framework |
| Spring Web MVC | 6.x | REST API layer |
| Spring Security | 6.x | Auth, JWT filter chain |
| Spring Data JPA | 3.x | ORM / repository layer |
| Hibernate | 6.x | JPA implementation |
| Flyway | latest | DB migrations |
| MapStruct | latest | Entity ↔ DTO mapping |
| Lombok | latest | Boilerplate reduction |
| JJWT | latest | JWT generation & validation |

### Database & Services
| Service | Purpose | Free Tier |
|---|---|---|
| Supabase (PostgreSQL) | Primary DB + Auth + Storage | 500MB DB, 1GB storage |
| Supabase Auth | Google OAuth + Email/Password | Included free |
| Supabase Realtime | Live group feeds | Included free |
| TMDB API | Film metadata (title, poster, cast) | Free, ~40 req/sec |
| Vercel | Frontend hosting | Free hobby plan |
| Railway / Render | Spring Boot API hosting | Free tier |
| Cloudinary (optional) | User avatar uploads | Free 25GB |

### Dev Tools
| Tool | Purpose |
|---|---|
| Maven | Build & dependency management |
| Docker + docker-compose | Local dev environment |
| Swagger / SpringDoc OpenAPI | API documentation |
| JUnit 5 + Mockito | Unit & integration tests |
| Testcontainers | DB integration testing |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│               Next.js 14 — Vercel (free)                     │
│     Pages: Home Feed, Discover, Film, Profile, Groups        │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTPS / REST + JSON
┌─────────────────────────▼────────────────────────────────────┐
│                       API LAYER                              │
│         Spring Boot 3 (Railway/Render — free tier)           │
│                                                              │
│   Controllers → Services → Repositories → DB                │
│   /api/v1/films  /users  /diary  /groups  /watchlist         │
│   /recommendations  /feed  /lists  /auth                     │
│                                                              │
│   Spring Security — JWT filter on every request              │
└──────┬──────────────────┬──────────────────┬─────────────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────────┐
│  Supabase   │  │  Supabase       │  │   TMDB API     │
│  PostgreSQL │  │  Auth + Storage │  │  (film data)   │
│  (JPA/HBN)  │  │  + Realtime     │  │                │
└─────────────┘  └─────────────────┘  └────────────────┘
```

---

## 4. Database Schema

```sql
-- Users (synced from Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Films (fetched from TMDB, cached locally)
CREATE TABLE films (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tmdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    language VARCHAR(10),
    industry VARCHAR(50), -- BOLLYWOOD, TAMIL, TELUGU, MALAYALAM, KANNADA, MARATHI, OTHER
    release_date DATE,
    poster_url TEXT,
    overview TEXT,
    genres TEXT[],
    director VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Watch Diary (core entity)
CREATE TABLE watch_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    film_id UUID REFERENCES films(id),
    watched_at DATE NOT NULL,
    rating DECIMAL(3,1) CHECK (rating >= 0.5 AND rating <= 5.0),
    review_text TEXT,
    watch_mode VARCHAR(20) CHECK (watch_mode IN ('THEATRE','OTT','HOME')),
    ott_platform VARCHAR(50), -- NETFLIX, PRIME, HOTSTAR, ZEE5, SONYLIV, MXPLAYER
    contains_spoilers BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Watchlist
CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    film_id UUID REFERENCES films(id),
    added_at TIMESTAMP DEFAULT NOW(),
    mood_tags TEXT[], -- ['CRY_IT_OUT','LAUGH','THRILLER','FEEL_GOOD']
    recommended_by UUID REFERENCES users(id) -- NULL if self-added
);

-- Groups
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    cover_image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Group Members
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('ADMIN','MEMBER')),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Recommendations (friend to friend or friend to group)
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id), -- NULL if to group
    to_group_id UUID REFERENCES groups(id), -- NULL if to user
    film_id UUID REFERENCES films(id),
    note TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','SAVED','DISMISSED')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- Lists
CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE list_films (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
    film_id UUID REFERENCES films(id),
    sort_order INTEGER,
    note TEXT
);
```

---

## 5. API Route Map

```
/api/v1
  /auth
    POST  /register
    POST  /login
    POST  /refresh
    GET   /me

  /films
    GET   /search?q=&language=&industry=&page=
    GET   /:id
    GET   /trending?industry=
    GET   /industries          ← list all industries

  /users
    GET   /:username
    PATCH /me
    GET   /:username/diary
    GET   /:username/watchlist
    GET   /:username/lists
    POST  /follow/:userId
    DELETE /follow/:userId
    GET   /:username/followers
    GET   /:username/following

  /diary
    POST   /                   ← log a film
    PATCH  /:entryId
    DELETE /:entryId
    GET    /feed               ← following feed

  /watchlist
    POST   /                   ← add film to watchlist
    DELETE /:itemId
    PATCH  /:itemId/watched    ← mark watched → creates diary entry
    GET    /
    PATCH  /:itemId/mood-tags

  /groups
    POST   /                         ← create group
    GET    /:groupId
    PATCH  /:groupId
    POST   /:groupId/members         ← invite member
    DELETE /:groupId/members/:userId ← remove member
    GET    /:groupId/watchlist       ← merged watchlists of all members
    GET    /:groupId/common          ← films on 2+ members' watchlists
    GET    /:groupId/feed            ← group activity feed

  /recommendations
    POST   /                   ← push film to friend or group
    GET    /inbox              ← recommendations received
    GET    /sent
    PATCH  /:recId/status      ← SAVED or DISMISSED

  /lists
    POST        /
    GET         /:listId
    PATCH       /:listId
    DELETE      /:listId
    POST        /:listId/films
    DELETE      /:listId/films/:filmId
    GET         /public        ← public lists browse
```

---

## 6. Spring Boot Project Structure

```
cinemadesi-api/
├── src/main/java/com/cinemadesi/
│   ├── CinemaDesiApplication.java
│   │
│   ├── config/
│   │   ├── SecurityConfig.java        ← JWT filter chain, CORS
│   │   ├── JwtConfig.java
│   │   └── TMDBConfig.java            ← TMDB RestClient bean
│   │
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── FilmController.java
│   │   ├── UserController.java
│   │   ├── DiaryController.java
│   │   ├── WatchlistController.java
│   │   ├── GroupController.java
│   │   ├── RecommendationController.java
│   │   └── ListController.java
│   │
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── FilmService.java
│   │   ├── TMDBService.java           ← TMDB API integration
│   │   ├── UserService.java
│   │   ├── DiaryService.java
│   │   ├── WatchlistService.java
│   │   ├── GroupService.java
│   │   ├── RecommendationService.java
│   │   └── FeedService.java
│   │
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── FilmRepository.java
│   │   ├── WatchEntryRepository.java
│   │   ├── WatchlistRepository.java
│   │   ├── GroupRepository.java
│   │   ├── GroupMemberRepository.java
│   │   ├── RecommendationRepository.java
│   │   ├── FollowRepository.java
│   │   └── ListRepository.java
│   │
│   ├── entity/
│   │   ├── User.java
│   │   ├── Film.java
│   │   ├── WatchEntry.java
│   │   ├── WatchlistItem.java
│   │   ├── Group.java
│   │   ├── GroupMember.java
│   │   ├── Recommendation.java
│   │   ├── Follow.java
│   │   └── FilmList.java
│   │
│   ├── dto/
│   │   ├── request/
│   │   │   ├── LogFilmRequest.java
│   │   │   ├── CreateGroupRequest.java
│   │   │   ├── RecommendFilmRequest.java
│   │   │   └── ...
│   │   └── response/
│   │       ├── FilmResponse.java
│   │       ├── UserProfileResponse.java
│   │       ├── GroupResponse.java
│   │       ├── DiaryEntryResponse.java
│   │       └── ...
│   │
│   ├── mapper/
│   │   ├── FilmMapper.java            ← MapStruct
│   │   ├── UserMapper.java
│   │   └── GroupMapper.java
│   │
│   ├── security/
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthFilter.java
│   │   └── UserPrincipal.java
│   │
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       ├── ResourceNotFoundException.java
│       └── UnauthorizedException.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── db/migration/               ← Flyway SQL migrations
│       ├── V1__init_schema.sql
│       ├── V2__add_groups.sql
│       └── V3__add_recommendations.sql
│
└── pom.xml
```

---

## 7. Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Backend (application-dev.yml)
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate        # Flyway handles schema, not Hibernate
    show-sql: true

app:
  jwt:
    secret: ${JWT_SECRET}
    expiry-ms: 86400000         # 24 hours
  tmdb:
    api-key: ${TMDB_API_KEY}
    base-url: https://api.themoviedb.org/3
```

---

## 8. Key Technical Decisions

### Java 21 Virtual Threads
Enable virtual threads in Spring Boot 3.2+ for significantly better throughput at no extra cost — important for free-tier hosting with limited resources.
```yaml
spring:
  threads:
    virtual:
      enabled: true
```

### JWT Auth Flow
1. User logs in via `/api/v1/auth/login` (email/password) or Google OAuth callback
2. Backend issues a JWT (signed with HS256)
3. Frontend stores JWT in httpOnly cookie
4. Every subsequent request passes JWT in `Authorization: Bearer <token>` header
5. `JwtAuthFilter` intercepts, validates, and sets `SecurityContext`

### TMDB Film Caching Strategy
- Never call TMDB on every user request — too slow and fragile
- On film search: check our DB first → if not found, call TMDB → save to DB → return
- Background job (Spring `@Scheduled`) refreshes trending films daily
- This means our DB grows organically as users search for films

### Flyway over Hibernate DDL
- `ddl-auto: validate` — Hibernate only validates, never auto-creates/drops
- All schema changes go through versioned Flyway SQL files
- Safer, trackable, production-grade practice — good for resume

---

## 9. Build Phases

### Phase 1 — Foundation (Weeks 1–3)
- Spring Boot project setup (Security, JPA, Flyway, MapStruct, Lombok)
- Supabase setup + initial DB schema migration
- JWT auth — Email/Password + Google OAuth
- TMDB service — search and cache films
- Watch diary — log, rate, review
- Watchlist — add, remove, mark watched
- Basic user profile

### Phase 2 — Social Layer (Weeks 4–6)
- Follow system + activity feed
- Watch Groups — create, invite, merged watchlist view
- Common Film Finder (group overlap query)
- Push recommendations to friends
- Recommendation inbox (accept/dismiss)

### Phase 3 — India Features (Weeks 7–8)
- Browse by industry/language (regional sections)
- OTT platform tagging on diary entries
- Spoiler rooms (flag + separate discussion)
- Indian language review support

### Phase 4 — Polish & Deploy (Weeks 9–10)
- Mood tags on watchlist
- Cinephile badges (milestone tracking)
- Release alerts (follow actors/directors)
- SpringDoc OpenAPI / Swagger UI
- Deploy frontend to Vercel, API to Railway

---

## 10. Free Tier Hosting Plan

| Service | Hosts | Free Limit |
|---|---|---|
| Vercel | Next.js frontend | Unlimited hobby deployments |
| Railway | Spring Boot JAR | $5 credit/month — enough for dev/demo |
| Supabase | PostgreSQL + Auth | 500MB DB, 2 projects free |
| TMDB | Film data API | Free, ~40 req/sec |

**Total monthly cost at MVP: ₹0**
