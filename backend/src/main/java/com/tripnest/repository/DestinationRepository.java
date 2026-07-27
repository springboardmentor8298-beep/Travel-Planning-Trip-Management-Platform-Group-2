package com.tripnest.repository;

import com.tripnest.entity.Destination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DestinationRepository extends JpaRepository<Destination, Long> {

    @Query("""
            SELECT d FROM Destination d
            WHERE (:search IS NULL OR
                   LOWER(d.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(d.city) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(d.country) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:country IS NULL OR LOWER(d.country) = LOWER(:country))
            """)
    Page<Destination> search(@Param("search") String search, @Param("country") String country, Pageable pageable);
}
