package com.tripnest.backend.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponse {

    private Long id;

    private String name;

    private String type; // Ticket, Hotel Booking, Passport, Insurance, Other

    private String size;

    private LocalDateTime uploadedAt;
}
