package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Notification entity — represents user notifications
 *
 * Schema:
 * CREATE TABLE notifications (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   title          VARCHAR(200) NOT NULL,
 *   message        TEXT NOT NULL,
 *   type           VARCHAR(50) NOT NULL,
 *   is_read        BOOLEAN NOT NULL DEFAULT FALSE,
 *   created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *   user_id        BIGINT NOT NULL,
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "related_trip_id")
    private Long relatedTripId;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
