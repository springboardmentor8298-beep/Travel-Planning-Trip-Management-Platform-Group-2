package tripnest_backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import tripnest_backend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
}
