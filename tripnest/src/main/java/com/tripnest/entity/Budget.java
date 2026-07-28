package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal totalBudget;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal remainingBudget;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal spentAmount;

    @OneToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;
}
