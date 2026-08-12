package com.tripnest.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    private String id;
    private String name;
    
    @Column(unique = true)
    private String email;
    
    private String photoUrl;
    private String passportNumber;
    private String currencyPreference;
    private String bio;
    private String authProvider; // GOOGLE, EMAIL
    private String role; // USER, ADMIN
    private LocalDateTime dateJoined;

    public UserEntity() {}

    public UserEntity(String id, String name, String email, String photoUrl, String passportNumber, String currencyPreference, String bio, String authProvider, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.photoUrl = photoUrl;
        this.passportNumber = passportNumber;
        this.currencyPreference = currencyPreference;
        this.bio = bio;
        this.authProvider = authProvider;
        this.role = role;
        this.dateJoined = LocalDateTime.now();
    }

    @PrePersist
    public void onCreate() {
        if (this.dateJoined == null) {
            this.dateJoined = LocalDateTime.now();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getPassportNumber() { return passportNumber; }
    public void setPassportNumber(String passportNumber) { this.passportNumber = passportNumber; }

    public String getCurrencyPreference() { return currencyPreference; }
    public void setCurrencyPreference(String currencyPreference) { this.currencyPreference = currencyPreference; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getDateJoined() { return dateJoined; }
}
