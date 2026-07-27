package com.tripnest.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tripnest.entity.enums.AuthProvider;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class User extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** Nullable because OAuth2 (Google) users don't have a local password. */
    @JsonIgnore
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProvider provider = AuthProvider.LOCAL;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "is_enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "is_email_verified", nullable = false)
    private boolean emailVerified = false;

    // ----- Travel preference fields (Module 2 groundwork) -----
    @Column(name = "home_country", length = 100)
    private String homeCountry;

    @Column(name = "preferred_currency", length = 10)
    private String preferredCurrency = "USD";

    @ManyToMany(fetch = FetchType.EAGER, cascade = { CascadeType.MERGE, CascadeType.PERSIST })
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}
