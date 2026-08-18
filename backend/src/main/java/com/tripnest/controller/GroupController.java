package com.tripnest.controller;

import com.tripnest.dto.GroupMessageResponse;
import com.tripnest.dto.GroupRequest;
import com.tripnest.dto.GroupResponse;
import com.tripnest.dto.InvitationResponse;
import com.tripnest.security.UserPrincipal;
import com.tripnest.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    /* ── Groups ── */

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody GroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupService.createGroup(principal.getUsername(), request));
    }

    @GetMapping
    public List<GroupResponse> getMyGroups(@AuthenticationPrincipal UserPrincipal principal) {
        return groupService.getMyGroups(principal.getUsername());
    }

    @GetMapping("/{groupId}")
    public GroupResponse getGroup(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId) {
        return groupService.getGroup(principal.getUsername(), groupId);
    }

    /* ── Invitations ── */

    /**
     * Invite one OR multiple members.
     * Body: { "emails": ["a@b.com", "c@d.com"] }
     *  OR  { "email": "a@b.com" }   (single, backwards compat)
     */
    @PostMapping("/{groupId}/invitations")
    public ResponseEntity<List<InvitationResponse>> inviteMembers(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId,
            @RequestBody Map<String, Object> body) {

        List<String> emails;
        Object emailsObj = body.get("emails");
        Object emailObj  = body.get("email");

        if (emailsObj instanceof List<?> list) {
            emails = list.stream().map(Object::toString).toList();
        } else if (emailObj != null) {
            emails = List.of(emailObj.toString());
        } else {
            return ResponseEntity.badRequest().build();
        }

        List<InvitationResponse> result =
                groupService.inviteMembers(principal.getUsername(), groupId, emails);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /** Get pending invitations for the current user */
    @GetMapping("/invitations/pending")
    public List<InvitationResponse> getMyPendingInvitations(
            @AuthenticationPrincipal UserPrincipal principal) {
        return groupService.getMyPendingInvitations(principal.getUsername());
    }

    /** Get all invitations for a group (with status — for the invite history panel) */
    @GetMapping("/{groupId}/invitations")
    public List<InvitationResponse> getGroupInvitations(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId) {
        return groupService.getGroupInvitations(principal.getUsername(), groupId);
    }

    /** Accept or reject an invitation */
    @PutMapping("/invitations/{invitationId}/respond")
    public InvitationResponse respondToInvitation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long invitationId,
            @RequestBody Map<String, Boolean> body) {
        boolean accept = Boolean.TRUE.equals(body.get("accept"));
        return groupService.respondToInvitation(principal.getUsername(), invitationId, accept);
    }

    /* ── Members ── */

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<GroupResponse> removeMember(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId,
            @PathVariable Long memberId) {
        return ResponseEntity.ok(
                groupService.removeMember(principal.getUsername(), groupId, memberId));
    }

    /* ── Messages ── */

    @GetMapping("/{groupId}/messages")
    public List<GroupMessageResponse> getMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId) {
        return groupService.getMessages(principal.getUsername(), groupId);
    }

    @PostMapping("/{groupId}/messages")
    public ResponseEntity<GroupMessageResponse> postMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long groupId,
            @RequestBody Map<String, String> body) {
        String content = body.getOrDefault("content", "").trim();
        if (content.isEmpty()) return ResponseEntity.badRequest().build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupService.postMessage(principal.getUsername(), groupId, content));
    }
}
