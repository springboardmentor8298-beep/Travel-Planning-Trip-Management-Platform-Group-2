package com.tripnest.entity;

/**
 * Enumeration of user roles in TripNest platform.
 * <p>
 * Roles:
 * - ROLE_TRAVELER: Default role for registered users
 * - ROLE_AGENT:    Travel agents who can list packages
 * - ROLE_ADMIN:    Platform administrators with full access
 */
public enum ERole {
    ROLE_TRAVELER,
    ROLE_AGENT,
    ROLE_ADMIN
}
