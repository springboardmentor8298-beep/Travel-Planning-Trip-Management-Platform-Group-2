package com.tripnest.backend.mapper;

import com.tripnest.backend.dto.RegisterRequest;
import com.tripnest.backend.dto.response.UserResponse;
import com.tripnest.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "enabled", ignore = true)
    User toEntity(RegisterRequest request);

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toResponse(User user);
}