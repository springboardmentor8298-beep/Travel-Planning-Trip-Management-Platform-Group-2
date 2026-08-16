package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SettlementTransaction {
    private String fromEmail;
    private String fromName;
    private String toEmail;
    private String toName;
    private Double amount;
}
