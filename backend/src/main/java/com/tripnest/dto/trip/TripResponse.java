package com.tripnest.dto.trip;

import com.tripnest.dto.destination.DestinationResponse;
import com.tripnest.entity.Trip;
import com.tripnest.entity.enums.TripStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Getter
@Builder
public class TripResponse {
    private Long id;
    private String title;
    private DestinationResponse destination;
    private Long ownerId;
    private String ownerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private long durationDays;
    private BigDecimal totalBudget;
    private TripStatus status;
    private String notes;
    private boolean shared;
    private long itineraryDayCount;
    private Instant createdAt;
    private Instant updatedAt;

    public static TripResponse fromEntity(Trip trip, long itineraryDayCount) {
        return TripResponse.builder()
                .id(trip.getId())
                .title(trip.getTitle())
                .destination(DestinationResponse.fromEntity(trip.getDestination()))
                .ownerId(trip.getOwner().getId())
                .ownerName(trip.getOwner().getFullName())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .durationDays(ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1)
                .totalBudget(trip.getTotalBudget())
                .status(trip.getStatus())
                .notes(trip.getNotes())
                .shared(trip.isShared())
                .itineraryDayCount(itineraryDayCount)
                .createdAt(trip.getCreatedAt())
                .updatedAt(trip.getUpdatedAt())
                .build();
    }
}
