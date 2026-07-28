package com.tripnest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "travel_groups")
public class TravelGroup {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String name;
    @Column(length = 1000) private String description;
    private LocalDateTime createdAt;
    @ManyToOne @JoinColumn(name = "owner_id", nullable = false) private User owner;
    @ManyToOne @JoinColumn(name = "trip_id") private Trip trip;
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true) @ToString.Exclude @EqualsAndHashCode.Exclude private List<GroupMember> members = new ArrayList<>();
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true) @ToString.Exclude @EqualsAndHashCode.Exclude private List<GroupDiscussion> discussions = new ArrayList<>();
}
