package com.tripnest.controller;

import com.tripnest.dto.ExpenseAnalyticsResponse;
import com.tripnest.dto.ExpenseRequest;
import com.tripnest.dto.ExpenseResponse;
import com.tripnest.dto.MessageResponse;
import com.tripnest.security.UserDetailsImpl;
import com.tripnest.service.ExpenseService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;


    // ==========================================
    // ADD EXPENSE
    // ==========================================

    @PostMapping("/trips/{tripId}/expenses")
    public ResponseEntity<?> createExpense(
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        ExpenseResponse response =
                expenseService.createExpense(
                        tripId,
                        request,
                        userDetails.getId()
                );

        return ResponseEntity.ok(response);
    }


    // ==========================================
    // GET ALL EXPENSES
    // ==========================================

    @GetMapping("/trips/{tripId}/expenses")
    public ResponseEntity<?> getTripExpenses(
            @PathVariable Long tripId) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        List<ExpenseResponse> expenses =
                expenseService.getTripExpenses(
                        tripId,
                        userDetails.getId()
                );

        return ResponseEntity.ok(expenses);
    }


    // ==========================================
    // GET EXPENSE ANALYTICS
    // ==========================================

    @GetMapping(
            "/trips/{tripId}/expenses/analytics"
    )
    public ResponseEntity<?> getExpenseAnalytics(
            @PathVariable Long tripId) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        ExpenseAnalyticsResponse analytics =
                expenseService.getExpenseAnalytics(
                        tripId,
                        userDetails.getId()
                );

        return ResponseEntity.ok(
                analytics
        );
    }


    // ==========================================
    // GET SINGLE EXPENSE
    // ==========================================

    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<?> getExpenseById(
            @PathVariable Long expenseId) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        ExpenseResponse response =
                expenseService.getExpenseById(
                        expenseId,
                        userDetails.getId()
                );

        return ResponseEntity.ok(response);
    }


    // ==========================================
    // UPDATE EXPENSE
    // ==========================================

    @PutMapping("/expenses/{expenseId}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        ExpenseResponse response =
                expenseService.updateExpense(
                        expenseId,
                        request,
                        userDetails.getId()
                );

        return ResponseEntity.ok(response);
    }


    // ==========================================
    // DELETE EXPENSE
    // ==========================================

    @DeleteMapping("/expenses/{expenseId}")
    public ResponseEntity<?> deleteExpense(
            @PathVariable Long expenseId) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        expenseService.deleteExpense(
                expenseId,
                userDetails.getId()
        );

        return ResponseEntity.ok(
                new MessageResponse(
                        "Expense deleted successfully!"
                )
        );
    }


    // ==========================================
    // GET TOTAL SPENT
    // ==========================================

    @GetMapping(
            "/trips/{tripId}/expenses/total"
    )
    public ResponseEntity<?> getTotalSpent(
            @PathVariable Long tripId) {

        UserDetailsImpl userDetails =
                getCurrentUser();

        Double total =
                expenseService.getTotalSpent(
                        tripId,
                        userDetails.getId()
                );

        return ResponseEntity.ok(total);
    }


    // ==========================================
    // CURRENT USER
    // ==========================================

    private UserDetailsImpl getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return (UserDetailsImpl)
                authentication.getPrincipal();
    }
}