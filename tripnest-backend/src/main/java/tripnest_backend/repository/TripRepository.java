package tripnest_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tripnest_backend.entity.Trip;

public interface TripRepository extends JpaRepository<Trip, Long> {
}
