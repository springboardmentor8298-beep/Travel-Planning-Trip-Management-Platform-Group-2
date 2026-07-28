package com.tripnest.dto;
import jakarta.validation.constraints.NotBlank;
public record GroupMessageRequest(@NotBlank String message) { }
