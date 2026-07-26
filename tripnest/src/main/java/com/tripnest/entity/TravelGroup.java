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
 * TravelGroup entity — represents a travel group for collaborative trip planning
 *
 * Schema:
 * CREATE TABLE travel_groups (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   name           VARCHAR(100) NOT NULL,
 *   description    TEXT,
 *   created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 *   admin_id       BIGINT NOT NULL,
 *   FOREIGN KEY (admin_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "travel_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @OneToMany(mappedBy = "travelGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<GroupMember> members = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
