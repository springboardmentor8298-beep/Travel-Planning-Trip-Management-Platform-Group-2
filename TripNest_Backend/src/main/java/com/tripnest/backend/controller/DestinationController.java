package com.tripnest.backend.controller;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.DestinationResponse;
import com.tripnest.backend.service.DestinationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
@Slf4j
public class DestinationController {

    private final DestinationService destinationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DestinationResponse>>> getDestinations(
            @RequestParam(value = "country", defaultValue = "India") String country,
            @RequestParam(value = "state", required = false) String state) {
        
        log.info("Received request for destinations: Country={}, State={}", country, state);

        if (state == null || state.trim().isBlank()) {
            log.warn("Request rejected: State parameter is missing or empty.");
            return ResponseEntity.ok(ApiResponse.<List<DestinationResponse>>builder()
                    .success(false)
                    .message("State parameter is required to search for destinations.")
                    .data(Collections.emptyList())
                    .build());
        }

        try {
            List<DestinationResponse> destinations = destinationService.getDestinations(country, state);

            if (destinations.isEmpty()) {
                log.warn("Failed to retrieve or parse destinations for state: {}", state);
                return ResponseEntity.ok(ApiResponse.<List<DestinationResponse>>builder()
                        .success(false)
                        .message("Unable to generate destinations at the moment. Please try again later.")
                        .data(Collections.emptyList())
                        .build());
            }

            return ResponseEntity.ok(ApiResponse.success("Successfully retrieved destinations", destinations));

        } catch (Exception e) {
            log.error("Unhandled error retrieving destinations: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.<List<DestinationResponse>>builder()
                    .success(false)
                    .message("An unexpected error occurred. Please try again later.")
                    .data(Collections.emptyList())
                    .build());
        }
    }
}
