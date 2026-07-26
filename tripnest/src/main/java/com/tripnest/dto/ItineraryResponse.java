package com.tripnest.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO returned when reading an Itinerary day.
 */
@Data
public class ItineraryResponse {

    private Long id;
    private Integer dayNumber;
    private LocalDate date;
    private String notes;
    private Long tripId;
    private List<ActivityResponse> activities;
}
