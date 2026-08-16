package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SettlementResponse {
    private Long tripId;
    private Double totalExpenses;
    private int memberCount;
    private Double fairSharePerMember;
    private List<MemberBalance> balances;
    private List<SettlementTransaction> transactions; // minimized "who pays whom"
}
