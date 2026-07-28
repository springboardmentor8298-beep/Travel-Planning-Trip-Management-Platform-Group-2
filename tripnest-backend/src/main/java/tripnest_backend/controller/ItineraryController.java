package tripnest_backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import tripnest_backend.entity.Itinerary;
import tripnest_backend.repository.ItineraryRepository;

@RestController
@RequestMapping("/api/itineraries")
@CrossOrigin(origins = "http://localhost:5173")
public class ItineraryController {

    @Autowired
    private ItineraryRepository repository;

    @GetMapping
    public List<Itinerary> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Itinerary create(@RequestBody Itinerary itinerary) {
        return repository.save(itinerary);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
