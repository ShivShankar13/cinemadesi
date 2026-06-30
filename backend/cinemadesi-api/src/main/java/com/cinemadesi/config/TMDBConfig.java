package com.cinemadesi.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;

/**
 * RestClient bean for talking to TMDB.
 *
 * <p>TMDB supports two auth styles:
 * <ul>
 *   <li>v3 API key as a query param (legacy) — {@code ?api_key=...}</li>
 *   <li>v4 read-access token in the Authorization header — {@code Bearer ...}</li>
 * </ul>
 * We use the v3 key passed as a query param at call sites, which is simpler
 * and matches the spec.</p>
 */
@Configuration
public class TMDBConfig {

    @Bean
    @Qualifier("tmdbRestClient")
    public RestClient tmdbRestClient(
            @Value("${app.tmdb.base-url}") String baseUrl
    ) {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }
}
