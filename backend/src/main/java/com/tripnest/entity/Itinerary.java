package com.tripnest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/**
 * One row per day of a trip (day-wise itinerary creation requirement).
 * Activities hang off each Itinerary day.
 */
@Entity
@Table(name = "itineraries")
@Getter
@Setter
@NoArgsConstructor
public class Itinerary extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "itinerary_date", nullable = false)
    private LocalDate date;

    @Column(length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
