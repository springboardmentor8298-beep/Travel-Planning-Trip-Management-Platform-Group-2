package com.tripnest.repository;

import com.tripnest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // Case-insensitive lookups - a real bug otherwise: inviting
    // "Sachin@Gmail.com" would fail to find a user registered as
    // "sachin@gmail.com" even though it's the same account.
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
}
