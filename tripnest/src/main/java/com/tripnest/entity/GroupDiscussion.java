package com.tripnest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * GroupDiscussion entity — represents a discussion within a travel group
 *
 * Schema:
 * CREATE TABLE group_discussions (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   title          VARCHAR(200) NOT NULL,
 *   created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *   group_id       BIGINT NOT NULL,
 *   created_by     BIGINT NOT NULL,
 *   FOREIGN KEY (group_id) REFERENCES travel_groups(id),
 *   FOREIGN KEY (created_by) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "group_discussions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDiscussion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private TravelGroup travelGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "discussion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private Set<DiscussionMessage> messages = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
