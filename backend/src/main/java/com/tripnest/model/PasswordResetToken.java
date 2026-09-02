package com.tripnest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private boolean used = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public PasswordResetToken() {}

    public PasswordResetToken(String token, User user, LocalDateTime expiresAt) {
        this.token     = token;
        this.user      = user;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public Long getId()                         { return id; }
    public String getToken()                    { return token; }
    public void setToken(String token)          { this.token = token; }
    public User getUser()                       { return user; }
    public void setUser(User user)              { this.user = user; }
    public LocalDateTime getExpiresAt()         { return expiresAt; }
    public void setExpiresAt(LocalDateTime e)   { this.expiresAt = e; }
    public boolean isUsed()                     { return used; }
    public void setUsed(boolean used)           { this.used = used; }
    public LocalDateTime getCreatedAt()         { return createdAt; }
}
