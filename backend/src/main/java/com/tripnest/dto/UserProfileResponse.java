package com.tripnest.dto;

import com.tripnest.model.User;

import java.time.LocalDateTime;

public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String travelPreferences;
    private String favoriteDestinations;
    private String bio;
    private String profilePictureUrl;
    private LocalDateTime createdAt;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long id, String fullName, String email, String phone, String role,
                               String travelPreferences, String favoriteDestinations, String bio,
                               String profilePictureUrl, LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.travelPreferences = travelPreferences;
        this.favoriteDestinations = favoriteDestinations;
        this.bio = bio;
        this.profilePictureUrl = profilePictureUrl;
        this.createdAt = createdAt;
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static UserProfileResponse fromEntity(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getTravelPreferences(),
                user.getFavoriteDestinations(),
                user.getBio(),
                user.getProfilePictureUrl(),
                user.getCreatedAt()
        );
    }
}
