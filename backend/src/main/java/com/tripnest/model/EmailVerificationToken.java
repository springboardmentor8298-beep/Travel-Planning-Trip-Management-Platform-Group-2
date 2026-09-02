package com.tripnest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private boolean used = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    public EmailVerificationToken() {}

    public EmailVerificationToken(String token, User user) {
        this.token = token;
        this.user  = user;
    }

    public Long getId()                      { return id; }
    public String getToken()                 { return token; }
    public void setToken(String t)           { this.token = t; }
    public User getUser()                    { return user; }
    public void setUser(User u)              { this.user = u; }
    public boolean isUsed()                  { return used; }
    public void setUsed(boolean used)        { this.used = used; }
    public LocalDateTime getCreatedAt()      { return createdAt; }
}
