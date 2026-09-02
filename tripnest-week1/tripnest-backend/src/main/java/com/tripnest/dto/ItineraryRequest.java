package com.tripnest.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ItineraryRequest {

    @NotNull(message = "Day number is required")
    private Integer dayNumber;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String notes;
}
