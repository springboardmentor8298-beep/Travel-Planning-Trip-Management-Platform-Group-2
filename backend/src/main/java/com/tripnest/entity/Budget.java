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

import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
public class Budget extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    private Trip trip;

    @Column(name = "planned_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal plannedAmount;

    @Column(name = "currency", length = 10, nullable = false)
    private String currency = "USD";

    @Column(name = "alert_threshold_percent")
    private Integer alertThresholdPercent = 80;
}
