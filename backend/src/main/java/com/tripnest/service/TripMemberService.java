package com.tripnest.service;

import com.tripnest.dto.TripMemberDTO;

import java.util.List;

public interface TripMemberService {
    List<TripMemberDTO> getTripMembers(Integer tripId, String currentUserEmail);
    TripMemberDTO addTripMember(Integer tripId, String memberEmail, String role, String currentUserEmail);
    void removeTripMember(Integer tripId, Integer targetUserId, String currentUserEmail);
    boolean isUserOwnerOrMember(Integer tripId, String userEmail);
    boolean isUserOwner(Integer tripId, String userEmail);
}
