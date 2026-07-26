package com.tripnest.controller;

import com.tripnest.dto.DiscussionRequest;
import com.tripnest.dto.MessageRequest;
import com.tripnest.entity.DiscussionMessage;
import com.tripnest.entity.GroupDiscussion;
import com.tripnest.service.GroupDiscussionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/discussions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class GroupDiscussionController {

    private final GroupDiscussionService discussionService;

    @PostMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<GroupDiscussion> createDiscussion(
            @PathVariable Long groupId,
            Authentication authentication,
            @Valid @RequestBody DiscussionRequest request) {
        Long userId = Long.parseLong(authentication.getName());
        GroupDiscussion discussion = discussionService.createDiscussion(groupId, userId, request);
        return ResponseEntity.ok(discussion);
    }

    @GetMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<GroupDiscussion>> getGroupDiscussions(@PathVariable Long groupId) {
        List<GroupDiscussion> discussions = discussionService.getGroupDiscussions(groupId);
        return ResponseEntity.ok(discussions);
    }

    @GetMapping("/{discussionId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<GroupDiscussion> getDiscussion(@PathVariable Long discussionId) {
        GroupDiscussion discussion = discussionService.getDiscussion(discussionId);
        return ResponseEntity.ok(discussion);
    }

    @DeleteMapping("/{discussionId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteDiscussion(@PathVariable Long discussionId) {
        discussionService.deleteDiscussion(discussionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{discussionId}/messages")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<DiscussionMessage> addMessage(
            @PathVariable Long discussionId,
            Authentication authentication,
            @Valid @RequestBody MessageRequest request) {
        Long userId = Long.parseLong(authentication.getName());
        DiscussionMessage message = discussionService.addMessage(discussionId, userId, request);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{discussionId}/messages")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<DiscussionMessage>> getDiscussionMessages(@PathVariable Long discussionId) {
        List<DiscussionMessage> messages = discussionService.getDiscussionMessages(discussionId);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/{discussionId}/messages/{messageId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        discussionService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }
}
