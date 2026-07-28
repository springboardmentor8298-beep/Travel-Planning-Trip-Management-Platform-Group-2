package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String activityName;

    private String activityType;

    private String location;

    private String startTime;

    private String endTime;

    private Integer durationMinutes;

    @Column(length = 1000)
    private String notes;

    private String status;

    private Integer sortOrder;

    private LocalDateTime reminderAt;

    private LocalDateTime reminderSentAt;

    @ManyToOne
    @JoinColumn(name = "itinerary_id")
    private Itinerary itinerary;
}
