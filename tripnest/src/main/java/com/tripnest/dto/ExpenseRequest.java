package com.tripnest.dto;

import com.tripnest.entity.ExpenseCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {
    
    @NotBlank
    @Size(max = 200)
    private String description;
    
    @NotNull
    private BigDecimal amount;
    
    @NotNull
    private ExpenseCategory category;
    
    @NotNull
    private LocalDate expenseDate;
    
    @Size(max = 50)
    private String paymentMethod;
    
    private String notes;
}
