package com.tripnest.dto;
import java.time.LocalDateTime;
import java.util.List;
public record GroupResponse(Long id, String name, String description, Long tripId, String tripName, String ownerName, LocalDateTime createdAt, List<GroupMemberResponse> members) { }
