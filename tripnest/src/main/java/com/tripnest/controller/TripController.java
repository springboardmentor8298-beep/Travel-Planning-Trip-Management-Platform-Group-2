package com.tripnest.controller;

import com.tripnest.dto.*;
import com.tripnest.service.TripService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {
    private final TripService service;
    public TripController(TripService service) { this.service=service; }
    @GetMapping public TripPageResponse list(Principal p,@RequestParam(defaultValue = "") String q,@RequestParam(required = false) String status,@RequestParam(defaultValue = "upcoming") String sort,@RequestParam(defaultValue = "0") int page,@RequestParam(defaultValue = "12") int size) { return service.list(p.getName(),q,status,sort,page,size); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public TripResponse create(Principal p,@Valid @RequestBody TripRequest r) { return service.create(p.getName(),r); }
    @GetMapping("/{tripId}") public TripResponse get(Principal p,@PathVariable Long tripId) { return service.get(p.getName(),tripId); }
    @PutMapping("/{tripId}") public TripResponse update(Principal p,@PathVariable Long tripId,@Valid @RequestBody TripRequest r) { return service.update(p.getName(),tripId,r); }
    @DeleteMapping("/{tripId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(Principal p,@PathVariable Long tripId) { service.delete(p.getName(),tripId); }
    @GetMapping("/{tripId}/itineraries") public List<ItineraryResponse> itineraries(Principal p,@PathVariable Long tripId) { return service.listItineraries(p.getName(),tripId); }
    @PostMapping("/{tripId}/itineraries") @ResponseStatus(HttpStatus.CREATED) public ItineraryResponse addItinerary(Principal p,@PathVariable Long tripId,@Valid @RequestBody ItineraryRequest r) { return service.addItinerary(p.getName(),tripId,r); }
    @DeleteMapping("/{tripId}/itineraries/{itineraryId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteItinerary(Principal p,@PathVariable Long tripId,@PathVariable Long itineraryId) { service.deleteItinerary(p.getName(),tripId,itineraryId); }
    @PutMapping("/{tripId}/itineraries/{itineraryId}") public ItineraryResponse updateItinerary(Principal p,@PathVariable Long tripId,@PathVariable Long itineraryId,@Valid @RequestBody ItineraryRequest r){return service.updateItinerary(p.getName(),tripId,itineraryId,r);}
    @PostMapping("/{tripId}/itineraries/{itineraryId}/activities") @ResponseStatus(HttpStatus.CREATED) public ActivityResponse addActivity(Principal p,@PathVariable Long tripId,@PathVariable Long itineraryId,@Valid @RequestBody ActivityRequest r) { return service.addActivity(p.getName(),tripId,itineraryId,r); }
    @DeleteMapping("/{tripId}/itineraries/{itineraryId}/activities/{activityId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteActivity(Principal p,@PathVariable Long tripId,@PathVariable Long itineraryId,@PathVariable Long activityId) { service.deleteActivity(p.getName(),tripId,itineraryId,activityId); }
    @PutMapping("/{tripId}/itineraries/{itineraryId}/activities/{activityId}") public ActivityResponse updateActivity(Principal p,@PathVariable Long tripId,@PathVariable Long itineraryId,@PathVariable Long activityId,@Valid @RequestBody ActivityRequest r){return service.updateActivity(p.getName(),tripId,itineraryId,activityId,r);}
    @PatchMapping("/{tripId}/itineraries/{itineraryId}/activities/order") public List<ActivityResponse> reorderActivities(Principal p,@PathVariable Long tripId,@PathVariable Long itineraryId,@Valid @RequestBody ActivityOrderRequest r){return service.reorderActivities(p.getName(),tripId,itineraryId,r);}
    @GetMapping("/{tripId}/members") public List<TripMemberResponse> members(Principal p,@PathVariable Long tripId){return service.members(p.getName(),tripId);}
    @PostMapping("/{tripId}/members") @ResponseStatus(HttpStatus.CREATED) public TripMemberResponse addMember(Principal p,@PathVariable Long tripId,@Valid @RequestBody TripMemberRequest r){return service.addMember(p.getName(),tripId,r);}
    @DeleteMapping("/{tripId}/members/{memberId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void removeMember(Principal p,@PathVariable Long tripId,@PathVariable Long memberId){service.removeMember(p.getName(),tripId,memberId);}
}
