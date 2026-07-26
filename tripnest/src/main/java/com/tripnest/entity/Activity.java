package com.tripnest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

/**
 * Activity entity — represents a scheduled activity within an itinerary day.
 *
 * Schema:
 * CREATE TABLE activities (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   name           VARCHAR(150) NOT NULL,
 *   description    TEXT,
 *   activity_type  VARCHAR(30) NOT NULL,
 *   start_time     TIME,
 *   end_time       TIME,
 *   location       VARCHAR(200),
 *   cost           DECIMAL(10,2),
 *   itinerary_id   BIGINT NOT NULL,
 *   FOREIGN KEY (itinerary_id) REFERENCES itineraries(id)
 * );
 */
@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 30)
    private ActivityType activityType = ActivityType.SIGHTSEEING;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Size(max = 200)
    @Column(length = 200)
    private String location;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 6)
    private BigDecimal longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    private Itinerary itinerary;
}
