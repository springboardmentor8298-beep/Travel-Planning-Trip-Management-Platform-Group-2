package com.tripnest.controller;

import com.tripnest.dto.DestinationRequest;
import com.tripnest.dto.DestinationResponse;
import com.tripnest.service.DestinationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;

    // Public browsing - no auth required (Destination Discovery System)
    @GetMapping
    public ResponseEntity<List<DestinationResponse>> getAllDestinations() {
        return ResponseEntity.ok(destinationService.getAllDestinations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DestinationResponse> getDestination(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getDestination(id));
    }

    // Only Administrators can add new destinations to the catalog
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<DestinationResponse> createDestination(@Valid @RequestBody DestinationRequest request) {
        return ResponseEntity.ok(destinationService.createDestination(request));
    }
}
