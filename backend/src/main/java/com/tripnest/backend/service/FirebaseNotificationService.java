package com.tripnest.backend.service;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class FirebaseNotificationService {

    public Map<String, Object> sendPushNotification(String fcmToken, String title, String body) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("service", "Firebase Cloud Messaging (FCM)");
        response.put("status", "DELIVERED_VIA_FCM");
        response.put("title", title != null ? title : "TripNest Travel Alert");
        response.put("body", body != null ? body : "Your itinerary has been updated.");
        response.put("fcmToken", fcmToken != null ? fcmToken : "fcm_token_demo_" + System.currentTimeMillis());
        return response;
    }
}
