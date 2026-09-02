package com.tripnest.dto;

import com.tripnest.model.TravelGroup;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private int memberCount;
    private List<MemberInfo> members;
    private LocalDateTime createdAt;

    public static class MemberInfo {
        private Long id;
        private String fullName;
        private String email;

        public MemberInfo(Long id, String fullName, String email) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
        }

        public Long getId() { return id; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
    }

    public static GroupResponse fromEntity(TravelGroup g) {
        GroupResponse r = new GroupResponse();
        r.id          = g.getId();
        r.name        = g.getName();
        r.description = g.getDescription();
        r.ownerId     = g.getOwner().getId();
        r.ownerName   = g.getOwner().getFullName();
        r.ownerEmail  = g.getOwner().getEmail();
        r.members     = g.getMembers().stream()
                         .map(u -> new MemberInfo(u.getId(), u.getFullName(), u.getEmail()))
                         .collect(Collectors.toList());
        // member count = owner + members
        r.memberCount = r.members.size() + 1;
        r.createdAt   = g.getCreatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Long getOwnerId() { return ownerId; }
    public String getOwnerName() { return ownerName; }
    public String getOwnerEmail() { return ownerEmail; }
    public int getMemberCount() { return memberCount; }
    public List<MemberInfo> getMembers() { return members; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
