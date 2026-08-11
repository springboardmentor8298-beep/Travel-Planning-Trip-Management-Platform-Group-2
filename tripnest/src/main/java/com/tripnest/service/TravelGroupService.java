package com.tripnest.service;

import com.tripnest.dto.GroupMemberResponse;
import com.tripnest.dto.TravelGroupRequest;
import com.tripnest.dto.TravelGroupResponse;
import com.tripnest.entity.GroupMember;
import com.tripnest.entity.GroupRole;
import com.tripnest.entity.TravelGroup;
import com.tripnest.entity.User;
import com.tripnest.repository.TravelGroupRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TravelGroupService {

    private final TravelGroupRepository travelGroupRepository;
    private final UserRepository userRepository;

    public TravelGroupResponse createGroup(Long adminId, TravelGroupRequest request) {
        try {
            User admin = userRepository.findById(adminId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            TravelGroup group = new TravelGroup();
            group.setName(request.getName());
            group.setDescription(request.getDescription());
            group.setAdmin(admin);

            TravelGroup savedGroup = travelGroupRepository.save(group);

            // Add admin as a member with ADMIN role
            GroupMember adminMember = new GroupMember();
            adminMember.setTravelGroup(savedGroup);
            adminMember.setUser(admin);
            adminMember.setRole(GroupRole.ADMIN);
            savedGroup.getMembers().add(adminMember);

            TravelGroup finalGroup = travelGroupRepository.save(savedGroup);
            return mapToResponse(finalGroup);
        } catch (Exception e) {
            System.err.println("Error in createGroup service: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create group: " + e.getMessage(), e);
        }
    }

    public TravelGroupResponse updateGroup(Long groupId, TravelGroupRequest request) {
        TravelGroup group = travelGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.setName(request.getName());
        group.setDescription(request.getDescription());

        TravelGroup updatedGroup = travelGroupRepository.save(group);
        return mapToResponse(updatedGroup);
    }

    public void deleteGroup(Long groupId) {
        travelGroupRepository.deleteById(groupId);
    }

    public TravelGroupResponse getGroup(Long groupId) {
        TravelGroup group = travelGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return mapToResponse(group);
    }

    /**
     * Returns all groups where the user is either admin OR a member.
     * De-duplicated by group ID.
     */
    public List<TravelGroupResponse> getUserGroups(Long userId) {
        try {
            // Groups where user is admin
            List<TravelGroup> adminGroups = travelGroupRepository.findByAdminIdOrderByCreatedAtDesc(userId);
            // Groups where user is a member (includes admin groups too, but we dedup below)
            List<TravelGroup> memberGroups = travelGroupRepository.findGroupsByMemberUserId(userId);

            // Merge and deduplicate by group ID
            Map<Long, TravelGroup> deduped = new LinkedHashMap<>();
            for (TravelGroup g : adminGroups) deduped.put(g.getId(), g);
            for (TravelGroup g : memberGroups) deduped.putIfAbsent(g.getId(), g);

            List<TravelGroupResponse> responses = new ArrayList<>();
            for (TravelGroup group : deduped.values()) {
                if (group.getAdmin() != null) group.getAdmin().getId();
                if (group.getMembers() != null) group.getMembers().size();
                responses.add(mapToResponse(group));
            }
            return responses;
        } catch (Exception e) {
            System.err.println("Error fetching user groups: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    public void addMemberToGroup(Long groupId, Long userId) {
        TravelGroup group = travelGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));

        if (isMember) {
            throw new RuntimeException("User is already a member of this group");
        }

        GroupMember member = new GroupMember();
        member.setTravelGroup(group);
        member.setUser(user);
        member.setRole(GroupRole.MEMBER);

        group.getMembers().add(member);
        travelGroupRepository.save(group);
    }

    /**
     * Adds a user to a group by their username (instead of numeric ID).
     */
    public void addMemberToGroupByUsername(Long groupId, String username) {
        TravelGroup group = travelGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));

        boolean isMember = group.getMembers().stream()
                .anyMatch(m -> m.getUser().getId().equals(user.getId()));

        if (isMember) {
            throw new RuntimeException("User '" + username + "' is already a member of this group");
        }

        GroupMember member = new GroupMember();
        member.setTravelGroup(group);
        member.setUser(user);
        member.setRole(GroupRole.MEMBER);

        group.getMembers().add(member);
        travelGroupRepository.save(group);
    }

    public void removeMemberFromGroup(Long groupId, Long userId) {
        TravelGroup group = travelGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.getMembers().removeIf(member -> member.getUser().getId().equals(userId));
        travelGroupRepository.save(group);
    }

    public void updateMemberRole(Long groupId, Long userId, GroupRole newRole) {
        TravelGroup group = travelGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        GroupMember member = group.getMembers().stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Member not found in group"));

        member.setRole(newRole);
        travelGroupRepository.save(group);
    }

    private TravelGroupResponse mapToResponse(TravelGroup group) {
        List<GroupMemberResponse> memberResponses = group.getMembers().stream()
                .map(member -> new GroupMemberResponse(
                        member.getId(),
                        member.getUser().getId(),
                        member.getUser().getUsername(),
                        member.getUser().getFirstName(),
                        member.getUser().getLastName(),
                        member.getRole().name(),
                        member.getJoinedAt()
                ))
                .collect(Collectors.toList());

        String adminName = "Unknown";
        Long adminId = null;
        if (group.getAdmin() != null) {
            adminId = group.getAdmin().getId();
            adminName = (group.getAdmin().getFirstName() != null ? group.getAdmin().getFirstName() : "") +
                       " " +
                       (group.getAdmin().getLastName() != null ? group.getAdmin().getLastName() : "");
            adminName = adminName.trim();
            if (adminName.isEmpty()) {
                adminName = group.getAdmin().getUsername();
            }
        }

        return new TravelGroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCreatedAt(),
                adminId,
                adminName,
                group.getMembers().size(),
                memberResponses
        );
    }
}
