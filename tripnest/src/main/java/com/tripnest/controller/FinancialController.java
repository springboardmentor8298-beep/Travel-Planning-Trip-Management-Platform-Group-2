package com.tripnest.controller;

import com.tripnest.dto.*;
import com.tripnest.service.FinancialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}")
public class FinancialController {
    private final FinancialService service;
    public FinancialController(FinancialService service) { this.service = service; }

    @GetMapping("/budget") public BudgetResponse budget(Principal principal, @PathVariable Long tripId) { return service.getBudget(principal.getName(), tripId); }
    @PutMapping("/budget") public BudgetResponse planBudget(Principal principal, @PathVariable Long tripId, @Valid @RequestBody BudgetRequest request) { return service.planBudget(principal.getName(), tripId, request); }
    @GetMapping("/expenses") public List<ExpenseResponse> expenses(Principal principal, @PathVariable Long tripId) { return service.listExpenses(principal.getName(), tripId); }
    @PostMapping("/expenses") @ResponseStatus(HttpStatus.CREATED) public ExpenseResponse addExpense(Principal principal, @PathVariable Long tripId, @Valid @RequestBody ExpenseRequest request) { return service.addExpense(principal.getName(), tripId, request); }
    @PutMapping("/expenses/{expenseId}") public ExpenseResponse updateExpense(Principal principal, @PathVariable Long tripId, @PathVariable Long expenseId, @Valid @RequestBody ExpenseRequest request) { return service.updateExpense(principal.getName(), tripId, expenseId, request); }
    @DeleteMapping("/expenses/{expenseId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteExpense(Principal principal, @PathVariable Long tripId, @PathVariable Long expenseId) { service.deleteExpense(principal.getName(), tripId, expenseId); }
    @GetMapping("/expenses/summary") public ExpenseSummaryResponse summary(Principal principal, @PathVariable Long tripId) { return service.summary(principal.getName(), tripId); }
    @GetMapping("/expenses/report.csv") public ResponseEntity<byte[]> report(Principal principal,@PathVariable Long tripId){String csv=service.csvReport(principal.getName(),tripId);return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=trip-"+tripId+"-expenses.csv").contentType(new MediaType("text","csv",StandardCharsets.UTF_8)).body(csv.getBytes(StandardCharsets.UTF_8));}
}
