package com.tripnest.backend.controller;

import com.tripnest.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/traveler")
    public ResponseEntity<?> getTravelerAnalytics() {
        long totalTrips = tripRepository.count();
        long activeTrips = tripRepository.findAll().stream().filter(t -> t.getIsCompleted() != null && !t.getIsCompleted()).count();
        long completedTrips = tripRepository.findAll().stream().filter(t -> t.getIsCompleted() != null && t.getIsCompleted()).count();
        double totalExpenses = expenseRepository.findAll().stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTrips", totalTrips);
        stats.put("activeTrips", activeTrips);
        stats.put("completedTrips", completedTrips);
        stats.put("totalExpenses", totalExpenses);
        stats.put("favoriteDestinations", List.of("Paris", "Tokyo", "Bali", "Rome"));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminAnalytics() {
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();
        double platformRevenue = 14500.00;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalTrips", totalTrips);
        stats.put("platformRevenue", platformRevenue);
        stats.put("systemStatus", "OPERATIONAL");

        return ResponseEntity.ok(stats);
    }
}
