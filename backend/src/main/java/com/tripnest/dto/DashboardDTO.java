package com.tripnest.dto;

public class DashboardDTO {

    private long totalUsers;
    private long totalTrips;
    private long totalDestinations;
    private long totalActivities;
    private long totalBudgets;
    private long totalExpenses;
    private long totalNotifications;

    public DashboardDTO() {
    }

    public DashboardDTO(long totalUsers, long totalTrips,
                        long totalDestinations, long totalActivities,
                        long totalBudgets, long totalExpenses,
                        long totalNotifications) {

        this.totalUsers = totalUsers;
        this.totalTrips = totalTrips;
        this.totalDestinations = totalDestinations;
        this.totalActivities = totalActivities;
        this.totalBudgets = totalBudgets;
        this.totalExpenses = totalExpenses;
        this.totalNotifications = totalNotifications;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalTrips() {
        return totalTrips;
    }

    public void setTotalTrips(long totalTrips) {
        this.totalTrips = totalTrips;
    }

    public long getTotalDestinations() {
        return totalDestinations;
    }

    public void setTotalDestinations(long totalDestinations) {
        this.totalDestinations = totalDestinations;
    }

    public long getTotalActivities() {
        return totalActivities;
    }

    public void setTotalActivities(long totalActivities) {
        this.totalActivities = totalActivities;
    }

    public long getTotalBudgets() {
        return totalBudgets;
    }

    public void setTotalBudgets(long totalBudgets) {
        this.totalBudgets = totalBudgets;
    }

    public long getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(long totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public long getTotalNotifications() {
        return totalNotifications;
    }

    public void setTotalNotifications(long totalNotifications) {
        this.totalNotifications = totalNotifications;
    }
}