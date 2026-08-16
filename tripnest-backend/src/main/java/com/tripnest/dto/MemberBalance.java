package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberBalance {
    private String email;
    private String fullName;
    private Double totalPaid;
    private Double fairShare;
    private Double netBalance; // positive = is owed money, negative = owes money
}
