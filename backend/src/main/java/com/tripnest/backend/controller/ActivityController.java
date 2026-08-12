package com.tripnest.backend.controller;

import com.tripnest.backend.model.ActivityEntity;
import com.tripnest.backend.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/trips/{tripId}/activities")
@CrossOrigin(origins = "*")
public class ActivityController {

    @Autowired
    private ActivityRepository activityRepository;

    @GetMapping
    public ResponseEntity<List<ActivityEntity>> getActivities(@PathVariable String tripId) {
        List<ActivityEntity> list = activityRepository.findByTripIdOrderByDayNumberAsc(tripId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> addActivity(@PathVariable String tripId, @RequestBody Map<String, Object> body) {
        ActivityEntity act = new ActivityEntity();
        act.setId("act_" + UUID.randomUUID().toString().substring(0, 8));
        act.setTripId(tripId);
        act.setDayNumber(body.containsKey("dayNumber") ? Integer.parseInt(body.get("dayNumber").toString()) : 1);
        act.setTitle(body.containsKey("title") ? body.get("title").toString() : "Sightseeing Activity");
        act.setDescription(body.containsKey("description") ? body.get("description").toString() : "");
        act.setCategory(body.containsKey("category") ? body.get("category").toString() : "Sightseeing");
        act.setPlaceName(body.containsKey("placeName") ? body.get("placeName").toString() : "");
        act.setPlaceAddress(body.containsKey("placeAddress") ? body.get("placeAddress").toString() : "");
        if (body.containsKey("cost")) act.setCost(Double.parseDouble(body.get("cost").toString()));
        if (body.containsKey("startTime")) act.setStartTime(body.get("startTime").toString());
        if (body.containsKey("endTime")) act.setEndTime(body.get("endTime").toString());

        ActivityEntity saved = activityRepository.save(act);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateActivity(@PathVariable String tripId, @PathVariable String id, @RequestBody Map<String, Object> body) {
        Optional<ActivityEntity> opt = activityRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        ActivityEntity act = opt.get();
        if (body.containsKey("title")) act.setTitle(body.get("title").toString());
        if (body.containsKey("description")) act.setDescription(body.get("description").toString());
        if (body.containsKey("category")) act.setCategory(body.get("category").toString());
        if (body.containsKey("placeName")) act.setPlaceName(body.get("placeName").toString());
        if (body.containsKey("cost")) act.setCost(Double.parseDouble(body.get("cost").toString()));
        if (body.containsKey("dayNumber")) act.setDayNumber(Integer.parseInt(body.get("dayNumber").toString()));

        ActivityEntity updated = activityRepository.save(act);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivity(@PathVariable String tripId, @PathVariable String id) {
        activityRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Activity deleted successfully"));
    }
}
