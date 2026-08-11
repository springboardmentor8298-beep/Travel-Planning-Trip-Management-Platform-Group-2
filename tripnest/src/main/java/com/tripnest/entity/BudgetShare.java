package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * BudgetShare entity — represents budget sharing/contribution for a trip among group members
 *
 * Schema:
 * CREATE TABLE budget_shares (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   trip_id        BIGINT NOT NULL,
 *   user_id        BIGINT NOT NULL,
 *   group_id       BIGINT,
 *   amount         DECIMAL(12,2) NOT NULL,
 *   share_type     VARCHAR(20) NOT NULL DEFAULT 'EQUAL',
 *   status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',
 *   created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *   updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   FOREIGN KEY (trip_id) REFERENCES trips(id),
 *   FOREIGN KEY (user_id) REFERENCES users(id),
 *   FOREIGN KEY (group_id) REFERENCES travel_groups(id)
 * );
 */
@Entity
@Table(name = "budget_shares")
@Data
@EqualsAndHashCode(exclude = {"trip", "user", "travelGroup"})
@NoArgsConstructor
@AllArgsConstructor
public class BudgetShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private TravelGroup travelGroup;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShareType shareType = ShareType.EQUAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShareStatus status = ShareStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ShareType {
        EQUAL,       // Equal share among all members
        PERCENTAGE,  // Percentage-based share
        CUSTOM       // Custom amount
    }

    public enum ShareStatus {
        PENDING,     // Share not yet confirmed
        CONFIRMED,   // Share confirmed by user
        PAID,        // Share paid
        CANCELLED    // Share cancelled
    }
}
