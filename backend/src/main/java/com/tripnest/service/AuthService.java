package com.tripnest.service;

import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.LoginRequest;
import com.tripnest.dto.RegisterRequest;
import com.tripnest.exception.DuplicateResourceException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.EmailVerificationToken;
import com.tripnest.model.PasswordResetToken;
import com.tripnest.model.Role;
import com.tripnest.model.User;
import com.tripnest.repository.EmailVerificationTokenRepository;
import com.tripnest.repository.PasswordResetTokenRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository                  userRepository;
    private final PasswordEncoder                 passwordEncoder;
    private final JwtUtil                         jwtUtil;
    private final AuthenticationManager           authenticationManager;
    private final PasswordResetTokenRepository    resetTokenRepo;
    private final EmailVerificationTokenRepository verifyTokenRepo;
    private final JavaMailSender                  mailSender;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.password-reset.expiry-minutes:30}")
    private int resetExpiryMinutes;

    @Value("${spring.mail.username:noreply@tripnest.com}")
    private String fromEmail;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       PasswordResetTokenRepository resetTokenRepo,
                       EmailVerificationTokenRepository verifyTokenRepo,
                       JavaMailSender mailSender) {
        this.userRepository       = userRepository;
        this.passwordEncoder      = passwordEncoder;
        this.jwtUtil              = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.resetTokenRepo       = resetTokenRepo;
        this.verifyTokenRepo      = verifyTokenRepo;
        this.mailSender           = mailSender;
    }

    /* ── Register ── */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(Role.TRAVELER);
        user.setEmailVerified(false);
        userRepository.save(user);

        // Send confirmation email (non-blocking — failure doesn't stop registration)
        try {
            sendVerificationEmail(user);
        } catch (Exception e) {
            // Log but don't fail registration if email sending fails
            System.err.println("[TripNest] Warning: could not send verification email to "
                    + user.getEmail() + ": " + e.getMessage());
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getFullName(),
                user.getEmail(), user.getRole().name(), user.isEmailVerified());
    }

    /* ── Login ── */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail().toLowerCase(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getFullName(),
                user.getEmail(), user.getRole().name(), user.isEmailVerified());
    }

    /* ── Send verification email ── */
    private void sendVerificationEmail(User user) {
        String rawToken = UUID.randomUUID().toString();
        EmailVerificationToken evt = new EmailVerificationToken(rawToken, user);
        verifyTokenRepo.save(evt);

        String verifyLink = frontendUrl + "/verify-email?token=" + rawToken;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(user.getEmail());
        msg.setSubject("TripNest — Verify Your Email Address");
        msg.setText(
            "Hi " + user.getFullName() + ",\n\n" +
            "Welcome to TripNest! Please verify your email address by clicking the link below:\n\n" +
            verifyLink + "\n\n" +
            "This link does not expire. If you did not create a TripNest account, you can safely ignore this email.\n\n" +
            "Happy travels!\n" +
            "— The TripNest Team"
        );
        mailSender.send(msg);
    }

    /* ── Verify email ── */
    public String verifyEmail(String rawToken) {
        EmailVerificationToken evt = verifyTokenRepo.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification link."));

        if (evt.isUsed()) {
            return "already_verified";
        }

        User user = evt.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        evt.setUsed(true);
        verifyTokenRepo.save(evt);

        return "verified";
    }

    /* ── Resend verification email ── */
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email."));

        if (user.isEmailVerified()) {
            throw new IllegalStateException("Email is already verified.");
        }

        sendVerificationEmail(user);
    }

    /* ── Forgot password: generate token + send email ── */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with email: " + email));

        resetTokenRepo.invalidateAllForUser(user.getId());

        String rawToken = UUID.randomUUID().toString();
        PasswordResetToken prt = new PasswordResetToken(
                rawToken, user, LocalDateTime.now().plusMinutes(resetExpiryMinutes));
        resetTokenRepo.save(prt);

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromEmail);
        msg.setTo(user.getEmail());
        msg.setSubject("TripNest — Reset Your Password");
        msg.setText(
            "Hi " + user.getFullName() + ",\n\n" +
            "We received a request to reset the password for your TripNest account.\n\n" +
            "Click the link below to set a new password (valid for " + resetExpiryMinutes + " minutes):\n\n" +
            resetLink + "\n\n" +
            "If you did not request this, you can safely ignore this email.\n\n" +
            "— The TripNest Team"
        );
        mailSender.send(msg);
    }

    /* ── Reset password: validate token + update password ── */
    public void resetPassword(String rawToken, String newPassword) {
        PasswordResetToken prt = resetTokenRepo.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link."));

        if (prt.isUsed()) {
            throw new IllegalArgumentException("This reset link has already been used.");
        }
        if (prt.isExpired()) {
            throw new IllegalArgumentException(
                    "This reset link has expired. Please request a new one.");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        prt.setUsed(true);
        resetTokenRepo.save(prt);
    }
}
