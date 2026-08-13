package com.tripnest.service;

import com.tripnest.model.Expense;
import com.tripnest.model.Trip;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private NotificationService notificationService;

    public Expense save(Expense expense) {
        return expenseRepository.save(expense);
    }

    public Expense saveForTrip(int tripId, Expense expense) {
        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        expense.setTrip(trip);
        Expense saved = expenseRepository.save(expense);

        // Check if total trip expenses exceed budget
        List<Expense> allExpenses = expenseRepository.findByTripId(tripId);
        double totalSpent = allExpenses.stream()
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0)
                .sum();

        if (trip.getBudget() > 0 && totalSpent > trip.getBudget()) {
            String msg = "⚠️ Budget Exceeded Alert: Total expenses (₹" + Math.round(totalSpent) + 
                    ") for trip to " + trip.getDestination() + " have exceeded budget limit (₹" + Math.round(trip.getBudget()) + ").";
            notificationService.createNotification(msg);
        }

        return saved;
    }

    public List<Expense> getByTripId(int tripId) {
        return expenseRepository.findByTripId(tripId);
    }

    public List<Expense> getAll() {
        return expenseRepository.findAll();
    }

    public void delete(int id) {
        expenseRepository.deleteById(id);
    }
}