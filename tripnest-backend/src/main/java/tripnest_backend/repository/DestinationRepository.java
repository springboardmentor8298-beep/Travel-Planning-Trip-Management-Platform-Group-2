package tripnest_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tripnest_backend.entity.Destination;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
}
