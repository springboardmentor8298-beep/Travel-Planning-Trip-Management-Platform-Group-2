package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * GroupMessage entity — stores chat messages per trip.
 *
 * Schema:
 * CREATE TABLE group_messages (
 *   id        BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   trip_id   BIGINT NOT NULL,
 *   sender_id BIGINT NOT NULL,
 *   message   TEXT NOT NULL,
 *   sent_at   DATETIME NOT NULL,
 *   FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
 *   FOREIGN KEY (sender_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "group_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt = LocalDateTime.now();
}
