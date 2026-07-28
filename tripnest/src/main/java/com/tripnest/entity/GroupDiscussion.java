package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "group_discussions")
public class GroupDiscussion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 1500) private String message;
    private LocalDateTime createdAt;
    @ManyToOne @JoinColumn(name = "group_id", nullable = false) private TravelGroup group;
    @ManyToOne @JoinColumn(name = "author_id", nullable = false) private User author;
}
