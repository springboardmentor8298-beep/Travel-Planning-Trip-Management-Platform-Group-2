package com.tripnest.service;

import com.tripnest.dto.GroupMessageResponse;
import com.tripnest.dto.GroupRequest;
import com.tripnest.dto.GroupResponse;
import com.tripnest.dto.InvitationResponse;
import com.tripnest.exception.AccessDeniedCustomException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.GroupInvitation;
import com.tripnest.model.GroupMessage;
import com.tripnest.model.Notification;
import com.tripnest.model.TravelGroup;
import com.tripnest.model.User;
import com.tripnest.repository.GroupInvitationRepository;
import com.tripnest.repository.GroupMessageRepository;
import com.tripnest.repository.TravelGroupRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {

    private final TravelGroupRepository groupRepo;
    private final GroupInvitationRepository invitationRepo;
    private final GroupMessageRepository messageRepo;
    private final UserRepository userRepo;
    private final NotificationService notifService;

    public GroupService(TravelGroupRepository groupRepo,
                        GroupInvitationRepository invitationRepo,
                        GroupMessageRepository messageRepo,
                        UserRepository userRepo,
                        NotificationService notifService) {
        this.groupRepo      = groupRepo;
        this.invitationRepo = invitationRepo;
        this.messageRepo    = messageRepo;
        this.userRepo       = userRepo;
        this.notifService   = notifService;
    }

    /* ── Create group ── */
    public GroupResponse createGroup(String ownerEmail, GroupRequest request) {
        User owner = findUserByEmail(ownerEmail);
        TravelGroup group = new TravelGroup();
        group.setName(request.getName().trim());
        group.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        group.setOwner(owner);
        group.getMembers().add(owner);
        groupRepo.save(group);
        return GroupResponse.fromEntity(group);
    }

    /* ── Get all groups for the current user ── */
    @Transactional(readOnly = true)
    public List<GroupResponse> getMyGroups(String email) {
        User user = findUserByEmail(email);
        return groupRepo.findAllForUser(user.getId())
                .stream()
                .map(GroupResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /* ── Get a single group ── */
    @Transactional(readOnly = true)
    public GroupResponse getGroup(String email, Long groupId) {
        TravelGroup group = findGroupOrThrow(groupId);
        assertMemberOrOwner(email, group);
        return GroupResponse.fromEntity(group);
    }

    /* ── Invite multiple members by email ── */
    public List<InvitationResponse> inviteMembers(String inviterEmail, Long groupId, List<String> emails) {
        User inviter = findUserByEmail(inviterEmail);
        TravelGroup group = findGroupOrThrow(groupId);
        assertMemberOrOwner(inviterEmail, group);

        List<InvitationResponse> results = new ArrayList<>();

        for (String rawEmail : emails) {
            String email = rawEmail.trim().toLowerCase();
            if (email.isEmpty()) continue;

            // Skip duplicate PENDING invite
            Optional<GroupInvitation> existing = invitationRepo
                    .findByGroupIdAndInviteeEmailIgnoreCaseAndStatus(groupId, email, GroupInvitation.Status.PENDING);
            if (existing.isPresent()) {
                results.add(InvitationResponse.fromEntity(existing.get()));
                continue;
            }

            Optional<User> inviteeUser = userRepo.findByEmail(email);
            if (inviteeUser.isPresent()) {
                boolean alreadyMember = group.getMembers().stream()
                        .anyMatch(m -> m.getEmail().equalsIgnoreCase(email));
                if (alreadyMember) continue;
            }

            GroupInvitation inv = new GroupInvitation();
            inv.setGroup(group);
            inv.setInvitedBy(inviter);
            inv.setInviteeEmail(email);
            inv.setInvitee(inviteeUser.orElse(null));
            inv.setStatus(GroupInvitation.Status.PENDING);
            invitationRepo.save(inv);

            // Notify the invitee if they have an account
            notifService.createForEmail(
                email,
                Notification.Type.GROUP_INVITATION,
                "You're invited to join \"" + group.getName() + "\"",
                inviter.getFullName() + " invited you to join the travel group \"" + group.getName() + "\".",
                "/groups"
            );

            results.add(InvitationResponse.fromEntity(inv));
        }
        return results;
    }

    /* ── Get pending invitations for the current user ── */
    @Transactional(readOnly = true)
    public List<InvitationResponse> getMyPendingInvitations(String email) {
        return invitationRepo
                .findByInviteeEmailIgnoreCaseAndStatus(email, GroupInvitation.Status.PENDING)
                .stream()
                .map(InvitationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /* ── Get all invitations for a group (with status) ── */
    @Transactional(readOnly = true)
    public List<InvitationResponse> getGroupInvitations(String email, Long groupId) {
        TravelGroup group = findGroupOrThrow(groupId);
        assertMemberOrOwner(email, group);
        return invitationRepo.findByGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(InvitationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /* ── Accept or reject an invitation ── */
    public InvitationResponse respondToInvitation(String email, Long invitationId, boolean accept) {
        GroupInvitation inv = invitationRepo.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (!inv.getInviteeEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedCustomException("This invitation is not for you");
        }
        if (inv.getStatus() != GroupInvitation.Status.PENDING) {
            throw new IllegalStateException("Invitation has already been responded to");
        }

        inv.setStatus(accept ? GroupInvitation.Status.ACCEPTED : GroupInvitation.Status.REJECTED);
        inv.setRespondedAt(LocalDateTime.now());

        String inviterEmail  = inv.getInvitedBy().getEmail();
        String groupName     = inv.getGroup().getName();
        Long   groupId       = inv.getGroup().getId();
        String responderName = inv.getInvitee() != null
                ? inv.getInvitee().getFullName()
                : inv.getInviteeEmail();

        if (accept) {
            User user = findUserByEmail(email);
            TravelGroup group = inv.getGroup();
            boolean notAlready = group.getMembers().stream()
                    .noneMatch(m -> m.getId().equals(user.getId()));
            if (notAlready) {
                group.getMembers().add(user);
                groupRepo.save(group);
            }

            // Notify inviter that invitation was accepted
            notifService.createForEmail(
                inviterEmail,
                Notification.Type.INVITATION_ACCEPTED,
                responderName + " accepted your invitation",
                responderName + " has joined \"" + groupName + "\". Your group now has " + (group.getMembers().size()) + " member(s).",
                "/groups/" + groupId
            );

            // Notify all other existing members about the new member
            for (User member : group.getMembers()) {
                if (!member.getEmail().equalsIgnoreCase(email)
                        && !member.getEmail().equalsIgnoreCase(inviterEmail)) {
                    notifService.create(
                        member,
                        Notification.Type.GROUP_MEMBER_JOINED,
                        responderName + " joined \"" + groupName + "\"",
                        responderName + " is now part of your travel group.",
                        "/groups/" + groupId
                    );
                }
            }

        } else {
            // Notify inviter that invitation was rejected
            notifService.createForEmail(
                inviterEmail,
                Notification.Type.INVITATION_REJECTED,
                responderName + " declined your invitation",
                responderName + " has declined the invitation to join \"" + groupName + "\".",
                "/groups"
            );
        }

        invitationRepo.save(inv);
        return InvitationResponse.fromEntity(inv);
    }

    /* ── Remove a member ── */
    public GroupResponse removeMember(String ownerEmail, Long groupId, Long memberId) {
        TravelGroup group = findGroupOrThrow(groupId);
        assertOwner(ownerEmail, group);
        group.getMembers().removeIf(m -> m.getId().equals(memberId));
        groupRepo.save(group);
        return GroupResponse.fromEntity(group);
    }

    /* ── Messages ── */
    @Transactional(readOnly = true)
    public List<GroupMessageResponse> getMessages(String email, Long groupId) {
        TravelGroup group = findGroupOrThrow(groupId);
        assertMemberOrOwner(email, group);
        return messageRepo.findByGroupIdOrderByCreatedAtAsc(groupId)
                .stream()
                .map(GroupMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public GroupMessageResponse postMessage(String email, Long groupId, String content) {
        User sender = findUserByEmail(email);
        TravelGroup group = findGroupOrThrow(groupId);
        assertMemberOrOwner(email, group);

        GroupMessage msg = new GroupMessage();
        msg.setGroup(group);
        msg.setSender(sender);
        msg.setContent(content.trim());
        messageRepo.save(msg);
        return GroupMessageResponse.fromEntity(msg);
    }

    /* ── Helpers ── */
    private User findUserByEmail(String email) {
        return userRepo.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private TravelGroup findGroupOrThrow(Long id) {
        return groupRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
    }

    private void assertOwner(String email, TravelGroup group) {
        if (!group.getOwner().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedCustomException("Only the group owner can perform this action");
        }
    }

    private void assertMemberOrOwner(String email, TravelGroup group) {
        boolean isOwner  = group.getOwner().getEmail().equalsIgnoreCase(email);
        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getEmail().equalsIgnoreCase(email));
        if (!isOwner && !isMember) {
            throw new AccessDeniedCustomException("You are not a member of this group");
        }
    }
}
