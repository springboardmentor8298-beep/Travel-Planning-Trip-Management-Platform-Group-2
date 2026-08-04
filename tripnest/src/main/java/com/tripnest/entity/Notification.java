package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Notification entity — in-app alerts for users.
 *
 * Schema:
 * CREATE TABLE notifications (
 *   id           BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   user_id      BIGINT NOT NULL,
 *   type         VARCHAR(30) NOT NULL,
 *   title        VARCHAR(100) NOT NULL,
 *   message      TEXT,
 *   is_read      BOOLEAN NOT NULL DEFAULT FALSE,
 *   created_at   DATETIME NOT NULL,
 *   reference_id BIGINT,
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Optional reference to the related entity (e.g. tripId) */
    @Column(name = "reference_id")
    private Long referenceId;
}
