package com.tripnest.service;

import com.tripnest.dto.UserProfileResponse;
import com.tripnest.dto.UserProfileUpdateRequest;
import com.tripnest.entity.Destination;
import com.tripnest.entity.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private TripRepository tripRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private Destination testDestination;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("alice");
        testUser.setEmail("alice@example.com");
        testUser.setPassword("encodedPass");
        testUser.setFavoriteDestinations(new HashSet<>());

        testDestination = new Destination();
        testDestination.setId(10L);
        testDestination.setName("Kyoto");
        testDestination.setCountry("Japan");
    }

    @Test
    void testGetUserProfile_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(tripRepository.countByUserId(1L)).thenReturn(4L);
        when(tripRepository.countByUserIdAndStatus(1L, com.tripnest.entity.TripStatus.COMPLETED)).thenReturn(2L);

        UserProfileResponse response = userService.getUserProfile(1L);

        assertNotNull(response);
        assertEquals("alice", response.getUsername());
        assertEquals(4L, response.getTotalTrips());
        assertEquals(2L, response.getCompletedTrips());
    }

    @Test
    void testUpdateProfile_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserProfileUpdateRequest req = new UserProfileUpdateRequest();
        req.setFirstName("Alice");
        req.setLastName("Wonder");
        req.setBio("Adventurer");
        req.setTravelPreferences("Adventure, Beach");

        UserProfileResponse res = userService.updateProfile(1L, req);

        assertNotNull(res);
        assertEquals("Alice", res.getFirstName());
        assertEquals("Wonder", res.getLastName());
        assertEquals("Adventurer", res.getBio());
    }

    @Test
    void testToggleFavoriteDestination_AddAndRemove() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(destinationRepository.findById(10L)).thenReturn(Optional.of(testDestination));

        // First toggle: Add to favorites
        boolean favorited = userService.toggleFavoriteDestination(1L, 10L);
        assertTrue(favorited);
        assertTrue(testUser.getFavoriteDestinations().contains(testDestination));

        // Second toggle: Remove from favorites
        boolean favoritedAgain = userService.toggleFavoriteDestination(1L, 10L);
        assertFalse(favoritedAgain);
        assertFalse(testUser.getFavoriteDestinations().contains(testDestination));
    }
}
