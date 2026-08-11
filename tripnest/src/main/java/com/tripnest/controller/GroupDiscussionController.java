package com.tripnest.controller;

import com.tripnest.dto.DiscussionMessageResponse;
import com.tripnest.dto.DiscussionRequest;
import com.tripnest.dto.GroupDiscussionResponse;
import com.tripnest.dto.MessageRequest;
import com.tripnest.entity.User;
import com.tripnest.repository.UserRepository;
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
    private final UserRepository userRepository;

    /**
     * Resolves a User from the JWT principal (which is the username string, not an ID).
     */
    private User resolveUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @PostMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> createDiscussion(
            @PathVariable Long groupId,
            Authentication authentication,
            @Valid @RequestBody DiscussionRequest request) {
        try {
            Long userId = resolveUser(authentication).getId();
            GroupDiscussionResponse discussion = discussionService.createDiscussion(groupId, userId, request);
            return ResponseEntity.ok(discussion);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<GroupDiscussionResponse>> getGroupDiscussions(@PathVariable Long groupId) {
        List<GroupDiscussionResponse> discussions = discussionService.getGroupDiscussions(groupId);
        return ResponseEntity.ok(discussions);
    }

    @GetMapping("/{discussionId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<GroupDiscussionResponse> getDiscussion(@PathVariable Long discussionId) {
        GroupDiscussionResponse discussion = discussionService.getDiscussion(discussionId);
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
    public ResponseEntity<?> addMessage(
            @PathVariable Long discussionId,
            Authentication authentication,
            @Valid @RequestBody MessageRequest request) {
        try {
            Long userId = resolveUser(authentication).getId();
            DiscussionMessageResponse message = discussionService.addMessage(discussionId, userId, request);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{discussionId}/messages")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<DiscussionMessageResponse>> getDiscussionMessages(@PathVariable Long discussionId) {
        List<DiscussionMessageResponse> messages = discussionService.getDiscussionMessages(discussionId);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/{discussionId}/messages/{messageId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId) {
        discussionService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }
}
