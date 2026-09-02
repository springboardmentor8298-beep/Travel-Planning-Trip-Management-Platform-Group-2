package com.tripnest.security;

import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Returns the email of the currently authenticated user,
     * extracted from the JWT-backed SecurityContext set by JwtAuthFilter.
     */
    public static String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
