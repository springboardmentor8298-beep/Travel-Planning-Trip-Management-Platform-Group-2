package com.tripnest.controller;

import com.tripnest.dto.GroupMessageRequest;
import com.tripnest.dto.GroupMessageResponse;
import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.GroupChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for group chat messages.
 *
 * Routes:
 *   GET  /api/trips/{tripId}/messages — get all messages (chronological)
 *   POST /api/trips/{tripId}/messages — send a message
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trips/{tripId}/messages")
@RequiredArgsConstructor
public class GroupChatController {

    private final GroupChatService groupChatService;

    @GetMapping
    public ResponseEntity<List<GroupMessageResponse>> getMessages(@PathVariable Long tripId) {
        return ResponseEntity.ok(groupChatService.getMessages(tripId));
    }

    @PostMapping
    public ResponseEntity<GroupMessageResponse> sendMessage(
            @PathVariable Long tripId,
            @RequestBody GroupMessageRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(groupChatService.sendMessage(tripId, currentUser.getId(), request));
    }
}
