package com.tripnest.controller;

import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.LoginRequest;
import com.tripnest.dto.RegisterRequest;
import com.tripnest.dto.RefreshRequest;
import com.tripnest.dto.PasswordResetRequest;
import com.tripnest.dto.PasswordResetConfirmRequest;
import jakarta.validation.Valid;
import com.tripnest.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175"
})
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest request) { return authService.refresh(request); }

    @PostMapping("/password-reset/request") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void requestReset(@Valid @RequestBody PasswordResetRequest request) { authService.requestPasswordReset(request); }

    @PostMapping("/password-reset/confirm") @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
    public void confirmReset(@Valid @RequestBody PasswordResetConfirmRequest request) { authService.resetPassword(request); }
}
