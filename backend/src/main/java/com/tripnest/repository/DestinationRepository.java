package com.tripnest.repository;

import com.tripnest.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {
    Optional<Destination> findByCityAndCountry(String city, String country);
    List<Destination> findByCountry(String country);
    List<Destination> findByNameContainingIgnoreCase(String name);
}
