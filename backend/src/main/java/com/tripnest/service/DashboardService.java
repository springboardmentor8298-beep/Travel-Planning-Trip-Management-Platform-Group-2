package com.tripnest.service;

import com.tripnest.dto.DashboardDTO;
import com.tripnest.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private DestinationRepository destinationRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    public DashboardDTO getDashboardSummary() {

        DashboardDTO dashboard = new DashboardDTO();

        dashboard.setTotalUsers(userRepository.count());
        dashboard.setTotalTrips(tripRepository.count());
        dashboard.setTotalDestinations(destinationRepository.count());
        dashboard.setTotalActivities(activityRepository.count());
        dashboard.setTotalBudgets(budgetRepository.count());
        dashboard.setTotalExpenses(expenseRepository.count());
        dashboard.setTotalNotifications(notificationRepository.count());

        return dashboard;
    }
}