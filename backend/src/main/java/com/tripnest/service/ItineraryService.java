package com.tripnest.service;

import com.tripnest.entity.Itinerary;
import com.tripnest.entity.Trip;
import com.tripnest.entity.User;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.exception.UnauthorizedException;
import com.tripnest.repository.ItineraryRepository;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripMemberRepository tripMemberRepository;

    public List<Itinerary> getItinerariesByTripId(Integer tripId, String email) {
        User user = getUserByEmail(email);
        getTripAndVerifyUser(tripId, user);
        return itineraryRepository.findByTrip_TripIdOrderByDayNumberAsc(tripId);
    }

    public Itinerary getItineraryById(Integer id, String email) {
        User user = getUserByEmail(email);
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary with ID " + id + " not found"));
        getTripAndVerifyUser(itinerary.getTrip().getTripId(), user);
        return itinerary;
    }

    public Itinerary saveItinerary(Itinerary itinerary, String email) {
        User user = getUserByEmail(email);
        if (itinerary.getTrip() == null || itinerary.getTrip().getTripId() == null) {
            throw new IllegalArgumentException("Trip ID is required");
        }
        Trip trip = getTripAndVerifyUser(itinerary.getTrip().getTripId(), user);
        itinerary.setTrip(trip);
        return itineraryRepository.save(itinerary);
    }

    public Itinerary updateItinerary(Integer id, Itinerary request, String email) {
        User user = getUserByEmail(email);
        Itinerary existing = itineraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary with ID " + id + " not found"));
        getTripAndVerifyUser(existing.getTrip().getTripId(), user);

        existing.setDayNumber(request.getDayNumber());
        existing.setItineraryTitle(request.getItineraryTitle());
        existing.setDescription(request.getDescription());
        return itineraryRepository.save(existing);
    }

    public void deleteItinerary(Integer id, String email) {
        User user = getUserByEmail(email);
        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Itinerary with ID " + id + " not found"));
        getTripAndVerifyUser(itinerary.getTrip().getTripId(), user);
        itineraryRepository.delete(itinerary);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + email + " not found"));
    }

    private Trip getTripAndVerifyUser(Integer tripId, User user) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip with ID " + tripId + " not found"));

        boolean isOwner = trip.getUser().getUserId().equals(user.getUserId());
        boolean isMember = tripMemberRepository.existsByTrip_TripIdAndUser_UserId(tripId, user.getUserId());

        if (!isOwner && !isMember) {
            throw new UnauthorizedException("You are not authorized to access this trip");
        }
        return trip;
    }
}