package com.cinemadesi.controller;

import com.cinemadesi.dto.request.RecommendFilmRequest;
import com.cinemadesi.dto.request.UpdateRecommendationStatusRequest;
import com.cinemadesi.dto.response.RecommendationResponse;
import com.cinemadesi.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

    private final RecommendationService recommendations;

    public RecommendationController(RecommendationService recommendations) {
        this.recommendations = recommendations;
    }

    @PostMapping
    public ResponseEntity<RecommendationResponse> create(@Valid @RequestBody RecommendFilmRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recommendations.send(request));
    }

    @GetMapping("/inbox")
    public List<RecommendationResponse> inbox() {
        return recommendations.inbox();
    }

    @GetMapping("/sent")
    public List<RecommendationResponse> sent() {
        return recommendations.sent();
    }

    @PatchMapping("/{recId}/status")
    public RecommendationResponse updateStatus(
            @PathVariable("recId") UUID recId,
            @Valid @RequestBody UpdateRecommendationStatusRequest request
    ) {
        return recommendations.updateStatus(recId, request);
    }
}
