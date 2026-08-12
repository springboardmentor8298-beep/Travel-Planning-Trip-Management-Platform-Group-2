package com.tripnest.backend.service;

import com.tripnest.backend.model.TripEntity;
import com.tripnest.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TripServiceTest {

    @Mock
    private TripRepository tripRepository;
    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private DocumentRepository documentRepository;
    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private DiscussionRepository discussionRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private TripService tripService;

    private TripEntity mockTrip;

    @BeforeEach
    void setUp() {
        mockTrip = new TripEntity();
        mockTrip.setId("trip_ooty_101");
        mockTrip.setTitle("Ooty Nature Getaway");
        mockTrip.setDestination("Ooty, Tamil Nadu");
        mockTrip.setOwnerEmail("traveler@tripnest.com");
        mockTrip.setTotalBudget(15000.0);
    }

    @Test
    void testCreateOrUpdateTrip_Success() {
        when(tripRepository.save(any(TripEntity.class))).thenReturn(mockTrip);

        TripEntity created = tripService.createOrUpdateTrip(mockTrip);

        assertNotNull(created);
        assertEquals("Ooty Nature Getaway", created.getTitle());
        assertEquals(15000.0, created.getTotalBudget());
        verify(tripRepository, times(1)).save(mockTrip);
    }

    @Test
    void testGetTripsForUser_Success() {
        when(tripRepository.findAll()).thenReturn(List.of(mockTrip));
        when(expenseRepository.findByTripId("trip_ooty_101")).thenReturn(Collections.emptyList());

        List<TripEntity> trips = tripService.getTripsForUser("traveler@tripnest.com");

        assertFalse(trips.isEmpty());
        assertEquals(1, trips.size());
    }

    @Test
    void testGetAllTrips_Success() {
        when(tripRepository.findAll()).thenReturn(List.of(mockTrip));
        when(expenseRepository.findByTripId("trip_ooty_101")).thenReturn(Collections.emptyList());

        List<TripEntity> trips = tripService.getAllTrips();

        assertFalse(trips.isEmpty());
        assertEquals(1, trips.size());
    }
}
