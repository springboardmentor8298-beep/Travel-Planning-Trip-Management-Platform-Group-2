package com.tripnest.service;

import com.tripnest.dto.GroupMessageRequest;
import com.tripnest.dto.GroupMessageResponse;
import com.tripnest.entity.GroupMessage;
import com.tripnest.entity.MemberStatus;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.GroupMessageRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for group chat messages within a trip.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class GroupChatService {

    private final GroupMessageRepository groupMessageRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMemberRepository tripMemberRepository;

    private void checkTripAccess(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        boolean isOwner = trip.getUser().getId().equals(userId);
        boolean isMember = tripMemberRepository
                .findByTripIdAndUserId(tripId, userId)
                .map(m -> m.getStatus() == MemberStatus.ACCEPTED)
                .orElse(false);
        if (!isOwner && !isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have access to this trip");
        }
    }

    public GroupMessageResponse sendMessage(Long tripId, Long senderId, GroupMessageRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message cannot be empty");
        }
        checkTripAccess(tripId, senderId);
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        GroupMessage msg = new GroupMessage();
        msg.setTrip(trip);
        msg.setSender(sender);
        msg.setMessage(request.getMessage().trim());

        return toResponse(groupMessageRepository.save(msg));
    }

    @Transactional(readOnly = true)
    public List<GroupMessageResponse> getMessages(Long tripId, Long userId) {
        checkTripAccess(tripId, userId);
        return groupMessageRepository.findByTripIdOrderBySentAtAsc(tripId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public GroupMessageResponse toResponse(GroupMessage msg) {
        GroupMessageResponse res = new GroupMessageResponse();
        res.setId(msg.getId());
        res.setTripId(msg.getTrip().getId());
        res.setSenderId(msg.getSender().getId());
        res.setSenderUsername(msg.getSender().getUsername());
        res.setMessage(msg.getMessage());
        res.setSentAt(msg.getSentAt());
        return res;
    }
}
