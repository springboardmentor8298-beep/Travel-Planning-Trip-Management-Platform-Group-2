package com.tripnest.backend.repository;

import com.tripnest.backend.model.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, String> {
    List<BookingEntity> findByTripId(String tripId);
    void deleteByTripId(String tripId);
}
