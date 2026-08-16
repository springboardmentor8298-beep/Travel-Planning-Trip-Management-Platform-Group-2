package com.tripnest.dto;

import com.tripnest.entity.TripRole;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TripMemberResponse {
    private Long userId;
    private String email;
    private String fullName;
    private TripRole role;
}
