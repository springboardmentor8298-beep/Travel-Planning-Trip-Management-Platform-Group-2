package com.tripnest.dto;

import com.tripnest.entity.TripStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO returned when reading a Trip.
 */
@Data
public class TripResponse {

    private Long id;
    private String title;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal budget;
    private TripStatus status;
    private String description;
    private int numberOfTravelers;
    private Long userId;
    private String username;
    private int durationDays;
    private List<ItineraryResponse> itineraries;
}
