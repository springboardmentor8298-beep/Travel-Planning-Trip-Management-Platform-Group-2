package com.tripnest.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.Map;

@Getter
@Builder
public class ErrorResponse {
    private boolean success;
    private String message;
    private int status;
    private Instant timestamp;
    private Map<String, String> fieldErrors;
}
