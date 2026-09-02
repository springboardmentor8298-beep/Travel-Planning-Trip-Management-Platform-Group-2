package com.tripnest.controller;

import com.tripnest.entity.Destination;
import com.tripnest.service.DestinationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    @GetMapping
    public ResponseEntity<List<Destination>> getAllDestinations() {
        List<Destination> destinations = destinationService.getAllDestinations();
        return ResponseEntity.ok(destinations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Destination> getDestinationById(@PathVariable("id") Integer id) {
        return destinationService.getDestinationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Destination> createDestination(@RequestBody Destination destination) {
        Destination saved = destinationService.saveDestination(destination);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Destination> updateDestination(@PathVariable("id") Integer id, @RequestBody Destination destination) {
        return destinationService.getDestinationById(id)
                .map(existing -> {
                    existing.setDestinationName(destination.getDestinationName());
                    existing.setCity(destination.getCity());
                    existing.setState(destination.getState());
                    existing.setCountry(destination.getCountry());
                    existing.setDescription(destination.getDescription());
                    existing.setAttractions(destination.getAttractions());
                    existing.setWeatherInfo(destination.getWeatherInfo());
                    existing.setTravelGuide(destination.getTravelGuide());
                    Destination updated = destinationService.updateDestination(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDestination(@PathVariable("id") Integer id) {
        if (destinationService.getDestinationById(id).isPresent()) {
            destinationService.deleteDestination(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}