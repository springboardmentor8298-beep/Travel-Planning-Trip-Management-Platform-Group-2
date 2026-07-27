package com.tripnest.entity;

import com.tripnest.entity.enums.TripStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
public class Trip extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "total_budget", precision = 12, scale = 2)
    private BigDecimal totalBudget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TripStatus status = TripStatus.PLANNING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_shared", nullable = false)
    private boolean shared = false;
}
