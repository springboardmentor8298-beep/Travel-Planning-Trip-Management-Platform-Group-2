package com.tripnest.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTripRequest {

    @NotBlank(message = "Trip name is required")
    private String tripName;

    @NotBlank(message = "Destination name is required")
    private String destinationName;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Country is required")
    private String country;

    @NotNull(message = "Start date is required")
    @FutureOrPresent
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @FutureOrPresent
    private LocalDate endDate;

    @NotNull(message = "Budget is required")
    private BigDecimal budget;

    private String notes;
    
    @NotNull(message = "Number of members is required")
    @Min(value = 1, message = "At least one member is required")
    private Integer totalMembers;
    
    private String coverImage;
}