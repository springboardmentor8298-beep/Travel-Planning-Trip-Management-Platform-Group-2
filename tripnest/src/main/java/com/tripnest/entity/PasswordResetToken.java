package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * PasswordResetToken entity — represents a password reset token
 *
 * Schema:
 * CREATE TABLE password_reset_tokens (
 *   id             BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   token          VARCHAR(255) NOT NULL UNIQUE,
 *   expiry_date    TIMESTAMP NOT NULL,
 *   used           BOOLEAN NOT NULL DEFAULT FALSE,
 *   user_id        BIGINT NOT NULL,
 *   FOREIGN KEY (user_id) REFERENCES users(id)
 * );
 */
@Entity
@Table(name = "password_reset_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private boolean used = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        if (expiryDate == null) {
            expiryDate = LocalDateTime.now().plusHours(24);
        }
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
}
