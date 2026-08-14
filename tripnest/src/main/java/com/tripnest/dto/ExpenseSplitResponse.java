package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseSplitResponse {
    private Long tripId;
    private String tripTitle;
    private BigDecimal totalTripSpent;
    private int totalMembers;
    private BigDecimal equalSharePerMember;
    private List<MemberBalance> memberBalances;
    private List<SettlementTransaction> suggestedSettlements;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MemberBalance {
        private Long userId;
        private String username;
        private String fullName;
        private BigDecimal totalPaid;
        private BigDecimal netBalance; // positive = gets money back, negative = owes money
        private String status; // "GETS_BACK", "OWES", "SETTLED"
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SettlementTransaction {
        private String fromUsername;
        private String fromFullName;
        private String toUsername;
        private String toFullName;
        private BigDecimal amount;
    }
}
