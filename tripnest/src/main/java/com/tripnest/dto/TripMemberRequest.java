package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TripMemberRequest {

    @NotBlank
    @Size(max = 50)
    private String username;
}