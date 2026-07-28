package com.tripnest.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
public record GroupMemberRequest(@Email @NotBlank String email, String memberRole) { }
