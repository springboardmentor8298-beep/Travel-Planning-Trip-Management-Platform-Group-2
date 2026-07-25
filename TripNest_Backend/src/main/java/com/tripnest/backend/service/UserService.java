package com.tripnest.backend.service;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.LoginRequest;
import com.tripnest.backend.dto.RegisterRequest;
import com.tripnest.backend.dto.response.AuthResponse;

public interface UserService {

    ApiResponse<AuthResponse> register(RegisterRequest request);

    ApiResponse<AuthResponse> login(LoginRequest request);

}