package com.tripnest.service;

import com.tripnest.model.Itinerary;
import com.tripnest.repository.ItineraryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItineraryService {

    @Autowired
    private ItineraryRepository itineraryRepository;

    public Itinerary save(Itinerary itinerary) {
        return itineraryRepository.save(itinerary);
    }

    public List<Itinerary> getAll() {
        return itineraryRepository.findAll();
    }
}