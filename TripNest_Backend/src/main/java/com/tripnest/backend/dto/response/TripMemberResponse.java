package com.tripnest.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripMemberResponse {

    private Long id;

    private String name;

    private String email;

    private String role; // OWNER, EDITOR, MEMBER

    private String status; // PENDING, ACCEPTED

    private Long tripId;

    private String tripName;

    private java.time.LocalDateTime createdAt;
}
