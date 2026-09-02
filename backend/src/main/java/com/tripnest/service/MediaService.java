package com.tripnest.service;

import com.tripnest.entity.TripMedia;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaService {
    TripMedia uploadMedia(Integer tripId, MultipartFile file, String category, String currentUserEmail);
    List<TripMedia> getMediaByTripId(Integer tripId, String category, String currentUserEmail);
    void deleteMedia(Integer mediaId, String currentUserEmail);
}
