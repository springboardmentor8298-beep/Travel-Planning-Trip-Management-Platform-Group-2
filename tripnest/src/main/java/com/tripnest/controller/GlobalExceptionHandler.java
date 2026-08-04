package com.tripnest.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

/**
 * Global Exception Handler to capture validation errors and other exceptions
 * and return structured JSON responses instead of default Spring /error page.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        // Include a generic message for single-line display
        String friendlyMessage = errors.values().stream().findFirst().orElse("Validation failed");
        errors.put("message", "Validation error: " + friendlyMessage);
        
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles ResponseStatusException (e.g. 404 Not Found, 403 Forbidden, 409 Conflict)
     * and returns a structured { "message": "..." } JSON body so the frontend
     * can read err.response?.data?.message reliably.
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(
            ResponseStatusException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getReason() != null ? ex.getReason() : ex.getMessage());
        body.put("status", String.valueOf(ex.getStatusCode().value()));
        return new ResponseEntity<>(body, ex.getStatusCode());
    }
}
