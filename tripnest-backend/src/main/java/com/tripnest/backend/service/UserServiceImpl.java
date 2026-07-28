package com.tripnest.backend.service;

import com.tripnest.backend.dto.RegisterRequest;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tripnest.backend.dto.LoginResponse;
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public User register(RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Encrypt password before saving
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole(request.getRole());

        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (passwordEncoder.matches(password, user.getPassword())) {

            String token = jwtService.generateToken(user.getEmail());

            return new LoginResponse(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getEmail()
            );
        }

        throw new RuntimeException("Invalid password");
    }
}