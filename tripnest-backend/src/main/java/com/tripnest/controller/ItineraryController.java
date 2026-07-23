package com.tripnest.controller;

import com.tripnest.model.Itinerary;
import com.tripnest.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/itinerary")
public class ItineraryController {

    @Autowired
    private ItineraryService itineraryService;

    @PostMapping("/add")
    public Itinerary add(@RequestBody Itinerary itinerary) {
        return itineraryService.save(itinerary);
    }

    @GetMapping("/all")
    public List<Itinerary> getAll() {
        return itineraryService.getAll();
    }
}