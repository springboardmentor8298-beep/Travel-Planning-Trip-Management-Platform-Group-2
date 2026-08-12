package com.tripnest.backend.service;

import com.tripnest.backend.model.UserEntity;
import com.tripnest.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private UserService userService;

    private UserEntity mockUser;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, messagingTemplate);
        mockUser = new UserEntity();
        mockUser.setId("user_123");
        mockUser.setName("Test Traveler");
        mockUser.setEmail("traveler@tripnest.com");
        mockUser.setRole("ROLE_TRAVELER");
    }

    @Test
    void testGoogleLoginOrRegister_Success() {
        when(userRepository.findByEmail("traveler@tripnest.com")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(UserEntity.class))).thenReturn(mockUser);

        UserEntity user = userService.loginOrRegisterGoogle("traveler@tripnest.com", "Test Traveler", "http://photo.url");

        assertNotNull(user);
        assertEquals("traveler@tripnest.com", user.getEmail());
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void testGetAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(List.of(mockUser));

        List<UserEntity> users = userService.getAllUsers();

        assertFalse(users.isEmpty());
        assertEquals(1, users.size());
    }

    @Test
    void testGetUserById_Success() {
        when(userRepository.findById("user_123")).thenReturn(Optional.of(mockUser));

        Optional<UserEntity> found = userService.getUserById("user_123");

        assertTrue(found.isPresent());
        assertEquals("Test Traveler", found.get().getName());
    }
}
