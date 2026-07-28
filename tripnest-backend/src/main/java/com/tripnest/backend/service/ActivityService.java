package com.tripnest.backend.service;

import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    // Create Activity
    public Activity createActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    // Get Activities by Itinerary
    public List<Activity> getActivitiesByItinerary(Long itineraryId) {
        return activityRepository.findByItineraryId(itineraryId);
    }

    // Get Activity by ID
    public Activity getActivityById(Long id) {

        return activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

    }

    // Update Activity
    public Activity updateActivity(Long id, Activity updatedActivity) {

        Activity activity = getActivityById(id);

        activity.setTitle(updatedActivity.getTitle());
        activity.setLocation(updatedActivity.getLocation());
        activity.setStartTime(updatedActivity.getStartTime());
        activity.setEndTime(updatedActivity.getEndTime());
        activity.setDescription(updatedActivity.getDescription());

        return activityRepository.save(activity);

    }

    // Delete Activity
    public void deleteActivity(Long id) {

        activityRepository.deleteById(id);

    }

}