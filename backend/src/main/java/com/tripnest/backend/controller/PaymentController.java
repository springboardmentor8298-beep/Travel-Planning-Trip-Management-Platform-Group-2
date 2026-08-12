package com.tripnest.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent() {
        Map<String, Object> response = new HashMap<>();
        response.put("transactionId", "pay_razor_" + System.currentTimeMillis());
        response.put("amount", 5000.0);
        response.put("currency", "INR");
        response.put("provider", "RAZORPAY");
        response.put("status", "CREATED");
        response.put("clientSecret", "sec_test_" + System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Payment verified successfully!");
        response.put("transactionId", "txn_" + System.currentTimeMillis());
        response.put("timestamp", LocalDateTime.now().toString());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/split")
    public ResponseEntity<?> splitGroupExpense() {
        Map<String, Object> result = new HashMap<>();
        result.put("totalAmount", 5000.0);
        result.put("perPersonAmount", 1250.0);
        result.put("memberCount", 4);

        return ResponseEntity.ok(result);
    }
}
