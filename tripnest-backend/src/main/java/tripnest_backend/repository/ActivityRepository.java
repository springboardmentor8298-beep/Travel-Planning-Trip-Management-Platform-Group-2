package tripnest_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tripnest_backend.entity.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
}
