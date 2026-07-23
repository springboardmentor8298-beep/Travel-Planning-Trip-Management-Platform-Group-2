package com.tripnest.controller;

import com.tripnest.dto.AuthResponse;
import com.tripnest.dto.LoginRequest;
import com.tripnest.dto.RegisterRequest;
import com.tripnest.model.User;
import com.tripnest.security.JwtService;
import com.tripnest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    // Register User
    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        return userService.registerUser(user);
    }

    // Login User
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        User user = userService.loginUser(
                request.getEmail(),
                request.getPassword()
        );

        if (user == null) {
            throw new RuntimeException("Invalid Email or Password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, user);
    }
}