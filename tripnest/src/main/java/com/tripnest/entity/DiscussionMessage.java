package com.tripnest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DiscussionMessage entity — represents a message within a group discussion
 *
 * Schema:
 * CREATE TABLE discussion_messages (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   content        TEXT NOT NULL,
 *   created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *   discussion_id  BIGINT NOT NULL,
 *   user_id        BIGINT NOT NULL,
 *   FOREIGN KEY (discussion_id) REFERENCES group_discussions(id),
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "discussion_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_id", nullable = false)
    private GroupDiscussion discussion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
