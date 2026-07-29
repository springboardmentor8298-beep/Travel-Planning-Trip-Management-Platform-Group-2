package com.tripnest.controller;

import com.tripnest.dto.AddTravelerRequest;
import com.tripnest.dto.TripDashboardResponse;
import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// No @PreAuthorize here on purpose - any AUTHENTICATED user (any role)
// can create/view their own trips. Role restriction only applies to
// /api/admin/** per SecurityConfig. If you see 403 here, it is almost
// certainly the JWT not authenticating at all (see JwtAuthFilter fix),
// not a missing role.
@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    // Explicit constructor instead of Lombok @RequiredArgsConstructor
    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.createTrip(email, request));
    }

    @GetMapping
    public ResponseEntity<List<TripResponse>> getMyTrips() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.getMyTrips(email));
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse> getTrip(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.getTrip(email, tripId));
    }

    @PutMapping("/{tripId}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Long tripId,
                                                    @Valid @RequestBody TripRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.updateTrip(email, tripId, request));
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        tripService.deleteTrip(email, tripId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{tripId}/travelers")
    public ResponseEntity<TripResponse> addTraveler(@PathVariable Long tripId,
                                                     @Valid @RequestBody AddTravelerRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.addTraveler(email, tripId, request));
    }

    @GetMapping("/{tripId}/dashboard")
    public ResponseEntity<TripDashboardResponse> getDashboard(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripService.getDashboard(email, tripId));
    }
}
