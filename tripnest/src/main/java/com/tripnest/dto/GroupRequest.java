package com.tripnest.dto;
import jakarta.validation.constraints.NotBlank;
public record GroupRequest(@NotBlank String name, String description, Long tripId) { }
