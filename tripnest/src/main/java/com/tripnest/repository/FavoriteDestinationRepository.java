package com.tripnest.repository;

import com.tripnest.entity.FavoriteDestination;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoriteDestinationRepository extends JpaRepository<FavoriteDestination, Long> {
    List<FavoriteDestination> findByUserEmail(String email);
    Optional<FavoriteDestination> findByUserEmailAndDestinationId(String email, Long destinationId);
}
