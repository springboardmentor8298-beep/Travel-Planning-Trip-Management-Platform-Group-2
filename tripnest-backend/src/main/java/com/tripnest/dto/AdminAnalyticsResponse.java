package com.tripnest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class AdminAnalyticsResponse {
    // User analytics
    private long totalUsers;
    private Map<String, Long> usersByRole;

    // Trip analytics
    private long totalTrips;
    private Map<String, Long> tripsByStatus;
    private double totalBudgetAllocatedPlatformWide;
    private double totalExpensesPlatformWide;

    // Destination analytics
    private long totalDestinationsInCatalog;
    private List<DestinationTrendEntry> topDestinations;

    // Platform statistics
    private long totalDocumentsUploaded;
    private long totalNotificationsSent;
    private long totalGroupMemberships;
}
