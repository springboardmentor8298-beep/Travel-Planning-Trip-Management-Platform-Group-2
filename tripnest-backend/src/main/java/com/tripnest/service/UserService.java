package com.tripnest.service;

import com.tripnest.model.User;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Register User
    public User registerUser(User user) {

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    // Login User
    public User loginUser(String email, String password) {

        System.out.println("========== LOGIN DEBUG ==========");
        System.out.println("Email from React : " + email);
        System.out.println("Password from React : " + password);

        User dbUser = userRepository.findByEmail(email);

        if (dbUser == null) {
            System.out.println("❌ User NOT FOUND in database");
            System.out.println("================================");
            return null;
        }

        System.out.println("✅ User Found");
        System.out.println("Database Email : " + dbUser.getEmail());
        System.out.println("Database Password : " + dbUser.getPassword());

        boolean passwordMatch = passwordEncoder.matches(password, dbUser.getPassword());

        System.out.println("Password Match : " + passwordMatch);
        System.out.println("================================");

        if (passwordMatch) {
            return dbUser;
        }

        return null;
    }
}