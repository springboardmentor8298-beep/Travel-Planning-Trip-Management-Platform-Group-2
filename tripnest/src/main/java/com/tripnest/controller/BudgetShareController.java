package com.tripnest.controller;

import com.tripnest.dto.BudgetShareRequest;
import com.tripnest.dto.BudgetShareResponse;
import com.tripnest.entity.User;
import com.tripnest.repository.UserRepository;
import com.tripnest.service.BudgetShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/budget-shares")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class BudgetShareController {

    private final BudgetShareService budgetShareService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> createBudgetShare(
            Authentication authentication,
            @RequestBody BudgetShareRequest request) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            BudgetShareResponse response = budgetShareService.createBudgetShare(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create budget share: " + e.getMessage());
        }
    }

    @PutMapping("/{shareId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateBudgetShare(
            @PathVariable Long shareId,
            @RequestBody BudgetShareRequest request) {
        try {
            BudgetShareResponse response = budgetShareService.updateBudgetShare(shareId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to update budget share: " + e.getMessage());
        }
    }

    @DeleteMapping("/{shareId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteBudgetShare(@PathVariable Long shareId) {
        try {
            budgetShareService.deleteBudgetShare(shareId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete budget share: " + e.getMessage());
        }
    }

    @GetMapping("/{shareId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getBudgetShare(@PathVariable Long shareId) {
        try {
            BudgetShareResponse response = budgetShareService.getBudgetShare(shareId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get budget share: " + e.getMessage());
        }
    }

    @GetMapping("/trip/{tripId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getBudgetSharesByTrip(@PathVariable Long tripId) {
        try {
            List<BudgetShareResponse> responses = budgetShareService.getBudgetSharesByTrip(tripId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get budget shares for trip: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getBudgetSharesByUser(Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            
            List<BudgetShareResponse> responses = budgetShareService.getBudgetSharesByUser(user.getId());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get budget shares for user: " + e.getMessage());
        }
    }

    @GetMapping("/group/{groupId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getBudgetSharesByGroup(@PathVariable Long groupId) {
        try {
            List<BudgetShareResponse> responses = budgetShareService.getBudgetSharesByGroup(groupId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get budget shares for group: " + e.getMessage());
        }
    }

    @PostMapping("/equal-shares/{tripId}/{groupId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> createEqualSharesForGroup(
            @PathVariable Long tripId,
            @PathVariable Long groupId) {
        try {
            List<BudgetShareResponse> responses = budgetShareService.createEqualSharesForGroup(tripId, groupId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to create equal shares: " + e.getMessage());
        }
    }

    @PutMapping("/{shareId}/confirm")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> confirmShare(@PathVariable Long shareId) {
        try {
            BudgetShareResponse response = budgetShareService.confirmShare(shareId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to confirm share: " + e.getMessage());
        }
    }

    @PutMapping("/{shareId}/paid")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> markAsPaid(@PathVariable Long shareId) {
        try {
            BudgetShareResponse response = budgetShareService.markAsPaid(shareId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to mark as paid: " + e.getMessage());
        }
    }

    @GetMapping("/trip/{tripId}/paid-total")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getTotalPaidAmount(@PathVariable Long tripId) {
        try {
            BigDecimal total = budgetShareService.getTotalPaidAmount(tripId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get total paid amount: " + e.getMessage());
        }
    }

    @GetMapping("/trip/{tripId}/total-budget")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getTotalBudgetAmount(@PathVariable Long tripId) {
        try {
            BigDecimal total = budgetShareService.getTotalBudgetAmount(tripId);
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to get total budget amount: " + e.getMessage());
        }
    }
}
