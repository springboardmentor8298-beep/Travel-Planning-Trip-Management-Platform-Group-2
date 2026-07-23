package com.tripnest.controller;

import com.tripnest.model.User;
import com.tripnest.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    // Register User
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // Login User
    @PostMapping("/login")
    public User loginUser(@RequestBody User user) {

        User loggedUser = userService.loginUser(
                user.getEmail(),
                user.getPassword()
        );

        return loggedUser;
    }
}