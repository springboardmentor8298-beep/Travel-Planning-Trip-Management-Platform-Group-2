package com.tripnest.service;

import com.tripnest.dto.ChangePasswordRequest;
import com.tripnest.dto.DestinationResponse;
import com.tripnest.dto.UserProfileResponse;
import com.tripnest.dto.UserProfileUpdateRequest;
import com.tripnest.entity.Destination;
import com.tripnest.entity.TripStatus;
import com.tripnest.entity.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final TripRepository tripRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        long totalTrips = tripRepository.countByUserId(userId);
        long completedTrips = tripRepository.countByUserIdAndStatus(userId, TripStatus.COMPLETED);

        return toProfileResponse(user, totalTrips, completedTrips);
    }

    public UserProfileResponse updateProfile(Long userId, UserProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) user.setLastName(request.getLastName().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getBio() != null) user.setBio(request.getBio().trim());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl().trim());
        if (request.getTravelPreferences() != null) user.setTravelPreferences(request.getTravelPreferences().trim());

        User saved = userRepository.save(user);
        long totalTrips = tripRepository.countByUserId(userId);
        long completedTrips = tripRepository.countByUserIdAndStatus(userId, TripStatus.COMPLETED);

        return toProfileResponse(saved, totalTrips, completedTrips);
    }

    public boolean toggleFavoriteDestination(Long userId, Long destinationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Destination destination = destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Destination not found"));

        boolean isFavorited;
        if (user.getFavoriteDestinations().contains(destination)) {
            user.getFavoriteDestinations().remove(destination);
            isFavorited = false;
        } else {
            user.getFavoriteDestinations().add(destination);
            isFavorited = true;
        }
        userRepository.save(user);
        return isFavorited;
    }

    @Transactional(readOnly = true)
    public Set<DestinationResponse> getFavoriteDestinations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return user.getFavoriteDestinations().stream()
                .map(this::toDestinationResponse)
                .collect(Collectors.toSet());
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileResponse toProfileResponse(User user, long totalTrips, long completedTrips) {
        Set<DestinationResponse> favs = user.getFavoriteDestinations().stream()
                .map(this::toDestinationResponse)
                .collect(Collectors.toSet());

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .travelPreferences(user.getTravelPreferences())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .favoriteDestinations(favs)
                .totalTrips(totalTrips)
                .completedTrips(completedTrips)
                .build();
    }

    private DestinationResponse toDestinationResponse(Destination d) {
        DestinationResponse res = new DestinationResponse();
        res.setId(d.getId());
        res.setName(d.getName());
        res.setCountry(d.getCountry());
        res.setDescription(d.getDescription());
        res.setClimate(d.getClimate());
        res.setBestTimeToVisit(d.getBestTimeToVisit());
        res.setPopularAttractions(d.getPopularAttractions());
        return res;
    }
}
