package com.tripnest.controller;

import com.tripnest.dto.DestinationResponse;
import com.tripnest.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for destination browsing.
 * <p>
 * Routes:
 *   GET /api/destinations           — all destinations
 *   GET /api/destinations/search    — search by name or country
 *   GET /api/destinations/{id}      — single destination detail
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService destinationService;

    @GetMapping
    public ResponseEntity<List<DestinationResponse>> getAll() {
        return ResponseEntity.ok(destinationService.getAllDestinations());
    }

    @GetMapping("/search")
    public ResponseEntity<List<DestinationResponse>> search(@RequestParam String q) {
        return ResponseEntity.ok(destinationService.searchDestinations(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DestinationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getById(id));
    }
}
