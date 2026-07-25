package com.tripnest.backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateItineraryRequest {

    @NotNull
    private Integer dayNumber;

    @NotNull
    private LocalDate date;

    private String notes;
}