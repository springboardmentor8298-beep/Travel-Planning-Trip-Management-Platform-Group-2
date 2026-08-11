package com.tripnest.repository;

import com.tripnest.entity.TripInvitation;
import com.tripnest.entity.TripInvitation.InvitationStatus;
import com.tripnest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripInvitationRepository extends JpaRepository<TripInvitation, Long> {

    List<TripInvitation> findByInviteeIdAndStatus(Long inviteeId, InvitationStatus status);

    List<TripInvitation> findByTripId(Long tripId);

    Optional<TripInvitation> findByTripIdAndInviteeId(Long tripId, Long inviteeId);

    List<TripInvitation> findByInviterId(Long inviterId);

    void deleteByTripIdAndInviteeId(Long tripId, Long inviteeId);
}
