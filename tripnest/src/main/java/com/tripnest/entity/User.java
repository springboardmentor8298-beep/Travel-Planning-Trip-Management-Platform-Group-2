package com.tripnest.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

/**
 * User entity — maps to the `users` table.
 * <p>
 * Schema:
 * CREATE TABLE users (
 *   id         BIGINT PRIMARY KEY AUTO_INCREMENT,
 *   username   VARCHAR(20) NOT NULL UNIQUE,
 *   email      VARCHAR(50) NOT NULL UNIQUE,
 *   password   VARCHAR(120) NOT NULL,
 *   first_name VARCHAR(50),
 *   last_name  VARCHAR(50),
 *   phone      VARCHAR(15),
 *   enabled    BOOLEAN NOT NULL DEFAULT TRUE
 * );
 *
 * CREATE TABLE user_roles (
 *   user_id BIGINT NOT NULL,
 *   role_id INT NOT NULL,
 *   PRIMARY KEY (user_id, role_id),
 *   FOREIGN KEY (user_id) REFERENCES users(id),
 *   FOREIGN KEY (role_id) REFERENCES roles(id)
 * );
 */
@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(min = 3, max = 20)
    @Column(nullable = false, unique = true, length = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    @Column(nullable = false, unique = true, length = 50)
    private String email;

    // Not @NotBlank — OAuth2 users have no password; a placeholder is stored instead.
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String password;

    @Size(max = 50)
    @Column(name = "first_name", length = 50)
    private String firstName;

    @Size(max = 50)
    @Column(name = "last_name", length = 50)
    private String lastName;

    @Size(max = 15)
    @Column(length = 15)
    private String phone;

    @Column(nullable = false)
    private boolean enabled = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @Column(columnDefinition = "TEXT")
    private String travelPreferences;

    @Column(columnDefinition = "TEXT")
    private String favoriteDestinations;

    @Column(columnDefinition = "TEXT")
    private String profileBio;

    @Column(length = 255)
    private String avatarUrl;

    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
}
