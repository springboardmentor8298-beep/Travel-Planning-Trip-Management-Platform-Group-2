package com.tripnest.controller;

import com.tripnest.dto.DestinationResponse;
import com.tripnest.entity.Destination;
import com.tripnest.repository.DestinationRepository;
import org.springframework.data.domain.*;
import org.springframework.web.bind.annotation.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {
    private final DestinationRepository repository;
    public DestinationController(DestinationRepository repository){this.repository=repository;}
    @GetMapping public List<DestinationResponse> list(){return repository.findAll(Sort.by(Sort.Direction.DESC,"popularityScore")).stream().map(this::response).toList();}
    @GetMapping("/popular") public List<DestinationResponse> popular(@RequestParam(defaultValue="6") int limit){return repository.findAll(PageRequest.of(0,Math.min(Math.max(1,limit),24),Sort.by(Sort.Direction.DESC,"popularityScore"))).map(this::response).toList();}
    @GetMapping("/search") public Page<DestinationResponse> search(@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="12") int size){var pageable=PageRequest.of(Math.max(page,0),Math.min(Math.max(size,1),50),Sort.by(Sort.Direction.DESC,"popularityScore").and(Sort.by("name")));return repository.findByNameContainingIgnoreCaseOrCityContainingIgnoreCaseOrCountryContainingIgnoreCase(q,q,q,pageable).map(this::response);}
    @GetMapping("/{id}") public DestinationResponse get(@PathVariable Long id){return response(repository.findById(id).orElseThrow(()->new RuntimeException("Destination not found")));}
    private DestinationResponse response(Destination d){String query=URLEncoder.encode(d.getName()+", "+d.getCountry(),StandardCharsets.UTF_8);return new DestinationResponse(d.getId(),d.getName(),d.getCountry(),d.getState(),d.getCity(),d.getDescription(),d.getImageUrl(),d.getTravelGuide(),d.getAttractions(),d.getPopularityScore(),d.getLatitude(),d.getLongitude(),"https://www.google.com/maps/search/?api=1&query="+query,new DestinationResponse.WeatherPlaceholder("Check local conditions before departure","Seasonal forecast","TripNest weather placeholder"));}
}
