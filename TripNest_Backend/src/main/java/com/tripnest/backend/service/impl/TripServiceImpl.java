package com.tripnest.backend.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateTripRequest;
import com.tripnest.backend.dto.UpdateTripRequest;
import com.tripnest.backend.dto.response.ActivityResponse;
import com.tripnest.backend.dto.response.ItineraryResponse;
import com.tripnest.backend.dto.response.TripResponse;
import com.tripnest.backend.dto.response.ExpenseResponse;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.entity.Destination;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.TripStatus;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.BudgetRepository;
import com.tripnest.backend.repository.DestinationRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.TripService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;

    private final UserRepository userRepository;
    
    private final DestinationRepository destinationRepository;

    private final BudgetRepository budgetRepository;
    
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }
    
    @Override
    @Transactional
    public ApiResponse<TripResponse> createTrip(CreateTripRequest request) {

        User user = getCurrentUser();

        Trip trip = Trip.builder()
                .tripName(request.getTripName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .notes(request.getNotes())
                .totalMembers(request.getTotalMembers())
                .status(TripStatus.PLANNED)
                .user(user)
                .build();

        trip = tripRepository.save(trip);

        Destination destination = Destination.builder()
                .name(request.getDestinationName())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .trip(trip)
                .build();

        destinationRepository.save(destination);

        trip.getDestinations().add(destination);
        
        Budget budget = Budget.builder()
                .totalBudget(request.getBudget())
                .totalSpent(BigDecimal.ZERO)
                .remainingBudget(request.getBudget())
                .trip(trip)
                .build();

        budgetRepository.save(budget);
        trip.setBudget(budget);

        TripResponse response = TripResponse.builder()
                .id(trip.getId())
                .tripName(trip.getTripName())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .status(trip.getStatus())
                .destination(destination.getName())
                .city(destination.getCity())
                .state(destination.getState())
                .country(destination.getCountry())
                .totalMembers(trip.getTotalMembers())
                .budget(budget.getTotalBudget())
                .spent(BigDecimal.ZERO)
                .notes(trip.getNotes())
                .description(trip.getDescription())
                .coverImage(trip.getCoverImage())
                .build();

        return ApiResponse.<TripResponse>builder()
                .success(true)
                .message("Trip created successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<TripResponse>> getMyTrips() {

        User user = getCurrentUser();

        List<TripResponse> trips = tripRepository.findByUser(user)
                .stream()
                .map(trip -> {

                    Destination destination = trip.getDestinations().isEmpty()
                            ? null
                            : trip.getDestinations().get(0);

                    BigDecimal spent = trip.getBudget() != null
                            ? trip.getBudget().getTotalSpent()
                            : BigDecimal.ZERO;

                    return TripResponse.builder()
                            .id(trip.getId())
                            .tripName(trip.getTripName())
                            .startDate(trip.getStartDate())
                            .endDate(trip.getEndDate())
                            .status(trip.getStatus())
                            .destination(destination != null ? destination.getName() : "")
                            .totalMembers(trip.getTotalMembers())
                            .budget(
                                    trip.getBudget() != null
                                            ? trip.getBudget().getTotalBudget()
                                            : BigDecimal.ZERO
                            )
                            .spent(spent)
                            .budgetId(
                                    trip.getBudget() != null
                                            ? trip.getBudget().getId()
                                            : null
                            )
                            .expenses(
                                    trip.getBudget() != null
                                            ? trip.getBudget().getExpenses()
                                                    .stream()
                                                    .map(expense ->
                                                            ExpenseResponse.builder()
                                                                    .id(expense.getId())
                                                                    .amount(expense.getAmount())
                                                                    .category(expense.getCategory())
                                                                    .description(expense.getDescription())
                                                                    .expenseDate(expense.getExpenseDate())
                                                                    .build()
                                                    )
                                                    .toList()
                                            : java.util.Collections.<ExpenseResponse>emptyList()
                            )
                            .coverImage(trip.getCoverImage())

                            .itinerary(

                                    trip.getItineraries()

                                            .stream()

                                            .map(itinerary ->

                                                    ItineraryResponse.builder()

                                                            .id(itinerary.getId())

                                                            .dayNumber(itinerary.getDayNumber())

                                                            .date(itinerary.getDate())

                                                            .notes(itinerary.getNotes())

                                                            .activities(

                                                                    itinerary.getActivities()

                                                                            .stream()

                                                                            .map(activity ->

                                                                                    ActivityResponse.builder()

                                                                                            .id(activity.getId())

                                                                                            .title(activity.getTitle())

                                                                                            .description(activity.getDescription())

                                                                                            .activityTime(activity.getActivityTime())

                                                                                            .activityType(activity.getActivityType())
                                                                                            .build()
                                                                            )
                                                                            .toList()
                                                            ).build()
                                           ) .toList()      
                                           ) .build();
                })
                .toList();

        return ApiResponse.<List<TripResponse>>builder()
                .success(true)
                .message("Trips fetched successfully")
                .data(trips)
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<TripResponse> getTripById(Long id) {

        User user = getCurrentUser();

        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        Destination destination = trip.getDestinations().isEmpty()
                ? null
                : trip.getDestinations().get(0);

        List<ItineraryResponse> itineraryResponses = trip.getItineraries()
                .stream()
                .map(itinerary -> ItineraryResponse.builder()
                        .id(itinerary.getId())
                        .dayNumber(itinerary.getDayNumber())
                        .date(itinerary.getDate())
                        .notes(itinerary.getNotes())
                        .activities(itinerary.getActivities()
                                .stream()
                                .map(activity -> ActivityResponse.builder()
                                        .id(activity.getId())
                                        .title(activity.getTitle())
                                        .description(activity.getDescription())
                                        .activityTime(activity.getActivityTime())
                                        .activityType(activity.getActivityType())
                                        .build())
                                .toList())
                        .build())
                .toList();

        TripResponse response = TripResponse.builder()
                .id(trip.getId())
                .tripName(trip.getTripName())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .status(trip.getStatus())
                .destination(destination != null ? destination.getName() : "")
                .city(destination != null ? destination.getCity() : "")
                .state(destination != null ? destination.getState() : "")
                .country(destination != null ? destination.getCountry() : "")
                .totalMembers(trip.getTotalMembers())
                .notes(trip.getNotes())
                .description(trip.getDescription())
                .budget(
                        trip.getBudget() != null
                                ? trip.getBudget().getTotalBudget()
                                : BigDecimal.ZERO
                )
                .spent(
                	    trip.getBudget() != null
                	            ? trip.getBudget().getTotalSpent()
                	            : BigDecimal.ZERO
                	)
                .coverImage(trip.getCoverImage())
                .budgetId(
                        trip.getBudget() != null
                                ? trip.getBudget().getId()
                                : null
                )
                .expenses(
                        trip.getBudget() != null
                                ? trip.getBudget().getExpenses()
                                        .stream()
                                        .map(expense ->
                                                ExpenseResponse.builder()
                                                        .id(expense.getId())
                                                        .amount(expense.getAmount())
                                                        .category(expense.getCategory())
                                                        .description(expense.getDescription())
                                                        .expenseDate(expense.getExpenseDate())
                                                        .build()
                                        )
                                        .toList()
                                : java.util.Collections.<ExpenseResponse>emptyList()
                )
                .itinerary(itineraryResponses)
                .build();

        return ApiResponse.<TripResponse>builder()
                .success(true)
                .message("Trip fetched successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<TripResponse> updateTrip(Long id, UpdateTripRequest request) {

        User user = getCurrentUser();

        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        trip.setTripName(request.getTripName());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setTotalMembers(request.getTotalMembers());
        trip.setNotes(request.getNotes());
        trip.setDescription(request.getDescription());
        trip.setCoverImage(request.getCoverImage());

        Destination destination = trip.getDestinations().get(0);

        destination.setName(request.getDestinationName());
        destination.setCity(request.getCity());
        destination.setState(request.getState());
        destination.setCountry(request.getCountry());

        Budget budget = trip.getBudget();

        budget.setTotalBudget(request.getBudget());

        budget.setRemainingBudget(
                request.getBudget().subtract(budget.getTotalSpent())
        );

        tripRepository.save(trip);

        List<ItineraryResponse> itineraryResponses = trip.getItineraries()
                .stream()
                .map(itinerary -> ItineraryResponse.builder()
                        .id(itinerary.getId())
                        .dayNumber(itinerary.getDayNumber())
                        .date(itinerary.getDate())
                        .notes(itinerary.getNotes())
                        .activities(itinerary.getActivities()
                                .stream()
                                .map(activity -> ActivityResponse.builder()
                                        .id(activity.getId())
                                        .title(activity.getTitle())
                                        .description(activity.getDescription())
                                        .activityTime(activity.getActivityTime())
                                        .activityType(activity.getActivityType())
                                        .build())
                                .toList())
                        .build())
                .toList();

        TripResponse response = TripResponse.builder()
                .id(trip.getId())
                .tripName(trip.getTripName())
                .destination(destination.getName())
                .city(destination.getCity())
                .state(destination.getState())
                .country(destination.getCountry())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .status(trip.getStatus())
                .totalMembers(trip.getTotalMembers())
                .notes(trip.getNotes())
                .description(trip.getDescription())
                .coverImage(trip.getCoverImage())
                .budget(
                        trip.getBudget() != null
                                ? trip.getBudget().getTotalBudget()
                                : BigDecimal.ZERO
                )
                .spent(
                	    trip.getBudget() != null
                	            ? trip.getBudget().getTotalSpent()
                	            : BigDecimal.ZERO
                	)
                .itinerary(itineraryResponses)
                .build();

        return ApiResponse.<TripResponse>builder()
                .success(true)
                .message("Trip updated successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<String> deleteTrip(Long id) {

        User user = getCurrentUser();

        Trip trip = tripRepository.findByIdAndUser(id, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        tripRepository.delete(trip);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Trip deleted successfully")
                .data("Trip deleted successfully")
                .build();
    }
}