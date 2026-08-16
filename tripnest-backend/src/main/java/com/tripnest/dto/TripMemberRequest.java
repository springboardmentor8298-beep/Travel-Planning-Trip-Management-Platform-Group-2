package com.tripnest.dto;

import com.tripnest.entity.TripRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TripMemberRequest {

    @NotBlank
    @Email(message = "Email must be valid")
    private String email;

    @NotNull(message = "Role is required")
    private TripRole role;
}
