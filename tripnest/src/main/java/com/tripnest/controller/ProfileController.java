package com.tripnest.controller;

import com.tripnest.dto.*;
import com.tripnest.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/api/profile")
public class ProfileController {
    private final ProfileService service;
    public ProfileController(ProfileService service){this.service=service;}
    @GetMapping public ProfileResponse get(Principal principal){return service.get(principal.getName());}
    @PutMapping public ProfileResponse update(Principal principal,@Valid @RequestBody ProfileRequest request){return service.update(principal.getName(),request);}
    @PostMapping(value="/picture",consumes="multipart/form-data") public ProfileResponse picture(Principal principal,@RequestParam MultipartFile file){return service.uploadPicture(principal.getName(),file);}
    @GetMapping("/favorites") public List<DestinationResponse> favorites(Principal principal){return service.favorites(principal.getName());}
    @PostMapping("/favorites/{destinationId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void addFavorite(Principal principal,@PathVariable Long destinationId){service.addFavorite(principal.getName(),destinationId);}
    @DeleteMapping("/favorites/{destinationId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void removeFavorite(Principal principal,@PathVariable Long destinationId){service.removeFavorite(principal.getName(),destinationId);}
}
