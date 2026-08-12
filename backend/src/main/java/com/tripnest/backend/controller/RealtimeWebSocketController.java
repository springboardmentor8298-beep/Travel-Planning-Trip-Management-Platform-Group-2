package com.tripnest.backend.controller;

import com.tripnest.backend.model.ExpenseEntity;
import com.tripnest.backend.model.TripEntity;
import com.tripnest.backend.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class RealtimeWebSocketController {

    private final TripService tripService;

    @Autowired
    public RealtimeWebSocketController(TripService tripService) {
        this.tripService = tripService;
    }

    @MessageMapping("/trips.update")
    @SendTo("/topic/trips")
    public TripEntity handleTripUpdate(TripEntity trip) {
        return tripService.createOrUpdateTrip(trip);
    }

    @MessageMapping("/expenses.add")
    @SendTo("/topic/expenses")
    public ExpenseEntity handleExpenseAdd(ExpenseEntity expense) {
        return tripService.addExpense(expense);
    }
}
