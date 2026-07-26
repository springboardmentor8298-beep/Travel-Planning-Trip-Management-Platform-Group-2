package com.tripnest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileRequest {
    
    @Size(max = 50)
    private String firstName;
    
    @Size(max = 50)
    private String lastName;
    
    @Size(max = 15)
    private String phone;
    
    @Email
    @Size(max = 50)
    private String email;
    
    private String travelPreferences;
    
    private String favoriteDestinations;
    
    private String profileBio;
    
    @Size(max = 255)
    private String avatarUrl;
}
