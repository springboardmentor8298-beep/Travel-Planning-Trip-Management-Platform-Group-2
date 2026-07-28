package tripnest_backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import tripnest_backend.entity.Destination;
import tripnest_backend.repository.DestinationRepository;

@RestController
@RequestMapping("/api/destinations")
@CrossOrigin(origins = "http://localhost:5173")
public class DestinationController {

    @Autowired
    private DestinationRepository repository;

    @GetMapping
    public List<Destination> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Destination create(@RequestBody Destination destination) {
        return repository.save(destination);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
