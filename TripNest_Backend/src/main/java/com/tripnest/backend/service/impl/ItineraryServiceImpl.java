package com.tripnest.backend.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.CreateItineraryRequest;
import com.tripnest.backend.dto.response.ActivityResponse;
import com.tripnest.backend.dto.response.ItineraryResponse;
import com.tripnest.backend.entity.Itinerary;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.exception.ResourceNotFoundException;
import com.tripnest.backend.repository.ItineraryRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.ItineraryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ItineraryServiceImpl implements ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }
    
    @Override
    public ApiResponse<ItineraryResponse> createItinerary(
            Long tripId,
            CreateItineraryRequest request) {

        User user = getCurrentUser();

        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        Itinerary itinerary = Itinerary.builder()
                .dayNumber(request.getDayNumber())
                .date(request.getDate())
                .notes(request.getNotes())
                .trip(trip)
                .build();

        itinerary = itineraryRepository.save(itinerary);

        ItineraryResponse response = ItineraryResponse.builder()
                .id(itinerary.getId())
                .dayNumber(itinerary.getDayNumber())
                .date(itinerary.getDate())
                .notes(itinerary.getNotes())
                .build();

        return ApiResponse.<ItineraryResponse>builder()
                .success(true)
                .message("Itinerary created successfully")
                .data(response)
                .build();
    }

    @Override
    public ApiResponse<List<ItineraryResponse>> getTripItinerary(Long tripId) {

        User user = getCurrentUser();

        Trip trip = tripRepository.findByIdAndUser(tripId, user)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Trip not found"));

        List<ItineraryResponse> response = itineraryRepository
                .findByTripOrderByDayNumberAsc(trip)
                .stream()
                .map(itinerary -> {

                    List<ActivityResponse> activities = itinerary.getActivities()
                            .stream()
                            .map(activity -> ActivityResponse.builder()
                                    .id(activity.getId())
                                    .title(activity.getTitle())
                                    .description(activity.getDescription())
                                    .activityTime(activity.getActivityTime())
                                    .activityType(activity.getActivityType())
                                    .build())
                            .toList();

                    return ItineraryResponse.builder()
                            .id(itinerary.getId())
                            .dayNumber(itinerary.getDayNumber())
                            .date(itinerary.getDate())
                            .notes(itinerary.getNotes())
                            .activities(activities)
                            .build();
                })
                .toList();

        return ApiResponse.<List<ItineraryResponse>>builder()
                .success(true)
                .message("Itinerary fetched successfully")
                .data(response)
                .build();
    }
    
}