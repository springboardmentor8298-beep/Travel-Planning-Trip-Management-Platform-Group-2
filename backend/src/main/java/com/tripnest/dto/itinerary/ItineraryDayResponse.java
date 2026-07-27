package com.tripnest.dto.itinerary;

import com.tripnest.dto.activity.ActivityResponse;
import com.tripnest.entity.Itinerary;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class ItineraryDayResponse {
    private Long id;
    private Long tripId;
    private Integer dayNumber;
    private LocalDate date;
    private String title;
    private String notes;
    private List<ActivityResponse> activities;

    public static ItineraryDayResponse fromEntity(Itinerary itinerary, List<ActivityResponse> activities) {
        return ItineraryDayResponse.builder()
                .id(itinerary.getId())
                .tripId(itinerary.getTrip().getId())
                .dayNumber(itinerary.getDayNumber())
                .date(itinerary.getDate())
                .title(itinerary.getTitle())
                .notes(itinerary.getNotes())
                .activities(activities)
                .build();
    }
}
