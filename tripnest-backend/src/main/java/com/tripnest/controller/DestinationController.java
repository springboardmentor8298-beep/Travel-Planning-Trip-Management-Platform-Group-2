package com.tripnest.controller;

import com.tripnest.model.Destination;
import com.tripnest.service.DestinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/destinations")
public class DestinationController {

    @Autowired
    private DestinationService destinationService;

    @PostMapping("/add")
    public Destination addDestination(@RequestBody Destination destination) {
        return destinationService.saveDestination(destination);
    }

    @GetMapping("/all")
    public List<Destination> getAllDestinations() {
        return destinationService.getAllDestinations();
    }
}