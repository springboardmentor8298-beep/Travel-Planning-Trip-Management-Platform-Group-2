package com.tripnest.service;

import com.tripnest.dto.DashboardAnalyticsResponse;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripStatus;
import com.tripnest.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardAnalyticsService {

    private final TripRepository tripRepository;

    public DashboardAnalyticsService(
            TripRepository tripRepository
    ) {
        this.tripRepository = tripRepository;
    }

    public DashboardAnalyticsResponse getAnalytics(
            Long userId
    ) {

        List<Trip> trips =
                tripRepository.findByUserId(userId);

        DashboardAnalyticsResponse response =
                new DashboardAnalyticsResponse();

        // Total trips
        response.setTotalTrips(trips.size());

        // Status counts
        response.setPlanningTrips(
                trips.stream()
                        .filter(trip ->
                                trip.getStatus() ==
                                TripStatus.PLANNING)
                        .count()
        );

        response.setUpcomingTrips(
                trips.stream()
                        .filter(trip ->
                                trip.getStatus() ==
                                TripStatus.UPCOMING)
                        .count()
        );

        response.setCompletedTrips(
                trips.stream()
                        .filter(trip ->
                                trip.getStatus() ==
                                TripStatus.COMPLETED)
                        .count()
        );

        // Total budget
        double totalBudget =
                trips.stream()
                        .map(Trip::getBudget)
                        .filter(budget ->
                                budget != null)
                        .mapToDouble(Double::doubleValue)
                        .sum();

        response.setTotalBudget(
                totalBudget
        );

        // Average budget
        double averageBudget =
                trips.stream()
                        .map(Trip::getBudget)
                        .filter(budget ->
                                budget != null)
                        .mapToDouble(Double::doubleValue)
                        .average()
                        .orElse(0.0);

        response.setAverageBudget(
                averageBudget
        );

        return response;
    }
}