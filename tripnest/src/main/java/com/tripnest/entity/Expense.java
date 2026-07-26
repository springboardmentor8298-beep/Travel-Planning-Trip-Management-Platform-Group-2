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

/**
 * Expense entity — represents a recorded expense for a trip
 *
 * Schema:
 * CREATE TABLE expenses (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   description    VARCHAR(200) NOT NULL,
 *   amount         DECIMAL(12,2) NOT NULL,
 *   category       VARCHAR(30) NOT NULL,
 *   expense_date   DATE NOT NULL,
 *   payment_method VARCHAR(50),
 *   notes          TEXT,
 *   trip_id        BIGINT NOT NULL,
 *   group_id       BIGINT,
 *   FOREIGN KEY (trip_id) REFERENCES trips(id),
 *   FOREIGN KEY (group_id) REFERENCES travel_groups(id)
 * );
 */
@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String description;

    @NotNull
    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExpenseCategory category;

    @NotNull
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Size(max = 50)
    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private TravelGroup travelGroup;
}
