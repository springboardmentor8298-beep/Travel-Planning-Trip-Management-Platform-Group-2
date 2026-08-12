package com.tripnest.backend.service;

import com.tripnest.backend.model.UserEntity;
import com.tripnest.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public UserService(UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<UserEntity> getUserById(String id) {
        return userRepository.findById(id);
    }

    @Transactional
    public UserEntity loginOrRegisterGoogle(String email, String name, String photoUrl) {
        Optional<UserEntity> existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            UserEntity user = existing.get();
            if (name != null) user.setName(name);
            if (photoUrl != null) user.setPhotoUrl(photoUrl);
            return userRepository.save(user);
        }

        UserEntity newUser = new UserEntity(
            "user_" + UUID.randomUUID().toString().substring(0, 8),
            name != null ? name : "Traveler",
            email,
            photoUrl != null ? photoUrl : null,
            "A-" + (10000000 + (int)(Math.random() * 89999999)),
            "INR",
            "Avid Explorer & World Traveler",
            "EMAIL",
            "ROLE_TRAVELER"
        );
        UserEntity saved = userRepository.save(newUser);
        messagingTemplate.convertAndSend("/topic/users", saved);
        return saved;
    }

    @Transactional
    public UserEntity updateUserProfile(UserEntity user) {
        UserEntity saved = userRepository.save(user);
        messagingTemplate.convertAndSend("/topic/users", saved);
        return saved;
    }

    @Transactional
    public void deleteAccount(String userId) {
        userRepository.deleteById(userId);
        messagingTemplate.convertAndSend("/topic/users/delete", userId);
    }
}
