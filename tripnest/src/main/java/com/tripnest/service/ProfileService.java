package com.tripnest.service;

import com.tripnest.dto.*;
import com.tripnest.entity.*;
import com.tripnest.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Set;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.*;
import java.io.IOException;
import java.util.UUID;

@Service @Transactional
public class ProfileService {
    private final UserRepository users; private final DestinationRepository destinations; private final FavoriteDestinationRepository favorites; private final Path profileRoot;
    public ProfileService(UserRepository users, DestinationRepository destinations, FavoriteDestinationRepository favorites, @Value("${app.upload-dir:uploads}") String uploadDirectory) { this.users=users; this.destinations=destinations; this.favorites=favorites;this.profileRoot=Path.of(uploadDirectory,"profiles").toAbsolutePath().normalize(); }
    public ProfileResponse get(String email) { return response(user(email)); }
    public ProfileResponse update(String email, ProfileRequest request) { User user=user(email); user.setFullName(request.fullName().trim()); user.setPhoneNumber(request.phoneNumber().trim()); user.setBio(request.bio()); user.setProfileImageUrl(request.profileImageUrl()); user.setTravelPreferences(request.travelPreferences()==null?Set.of():Set.copyOf(request.travelPreferences())); return response(user); }
    public List<DestinationResponse> favorites(String email) { return favorites.findByUserEmail(email).stream().map(f -> destinationResponse(f.getDestination())).toList(); }
    public void addFavorite(String email, Long destinationId) { if(favorites.findByUserEmailAndDestinationId(email,destinationId).isPresent()) return; favorites.save(new FavoriteDestination(null,user(email),destination(destinationId))); }
    public void removeFavorite(String email, Long destinationId) { favorites.findByUserEmailAndDestinationId(email,destinationId).ifPresent(favorites::delete); }
    public ProfileResponse uploadPicture(String email, MultipartFile file){if(file==null||file.isEmpty())throw new RuntimeException("Choose a profile image");if(file.getSize()>2L*1024*1024)throw new RuntimeException("Profile image must be 2 MB or smaller");if(!Set.of("image/jpeg","image/png","image/webp").contains(file.getContentType()))throw new RuntimeException("Upload JPG, PNG, or WEBP images only");User u=user(email);String extension=file.getOriginalFilename()!=null&&file.getOriginalFilename().lastIndexOf('.')>=0?file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.')):".img";try{Files.createDirectories(profileRoot);String key=UUID.randomUUID()+extension;Files.copy(file.getInputStream(),profileRoot.resolve(key),StandardCopyOption.REPLACE_EXISTING);u.setProfileImageUrl("/api/profile/picture/"+key);}catch(IOException e){throw new RuntimeException("Could not store profile picture");}return response(u);}
    private User user(String email){return users.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));}
    private Destination destination(Long id){return destinations.findById(id).orElseThrow(()->new RuntimeException("Destination not found"));}
    private ProfileResponse response(User u){return new ProfileResponse(u.getId(),u.getFullName(),u.getEmail(),u.getPhoneNumber(),u.getBio(),u.getProfileImageUrl(),u.getRole().getRoleName(),u.getTravelPreferences()==null?Set.of():Set.copyOf(u.getTravelPreferences()));}
    private DestinationResponse destinationResponse(Destination d){String query=java.net.URLEncoder.encode(d.getName()+", "+d.getCountry(),java.nio.charset.StandardCharsets.UTF_8);return new DestinationResponse(d.getId(),d.getName(),d.getCountry(),d.getState(),d.getCity(),d.getDescription(),d.getImageUrl(),d.getTravelGuide(),d.getAttractions(),d.getPopularityScore(),d.getLatitude(),d.getLongitude(),"https://www.google.com/maps/search/?api=1&query="+query,new DestinationResponse.WeatherPlaceholder("Check local conditions before departure","Seasonal forecast","TripNest weather placeholder"));}
}
