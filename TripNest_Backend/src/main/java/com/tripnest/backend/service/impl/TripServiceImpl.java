package com.tripnest.backend.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import com.tripnest.backend.exception.BadRequestException;
import java.time.LocalDate;

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
import com.tripnest.backend.entity.TripMember;
import com.tripnest.backend.dto.response.TripMemberResponse;
import com.tripnest.backend.dto.response.DocumentResponse;
import com.tripnest.backend.dto.response.TripDetailsResponse;
import org.springframework.security.access.AccessDeniedException;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.repository.TripMemberRepository;
import com.tripnest.backend.repository.DocumentRepository;
import com.tripnest.backend.service.TripService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;

    private final UserRepository userRepository;
    
    private final DestinationRepository destinationRepository;

    private final BudgetRepository budgetRepository;

    private final TripMemberRepository tripMemberRepository;

    private final DocumentRepository documentRepository;
    
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }
    
    private TripStatus calculateDynamicStatus(Trip trip) {
        if (trip.getStatus() == TripStatus.CANCELLED) {
            return TripStatus.CANCELLED;
        }
        LocalDate today = LocalDate.now();
        if (today.isBefore(trip.getStartDate())) {
            return TripStatus.UPCOMING;
        } else if (today.isAfter(trip.getEndDate())) {
            return TripStatus.COMPLETED;
        } else {
            return TripStatus.ACTIVE;
        }
    }

    @Override
    @Transactional
    public ApiResponse<TripResponse> createTrip(CreateTripRequest request) {

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

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

        TripMember ownerMember = TripMember.builder()
                .trip(trip)
                .user(user)
                .email(user.getEmail())
                .name(user.getFullName())
                .role("OWNER")
                .status("ACCEPTED")
                .build();
        tripMemberRepository.save(ownerMember);

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
                .status(calculateDynamicStatus(trip))
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
    public ApiResponse<List<TripResponse>> getMyTrips(String search, String status, String sort) {

        User currentUser = getCurrentUser();

        Specification<Trip> spec = (root, query, cb) -> {
            Join<Trip, TripMember> membersJoin = root.join("tripMembers", JoinType.LEFT);
            Predicate userPred = cb.or(
                    cb.equal(root.get("user"), currentUser),
                    cb.and(
                            cb.equal(membersJoin.get("user"), currentUser),
                            cb.equal(membersJoin.get("status"), "ACCEPTED")
                    )
            );

            query.distinct(true);
            Predicate finalPred = userPred;

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Join<Trip, Destination> destJoin = root.join("destinations", JoinType.LEFT);
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("tripName")), pattern),
                        cb.like(cb.lower(destJoin.get("name")), pattern),
                        cb.like(cb.lower(destJoin.get("city")), pattern),
                        cb.like(cb.lower(destJoin.get("state")), pattern),
                        cb.like(cb.lower(destJoin.get("country")), pattern)
                );
                finalPred = cb.and(finalPred, searchPred);
            }

            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("All")) {
                LocalDate today = LocalDate.now();
                Predicate statusPred;
                String statusStr = status.trim().toUpperCase();
                if (statusStr.equals("UPCOMING")) {
                    statusPred = cb.and(
                            cb.notEqual(root.get("status"), TripStatus.CANCELLED),
                            cb.greaterThan(root.get("startDate"), today)
                    );
                } else if (statusStr.equals("ACTIVE")) {
                    statusPred = cb.and(
                            cb.notEqual(root.get("status"), TripStatus.CANCELLED),
                            cb.lessThanOrEqualTo(root.get("startDate"), today),
                            cb.greaterThanOrEqualTo(root.get("endDate"), today)
                    );
                } else if (statusStr.equals("COMPLETED")) {
                    statusPred = cb.or(
                            cb.equal(root.get("status"), TripStatus.COMPLETED),
                            cb.and(
                                    cb.notEqual(root.get("status"), TripStatus.CANCELLED),
                                    cb.lessThan(root.get("endDate"), today)
                            )
                    );
                } else if (statusStr.equals("CANCELLED")) {
                    statusPred = cb.equal(root.get("status"), TripStatus.CANCELLED);
                } else {
                    statusPred = cb.conjunction();
                }
                finalPred = cb.and(finalPred, statusPred);
            }

            return finalPred;
        };

        org.springframework.data.domain.Sort sorting = org.springframework.data.domain.Sort.unsorted();
        if (sort != null && !sort.trim().isEmpty()) {
            if (sort.equalsIgnoreCase("dateAsc") || sort.equalsIgnoreCase("startDate-asc")) {
                sorting = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "startDate");
            } else if (sort.equalsIgnoreCase("dateDesc") || sort.equalsIgnoreCase("startDate-desc")) {
                sorting = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "startDate");
            } else if (sort.equalsIgnoreCase("budgetDesc") || sort.equalsIgnoreCase("budget-desc")) {
                sorting = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "budget.totalBudget");
            } else if (sort.equalsIgnoreCase("titleAsc") || sort.equalsIgnoreCase("title-asc")) {
                sorting = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "tripName");
            }
        } else {
            sorting = org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.ASC, "startDate");
        }

        List<TripResponse> trips = tripRepository.findAll(spec, sorting)
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
                            .status(calculateDynamicStatus(trip))
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
                                                                                            .cost(activity.getCost() != null ? activity.getCost() : BigDecimal.ZERO)
                                                                                            .build()
                                                                            )
                                                                            .toList()
                                                            ).build()
                                            ).toList()
                            ).build();
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
    public ApiResponse<com.tripnest.backend.dto.response.TripDetailsResponse> getTripById(Long id) {

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        validateTripAccess(trip);

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
                                        .cost(activity.getCost() != null ? activity.getCost() : BigDecimal.ZERO)
                                        .build())
                                .toList())
                        .build())
                .toList();

        // Calculate estimated cost from activities
        BigDecimal estimatedCost = trip.getItineraries().stream()
                .flatMap(it -> it.getActivities().stream())
                .map(act -> act.getCost() != null ? act.getCost() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate utilization percentage
        double utilizationPercentage = 0.0;
        BigDecimal spentVal = BigDecimal.ZERO;
        BigDecimal budgetVal = BigDecimal.ZERO;
        if (trip.getBudget() != null) {
            budgetVal = trip.getBudget().getTotalBudget();
            spentVal = trip.getBudget().getTotalSpent();
            if (budgetVal.compareTo(BigDecimal.ZERO) > 0) {
                utilizationPercentage = spentVal.doubleValue() / budgetVal.doubleValue() * 100.0;
            }
        }

        // Fetch travelers (collaboration members)
        List<TripMemberResponse> travelers = tripMemberRepository.findByTrip(trip)
                .stream()
                .map(m -> TripMemberResponse.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .email(m.getEmail())
                        .role(m.getRole())
                        .status(m.getStatus())
                        .build())
                .toList();

        // Fetch documents
        List<DocumentResponse> documents = documentRepository.findByTrip(trip)
                .stream()
                .map(d -> DocumentResponse.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .type(d.getType())
                        .size(d.getSize())
                        .uploadedAt(d.getCreatedAt())
                        .build())
                .toList();

        TripDetailsResponse response = TripDetailsResponse.builder()
                .id(trip.getId())
                .tripName(trip.getTripName())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .status(calculateDynamicStatus(trip))
                .destination(destination != null ? destination.getName() : "")
                .city(destination != null ? destination.getCity() : "")
                .state(destination != null ? destination.getState() : "")
                .country(destination != null ? destination.getCountry() : "")
                .totalMembers(trip.getTotalMembers())
                .notes(trip.getNotes())
                .description(trip.getDescription())
                .budget(budgetVal)
                .spent(spentVal)
                .budgetId(trip.getBudget() != null ? trip.getBudget().getId() : null)
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
                .travelers(travelers)
                .documents(documents)
                .estimatedCost(estimatedCost)
                .utilizationPercentage(utilizationPercentage)
                .coverImage(trip.getCoverImage())
                .build();

        return ApiResponse.<TripDetailsResponse>builder()
                .success(true)
                .message("Trip fetched successfully")
                .data(response)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<TripResponse> updateTrip(Long id, UpdateTripRequest request) {

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date cannot be after end date");
        }

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        validateTripEditPermission(trip);

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
                .status(calculateDynamicStatus(trip))
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

        User currentUser = getCurrentUser();

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        boolean isOwner = trip.getUser().getId().equals(currentUser.getId());
        if (!isOwner) {
            String role = tripMemberRepository.findByTripAndUser(trip, currentUser)
                    .filter(m -> "ACCEPTED".equalsIgnoreCase(m.getStatus()))
                    .map(m -> m.getRole().toUpperCase())
                    .orElse("MEMBER");
            if (!"OWNER".equals(role)) {
                throw new AccessDeniedException("Only the trip OWNER can delete this trip.");
            }
        }

        tripRepository.delete(trip);

        return ApiResponse.<String>builder()
                .success(true)
                .message("Trip deleted successfully")
                .data("Trip deleted successfully")
                .build();
    }

    private void validateTripAccess(Trip trip) {
        User currentUser = getCurrentUser();
        if (trip.getUser().getId().equals(currentUser.getId())) {
            return;
        }
        boolean isMember = tripMemberRepository.findByTripAndUser(trip, currentUser)
                .filter(m -> "ACCEPTED".equalsIgnoreCase(m.getStatus()))
                .isPresent();
        if (!isMember) {
            throw new AccessDeniedException("You do not have permission to access this trip.");
        }
    }

    private void validateTripEditPermission(Trip trip) {
        User currentUser = getCurrentUser();
        if (trip.getUser().getId().equals(currentUser.getId())) {
            return;
        }
        String role = tripMemberRepository.findByTripAndUser(trip, currentUser)
                .filter(m -> "ACCEPTED".equalsIgnoreCase(m.getStatus()))
                .map(m -> m.getRole().toUpperCase())
                .orElse("MEMBER");
        if (!"OWNER".equals(role) && !"EDITOR".equals(role)) {
            throw new AccessDeniedException("You do not have permission to modify this trip.");
        }
    }
}