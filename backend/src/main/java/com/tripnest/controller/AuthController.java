package com.tripnest.controller;

import com.tripnest.config.GoogleOAuthConfig;
import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.LoginRequest;
import com.tripnest.dto.RegisterRequest;
import com.tripnest.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final GoogleOAuthConfig googleOAuthConfig;

    public AuthController(AuthService authService, GoogleOAuthConfig googleOAuthConfig) {
        this.authService = authService;
        this.googleOAuthConfig = googleOAuthConfig;
    }

    @GetMapping("/oauth-enabled")
    public ResponseEntity<Map<String, Boolean>> oauthEnabled() {
        return ResponseEntity.ok(Map.of("enabled", googleOAuthConfig.enabled()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
