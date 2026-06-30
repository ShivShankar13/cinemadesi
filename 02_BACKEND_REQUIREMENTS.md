# CinemaDesi — Backend Requirements
### Spring Boot 3 · Java 21 · PostgreSQL (Supabase) · Spring Data JPA

> Hand this file to Claude Code to build the backend from scratch. Every requirement is self-contained and buildable in order.

---

## Tech Stack (locked)

| Layer | Tech |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.2+ |
| Web | Spring Web MVC |
| Security | Spring Security 6 + JJWT |
| ORM | Spring Data JPA + Hibernate 6 |
| DB Migrations | Flyway |
| Mapping | MapStruct |
| Boilerplate | Lombok |
| Validation | Jakarta Bean Validation (`@Valid`) |
| HTTP Client | Spring RestClient (Java 21 built-in) |
| Docs | SpringDoc OpenAPI 2 (Swagger UI) |
| Tests | JUnit 5 + Mockito + Testcontainers |
| Build | Maven |

---

## pom.xml Dependencies

```xml
<dependencies>
  <!-- Spring Boot starters -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
  </dependency>

  <!-- Database -->
  <dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
  </dependency>
  <dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
  </dependency>

  <!-- JWT -->
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
  </dependency>

  <!-- MapStruct + Lombok (order matters) -->
  <dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.5.5.Final</version>
  </dependency>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>

  <!-- SpringDoc OpenAPI -->
  <dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.5.0</version>
  </dependency>

  <!-- Testing -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

---

## application.yml

```yaml
spring:
  application:
    name: cinemadesi-api

  datasource:
    url: ${DATABASE_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 5       # keep low for free tier DB

  jpa:
    hibernate:
      ddl-auto: validate         # Flyway handles schema
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  flyway:
    enabled: true
    locations: classpath:db/migration

  threads:
    virtual:
      enabled: true              # Java 21 virtual threads

app:
  jwt:
    secret: ${JWT_SECRET}
    expiry-ms: 86400000
  tmdb:
    api-key: ${TMDB_API_KEY}
    base-url: https://api.themoviedb.org/3
  cors:
    allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000}

server:
  port: ${PORT:8080}

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui
```

---

## Module 1 — Project Bootstrap

**Task:** Set up the project skeleton.

1. Create Spring Boot 3.2+ project with all dependencies above
2. Create `CinemaDesiApplication.java` — enable virtual threads
3. Create `application.yml` and `application-dev.yml` with all config
4. Create `GlobalExceptionHandler.java` with handlers for:
   - `ResourceNotFoundException` → 404
   - `UnauthorizedException` → 401
   - `MethodArgumentNotValidException` → 400 with field errors
   - Generic `Exception` → 500
5. Create standard error response DTO:
```java
public record ErrorResponse(int status, String message, Map<String, String> errors, Instant timestamp) {}
```
6. Add health check endpoint at `GET /api/v1/health` returning `{ "status": "UP" }`

---

## Module 2 — Database Schema (Flyway)

**Task:** Create all Flyway migration files in `src/main/resources/db/migration/`

### V1__init_users_and_films.sql
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_uid VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE films (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tmdb_id INTEGER UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    original_title VARCHAR(500),
    language VARCHAR(10),
    industry VARCHAR(50),
    release_date DATE,
    poster_url TEXT,
    backdrop_url TEXT,
    overview TEXT,
    genres TEXT[],
    director VARCHAR(255),
    runtime_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_films_tmdb_id ON films(tmdb_id);
CREATE INDEX idx_films_industry ON films(industry);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

### V2__watch_entries_and_watchlist.sql
```sql
CREATE TABLE watch_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES films(id),
    watched_at DATE NOT NULL,
    rating DECIMAL(3,1) CHECK (rating >= 0.5 AND rating <= 5.0),
    review_text TEXT,
    watch_mode VARCHAR(20) CHECK (watch_mode IN ('THEATRE','OTT','HOME')),
    ott_platform VARCHAR(50),
    contains_spoilers BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES films(id),
    added_at TIMESTAMP DEFAULT NOW(),
    mood_tags TEXT[],
    recommended_by UUID REFERENCES users(id),
    UNIQUE(user_id, film_id)
);

