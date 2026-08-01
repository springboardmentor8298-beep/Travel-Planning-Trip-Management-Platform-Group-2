package com.tripnest.backend.service;

import java.util.List;
import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.InviteMemberRequest;
import com.tripnest.backend.dto.response.TripMemberResponse;

public interface TripMemberService {

    ApiResponse<TripMemberResponse> inviteMember(Long tripId, InviteMemberRequest request);

    ApiResponse<String> removeMember(Long tripId, Long memberId);

    ApiResponse<List<TripMemberResponse>> getMembers(Long tripId);

    ApiResponse<String> acceptInvitation(Long memberId);

    ApiResponse<String> declineInvitation(Long memberId);

    ApiResponse<List<TripMemberResponse>> getMyPendingInvitations();
}
