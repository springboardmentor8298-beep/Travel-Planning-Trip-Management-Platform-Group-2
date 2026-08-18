package com.tripnest.service;

import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.LoginRequest;
import com.tripnest.dto.RegisterRequest;
import com.tripnest.exception.DuplicateResourceException;
import com.tripnest.model.Role;
import com.tripnest.model.User;
import com.tripnest.repository.EmailVerificationTokenRepository;
import com.tripnest.repository.PasswordResetTokenRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock UserRepository               userRepository;
    @Mock PasswordEncoder              passwordEncoder;
    @Mock JwtUtil                      jwtUtil;
    @Mock AuthenticationManager        authenticationManager;
    @Mock PasswordResetTokenRepository resetTokenRepo;
    @Mock EmailVerificationTokenRepository verifyTokenRepo;
    @Mock JavaMailSender               mailSender;

    @InjectMocks AuthService authService;

    private RegisterRequest registerRequest;
    private User             savedUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setPhone("9999999999");

        savedUser = new User();
        savedUser.setId(1L);
        savedUser.setFullName("Test User");
        savedUser.setEmail("test@example.com");
        savedUser.setPassword("encoded_password");
        savedUser.setRole(Role.TRAVELER);
    }

    /* ── Registration ── */

    @Test
    @DisplayName("register: should create user and return JWT token")
    void register_success() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(anyString(), any(), anyString())).thenReturn("jwt-token");
        doNothing().when(mailSender).send(any(org.springframework.mail.SimpleMailMessage.class));
        when(verifyTokenRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getFullName()).isEqualTo("Test User");
        assertThat(response.getRole()).isEqualTo("TRAVELER");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register: should throw DuplicateResourceException for existing email")
    void register_duplicateEmail_throwsException() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("register: should encode the password before saving")
    void register_passwordIsEncoded() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("tok");
        doNothing().when(mailSender).send(any(org.springframework.mail.SimpleMailMessage.class));
        when(verifyTokenRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        authService.register(registerRequest);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("hashed");
    }

    /* ── Login ── */

    @Test
    @DisplayName("login: should authenticate and return JWT token")
    void login_success() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(savedUser));
        when(jwtUtil.generateToken(anyString(), any(), anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    @DisplayName("login: should use lowercase email for lookup")
    void login_emailLowercased() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("TEST@EXAMPLE.COM");
        loginRequest.setPassword("password123");

        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(savedUser));
        when(jwtUtil.generateToken(anyString(), anyLong(), anyString())).thenReturn("tok");

        authService.login(loginRequest);

        verify(userRepository).findByEmail("test@example.com");
    }

    /* ── Reset password ── */

    @Test
    @DisplayName("resetPassword: should throw for password shorter than 6 chars")
    void resetPassword_tooShort_throws() {
        com.tripnest.model.PasswordResetToken prt = new com.tripnest.model.PasswordResetToken();
        prt.setToken("token123");
        prt.setUser(savedUser);
        prt.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(30));

        when(resetTokenRepo.findByToken("token123")).thenReturn(Optional.of(prt));

        assertThatThrownBy(() -> authService.resetPassword("token123", "abc"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("at least 6");
    }
}
