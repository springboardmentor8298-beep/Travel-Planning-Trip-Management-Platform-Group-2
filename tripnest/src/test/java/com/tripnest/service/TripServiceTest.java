package com.tripnest.service;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.entity.MemberStatus;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripStatus;
import com.tripnest.entity.User;
import com.tripnest.repository.TripMemberRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    private TripRepository tripRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TripMemberRepository tripMemberRepository;

    @InjectMocks
    private TripService tripService;

    private User testUser;
    private Trip testTrip;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("john_doe");
        testUser.setEmail("john@example.com");

        testTrip = new Trip();
        testTrip.setId(100L);
        testTrip.setTitle("Paris Summer Vacation");
        testTrip.setDestination("Paris, France");
        testTrip.setStartDate(LocalDate.of(2026, 7, 1));
        testTrip.setEndDate(LocalDate.of(2026, 7, 10));
        testTrip.setBudget(BigDecimal.valueOf(3500.0));
        testTrip.setNumberOfTravelers(2);
        testTrip.setStatus(TripStatus.PLANNED);
        testTrip.setUser(testUser);
    }

    @Test
    void testGetUserTrips_ReturnsUserAndCollaborationTrips() {
        when(tripRepository.findByUserIdOrderByStartDateDesc(1L)).thenReturn(List.of(testTrip));
        when(tripMemberRepository.findByUserIdAndStatus(1L, MemberStatus.ACCEPTED)).thenReturn(List.of());

        List<TripResponse> responses = tripService.getUserTrips(1L);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Paris Summer Vacation", responses.get(0).getTitle());
        verify(tripRepository, times(1)).findByUserIdOrderByStartDateDesc(1L);
    }

    @Test
    void testGetTripById_Success() {
        when(tripRepository.findById(100L)).thenReturn(Optional.of(testTrip));

        TripResponse response = tripService.getTripById(100L, 1L);

        assertNotNull(response);
        assertEquals("Paris, France", response.getDestination());
        assertEquals(BigDecimal.valueOf(3500.0), response.getBudget());
    }

    @Test
    void testGetTripById_NotFound_ThrowsException() {
        when(tripRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> tripService.getTripById(999L, 1L));
    }

    @Test
    void testCreateTrip_Success() {
        TripRequest request = new TripRequest();
        request.setTitle("Swiss Alps Trek");
        request.setDestination("Zurich, Switzerland");
        request.setStartDate(LocalDate.of(2026, 9, 1));
        request.setEndDate(LocalDate.of(2026, 9, 7));
        request.setBudget(BigDecimal.valueOf(4500.0));
        request.setNumberOfTravelers(3);
        request.setStatus(TripStatus.PLANNED);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(tripRepository.save(any(Trip.class))).thenAnswer(invocation -> {
            Trip saved = invocation.getArgument(0);
            saved.setId(101L);
            return saved;
        });

        TripResponse created = tripService.createTrip(1L, request);

        assertNotNull(created);
        assertEquals("Swiss Alps Trek", created.getTitle());
        assertEquals(BigDecimal.valueOf(4500.0), created.getBudget());
        verify(tripRepository, times(1)).save(any(Trip.class));
    }
}
