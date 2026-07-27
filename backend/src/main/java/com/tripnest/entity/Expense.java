package com.tripnest.entity;

import com.tripnest.entity.enums.ExpenseCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
public class Expense extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paid_by_user_id", nullable = false)
    private User paidBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExpenseCategory category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 10, nullable = false)
    private String currency = "USD";

    @Column(length = 255)
    private String description;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "receipt_url")
    private String receiptUrl;
}
