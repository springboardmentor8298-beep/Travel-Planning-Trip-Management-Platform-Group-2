package com.tripnest.backend.controller;

import com.tripnest.backend.dto.RegisterRequest;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

import com.tripnest.backend.dto.LoginRequest;
import com.tripnest.backend.dto.LoginResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {


    private final UserService userService;


    public AuthController(UserService userService) {
        this.userService = userService;
    }


    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request){

        return userService.register(request);

    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request){

        return userService.login(
            request.getEmail(),
            request.getPassword()
        );
    }

}