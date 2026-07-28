package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "refresh_tokens")
public class RefreshToken {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 64) private String tokenId;
    @Column(nullable = false) private Instant expiresAt;
    @ManyToOne @JoinColumn(name = "user_id", nullable = false) private User user;
}
