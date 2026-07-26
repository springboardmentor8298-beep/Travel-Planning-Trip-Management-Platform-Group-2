package com.tripnest.dto;

import com.tripnest.entity.TripStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating or updating a Trip.
 */
@Data
public class TripRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String destination;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private BigDecimal budget;

    private TripStatus status;

    private String description;

    private int numberOfTravelers = 1;
}
