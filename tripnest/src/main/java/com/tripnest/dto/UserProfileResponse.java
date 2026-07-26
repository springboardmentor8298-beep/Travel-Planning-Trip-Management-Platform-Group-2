package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Set<String> roles;
    private String travelPreferences;
    private String favoriteDestinations;
    private String profileBio;
    private String avatarUrl;
    private long totalTrips;
    private long completedTrips;
}
