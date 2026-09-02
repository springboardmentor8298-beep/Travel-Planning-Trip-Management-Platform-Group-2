package com.tripnest.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.TRAVELER;

    // --- Profile management (Module 2) ---
    @Column(length = 1000)
    private String travelPreferences; // e.g. "Adventure, Beach, Budget travel"

    @Column(length = 1000)
    private String favoriteDestinations; // comma separated for Milestone 1 simplicity

    @Column(length = 500)
    private String bio;

    private String profilePictureUrl;

    private boolean active = true;

    @Column(nullable = false)
    private boolean emailVerified = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Trip> ownedTrips = new HashSet<>();

    public User() {
    }

    public User(Long id, String fullName, String email, String password, String phone, Role role, String travelPreferences, String favoriteDestinations, String bio, String profilePictureUrl, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt, Set<Trip> ownedTrips) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role == null ? Role.TRAVELER : role;
        this.travelPreferences = travelPreferences;
        this.favoriteDestinations = favoriteDestinations;
        this.bio = bio;
        this.profilePictureUrl = profilePictureUrl;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.ownedTrips = ownedTrips == null ? new HashSet<>() : ownedTrips;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getTravelPreferences() {
        return travelPreferences;
    }

    public void setTravelPreferences(String travelPreferences) {
        this.travelPreferences = travelPreferences;
    }

    public String getFavoriteDestinations() {
        return favoriteDestinations;
    }

    public void setFavoriteDestinations(String favoriteDestinations) {
        this.favoriteDestinations = favoriteDestinations;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Set<Trip> getOwnedTrips() {
        return ownedTrips;
    }

    public void setOwnedTrips(Set<Trip> ownedTrips) {
        this.ownedTrips = ownedTrips;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
