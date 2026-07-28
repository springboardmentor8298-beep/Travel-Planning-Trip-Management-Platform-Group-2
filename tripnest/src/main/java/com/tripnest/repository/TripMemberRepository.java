package com.tripnest.repository;
import com.tripnest.entity.TripMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface TripMemberRepository extends JpaRepository<TripMember,Long> {
 List<TripMember> findByTripId(Long tripId);
 Optional<TripMember> findByTripIdAndUserEmail(Long tripId,String email);
}
