package com.tripnest.service;
import com.tripnest.entity.Notification;
import com.tripnest.entity.User;
import com.tripnest.repository.NotificationRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @Transactional
public class NotificationService {
    private final NotificationRepository notifications; private final UserRepository users;
    public NotificationService(NotificationRepository notifications, UserRepository users) { this.notifications = notifications; this.users = users; }
    public void dispatch(User user, String title, String message) { Notification n = new Notification(); n.setUser(user); n.setTitle(title); n.setMessage(message); n.setIsRead(false); n.setCreatedAt(LocalDateTime.now()); notifications.save(n); }
    public List<Notification> list(String email) { return notifications.findByUserEmailOrderByCreatedAtDesc(email); }
    public void markRead(String email, Long id) { Notification n = notifications.findById(id).filter(item -> item.getUser().getEmail().equals(email)).orElseThrow(() -> new RuntimeException("Notification not found")); n.setIsRead(true); }
    public void markAllRead(String email) { notifications.findByUserEmailOrderByCreatedAtDesc(email).forEach(n -> n.setIsRead(true)); }
}
