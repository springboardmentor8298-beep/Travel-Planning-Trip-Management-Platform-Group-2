package com.tripnest.dto;

import java.util.Set;

public record ProfileResponse(Long id, String fullName, String email, String phoneNumber, String bio,
                              String profileImageUrl, String role, Set<String> travelPreferences) { }
