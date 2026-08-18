package com.tripnest.repository;

import com.tripnest.model.TripInvitation;
import com.tripnest.model.TripInvitation.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripInvitationRepository extends JpaRepository<TripInvitation, Long> {

    List<TripInvitation> findByInviteeEmailIgnoreCaseAndStatus(String email, Status status);

    List<TripInvitation> findByTripIdOrderByCreatedAtDesc(Long tripId);

    Optional<TripInvitation> findByTripIdAndInviteeEmailIgnoreCaseAndStatus(
            Long tripId, String email, Status status);
}
