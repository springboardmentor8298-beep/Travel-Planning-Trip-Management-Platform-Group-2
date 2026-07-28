package com.tripnest.backend.service;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.LoginRequest;
import com.tripnest.backend.dto.RegisterRequest;
import com.tripnest.backend.dto.response.AuthResponse;

import com.tripnest.backend.dto.UserProfileDto;

public interface UserService {

    ApiResponse<AuthResponse> register(RegisterRequest request);

    ApiResponse<AuthResponse> login(LoginRequest request);

    ApiResponse<UserProfileDto> getProfile();

    ApiResponse<UserProfileDto> updateProfile(UserProfileDto request);

}