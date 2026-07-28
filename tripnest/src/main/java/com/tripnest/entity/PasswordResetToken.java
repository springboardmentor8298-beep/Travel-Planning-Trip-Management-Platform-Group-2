package com.tripnest.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="password_reset_tokens") @Data @NoArgsConstructor @AllArgsConstructor
public class PasswordResetToken {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,unique=true,length=100) private String token;
 @Column(nullable=false) private Instant expiresAt;
 @ManyToOne(optional=false) @JoinColumn(name="user_id") private User user;
}
