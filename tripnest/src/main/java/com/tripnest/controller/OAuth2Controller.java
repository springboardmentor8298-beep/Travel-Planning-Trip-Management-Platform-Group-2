package com.tripnest.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Supplementary OAuth2 endpoints.
 * <p>
 * The success flow is entirely handled by OAuth2AuthenticationSuccessHandler
 * (which issues the JWT and redirects the browser to the React app).
 * This controller only provides a JSON failure endpoint for API clients.
 */
@RestController
@RequestMapping("/api/auth/oauth2")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class OAuth2Controller {

    @GetMapping("/failure")
    public ResponseEntity<?> oauth2Failure() {
        return ResponseEntity.badRequest().body(Map.of(
            "error", "OAuth2 authentication failed"
        ));
    }
}
