package com.tripnest.service;

import com.tripnest.dto.ActivityRequest;
import com.tripnest.dto.ActivityResponse;
import com.tripnest.entity.Activity;
import com.tripnest.entity.Itinerary;
import com.tripnest.repository.ActivityRepository;
import com.tripnest.repository.ItineraryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for activity CRUD operations within an itinerary day.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;

    public ActivityResponse addActivity(Long itineraryId, ActivityRequest request) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Itinerary not found"));

        Activity activity = new Activity();
        activity.setItinerary(itinerary);
        applyRequest(activity, request);

        return toResponse(activityRepository.save(activity));
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivities(Long itineraryId) {
        return activityRepository.findByItineraryIdOrderByStartTimeAsc(itineraryId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse updateActivity(Long activityId, Long itineraryId, ActivityRequest request) {
        Activity activity = activityRepository.findByIdAndItineraryId(activityId, itineraryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
        applyRequest(activity, request);
        return toResponse(activityRepository.save(activity));
    }

    public void deleteActivity(Long activityId, Long itineraryId) {
        Activity activity = activityRepository.findByIdAndItineraryId(activityId, itineraryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Activity not found"));
        activityRepository.delete(activity);
    }

    private void applyRequest(Activity activity, ActivityRequest req) {
        activity.setName(req.getName());
        activity.setDescription(req.getDescription());
        activity.setActivityType(req.getActivityType() != null ? req.getActivityType() : activity.getActivityType());
        activity.setStartTime(req.getStartTime());
        activity.setEndTime(req.getEndTime());
        activity.setLocation(req.getLocation());
        activity.setCost(req.getCost());
    }

    public ActivityResponse toResponse(Activity activity) {
        ActivityResponse res = new ActivityResponse();
        res.setId(activity.getId());
        res.setName(activity.getName());
        res.setDescription(activity.getDescription());
        res.setActivityType(activity.getActivityType());
        res.setStartTime(activity.getStartTime());
        res.setEndTime(activity.getEndTime());
        res.setLocation(activity.getLocation());
        res.setCost(activity.getCost());
        res.setItineraryId(activity.getItinerary().getId());
        return res;
    }
}
