# syntax=docker/dockerfile:1.7

# ─── 1. Builder stage ────────────────────────────────────────────────────
# Maven + JDK 21. Two-step copy means we cache dependencies separately
# from sources — re-running on a code-only change is sub-30s.
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Copy pom first so the dependency layer caches independently of code.
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests dependency:go-offline

COPY src ./src

RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests package && \
    cp target/*.jar app.jar


# ─── 2. Runtime stage ────────────────────────────────────────────────────
# Slim JRE 21. Runs as a non-root user. Has curl so the healthcheck works
# without bundling extra tools.
FROM eclipse-temurin:21-jre-jammy

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    useradd --system --create-home --shell /bin/false app

WORKDIR /app
COPY --from=builder --chown=app:app /build/app.jar /app/app.jar

USER app

EXPOSE 8080

# JVM tuned for small containers. -XX:MaxRAMPercentage lets the JVM
# automatically size the heap based on the container's memory limit.
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom"

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
