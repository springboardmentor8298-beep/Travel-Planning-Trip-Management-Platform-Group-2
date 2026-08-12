package com.tripnest.repository;

import com.tripnest.model.GroupInvitation;
import com.tripnest.model.GroupInvitation.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Long> {

    /** Pending invitations for a specific user email (for the "accept/reject" UI) */
    List<GroupInvitation> findByInviteeEmailIgnoreCaseAndStatus(String email, Status status);

    /** All invitations for a specific group (for the invitation history tab) */
    List<GroupInvitation> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    /** Check duplicate: don't resend a PENDING invite to same email+group */
    Optional<GroupInvitation> findByGroupIdAndInviteeEmailIgnoreCaseAndStatus(
            Long groupId, String inviteeEmail, Status status);
}
