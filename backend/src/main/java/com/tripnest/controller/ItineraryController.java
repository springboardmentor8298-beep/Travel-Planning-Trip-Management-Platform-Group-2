package com.tripnest.controller;

import com.tripnest.dto.ItineraryItemRequest;
import com.tripnest.dto.ItineraryItemResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.ItineraryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/itinerary")
public class ItineraryController {

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @GetMapping
    public List<ItineraryItemResponse> getItinerary(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long tripId) {
        return itineraryService.getItinerary(principal.getUsername(), tripId);
    }

    @PostMapping
    public ResponseEntity<ItineraryItemResponse> addItineraryItem(@AuthenticationPrincipal UserPrincipal principal,
                                                                   @PathVariable Long tripId,
                                                                   @Valid @RequestBody ItineraryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(itineraryService.addItineraryItem(principal.getUsername(), tripId, request));
    }

    @PutMapping("/{itemId}")
    public ItineraryItemResponse updateItineraryItem(@AuthenticationPrincipal UserPrincipal principal,
                                                      @PathVariable Long tripId,
                                                      @PathVariable Long itemId,
                                                      @Valid @RequestBody ItineraryItemRequest request) {
        return itineraryService.updateItineraryItem(principal.getUsername(), tripId, itemId, request);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteItineraryItem(@AuthenticationPrincipal UserPrincipal principal,
                                                     @PathVariable Long tripId,
                                                     @PathVariable Long itemId) {
        itineraryService.deleteItineraryItem(principal.getUsername(), tripId, itemId);
        return ResponseEntity.noContent().build();
    }
}
