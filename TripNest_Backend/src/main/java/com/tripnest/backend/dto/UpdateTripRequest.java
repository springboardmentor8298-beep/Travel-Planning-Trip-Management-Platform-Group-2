package com.tripnest.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateTripRequest {

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

    @NotNull
    @FutureOrPresent
    private LocalDate startDate;

    @NotNull
    @FutureOrPresent
    private LocalDate endDate;

    @NotNull
    private BigDecimal budget;

    private String notes;
    
    private String description;
    
    @NotNull
    @Min(1)
    private Integer totalMembers;
    
    private String coverImage;
}