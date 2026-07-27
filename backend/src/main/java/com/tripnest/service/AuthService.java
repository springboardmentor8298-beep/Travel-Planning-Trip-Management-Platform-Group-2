package com.tripnest.service;

import com.tripnest.dto.auth.AuthResponse;
import com.tripnest.dto.auth.ForgotPasswordRequest;
import com.tripnest.dto.auth.LoginRequest;
import com.tripnest.dto.auth.RegisterRequest;
import com.tripnest.dto.auth.ResetPasswordRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(String refreshToken);

    void logout(String refreshToken);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}
