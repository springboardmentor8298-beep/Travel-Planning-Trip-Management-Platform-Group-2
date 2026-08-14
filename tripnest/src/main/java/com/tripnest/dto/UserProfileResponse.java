package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String bio;
    private String avatarUrl;
    private String travelPreferences;
    private List<String> roles;
    private Set<DestinationResponse> favoriteDestinations;
    private long totalTrips;
    private long completedTrips;
}
