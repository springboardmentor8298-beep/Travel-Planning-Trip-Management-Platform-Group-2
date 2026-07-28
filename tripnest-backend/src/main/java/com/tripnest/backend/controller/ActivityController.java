package com.tripnest.backend.controller;

import com.tripnest.backend.entity.Activity;
import com.tripnest.backend.service.ActivityService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/activities")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    // Create Activity
    @PostMapping
    public Activity createActivity(@RequestBody Activity activity) {
        return activityService.createActivity(activity);
    }

    // Get Activities by Itinerary
    @GetMapping("/itinerary/{itineraryId}")
    public List<Activity> getActivitiesByItinerary(@PathVariable Long itineraryId) {
        return activityService.getActivitiesByItinerary(itineraryId);
    }

    @PutMapping("/{id}")
    public Activity updateActivity(
            @PathVariable Long id,
            @RequestBody Activity activity
    ) {

        return activityService.updateActivity(id, activity);

    }

    @DeleteMapping("/{id}")
    public void deleteActivity(@PathVariable Long id) {

        activityService.deleteActivity(id);

    }

}