CREATE INDEX idx_watch_entries_user_id ON watch_entries(user_id);
CREATE INDEX idx_watch_entries_film_id ON watch_entries(film_id);
CREATE INDEX idx_watchlist_user_id ON watchlist_items(user_id);
```

### V3__groups_and_follows.sql
```sql
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    cover_image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN','MEMBER')),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

### V4__recommendations_and_lists.sql
```sql
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID REFERENCES users(id),
    to_group_id UUID REFERENCES groups(id),
    film_id UUID NOT NULL REFERENCES films(id),
    note TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','SAVED','DISMISSED')),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT rec_target_check CHECK (to_user_id IS NOT NULL OR to_group_id IS NOT NULL)
);

CREATE TABLE lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE list_films (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    film_id UUID NOT NULL REFERENCES films(id),
    sort_order INTEGER DEFAULT 0,
    note TEXT,
    UNIQUE(list_id, film_id)
);
```

---

## Module 3 — JPA Entities

**Task:** Create all entities in `entity/` package. Use Lombok `@Data`/`@Builder`/`@NoArgsConstructor`/`@AllArgsConstructor`. Use UUID as primary key type. Use `@CreationTimestamp` / `@UpdateTimestamp`.

Entities to create (matching schema above):
- `User.java`
- `Film.java` — genres as `List<String>` with `@JdbcTypeCode(SqlTypes.ARRAY)`
- `WatchEntry.java` — rating as `BigDecimal`, watchMode/ottPlatform as `@Enumerated(STRING)`
- `WatchlistItem.java` — moodTags as `List<String>`
- `Group.java`
- `GroupMember.java` — role as `@Enumerated(STRING)`
- `Follow.java`
- `Recommendation.java` — status as `@Enumerated(STRING)`
- `FilmList.java`
- `ListFilm.java`

Create enums in `entity/enums/`:
- `WatchMode { THEATRE, OTT, HOME }`
- `OttPlatform { NETFLIX, PRIME, HOTSTAR, ZEE5, SONYLIV, MXPLAYER, OTHER }`
- `Industry { BOLLYWOOD, TAMIL, TELUGU, MALAYALAM, KANNADA, MARATHI, OTHER }`
- `GroupRole { ADMIN, MEMBER }`
- `RecommendationStatus { PENDING, SAVED, DISMISSED }`

---

## Module 4 — Security & JWT

**Task:** Full Spring Security 6 JWT setup.

### SecurityConfig.java
- Stateless session management
- Disable CSRF (REST API)
- Permit: `POST /api/v1/auth/**`, `GET /api/v1/films/**`, `GET /api/v1/health`
- All other routes require authenticated JWT
- Add `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`
- Configure CORS from `app.cors.allowed-origins`

### JwtUtil.java
```java
// Methods to implement:
String generateToken(UUID userId, String email);
Claims extractAllClaims(String token);
UUID extractUserId(String token);
boolean isTokenValid(String token);
```

### JwtAuthFilter.java
- Extends `OncePerRequestFilter`
- Extract `Authorization: Bearer <token>` header
- Validate token with `JwtUtil`
- Set `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`
- On failure: return 401 JSON (not redirect)

### UserPrincipal.java
```java
// Wraps authenticated user info
public record UserPrincipal(UUID userId, String email) {}
```

---

## Module 5 — Auth Module

