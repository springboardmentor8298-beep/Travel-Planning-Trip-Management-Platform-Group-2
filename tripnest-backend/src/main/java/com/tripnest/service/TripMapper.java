package com.tripnest.service;

import com.tripnest.dto.DestinationResponse;
import com.tripnest.dto.TripResponse;
import com.tripnest.entity.Destination;
import com.tripnest.entity.Trip;
import org.springframework.stereotype.Component;

/**
 * Single place that converts a Trip entity into a TripResponse DTO.
 * Used by both TripService (single-trip endpoints) and DashboardService
 * (aggregated "recent trips" list) so the shape never drifts between them.
 */
@Component
public class TripMapper {

    public TripResponse toResponse(Trip trip) {
        DestinationResponse destinationResponse = null;
        if (trip.getDestination() != null) {
            Destination d = trip.getDestination();
            destinationResponse = new DestinationResponse(
                    d.getId(), d.getName(), d.getCountry(), d.getDescription(),
                    d.getImageUrl(), d.getPopularAttractions()
            );
        }
        return new TripResponse(
                trip.getId(),
                trip.getTitle(),
                destinationResponse,
                trip.getCity(),
                trip.getState(),
                trip.getCountry(),
                trip.getTotalMembers(),
                trip.getNotes(),
                trip.getStartDate(),
                trip.getEndDate(),
                trip.getBudget(),
                trip.getStatus(),
                trip.getOwner().getEmail(),
                trip.getTravelers().size()
        );
    }
}
