package com.cinemadesi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled TMDB trending refresh — keeps the local film cache warm so
 * {@code GET /api/v1/films/trending} doesn't depend on a fresh TMDB call
 * to feel snappy.
 *
 * <p>Cron is configurable via {@code app.tmdb.trending-refresh-cron}
 * (defaults to {@code 0 0 4 * * *} — 04:00 daily, IST in dev).</p>
 *
 * <p>Schedule is in IST so the job runs during India's overnight,
 * matching when TMDB's "week" trending list gets refreshed for our
 * users' tomorrow morning.</p>
 */
@Component
public class TrendingRefreshJob {

    private static final Logger log = LoggerFactory.getLogger(TrendingRefreshJob.class);

    private final FilmService films;

    public TrendingRefreshJob(FilmService films) {
        this.films = films;
    }

    @Scheduled(
            cron = "${app.tmdb.trending-refresh-cron:0 0 4 * * *}",
            zone = "Asia/Kolkata"
    )
    public void refresh() {
        long start = System.currentTimeMillis();
        try {
            int newlyCached = films.cacheTrending();
            log.info("Trending refresh complete — cached {} new films in {}ms",
                    newlyCached, System.currentTimeMillis() - start);
        } catch (Exception ex) {
            // Never let a scheduled job throw — Spring would retry on the
            // next tick anyway, but logging keeps Glassdoor green.
            log.error("Trending refresh failed", ex);
        }
    }
}
