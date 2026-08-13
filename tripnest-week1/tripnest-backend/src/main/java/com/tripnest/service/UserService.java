package com.tripnest.service;

import com.tripnest.dto.ChangePasswordRequest;
import com.tripnest.dto.UpdateProfileRequest;
import com.tripnest.dto.UserProfileResponse;
import com.tripnest.entity.Role;
import com.tripnest.entity.User;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile(String email) {
        User user = findUserOrThrow(email);
        return toProfileResponse(user);
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserOrThrow(email);
        user.setFullName(request.getFullName());
        userRepository.save(user);
        return toProfileResponse(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findUserOrThrow(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRoles().stream().map(Role::getName).map(Enum::name).collect(Collectors.toSet())
        );
    }
}
