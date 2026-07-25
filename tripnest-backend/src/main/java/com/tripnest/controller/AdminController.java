package com.tripnest.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Demonstrates role-based access control (RBAC).
 * Two layers of protection are shown here on purpose for the review:
 *  1. URL-level:    SecurityConfig -> "/api/admin/**" requires ROLE_ADMINISTRATOR
 *  2. Method-level:  @PreAuthorize on this specific method, redundant but shows both patterns
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/dashboard-stub")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public Map<String, String> adminOnly() {
        return Map.of("message", "You have ADMINISTRATOR access. Full analytics dashboard arrives in Week 7-8.");
    }
}
