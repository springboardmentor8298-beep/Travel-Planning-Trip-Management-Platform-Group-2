package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record ProfileRequest(@NotBlank String fullName, @NotBlank String phoneNumber, String bio,
                             String profileImageUrl, Set<String> travelPreferences) { }
