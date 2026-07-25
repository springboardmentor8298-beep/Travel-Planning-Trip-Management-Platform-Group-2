package com.tripnest.backend.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.LoginRequest;
import com.tripnest.backend.dto.RegisterRequest;
import com.tripnest.backend.dto.response.AuthResponse;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.Role;
import com.tripnest.backend.exception.DuplicateResourceException;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.security.JwtService;
import com.tripnest.backend.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    
    private final PasswordEncoder passwordEncoder;
    
    private final JwtService jwtService;
    
    private final AuthenticationManager authenticationManager;

    @Override
    public ApiResponse<AuthResponse> register(RegisterRequest request) {

    	log.info("Registering user with email: {}", request.getEmail());
    	
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.TRAVELER)
                .enabled(true)
                .build();

        userRepository.save(user);
        
        log.info("User registered successfully: {}", user.getEmail());

        String token = jwtService.generateToken(user.getEmail());

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Registration Successful")
                .data(authResponse)
                .build();
    }

    @Override
    public ApiResponse<AuthResponse> login(LoginRequest request) {

    	log.info("Login request for: {}", request.getEmail());
    	
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        String token = jwtService.generateToken(user.getEmail());

        AuthResponse response = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
        
        log.info("User logged in successfully: {}", user.getEmail());

        return ApiResponse.<AuthResponse>builder()
                .success(true)
                .message("Login Successful")
                .data(response)
                .build();
    }
}