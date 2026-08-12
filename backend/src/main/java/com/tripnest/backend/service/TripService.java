package com.tripnest.backend.service;

import com.tripnest.backend.model.ExpenseEntity;
import com.tripnest.backend.model.TripEntity;
import com.tripnest.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final DocumentRepository documentRepository;
    private final ActivityRepository activityRepository;
    private final DiscussionRepository discussionRepository;
    private final BookingRepository bookingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public TripService(
            TripRepository tripRepository,
            ExpenseRepository expenseRepository,
            DocumentRepository documentRepository,
            ActivityRepository activityRepository,
            DiscussionRepository discussionRepository,
            BookingRepository bookingRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.tripRepository = tripRepository;
        this.expenseRepository = expenseRepository;
        this.documentRepository = documentRepository;
        this.activityRepository = activityRepository;
        this.discussionRepository = discussionRepository;
        this.bookingRepository = bookingRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<TripEntity> getAllTrips() {
        List<TripEntity> trips = tripRepository.findAll();
        for (TripEntity t : trips) {
            List<ExpenseEntity> exps = expenseRepository.findByTripId(t.getId());
            double sum = exps.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();
            t.setSpentBudget(sum);

            if (t.getSharedMembers() != null && !t.getSharedMembers().isBlank()) {
                long acceptedCount = Arrays.stream(t.getSharedMembers().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .distinct()
                        .count();
                t.setMemberCount(Math.max(t.getMemberCount() != null ? t.getMemberCount() : 1, (int) (1 + acceptedCount)));
            }
        }
        return trips;
    }

    public List<TripEntity> getTripsForUser(String ownerEmail) {
        List<TripEntity> trips;
        if (ownerEmail == null || ownerEmail.isBlank() || ownerEmail.equals("null")) {
            trips = tripRepository.findAll();
        } else {
            String search = ownerEmail.trim().toLowerCase();
            trips = tripRepository.findAll().stream()
                    .filter(t -> (t.getOwnerEmail() != null && (t.getOwnerEmail().equalsIgnoreCase(search) || search.contains(t.getOwnerEmail().toLowerCase())))
                            || (t.getSharedMembers() != null && t.getSharedMembers().toLowerCase().contains(search)))
                    .collect(Collectors.toList());
        }

        for (TripEntity t : trips) {
            List<ExpenseEntity> exps = expenseRepository.findByTripId(t.getId());
            double sum = exps.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();
            t.setSpentBudget(sum);

            if (t.getSharedMembers() != null && !t.getSharedMembers().isBlank()) {
                long acceptedCount = Arrays.stream(t.getSharedMembers().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .distinct()
                        .count();
                t.setMemberCount(Math.max(t.getMemberCount() != null ? t.getMemberCount() : 1, (int) (1 + acceptedCount)));
            }
        }

        return trips;
    }

    @Transactional
    public TripEntity createOrUpdateTrip(TripEntity trip) {
        TripEntity savedTrip = tripRepository.save(trip);
        messagingTemplate.convertAndSend("/topic/trips", savedTrip);
        return savedTrip;
    }

    @Transactional
    public void deleteTrip(String tripId) {
        documentRepository.deleteByTripId(tripId);
        expenseRepository.deleteByTripId(tripId);
        activityRepository.deleteByTripId(tripId);
        discussionRepository.deleteByTripId(tripId);
        bookingRepository.deleteByTripId(tripId);

        tripRepository.deleteById(tripId);

        messagingTemplate.convertAndSend("/topic/trips/delete", tripId);
    }

    @Transactional
    public ExpenseEntity addExpense(ExpenseEntity expense) {
        ExpenseEntity savedExpense = expenseRepository.save(expense);
        messagingTemplate.convertAndSend("/topic/expenses", savedExpense);
        return savedExpense;
    }

    public List<ExpenseEntity> getExpensesForTrip(String tripId) {
        return expenseRepository.findByTripId(tripId);
    }
}
