package com.tripnest.service;

import com.tripnest.dto.AdminAnalyticsResponse;
import com.tripnest.dto.DestinationTrendEntry;
import com.tripnest.entity.*;
import com.tripnest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Powers the Admin Dashboard - platform-wide statistics across ALL users,
 * as opposed to DashboardService which only aggregates the current user's
 * own data. Only reachable via /api/admin/analytics, which SecurityConfig
 * restricts to ROLE_ADMINISTRATOR.
 */
@Service
@RequiredArgsConstructor
public class AdminAnalyticsService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final DestinationRepository destinationRepository;
    private final TripDocumentRepository tripDocumentRepository;
    private final NotificationRepository notificationRepository;
    private final TripMemberRoleRepository tripMemberRoleRepository;

    public AdminAnalyticsResponse getAnalytics() {
        List<User> allUsers = userRepository.findAll();
        List<Trip> allTrips = tripRepository.findAll();

        Map<String, Long> usersByRole = new LinkedHashMap<>();
        for (RoleName roleName : RoleName.values()) {
            long count = allUsers.stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == roleName))
                    .count();
            usersByRole.put(roleName.name(), count);
        }

        Map<String, Long> tripsByStatus = new LinkedHashMap<>();
        for (TripStatus status : TripStatus.values()) {
            tripsByStatus.put(status.name(), allTrips.stream().filter(t -> t.getStatus() == status).count());
        }

        double totalBudget = allTrips.stream()
                .mapToDouble(t -> t.getBudget() != null ? t.getBudget() : 0.0)
                .sum();

        double totalExpenses = expenseRepository.findAll().stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        // Top 5 most-planned locations across every trip on the platform,
        // preferring the free-text city (what users actually type most
        // often) and falling back to the linked Destination catalog entry.
        Map<String, Long> locationCounts = allTrips.stream()
                .map(t -> {
                    if (t.getCity() != null && !t.getCity().isBlank()) return t.getCity();
                    return t.getDestination() != null ? t.getDestination().getName() : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(loc -> loc, Collectors.counting()));

        List<DestinationTrendEntry> topDestinations = locationCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new DestinationTrendEntry(e.getKey(), e.getValue()))
                .toList();

        return new AdminAnalyticsResponse(
                allUsers.size(),
                usersByRole,
                allTrips.size(),
                tripsByStatus,
                round2(totalBudget),
                round2(totalExpenses),
                destinationRepository.count(),
                topDestinations,
                tripDocumentRepository.count(),
                notificationRepository.count(),
                tripMemberRoleRepository.count()
        );
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
