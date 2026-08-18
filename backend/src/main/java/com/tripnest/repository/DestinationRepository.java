package com.tripnest.repository;

import com.tripnest.model.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long> {

    List<Destination> findByCountryIgnoreCaseOrderByNameAsc(String country);

    List<Destination> findByTypeIgnoreCaseOrderByNameAsc(String type);

    @Query("SELECT d FROM Destination d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(d.country) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(d.type) LIKE LOWER(CONCAT('%',:q,'%')) " +
           "ORDER BY d.name ASC")
    List<Destination> search(@Param("q") String query);

    List<Destination> findAllByOrderByCreatedAtDesc();
}
