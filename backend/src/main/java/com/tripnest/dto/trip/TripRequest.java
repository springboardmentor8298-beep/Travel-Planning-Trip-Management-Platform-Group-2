package com.tripnest.dto.trip;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class TripRequest {

    @NotBlank(message = "Trip title is required")
    @Size(max = 150)
    private String title;

    @NotNull(message = "A destination must be selected")
    private Long destinationId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private BigDecimal totalBudget;

    private String notes;

    private boolean shared = false;
}
