package tripnest_backend.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import tripnest_backend.entity.Activity;
import tripnest_backend.repository.ActivityRepository;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    @Autowired
    private ActivityRepository repository;

    @GetMapping
    public List<Activity> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Activity create(@RequestBody Activity activity) {
        return repository.save(activity);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
