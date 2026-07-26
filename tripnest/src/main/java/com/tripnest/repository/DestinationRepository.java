package com.tripnest.repository;

import com.tripnest.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for {@link Destination}.
 */
@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {

    List<Destination> findByNameContainingIgnoreCaseOrCountryContainingIgnoreCase(String name, String country);

    List<Destination> findByCountryIgnoreCase(String country);
}
