package com.tripnest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for creating or updating an Itinerary day.
 */
@Data
public class ItineraryRequest {

    @NotNull
    private Integer dayNumber;

    private LocalDate date;

    private String notes;
}
