package com.cinemadesi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Lightweight health endpoint scoped to the public API path
 * ({@code /api/v1/health}) so it can be hit without auth and
 * sits alongside the rest of the v1 surface.
 *
 * <p>Distinct from Spring Boot Actuator's {@code /actuator/health},
 * which remains available for orchestrators / uptime checks.</p>
 */
@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
