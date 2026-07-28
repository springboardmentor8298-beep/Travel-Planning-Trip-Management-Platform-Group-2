package com.tripnest.service;

import com.tripnest.dto.ActivityRequest;
import com.tripnest.dto.ActivityResponse;
import com.tripnest.entity.Activity;
import com.tripnest.entity.Destination;
import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;

    public ActivityService(ActivityRepository activityRepository, ItineraryRepository itineraryRepository, TripRepository tripRepository, DestinationRepository destinationRepository) {
        this.activityRepository = activityRepository;
        this.itineraryRepository = itineraryRepository;
        this.tripRepository = tripRepository;
        this.destinationRepository = destinationRepository;
    }

    public ActivityResponse createActivity(Long tripId, Long itineraryId, ActivityRequest request, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = itineraryRepository.findByIdAndTrip(itineraryId, trip)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        Activity activity = new Activity();
        activity.setName(request.getName());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocation(request.getLocation());
        activity.setCost(request.getCost());
        activity.setCategory(request.getCategory());
        activity.setItinerary(itinerary);
        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found"));
            activity.setDestination(destination);
        }
        activity = activityRepository.save(activity);
        return toActivityResponse(activity);
    }

    public List<ActivityResponse> getItineraryActivities(Long tripId, Long itineraryId, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = itineraryRepository.findByIdAndTrip(itineraryId, trip)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        return activityRepository.findByItineraryOrderByStartTimeAsc(itinerary).stream()
                .map(this::toActivityResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivityById(Long tripId, Long itineraryId, Long activityId, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = itineraryRepository.findByIdAndTrip(itineraryId, trip)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        Activity activity = activityRepository.findByIdAndItinerary(activityId, itinerary)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        return toActivityResponse(activity);
    }

    public ActivityResponse updateActivity(Long tripId, Long itineraryId, Long activityId, ActivityRequest request, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = itineraryRepository.findByIdAndTrip(itineraryId, trip)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        Activity activity = activityRepository.findByIdAndItinerary(activityId, itinerary)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        activity.setName(request.getName());
        activity.setDescription(request.getDescription());
        activity.setStartTime(request.getStartTime());
        activity.setEndTime(request.getEndTime());
        activity.setLocation(request.getLocation());
        activity.setCost(request.getCost());
        activity.setCategory(request.getCategory());
        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found"));
            activity.setDestination(destination);
        } else {
            activity.setDestination(null);
        }
        activity = activityRepository.save(activity);
        return toActivityResponse(activity);
    }

    public void deleteActivity(Long tripId, Long itineraryId, Long activityId, User user) {
        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        Itinerary itinerary = itineraryRepository.findByIdAndTrip(itineraryId, trip)
                .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        Activity activity = activityRepository.findByIdAndItinerary(activityId, itinerary)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
        activityRepository.delete(activity);
    }

    private ActivityResponse toActivityResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setName(activity.getName());
        response.setDescription(activity.getDescription());
        response.setStartTime(activity.getStartTime());
        response.setEndTime(activity.getEndTime());
        response.setLocation(activity.getLocation());
        response.setCost(activity.getCost());
        response.setCategory(activity.getCategory());
        if (activity.getDestination() != null) {
            response.setDestinationId(activity.getDestination().getId());
            response.setDestinationName(activity.getDestination().getName());
        }
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        return response;
    }
}
