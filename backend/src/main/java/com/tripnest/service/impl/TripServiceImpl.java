package com.tripnest.service.impl;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.entity.Activity;
import com.tripnest.entity.Destination;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedException;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import com.tripnest.service.TripService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final ItineraryRepository itineraryRepository;
    private final ActivityRepository activityRepository;
    private final com.tripnest.repository.TripMemberRepository tripMemberRepository;
    private final com.tripnest.service.NotificationService notificationService;

    public TripServiceImpl(TripRepository tripRepository,
                           UserRepository userRepository,
                           DestinationRepository destinationRepository,
                           ItineraryRepository itineraryRepository,
                           ActivityRepository activityRepository,
                           com.tripnest.repository.TripMemberRepository tripMemberRepository,
                           com.tripnest.service.NotificationService notificationService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.destinationRepository = destinationRepository;
        this.itineraryRepository = itineraryRepository;
        this.activityRepository = activityRepository;
        this.tripMemberRepository = tripMemberRepository;
        this.notificationService = notificationService;
    }

    @Override
    public TripResponse createTrip(TripRequest request, String email) {
        User user = getUserByEmail(email);
        Destination destination = getDestinationById(request.getDestinationId());

        validateDatesAndBudget(request);

        Trip trip = new Trip();
        trip.setUser(user);
        trip.setDestination(destination);
        trip.setTripName(request.getTripName());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudgetAllocated(request.getBudgetAllocated());
        trip.setNumberOfTravelers(request.getNumberOfTravelers());
        trip.setCoverImage(request.getCoverImage());
        trip.setStatus(request.getStatus() == null ? "UPCOMING" : request.getStatus());
        trip.setCreatedAt(LocalDateTime.now());
        trip.setUpdatedAt(LocalDateTime.now());

        Trip savedTrip = tripRepository.save(trip);

        // Add creator as OWNER in trip_members table
        com.tripnest.entity.TripMember ownerMember = new com.tripnest.entity.TripMember(savedTrip, user, "OWNER");
        tripMemberRepository.save(ownerMember);

        // Generate TRIP_CREATED notification
        com.tripnest.entity.Notification notification = new com.tripnest.entity.Notification();
        notification.setUser(user);
        notification.setNotificationTitle("Trip Created");
        notification.setMessage("Your trip '" + savedTrip.getTripName() + "' was successfully created.");
        notification.setNotificationType("TRIP_CREATED");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationService.saveNotification(notification);

        return mapToResponse(savedTrip);
    }

    @Override
    public List<TripResponse> getAllUserTrips(String email) {
        return getAllUserTrips(email, null, null, null);
    }

    @Override
    public List<TripResponse> getAllUserTrips(String email, String search, String status, String sortBy) {
        User user = getUserByEmail(email);
        List<Trip> trips = tripRepository.findAllUserAndSharedTrips(user.getUserId());

        // Search filter
        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            trips = trips.stream().filter(t ->
                (t.getTripName() != null && t.getTripName().toLowerCase().contains(q)) ||
                (t.getDescription() != null && t.getDescription().toLowerCase().contains(q)) ||
                (t.getDestination() != null && (
                    (t.getDestination().getDestinationName() != null && t.getDestination().getDestinationName().toLowerCase().contains(q)) ||
                    (t.getDestination().getCity() != null && t.getDestination().getCity().toLowerCase().contains(q)) ||
                    (t.getDestination().getCountry() != null && t.getDestination().getCountry().toLowerCase().contains(q))
                ))
            ).collect(Collectors.toList());
        }

        // Status filter
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            String targetStatus = status.trim().toUpperCase();
            trips = trips.stream().filter(t ->
                t.getStatus() != null && t.getStatus().toUpperCase().equals(targetStatus)
            ).collect(Collectors.toList());
        }

        // Sorting
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            switch (sortBy.toLowerCase()) {
                case "enddate":
                    trips.sort(Comparator.comparing(Trip::getEndDate, Comparator.nullsLast(Comparator.naturalOrder())));
                    break;
                case "budget":
                    trips.sort(Comparator.comparing(Trip::getBudgetAllocated, Comparator.nullsLast(Comparator.reverseOrder())));
                    break;
                case "name":
                    trips.sort(Comparator.comparing(Trip::getTripName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
                    break;
                case "status":
                    trips.sort(Comparator.comparing(Trip::getStatus, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));
                    break;
                case "startdate":
                default:
                    trips.sort(Comparator.comparing(Trip::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())));
                    break;
            }
        }

        return trips.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TripResponse> getAllTrips() {
        List<Trip> trips = tripRepository.findAll();
        return trips.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public TripResponse getTripById(Integer tripId, String email) {
        User user = getUserByEmail(email);
        Trip trip = getTripByIdAndVerifyUser(tripId, user);
        return mapToResponse(trip);
    }

    @Override
    public TripResponse updateTrip(Integer tripId, TripRequest request, String email) {
        User user = getUserByEmail(email);
        Trip trip = getTripByIdAndVerifyUser(tripId, user);
        Destination destination = getDestinationById(request.getDestinationId());

        validateDatesAndBudget(request);

        trip.setDestination(destination);
        trip.setTripName(request.getTripName());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudgetAllocated(request.getBudgetAllocated());
        trip.setNumberOfTravelers(request.getNumberOfTravelers());
        trip.setCoverImage(request.getCoverImage());
        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }
        trip.setUpdatedAt(LocalDateTime.now());

        Trip updatedTrip = tripRepository.save(trip);
        return mapToResponse(updatedTrip);
    }

    @Override
    public void deleteTrip(Integer tripId, String email) {
        User user = getUserByEmail(email);
        Trip trip = getTripByIdAndVerifyUser(tripId, user);
        tripRepository.delete(trip);
    }

    @Override
    public TripResponse duplicateTrip(Integer tripId, String email) {
        User user = getUserByEmail(email);
        Trip origTrip = getTripByIdAndVerifyUser(tripId, user);

        Trip dupTrip = new Trip();
        dupTrip.setUser(user);
        dupTrip.setDestination(origTrip.getDestination());
        dupTrip.setTripName(origTrip.getTripName() + " (Copy)");
        dupTrip.setDescription(origTrip.getDescription());
        dupTrip.setStartDate(origTrip.getStartDate());
        dupTrip.setEndDate(origTrip.getEndDate());
        dupTrip.setBudgetAllocated(origTrip.getBudgetAllocated());
        dupTrip.setNumberOfTravelers(origTrip.getNumberOfTravelers());
        dupTrip.setCoverImage(origTrip.getCoverImage());
        dupTrip.setStatus("PLANNING");
        dupTrip.setCreatedAt(LocalDateTime.now());
        dupTrip.setUpdatedAt(LocalDateTime.now());

        Trip savedDupTrip = tripRepository.save(dupTrip);

        // Duplicate Itinerary days and activities
        List<Itinerary> origItineraries = itineraryRepository.findByTrip_TripIdOrderByDayNumberAsc(origTrip.getTripId());
        for (Itinerary origItin : origItineraries) {
            Itinerary dupItin = new Itinerary();
            dupItin.setTrip(savedDupTrip);
            dupItin.setDayNumber(origItin.getDayNumber());
            dupItin.setItineraryTitle(origItin.getItineraryTitle());
            dupItin.setDescription(origItin.getDescription());
            Itinerary savedDupItin = itineraryRepository.save(dupItin);

            List<Activity> origActivities = activityRepository.findByItinerary_ItineraryIdOrderByActivityTimeAsc(origItin.getItineraryId());
            for (Activity origAct : origActivities) {
                Activity dupAct = new Activity();
                dupAct.setItinerary(savedDupItin);
                dupAct.setActivityName(origAct.getActivityName());
                dupAct.setActivityType(origAct.getActivityType());
                dupAct.setPlaceName(origAct.getPlaceName());
                dupAct.setActivityTime(origAct.getActivityTime());
                dupAct.setEndTime(origAct.getEndTime());
                dupAct.setTimeSlot(origAct.getTimeSlot());
                dupAct.setEstimatedCost(origAct.getEstimatedCost());
                dupAct.setStatus("PENDING");
                dupAct.setDescription(origAct.getDescription());
                dupAct.setNotes(origAct.getNotes());
                dupAct.setDisplayOrder(origAct.getDisplayOrder());
                dupAct.setReminder(origAct.getReminder());
                activityRepository.save(dupAct);
            }
        }

        return mapToResponse(savedDupTrip);
    }

    @Override
    public TripResponse archiveTrip(Integer tripId, String email) {
        User user = getUserByEmail(email);
        Trip trip = getTripByIdAndVerifyUser(tripId, user);
        if ("ARCHIVED".equalsIgnoreCase(trip.getStatus())) {
            trip.setStatus("UPCOMING");
        } else {
            trip.setStatus("ARCHIVED");
        }
        trip.setUpdatedAt(LocalDateTime.now());
        Trip saved = tripRepository.save(trip);
        return mapToResponse(saved);
    }

    // Helper Methods

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + email + " not found"));
    }

    private Destination getDestinationById(Integer destinationId) {
        return destinationRepository.findById(destinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Destination with ID " + destinationId + " not found"));
    }

    private Trip getTripByIdAndVerifyUser(Integer tripId, User user) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + tripId + " not found"));

        boolean isOwner = trip.getUser().getUserId().equals(user.getUserId());
        boolean isMember = tripMemberRepository.existsByTrip_TripIdAndUser_UserId(tripId, user.getUserId());

        if (!isOwner && !isMember) {
            throw new UnauthorizedException("You are not authorized to access this trip");
        }
        return trip;
    }

    private void validateDatesAndBudget(TripRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be greater than or equal to start date");
        }
        if (request.getBudgetAllocated().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Budget cannot be negative");
        }
        if (request.getNumberOfTravelers() < 1) {
            throw new IllegalArgumentException("Travelers minimum 1");
        }
    }

    private TripResponse mapToResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setTripId(trip.getTripId());
        response.setTripName(trip.getTripName());
        response.setDescription(trip.getDescription());
        response.setStartDate(trip.getStartDate());
        response.setEndDate(trip.getEndDate());
        response.setBudgetAllocated(trip.getBudgetAllocated());
        response.setNumberOfTravelers(trip.getNumberOfTravelers());
        response.setCoverImage(trip.getCoverImage());
        response.setStatus(trip.getStatus());

        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
            response.setDurationDays((int) days);
        } else {
            response.setDurationDays(0);
        }

        if (trip.getDestination() != null) {
            response.setDestinationId(trip.getDestination().getDestinationId());
            response.setDestinationName(trip.getDestination().getDestinationName());
            response.setCity(trip.getDestination().getCity());
            response.setState(trip.getDestination().getState());
            response.setCountry(trip.getDestination().getCountry());
        }

        // Activity Stats & Progress
        List<Activity> activities = activityRepository.findByItinerary_Trip_TripId(trip.getTripId());
        int totalActs = activities.size();
        int completedActs = (int) activities.stream().filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus())).count();
        int progress = totalActs > 0 ? (completedActs * 100) / totalActs : 0;

        response.setTotalActivitiesCount(totalActs);
        response.setCompletedActivitiesCount(completedActs);
        response.setProgressPercentage(progress);

        return response;
    }
}