### Endpoints
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/auth/me        (authenticated)
```

### DTOs

**RegisterRequest:**
```java
@NotBlank String email;
@NotBlank @Size(min=8) String password;
@NotBlank @Pattern(regexp="^[a-z0-9_]{3,30}$") String username;
String displayName;
```

**LoginRequest:**
```java
@NotBlank String email;
@NotBlank String password;
```

**AuthResponse:**
```java
String accessToken;
String tokenType;  // "Bearer"
UserProfileResponse user;
```

### AuthService logic
- Register: validate unique email+username → hash password with BCrypt → save user → generate JWT → return AuthResponse
- Login: find user by email → verify BCrypt → generate JWT → return AuthResponse
- Me: load user from SecurityContext userId → return UserProfileResponse

---

## Module 6 — Film Module

### TMDBService.java

Wrap Spring `RestClient` to call TMDB API:

```java
// Methods:
TMDBFilmDto searchFilms(String query, String language, int page);
TMDBFilmDto getFilmById(int tmdbId);
List<TMDBFilmDto> getTrending(String timeWindow);  // "day" or "week"
```

Map TMDB response to internal `Film` entity. Store in DB on first fetch.

**TMDB search endpoint:** `GET /search/movie?query={q}&language=hi-IN&page={page}&api_key={key}`
**TMDB trending:** `GET /trending/movie/week?api_key={key}`

Detect `industry` from TMDB `original_language`:
- `hi` → BOLLYWOOD
- `ta` → TAMIL
- `te` → TELUGU
- `ml` → MALAYALAM
- `kn` → KANNADA
- `mr` → MARATHI
- else → OTHER

### FilmController endpoints
```
GET /api/v1/films/search?q=&language=&industry=&page=0&size=20
GET /api/v1/films/:id
GET /api/v1/films/trending?industry=TAMIL
GET /api/v1/films/industries
```

### FilmService logic
- `searchFilms`: check local DB first (by title ILIKE) → if < 5 results, supplement with TMDB call → cache new films → return merged results
- `getFilmById`: check local DB → if not found, fetch from TMDB by tmdbId, save, return

---

## Module 7 — User & Follow Module

### UserController endpoints
```
GET    /api/v1/users/:username
PATCH  /api/v1/users/me
GET    /api/v1/users/:username/diary?page=0&size=20
GET    /api/v1/users/:username/watchlist
GET    /api/v1/users/:username/lists
POST   /api/v1/users/follow/:userId
DELETE /api/v1/users/follow/:userId
GET    /api/v1/users/:username/followers
GET    /api/v1/users/:username/following
```

### UserProfileResponse DTO
```java
UUID id;
String username;
String displayName;
String avatarUrl;
String bio;
int totalFilmsWatched;
int totalFollowers;
int totalFollowing;
boolean isFollowedByMe;  // only when authenticated caller
```

### UpdateProfileRequest DTO
```java
String displayName;
String bio;
String avatarUrl;
```

---

## Module 8 — Diary Module

### DiaryController endpoints
```
POST   /api/v1/diary
PATCH  /api/v1/diary/:entryId
DELETE /api/v1/diary/:entryId
GET    /api/v1/diary/feed?page=0&size=20
```

### LogFilmRequest DTO
```java
@NotNull UUID filmId;
@NotNull LocalDate watchedAt;
BigDecimal rating;            // 0.5 to 5.0, optional
String reviewText;            // optional
WatchMode watchMode;          // optional
OttPlatform ottPlatform;      // optional, required if watchMode=OTT
Boolean containsSpoilers;     // default false
```

### DiaryEntryResponse DTO
```java
UUID id;
FilmSummaryResponse film;
LocalDate watchedAt;
BigDecimal rating;
String reviewText;
WatchMode watchMode;
OttPlatform ottPlatform;
Boolean containsSpoilers;
UserSummaryResponse user;
Instant createdAt;
```

### Feed logic
- `GET /diary/feed` → fetch watch entries from users the caller follows, ordered by `created_at DESC`, paginated

---

## Module 9 — Watchlist Module

### WatchlistController endpoints
```
GET    /api/v1/watchlist
POST   /api/v1/watchlist
DELETE /api/v1/watchlist/:itemId
PATCH  /api/v1/watchlist/:itemId/watched
PATCH  /api/v1/watchlist/:itemId/mood-tags
```

### AddToWatchlistRequest
```java
@NotNull UUID filmId;
List<String> moodTags;  // optional, e.g. ["THRILLER","INTENSE"]
```

### MarkWatchedRequest
```java
@NotNull LocalDate watchedAt;
BigDecimal rating;
String reviewText;
WatchMode watchMode;
OttPlatform ottPlatform;
```

### MarkWatched logic
1. Find watchlist item → verify belongs to caller
2. Create `WatchEntry` from the request
3. Delete the watchlist item
4. Return the new `DiaryEntryResponse`

---

## Module 10 — Groups Module

### GroupController endpoints
```
POST   /api/v1/groups
GET    /api/v1/groups/:groupId
PATCH  /api/v1/groups/:groupId           (ADMIN only)
POST   /api/v1/groups/:groupId/members   (invite by userId)
DELETE /api/v1/groups/:groupId/members/:userId  (ADMIN or self-leave)
GET    /api/v1/groups/:groupId/watchlist
GET    /api/v1/groups/:groupId/common
GET    /api/v1/groups/:groupId/feed?page=0&size=20
GET    /api/v1/groups/my                 (groups I am member of)
```

### Key queries

**Merged watchlist** (`GET /groups/:groupId/watchlist`):
Return all watchlist items of all group members, grouped by film, showing which members have it.

Response shape:
```java
List<GroupWatchlistItemResponse>
// each item:
UUID filmId;
FilmSummaryResponse film;
List<UserSummaryResponse> addedBy;  // which members have it
int memberCount;  // how many members added this film
```

**Common films** (`GET /groups/:groupId/common`):
Films that appear in 2 or more members' watchlists, sorted by memberCount DESC.
```sql
SELECT film_id, COUNT(DISTINCT user_id) as member_count
FROM watchlist_items
WHERE user_id IN (SELECT user_id FROM group_members WHERE group_id = :groupId)
GROUP BY film_id
HAVING COUNT(DISTINCT user_id) >= 2
ORDER BY member_count DESC;
```

**Group feed** (`GET /groups/:groupId/feed`):
Watch entries logged by any group member, ordered by `created_at DESC`.

---

## Module 11 — Recommendations Module

### RecommendationController endpoints
```
POST   /api/v1/recommendations
GET    /api/v1/recommendations/inbox
GET    /api/v1/recommendations/sent
PATCH  /api/v1/recommendations/:recId/status
```

### RecommendFilmRequest
```java
@NotNull UUID filmId;
UUID toUserId;      // one of these must be present
UUID toGroupId;     // one of these must be present
String note;        // optional personal message
```

Validation: exactly one of `toUserId` or `toGroupId` must be non-null.

### UpdateStatusRequest
```java
@NotNull RecommendationStatus status;  // SAVED or DISMISSED
```

### SAVED logic
When a recommendation is SAVED:
1. Update `recommendations.status = SAVED`
2. Create a `WatchlistItem` for the recipient (with `recommended_by` set to sender)

---

## Module 12 — Lists Module

### ListController endpoints
```
POST        /api/v1/lists
GET         /api/v1/lists/:listId
PATCH       /api/v1/lists/:listId
DELETE      /api/v1/lists/:listId
POST        /api/v1/lists/:listId/films
DELETE      /api/v1/lists/:listId/films/:filmId
GET         /api/v1/lists/public?page=0&size=20
GET         /api/v1/lists/my
```

### CreateListRequest
```java
@NotBlank String title;
String description;
boolean isPublic;
```

### AddFilmToListRequest
```java
@NotNull UUID filmId;
String note;
Integer sortOrder;
```

---

## Module 13 — Testing

### Unit Tests (JUnit 5 + Mockito)
Write unit tests for all service classes:
- `AuthServiceTest` — register duplicate email, login wrong password, successful login
- `FilmServiceTest` — search hits DB first, falls back to TMDB
- `GroupServiceTest` — common film finder query, permission checks (only members can view)
- `WatchlistServiceTest` — mark watched creates diary entry + removes watchlist item
- `RecommendationServiceTest` — save recommendation auto-adds to watchlist

### Integration Tests (Testcontainers)
- `AuthControllerIntegrationTest` — full register → login → /me flow
- `DiaryControllerIntegrationTest` — log film, get feed
- `GroupControllerIntegrationTest` — create group, add member, get common films

---

## Module 14 — SpringDoc / Swagger

Configure SpringDoc OpenAPI with:
- Title: "CinemaDesi API"
- Version: "1.0.0"
- Bearer auth scheme
- Group all controllers under proper tags
- Swagger UI available at `/swagger-ui` in dev only

---

## Important Implementation Notes

1. **All endpoints return consistent JSON** — never return raw strings
2. **Pagination** — use Spring Data `Pageable` and return `Page<T>` wrapped in a `PagedResponse<T>` DTO with `content`, `page`, `size`, `totalElements`, `totalPages`
3. **UUID everywhere** — never expose sequential integer IDs in responses
4. **Authorization checks** — always verify the authenticated user owns the resource before update/delete. Throw `UnauthorizedException` if not.
5. **TMDB images** — prefix poster paths with `https://image.tmdb.org/t/p/w500`
6. **No N+1 queries** — use `@EntityGraph` or JPQL JOIN FETCH for association loading
7. **Soft deletes** — not required for MVP, hard delete is fine
8. **Passwords** — BCrypt with strength 12, never log or return passwords
