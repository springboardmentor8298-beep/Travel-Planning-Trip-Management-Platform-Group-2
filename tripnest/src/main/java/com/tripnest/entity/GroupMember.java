package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * GroupMember entity — represents a member of a travel group
 *
 * Schema:
 * CREATE TABLE group_members (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   joined_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *   role           VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
 *   group_id       BIGINT NOT NULL,
 *   user_id        BIGINT NOT NULL,
 *   FOREIGN KEY (group_id) REFERENCES travel_groups(id),
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "group_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GroupRole role = GroupRole.MEMBER;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private TravelGroup travelGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
