package com.tripnest.service;

import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.LoginRequest;
import com.tripnest.dto.RegisterRequest;
import com.tripnest.entity.User;
import com.tripnest.security.JwtService;
import com.tripnest.entity.RefreshToken;
import com.tripnest.repository.RefreshTokenRepository;
import com.tripnest.dto.RefreshRequest;
import com.tripnest.dto.PasswordResetRequest;
import com.tripnest.dto.PasswordResetConfirmRequest;
import com.tripnest.entity.PasswordResetToken;
import com.tripnest.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenRepository refreshTokens;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokens;

    public AuthResponse register(RegisterRequest request) {

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userService.register(user);

        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userService.findByEmail(request.getEmail());

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return issueTokens(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        String email = jwtService.extractUsername(request.refreshToken());
        String tokenId = jwtService.extractTokenId(request.refreshToken());
        RefreshToken stored = refreshTokens.findByTokenId(tokenId).orElseThrow(() -> new RuntimeException("Refresh token is invalid"));
        if (stored.getExpiresAt().isBefore(Instant.now()) || !stored.getUser().getEmail().equals(email)) { refreshTokens.delete(stored); throw new RuntimeException("Refresh token has expired"); }
        refreshTokens.delete(stored);
        return issueTokens(stored.getUser());
    }

    public AuthResponse issueTokens(User user) {
        String tokenId = UUID.randomUUID().toString();
        refreshTokens.save(new RefreshToken(null, tokenId, Instant.now().plusSeconds(604800), user));
        return new AuthResponse(jwtService.generateAccessToken(user.getEmail()), jwtService.generateRefreshToken(user.getEmail(), tokenId));
    }

    public void requestPasswordReset(PasswordResetRequest request) {
        userService.findByEmailOptional(request.email()).ifPresent(user -> {
            passwordResetTokens.deleteByUserId(user.getId());
            passwordResetTokens.save(new PasswordResetToken(null, UUID.randomUUID().toString(), Instant.now().plusSeconds(1800), user));
        });
    }

    public void resetPassword(PasswordResetConfirmRequest request) {
        PasswordResetToken reset = passwordResetTokens.findByToken(request.token()).orElseThrow(() -> new RuntimeException("Password reset token is invalid"));
        if (reset.getExpiresAt().isBefore(Instant.now())) { passwordResetTokens.delete(reset); throw new RuntimeException("Password reset token has expired"); }
        reset.getUser().setPassword(passwordEncoder.encode(request.newPassword()));
        refreshTokens.deleteAll(refreshTokens.findByUserId(reset.getUser().getId()));
        passwordResetTokens.delete(reset);
    }
}
