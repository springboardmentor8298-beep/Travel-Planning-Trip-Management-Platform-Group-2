package com.tripnest.service;

import com.tripnest.dto.TripRequest;
import com.tripnest.dto.TripResponse;
import com.tripnest.exception.AccessDeniedCustomException;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.model.Role;
import com.tripnest.model.Trip;
import com.tripnest.model.TripStatus;
import com.tripnest.model.User;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TripService Unit Tests")
class TripServiceTest {

    @Mock TripRepository tripRepository;
    @Mock UserRepository userRepository;

    @InjectMocks TripService tripService;

    private User  owner;
    private Trip  trip;
    private TripRequest validRequest;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setFullName("Alice Traveller");
        owner.setEmail("alice@example.com");
        owner.setRole(Role.TRAVELER);
        owner.setPassword("encoded");

        trip = new Trip();
        trip.setId(10L);
        trip.setTitle("Goa Trip");
        trip.setDestination("Goa, India");
        trip.setStartDate(LocalDate.of(2025, 12, 1));
        trip.setEndDate(LocalDate.of(2025, 12, 7));
        trip.setBudget(new BigDecimal("20000"));
        trip.setStatus(TripStatus.PLANNED);
        trip.setOwner(owner);

        validRequest = new TripRequest();
        validRequest.setTitle("Goa Trip");
        validRequest.setDestination("Goa, India");
        validRequest.setStartDate(LocalDate.of(2025, 12, 1));
        validRequest.setEndDate(LocalDate.of(2025, 12, 7));
        validRequest.setBudget(new BigDecimal("20000"));
    }

    /* ── Create ── */

    @Test
    @DisplayName("createTrip: should save trip and return response")
    void createTrip_success() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(owner));
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        TripResponse response = tripService.createTrip("alice@example.com", validRequest);

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Goa Trip");
        assertThat(response.getDestination()).isEqualTo("Goa, India");
        assertThat(response.getStatus()).isEqualTo("PLANNED");
        verify(tripRepository).save(any(Trip.class));
    }

    @Test
    @DisplayName("createTrip: should throw when end date is before start date")
    void createTrip_invalidDates_throws() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(owner));
        validRequest.setEndDate(LocalDate.of(2025, 11, 1)); // before startDate

        assertThatThrownBy(() -> tripService.createTrip("alice@example.com", validRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("End date");
    }

    @Test
    @DisplayName("createTrip: should throw ResourceNotFoundException for unknown user")
    void createTrip_userNotFound_throws() {
        when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tripService.createTrip("ghost@example.com", validRequest))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("createTrip: should default status to PLANNED when not provided")
    void createTrip_defaultsStatusToPlanned() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(owner));
        when(tripRepository.save(any(Trip.class))).thenAnswer(inv -> {
            Trip t = inv.getArgument(0);
            t.setId(10L);
            return t;
        });
        validRequest.setStatus(null); // not provided

        TripResponse response = tripService.createTrip("alice@example.com", validRequest);
        assertThat(response.getStatus()).isEqualTo("PLANNED");
    }

    /* ── Get my trips ── */

    @Test
    @DisplayName("getMyTrips: should return trips owned by user")
    void getMyTrips_returnsOwnedTrips() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(owner));
        when(tripRepository.findByOwnerIdOrTravelers_IdOrderByStartDateAsc(1L, 1L))
            .thenReturn(List.of(trip));

        List<TripResponse> result = tripService.getMyTrips("alice@example.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Goa Trip");
    }

    @Test
    @DisplayName("getMyTrips: should return empty list when user has no trips")
    void getMyTrips_noTrips_returnsEmpty() {
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(owner));
        when(tripRepository.findByOwnerIdOrTravelers_IdOrderByStartDateAsc(1L, 1L))
            .thenReturn(List.of());

        List<TripResponse> result = tripService.getMyTrips("alice@example.com");
        assertThat(result).isEmpty();
    }

    /* ── Delete ── */

    @Test
    @DisplayName("deleteTrip: should delete when user is owner")
    void deleteTrip_ownerCanDelete() {
        when(tripRepository.findById(10L)).thenReturn(Optional.of(trip));

        assertThatNoException().isThrownBy(
            () -> tripService.deleteTrip("alice@example.com", 10L));

        verify(tripRepository).delete(trip);
    }

    @Test
    @DisplayName("deleteTrip: should throw AccessDenied when non-owner tries to delete")
    void deleteTrip_nonOwner_throws() {
        when(tripRepository.findById(10L)).thenReturn(Optional.of(trip));

        assertThatThrownBy(() -> tripService.deleteTrip("hacker@example.com", 10L))
            .isInstanceOf(AccessDeniedCustomException.class);

        verify(tripRepository, never()).delete(any());
    }

    /* ── Add traveler ── */

    @Test
    @DisplayName("addTraveler: should add traveler to trip")
    void addTraveler_success() {
        User traveler = new User();
        traveler.setId(2L);
        traveler.setEmail("bob@example.com");
        traveler.setFullName("Bob");
        traveler.setPassword("enc");
        traveler.setRole(Role.TRAVELER);

        when(tripRepository.findById(10L)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(traveler));
        when(tripRepository.save(any(Trip.class))).thenReturn(trip);

        TripResponse response = tripService.addTraveler("alice@example.com", 10L, "bob@example.com");
        assertThat(response).isNotNull();
        verify(tripRepository).save(trip);
    }

    @Test
    @DisplayName("addTraveler: should throw when traveler email not found")
    void addTraveler_travelerNotFound_throws() {
        when(tripRepository.findById(10L)).thenReturn(Optional.of(trip));
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tripService.addTraveler("alice@example.com", 10L, "nobody@example.com"))
            .isInstanceOf(ResourceNotFoundException.class);
    }
}
