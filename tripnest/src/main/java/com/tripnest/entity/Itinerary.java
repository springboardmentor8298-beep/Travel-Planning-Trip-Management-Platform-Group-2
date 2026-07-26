package com.tripnest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Itinerary entity — represents a single day plan within a trip.
 *
 * Schema:
 * CREATE TABLE itineraries (
 *   id          BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   day_number  INT NOT NULL,
 *   date        DATE,
 *   notes       TEXT,
 *   trip_id     BIGINT NOT NULL,
 *   FOREIGN KEY (trip_id) REFERENCES trips(id)
 * );
 */
@Entity
@Table(name = "itineraries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column
    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @OneToMany(mappedBy = "itinerary", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startTime ASC")
    private List<Activity> activities = new ArrayList<>();
}
