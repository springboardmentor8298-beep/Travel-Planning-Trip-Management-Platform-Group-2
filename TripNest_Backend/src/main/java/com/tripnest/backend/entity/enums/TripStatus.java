package com.tripnest.backend.entity.enums;

import java.time.LocalDate;

public enum TripStatus {

	PLANNED, ONGOING, COMPLETED, CANCELLED, UPCOMING, ACTIVE;

	public static TripStatus calculateStatus(LocalDate startDate, LocalDate endDate, TripStatus currentStatus) {
		if (currentStatus == CANCELLED) {
			return CANCELLED;
		}
		LocalDate today = LocalDate.now();
		if (today.isBefore(startDate)) {
			return UPCOMING;
		} else if (today.isAfter(endDate)) {
			return COMPLETED;
		} else {
			return ACTIVE;
		}
	}
}
