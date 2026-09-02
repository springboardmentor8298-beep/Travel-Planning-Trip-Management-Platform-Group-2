package com.tripnest.dto;

import com.tripnest.model.Expense;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseResponse {
    private Long id;
    private String title;
    private BigDecimal amount;
    private String category;
    private LocalDate expenseDate;
    private Long paidById;
    private String paidByName;
    private String notes;

    public ExpenseResponse() {
    }

    public ExpenseResponse(Long id, String title, BigDecimal amount, String category, LocalDate expenseDate,
                           Long paidById, String paidByName, String notes) {
        this.id = id;
        this.title = title;
        this.amount = amount;
        this.category = category;
        this.expenseDate = expenseDate;
        this.paidById = paidById;
        this.paidByName = paidByName;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getCategory() {
        return category;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public Long getPaidById() {
        return paidById;
    }

    public String getPaidByName() {
        return paidByName;
    }

    public String getNotes() {
        return notes;
    }

    public static ExpenseResponse fromEntity(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getTitle(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getExpenseDate(),
                expense.getPaidBy().getId(),
                expense.getPaidBy().getFullName(),
                expense.getNotes()
        );
    }
}
