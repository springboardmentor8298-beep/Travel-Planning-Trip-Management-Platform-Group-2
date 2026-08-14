package com.tripnest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Trip entity — represents a travel plan created by a user.
 *
 * Schema:
 * CREATE TABLE trips (
 *   id                  BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   title               VARCHAR(100) NOT NULL,
 *   destination         VARCHAR(150) NOT NULL,
 *   start_date          DATE NOT NULL,
 *   end_date            DATE NOT NULL,
 *   budget              DECIMAL(12,2),
 *   status              VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
 *   description         TEXT,
 *   number_of_travelers INT NOT NULL DEFAULT 1,
 *   user_id             BIGINT NOT NULL,
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "trips")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String title;

    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String destination;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(precision = 12, scale = 2)
    private BigDecimal budget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TripStatus status = TripStatus.PLANNED;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "number_of_travelers", nullable = false)
    private int numberOfTravelers = 1;

    @Column(name = "share_token", unique = true, length = 64)
    private String shareToken;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    private List<Itinerary> itineraries = new ArrayList<>();
}
