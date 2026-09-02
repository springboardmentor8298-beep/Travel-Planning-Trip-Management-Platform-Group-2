package com.tripnest.dto;

public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String travelPreferences;
    private String favoriteDestinations;
    private String bio;
    private String profilePictureUrl;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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
}
