package com.tripnest.service;

import com.tripnest.dto.DiscussionMessageResponse;
import com.tripnest.dto.DiscussionRequest;
import com.tripnest.dto.GroupDiscussionResponse;
import com.tripnest.dto.MessageRequest;
import com.tripnest.entity.DiscussionMessage;
import com.tripnest.entity.GroupDiscussion;
import com.tripnest.entity.TravelGroup;
import com.tripnest.entity.User;
import com.tripnest.repository.DiscussionMessageRepository;
import com.tripnest.repository.GroupDiscussionRepository;
import com.tripnest.repository.TravelGroupRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupDiscussionService {

    private final GroupDiscussionRepository discussionRepository;
    private final DiscussionMessageRepository messageRepository;
    private final TravelGroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupDiscussionResponse createDiscussion(Long groupId, Long userId, DiscussionRequest request) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupDiscussion discussion = new GroupDiscussion();
        discussion.setTitle(request.getTitle());
        discussion.setTravelGroup(group);
        discussion.setCreatedBy(user);

        GroupDiscussion saved = discussionRepository.save(discussion);
        return mapToDiscussionResponse(saved);
    }

    public void deleteDiscussion(Long discussionId) {
        discussionRepository.deleteById(discussionId);
    }

    public GroupDiscussionResponse getDiscussion(Long discussionId) {
        GroupDiscussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new RuntimeException("Discussion not found"));
        return mapToDiscussionResponse(discussion);
    }

    public List<GroupDiscussionResponse> getGroupDiscussions(Long groupId) {
        return discussionRepository.findByTravelGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(this::mapToDiscussionResponse)
                .collect(Collectors.toList());
    }

    public DiscussionMessageResponse addMessage(Long discussionId, Long userId, MessageRequest request) {
        GroupDiscussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new RuntimeException("Discussion not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DiscussionMessage message = new DiscussionMessage();
        message.setContent(request.getContent());
        message.setDiscussion(discussion);
        message.setUser(user);

        DiscussionMessage savedMessage = messageRepository.save(message);
        return mapToMessageResponse(savedMessage);
    }

    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }

    public List<DiscussionMessageResponse> getDiscussionMessages(Long discussionId) {
        return messageRepository.findByDiscussionIdOrderByCreatedAtAsc(discussionId)
                .stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());
    }

    public GroupDiscussionResponse mapToDiscussionResponse(GroupDiscussion d) {
        return new GroupDiscussionResponse(
                d.getId(),
                d.getTitle(),
                d.getTravelGroup() != null ? d.getTravelGroup().getId() : null,
                d.getCreatedBy() != null ? d.getCreatedBy().getId() : null,
                d.getCreatedBy() != null ? d.getCreatedBy().getUsername() : null,
                d.getCreatedAt()
        );
    }

    public DiscussionMessageResponse mapToMessageResponse(DiscussionMessage m) {
        DiscussionMessageResponse.UserSummary userSummary = null;
        if (m.getUser() != null) {
            userSummary = new DiscussionMessageResponse.UserSummary(
                    m.getUser().getId(),
                    m.getUser().getUsername(),
                    m.getUser().getFirstName(),
                    m.getUser().getLastName()
            );
        }
        return new DiscussionMessageResponse(
                m.getId(),
                m.getContent(),
                m.getCreatedAt(),
                m.getDiscussion() != null ? m.getDiscussion().getId() : null,
                userSummary
        );
    }
}
