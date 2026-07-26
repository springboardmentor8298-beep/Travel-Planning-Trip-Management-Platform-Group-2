package com.tripnest.service;

import com.tripnest.dto.DiscussionRequest;
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

@Service
@RequiredArgsConstructor
@Transactional
public class GroupDiscussionService {

    private final GroupDiscussionRepository discussionRepository;
    private final DiscussionMessageRepository messageRepository;
    private final TravelGroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupDiscussion createDiscussion(Long groupId, Long userId, DiscussionRequest request) {
        TravelGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GroupDiscussion discussion = new GroupDiscussion();
        discussion.setTitle(request.getTitle());
        discussion.setTravelGroup(group);
        discussion.setCreatedBy(user);

        return discussionRepository.save(discussion);
    }

    public void deleteDiscussion(Long discussionId) {
        discussionRepository.deleteById(discussionId);
    }

    public GroupDiscussion getDiscussion(Long discussionId) {
        return discussionRepository.findById(discussionId)
                .orElseThrow(() -> new RuntimeException("Discussion not found"));
    }

    public List<GroupDiscussion> getGroupDiscussions(Long groupId) {
        return discussionRepository.findByTravelGroupIdOrderByCreatedAtDesc(groupId);
    }

    public DiscussionMessage addMessage(Long discussionId, Long userId, MessageRequest request) {
        GroupDiscussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new RuntimeException("Discussion not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DiscussionMessage message = new DiscussionMessage();
        message.setContent(request.getContent());
        message.setDiscussion(discussion);
        message.setUser(user);

        DiscussionMessage savedMessage = messageRepository.save(message);
        discussion.getMessages().add(savedMessage);
        discussionRepository.save(discussion);

        return savedMessage;
    }

    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }

    public List<DiscussionMessage> getDiscussionMessages(Long discussionId) {
        return messageRepository.findByDiscussionIdOrderByCreatedAtAsc(discussionId);
    }
}
