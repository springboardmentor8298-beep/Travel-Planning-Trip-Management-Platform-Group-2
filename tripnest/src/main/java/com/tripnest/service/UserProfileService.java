package com.tripnest.service;

import com.tripnest.dto.UserProfileRequest;
import com.tripnest.dto.UserProfileResponse;
import com.tripnest.entity.TripStatus;
import com.tripnest.entity.User;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserProfileService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalTrips = tripRepository.countByUserId(userId);
        long completedTrips = tripRepository.countByUserIdAndStatus(userId, TripStatus.COMPLETED);

        return mapToResponse(user, totalTrips, completedTrips);
    }

    public UserProfileResponse updateUserProfile(Long userId, UserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getTravelPreferences() != null) {
            user.setTravelPreferences(request.getTravelPreferences());
        }
        if (request.getFavoriteDestinations() != null) {
            user.setFavoriteDestinations(request.getFavoriteDestinations());
        }
        if (request.getProfileBio() != null) {
            user.setProfileBio(request.getProfileBio());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        User updatedUser = userRepository.save(user);

        long totalTrips = tripRepository.countByUserId(userId);
        long completedTrips = tripRepository.countByUserIdAndStatus(userId, TripStatus.COMPLETED);

        return mapToResponse(updatedUser, totalTrips, completedTrips);
    }

    public void updatePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserProfileResponse mapToResponse(User user, long totalTrips, long completedTrips) {
        Set<String> roles = user.getRoles() != null 
                ? user.getRoles().stream()
                        .map(role -> role.getName() != null ? role.getName().name() : "UNKNOWN")
                        .collect(Collectors.toSet())
                : Set.of();

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                roles,
                user.getTravelPreferences(),
                user.getFavoriteDestinations(),
                user.getProfileBio(),
                user.getAvatarUrl(),
                totalTrips,
                completedTrips
        );
    }
}
