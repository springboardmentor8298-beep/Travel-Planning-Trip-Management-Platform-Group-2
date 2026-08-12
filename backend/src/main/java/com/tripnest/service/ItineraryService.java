package com.tripnest.service;

import com.tripnest.dto.ItineraryItemRequest;
import com.tripnest.dto.ItineraryItemResponse;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.ItineraryItem;
import com.tripnest.model.Trip;
import com.tripnest.repository.ItineraryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItineraryService {

    private final ItineraryItemRepository itineraryItemRepository;
    private final TripAccessService tripAccessService;

    public ItineraryService(ItineraryItemRepository itineraryItemRepository, TripAccessService tripAccessService) {
        this.itineraryItemRepository = itineraryItemRepository;
        this.tripAccessService = tripAccessService;
    }

    public List<ItineraryItemResponse> getItinerary(String email, Long tripId) {
        tripAccessService.findAccessibleTrip(email, tripId);
        return itineraryItemRepository.findByTripIdOrderByActivityDateAscStartTimeAsc(tripId)
                .stream()
                .map(ItineraryItemResponse::fromEntity)
                .toList();
    }

    public ItineraryItemResponse addItineraryItem(String email, Long tripId, ItineraryItemRequest request) {
        Trip trip = tripAccessService.findAccessibleTrip(email, tripId);
        ItineraryItem item = new ItineraryItem();
        applyRequest(item, request);
        item.setTrip(trip);
        return ItineraryItemResponse.fromEntity(itineraryItemRepository.save(item));
    }

    public ItineraryItemResponse updateItineraryItem(String email, Long tripId, Long itemId, ItineraryItemRequest request) {
        tripAccessService.findAccessibleTrip(email, tripId);
        ItineraryItem item = findItemForTrip(itemId, tripId);
        applyRequest(item, request);
        return ItineraryItemResponse.fromEntity(itineraryItemRepository.save(item));
    }

    public void deleteItineraryItem(String email, Long tripId, Long itemId) {
        tripAccessService.findAccessibleTrip(email, tripId);
        ItineraryItem item = findItemForTrip(itemId, tripId);
        itineraryItemRepository.delete(item);
    }

    private ItineraryItem findItemForTrip(Long itemId, Long tripId) {
        ItineraryItem item = itineraryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary item not found"));
        if (!item.getTrip().getId().equals(tripId)) {
            throw new ResourceNotFoundException("Itinerary item not found for this trip");
        }
        return item;
    }

    private void applyRequest(ItineraryItem item, ItineraryItemRequest request) {
        item.setTitle(request.getTitle());
        item.setActivityDate(request.getActivityDate());
        item.setStartTime(request.getStartTime());
        item.setEndTime(request.getEndTime());
        item.setActivityType(request.getActivityType());
        item.setLocation(request.getLocation());
        item.setPlaceAddress(request.getPlaceAddress());
        item.setReminderAt(request.getReminderAt());
        item.setNotes(request.getNotes());
        item.setLat(request.getLat());
        item.setLng(request.getLng());
    }
}
