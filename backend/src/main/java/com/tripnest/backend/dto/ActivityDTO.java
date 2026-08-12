package com.tripnest.backend.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

public class ActivityDTO {

    public static class ActivityRequest {
        private Integer dayNumber;
        private String title;
        private String description;
        private LocalTime startTime;
        private LocalTime endTime;
        private BigDecimal cost;
        private String category;
        private String placeName;
        private String placeAddress;
        private Double latitude;
        private Double longitude;

        public Integer getDayNumber() {
            return dayNumber;
        }

        public void setDayNumber(Integer dayNumber) {
            this.dayNumber = dayNumber;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalTime getStartTime() {
            return startTime;
        }

        public void setStartTime(LocalTime startTime) {
            this.startTime = startTime;
        }

        public LocalTime getEndTime() {
            return endTime;
        }

        public void setEndTime(LocalTime endTime) {
            this.endTime = endTime;
        }

        public BigDecimal getCost() {
            return cost;
        }

        public void setCost(BigDecimal cost) {
            this.cost = cost;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getPlaceName() {
            return placeName;
        }

        public void setPlaceName(String placeName) {
            this.placeName = placeName;
        }

        public String getPlaceAddress() {
            return placeAddress;
        }

        public void setPlaceAddress(String placeAddress) {
            this.placeAddress = placeAddress;
        }

        public Double getLatitude() {
            return latitude;
        }

        public void setLatitude(Double latitude) {
            this.latitude = latitude;
        }

        public Double getLongitude() {
            return longitude;
        }

        public void setLongitude(Double longitude) {
            this.longitude = longitude;
        }
    }
}
