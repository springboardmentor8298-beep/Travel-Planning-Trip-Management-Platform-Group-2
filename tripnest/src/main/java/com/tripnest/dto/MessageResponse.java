package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Generic message response DTO for success/error messages.
 */
@Data
@AllArgsConstructor
public class MessageResponse {

    private String message;
}
