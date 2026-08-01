package com.tripnest.backend.mapper;

import org.springframework.stereotype.Component;
import com.tripnest.backend.dto.RegisterRequest;
import com.tripnest.backend.dto.response.UserResponse;
import com.tripnest.backend.entity.User;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }
        return User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .build();
    }

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .build();
    }
}