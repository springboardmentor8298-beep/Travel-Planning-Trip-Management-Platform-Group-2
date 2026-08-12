package com.tripnest.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class TripDTO {

    public static class TripRequest {
        private String title;
        private String destination;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal budget;
        private String description;
        private String status;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDestination() {
            return destination;
        }

        public void setDestination(String destination) {
            this.destination = destination;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public BigDecimal getBudget() {
            return budget;
        }

        public void setBudget(BigDecimal budget) {
            this.budget = budget;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class UserSummary {
        private Long id;
        private String username;
        private String fullName;

        public UserSummary(Long id, String username, String fullName) {
            this.id = id;
            this.username = username;
            this.fullName = fullName;
        }

        public Long getId() {
            return id;
        }

        public String getUsername() {
            return username;
        }

        public String getFullName() {
            return fullName;
        }
    }

    public static class TripResponse {
        private Long id;
        private String title;
        private String destination;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal budget;
        private String description;
        private String status;
        private UserSummary owner;
        private List<UserSummary> members;
        private BigDecimal totalExpenses;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDestination() {
            return destination;
        }

        public void setDestination(String destination) {
            this.destination = destination;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public BigDecimal getBudget() {
            return budget;
        }

        public void setBudget(BigDecimal budget) {
            this.budget = budget;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public UserSummary getOwner() {
            return owner;
        }

        public void setOwner(UserSummary owner) {
            this.owner = owner;
        }

        public List<UserSummary> getMembers() {
            return members;
        }

        public void setMembers(List<UserSummary> members) {
            this.members = members;
        }

        public BigDecimal getTotalExpenses() {
            return totalExpenses;
        }

        public void setTotalExpenses(BigDecimal totalExpenses) {
            this.totalExpenses = totalExpenses;
        }
    }
}
