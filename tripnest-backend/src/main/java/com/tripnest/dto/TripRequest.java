package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TripRequest {

    @NotBlank(message = "Title is required")
    private String title;

    // Optional - link to an existing Destination by id
    private Long destinationId;

    // Optional free-text location, independent of the Destination catalog
    private String city;
    private String state;
    private String country;
    private Integer totalMembers;
    private String notes;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private Double budget;
}
