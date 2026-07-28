package tripnest_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tripnest_backend.entity.Itinerary;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
}
