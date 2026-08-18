package com.tripnest.service;

import com.tripnest.entity.PasswordResetToken;
import com.tripnest.entity.User;
import com.tripnest.repository.PasswordResetTokenRepository;
import com.tripnest.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${tripnest.app.frontendUrl}")
    private String frontendUrl;

    @Value("${tripnest.app.resetTokenExpirationMinutes:15}")
    private long expirationMinutes;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            JavaMailSender mailSender,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    // ==========================================
    // FORGOT PASSWORD
    // ==========================================

    @Transactional
    public void forgotPassword(String email) {

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findAll()
                        .stream()
                        .filter(u ->
                                u.getEmail() != null &&
                                u.getEmail()
                                        .equalsIgnoreCase(normalizedEmail))
                        .findFirst()
                        .orElse(null);

        /*
         * Important:
         * Do not reveal whether an email exists.
         */

        if (user == null) {
            return;
        }

        // Remove previous reset tokens
        tokenRepository.deleteByUser(user);

        // Generate secure random token
        String token =
                UUID.randomUUID().toString();

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setToken(token);
        resetToken.setUser(user);

        resetToken.setExpiryDate(
                LocalDateTime.now()
                        .plusMinutes(expirationMinutes)
        );

        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        // Create reset URL
        String resetUrl =
                frontendUrl +
                "/reset-password?token=" +
                token;

        sendResetEmail(
                user.getEmail(),
                user.getFirstName(),
                resetUrl
        );
    }

    // ==========================================
    // SEND EMAIL
    // ==========================================

    private void sendResetEmail(
            String email,
            String firstName,
            String resetUrl) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "TripNest - Reset Your Password"
        );

        String name =
                firstName != null &&
                !firstName.isBlank()
                        ? firstName
                        : "Traveler";

        message.setText(
                "Hello " + name + ",\n\n" +

                "We received a request to reset " +
                "your TripNest password.\n\n" +

                "Click the link below to reset " +
                "your password:\n\n" +

                resetUrl + "\n\n" +

                "This link will expire in " +
                expirationMinutes +
                " minutes.\n\n" +

                "If you did not request a password reset, " +
                "you can safely ignore this email.\n\n" +

                "Regards,\n" +
                "TripNest Team"
        );

        mailSender.send(message);
    }

    // ==========================================
    // RESET PASSWORD
    // ==========================================

    @Transactional
    public void resetPassword(
            String token,
            String newPassword) {

        PasswordResetToken resetToken =
                tokenRepository
                        .findByToken(token)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid password reset token"
                                )
                        );

        // Check if already used
        if (resetToken.isUsed()) {

            throw new RuntimeException(
                    "This password reset link has already been used"
            );
        }

        // Check expiry
        if (resetToken.getExpiryDate()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "This password reset link has expired"
            );
        }

        User user =
                resetToken.getUser();

        // Encrypt new password
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);

        tokenRepository.save(resetToken);
    }
}