package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    // Free-text location fields, separate from the curated Destination catalog -
    // lets a user plan a trip to a place that isn't in Destinations yet.
    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    private Integer totalMembers;

    @Column(length = 1000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    // Simple planned-budget number for Milestone 2.
    // Detailed expense tracking (Budget/Expense entities) arrives in Milestone 3.
    private Double budget;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private TripStatus status = TripStatus.PLANNED;

    // Prevents the scheduled reminder job from notifying the same trip twice.
    @Builder.Default
    // columnDefinition provides a DATABASE-level default, not just a Java
    // default. Without this, Hibernate's ALTER TABLE on your EXISTING
    // trips table (which already has rows) would fail with the exact
    // same "doesn't have a default value" error we just fixed for
    // trip_documents - a NOT NULL column with no default can't be added
    // to a table that already contains data.
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean reminderSent = false;

    // The user who created the trip
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // Other users sharing this trip (Group Collaboration groundwork)
    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "trip_travelers",
            joinColumns = @JoinColumn(name = "trip_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> travelers = new HashSet<>();

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
