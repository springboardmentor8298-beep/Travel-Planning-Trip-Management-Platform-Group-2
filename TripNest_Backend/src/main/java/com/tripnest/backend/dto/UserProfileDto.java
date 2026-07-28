package com.tripnest.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

    private String fullName;

    private String email;

    private String phone;

    private String country;

    private String bio;

    private String photo;

    private String travelStyle;

    private String emergencyContact;
}
