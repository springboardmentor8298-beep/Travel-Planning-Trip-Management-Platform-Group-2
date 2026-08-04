package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * TripMember entity — links users to trips as collaborators.
 *
 * Schema:
 * CREATE TABLE trip_members (
 *   id         BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   trip_id    BIGINT NOT NULL,
 *   user_id    BIGINT NOT NULL,
 *   role       VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
 *   status     VARCHAR(20) NOT NULL DEFAULT 'PENDING',
 *   invited_at DATETIME NOT NULL,
 *   joined_at  DATETIME,
 *   UNIQUE KEY uq_trip_user (trip_id, user_id),
 *   FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "trip_members",
        uniqueConstraints = @UniqueConstraint(columnNames = {"trip_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberRole role = MemberRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MemberStatus status = MemberStatus.PENDING;

    @Column(name = "invited_at", nullable = false, updatable = false)
    private LocalDateTime invitedAt = LocalDateTime.now();

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
}
