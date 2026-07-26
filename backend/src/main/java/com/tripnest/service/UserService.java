package com.tripnest.service;

import com.tripnest.dto.UpdateProfileRequest;
import com.tripnest.dto.UserProfileResponse;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.User;
import com.tripnest.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserProfileResponse getProfile(String email) {
        return UserProfileResponse.fromEntity(getUserByEmail(email));
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getTravelPreferences() != null) user.setTravelPreferences(request.getTravelPreferences());
        if (request.getFavoriteDestinations() != null) user.setFavoriteDestinations(request.getFavoriteDestinations());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfilePictureUrl() != null) user.setProfilePictureUrl(request.getProfilePictureUrl());

        userRepository.save(user);
        return UserProfileResponse.fromEntity(user);
    }

    // Admin-only: list all users (Roles module)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserProfileResponse::fromEntity)
                .toList();
    }

    public long countUsers() {
        return userRepository.count();
    }
}
