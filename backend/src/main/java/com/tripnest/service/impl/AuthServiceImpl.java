package com.tripnest.service.impl;

import com.tripnest.dto.auth.AuthResponse;
import com.tripnest.dto.auth.ForgotPasswordRequest;
import com.tripnest.dto.auth.LoginRequest;
import com.tripnest.dto.auth.RegisterRequest;
import com.tripnest.dto.auth.ResetPasswordRequest;
import com.tripnest.entity.PasswordResetToken;
import com.tripnest.entity.RefreshToken;
import com.tripnest.entity.Role;
import com.tripnest.entity.User;
import com.tripnest.entity.enums.RoleName;
import com.tripnest.exception.DuplicateResourceException;
import com.tripnest.exception.InvalidCredentialsException;
import com.tripnest.exception.InvalidTokenException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.repository.PasswordResetTokenRepository;
import com.tripnest.repository.RefreshTokenRepository;
import com.tripnest.repository.RoleRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.security.JwtProperties;
import com.tripnest.security.JwtUtil;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.AuthService;
import com.tripnest.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final JwtProperties jwtProperties;
    private final EmailService emailService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        Role travelerRole = roleRepository.findByName(RoleName.ROLE_TRAVELER)
                .orElseThrow(() -> new ResourceNotFoundException("Default role not configured"));

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(travelerRole));

        User saved = userRepository.save(user);
        emailService.sendWelcomeEmail(saved.getEmail(), saved.getFullName());

        return buildAuthResponse(saved);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );
        } catch (Exception ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return buildAuthResponse(principal.getUser());
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not recognized"));

        if (storedToken.isRevoked() || storedToken.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException("Refresh token expired or revoked, please log in again");
        }

        User user = storedToken.getUser();

        // Rotate: revoke the used token and issue a brand-new pair.
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setUser(user);
            resetToken.setExpiresAt(Instant.now().plusSeconds(30 * 60)); // 30 minutes
            passwordResetTokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetToken.getToken());
        });
        // Always respond as if it succeeded (prevents email enumeration).
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired reset link"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException("Invalid or expired reset link");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Invalidate all active sessions for safety.
        refreshTokenRepository.revokeAllForUser(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        String accessToken = jwtUtil.generateAccessToken(principal);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(jwtUtil.generateRefreshTokenValue());
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpirationMs()));
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .user(AuthResponse.UserSummary.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .profilePictureUrl(user.getProfilePictureUrl())
                        .build())
                .build();
    }
}
