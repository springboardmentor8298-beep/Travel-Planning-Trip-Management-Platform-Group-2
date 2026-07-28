package com.tripnest.service;

import com.tripnest.dto.*;
import com.tripnest.entity.*;
import com.tripnest.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class TripService {
    private final TripRepository trips;
    private final UserRepository users;
    private final DestinationRepository destinations;
    private final ItineraryRepository itineraries;
    private final ActivityRepository activities;
    private final TripMemberRepository members;

    public TripService(TripRepository trips, UserRepository users, DestinationRepository destinations,
                       ItineraryRepository itineraries, ActivityRepository activities, TripMemberRepository members) {
        this.trips = trips; this.users = users; this.destinations = destinations;
        this.itineraries = itineraries; this.activities = activities; this.members = members;
    }

    public TripPageResponse list(String email, String query, String status, String sort, int page, int size) {
        Comparator<Trip> comparator = "name".equalsIgnoreCase(sort) ? Comparator.comparing(Trip::getTripName, String.CASE_INSENSITIVE_ORDER) : "newest".equalsIgnoreCase(sort) ? Comparator.comparing(Trip::getStartDate).reversed() : Comparator.comparing(Trip::getStartDate);
        String search = query == null ? "" : query.trim().toLowerCase();
        String requestedStatus = status == null ? "" : status.trim().toUpperCase();
        List<TripResponse> matching = java.util.stream.Stream.concat(trips.findByUserEmailOrderByStartDateAsc(email).stream(), trips.findByMembersUserEmailOrderByStartDateAsc(email).stream()).distinct().filter(trip -> search.isBlank() || trip.getTripName().toLowerCase().contains(search) || trip.getDestination().toLowerCase().contains(search)).filter(trip -> requestedStatus.isBlank() || trip.getStatus().equalsIgnoreCase(requestedStatus)).sorted(comparator).map(this::tripResponse).toList();
        int safeSize = Math.min(Math.max(size, 1), 50); int totalPages = (int) Math.ceil((double) matching.size() / safeSize); int safePage = Math.max(0, Math.min(page, Math.max(0, totalPages - 1))); int start = Math.min(safePage * safeSize, matching.size()); int end = Math.min(start + safeSize, matching.size());
        return new TripPageResponse(matching.subList(start, end), safePage, safeSize, matching.size(), totalPages);
    }
    public TripResponse get(String email, Long id) { return tripResponse(accessible(email, id)); }
    public TripResponse create(String email, TripRequest request) { Trip trip = new Trip(); apply(trip, request); trip.setUser(user(email)); return tripResponse(trips.save(trip)); }
    public TripResponse update(String email, Long id, TripRequest request) { Trip trip = editor(email, id); apply(trip, request); return tripResponse(trip); }
    public void delete(String email, Long id) { trips.delete(owner(email, id)); }

    public List<ItineraryResponse> listItineraries(String email, Long tripId) { return accessible(email, tripId).getItineraries().stream().sorted(Comparator.comparing(Itinerary::getDayNumber)).map(this::itineraryResponse).toList(); }
    public ItineraryResponse addItinerary(String email, Long tripId, ItineraryRequest request) { Trip trip=editor(email,tripId); Itinerary i=new Itinerary(); i.setTrip(trip); i.setDayNumber(request.dayNumber()); i.setItineraryDate(request.itineraryDate()); i.setDescription(request.description()); return itineraryResponse(itineraries.save(i)); }
    public void deleteItinerary(String email, Long tripId, Long itineraryId) { Itinerary i=itineraries.findById(itineraryId).orElseThrow(()->new RuntimeException("Itinerary not found")); if (!i.getTrip().getId().equals(editor(email,tripId).getId())) throw new RuntimeException("Itinerary not found"); itineraries.delete(i); }
    public ActivityResponse addActivity(String email, Long tripId, Long itineraryId, ActivityRequest request) { Itinerary i=itineraries.findById(itineraryId).orElseThrow(()->new RuntimeException("Itinerary not found")); if (!i.getTrip().getId().equals(editor(email,tripId).getId())) throw new RuntimeException("Itinerary not found"); Activity a=new Activity(); a.setItinerary(i); a.setSortOrder(i.getActivities() == null ? 0 : i.getActivities().size()); applyActivity(a, request); return activityResponse(activities.save(a)); }
    public void deleteActivity(String email, Long tripId, Long itineraryId, Long activityId) { Activity a=activities.findById(activityId).orElseThrow(()->new RuntimeException("Activity not found")); if (!a.getItinerary().getId().equals(itineraryId) || !a.getItinerary().getTrip().getId().equals(editor(email,tripId).getId())) throw new RuntimeException("Activity not found"); activities.delete(a); }
    public ItineraryResponse updateItinerary(String email,Long tripId,Long id,ItineraryRequest r){Itinerary i=itineraries.findById(id).orElseThrow(()->new RuntimeException("Itinerary not found"));if(!i.getTrip().getId().equals(editor(email,tripId).getId()))throw new RuntimeException("Itinerary not found");i.setDayNumber(r.dayNumber());i.setItineraryDate(r.itineraryDate());i.setDescription(r.description());return itineraryResponse(i);}
    public ActivityResponse updateActivity(String email,Long tripId,Long itineraryId,Long id,ActivityRequest r){Activity a=activities.findById(id).orElseThrow(()->new RuntimeException("Activity not found"));if(!a.getItinerary().getId().equals(itineraryId)||!a.getItinerary().getTrip().getId().equals(editor(email,tripId).getId()))throw new RuntimeException("Activity not found");applyActivity(a,r);return activityResponse(a);}
    public List<ActivityResponse> reorderActivities(String email, Long tripId, Long itineraryId, ActivityOrderRequest request) {
        Itinerary itinerary = itineraries.findById(itineraryId).orElseThrow(() -> new RuntimeException("Itinerary not found"));
        if (!itinerary.getTrip().getId().equals(editor(email, tripId).getId())) throw new RuntimeException("Itinerary not found");
        List<Activity> current = itinerary.getActivities() == null ? List.of() : itinerary.getActivities();
        if (current.size() != request.activityIds().size() || !current.stream().map(Activity::getId).collect(java.util.stream.Collectors.toSet()).equals(new java.util.HashSet<>(request.activityIds()))) throw new RuntimeException("Activity order does not match this itinerary");
        java.util.Map<Long, Activity> byId = current.stream().collect(java.util.stream.Collectors.toMap(Activity::getId, activity -> activity));
        for (int index = 0; index < request.activityIds().size(); index++) byId.get(request.activityIds().get(index)).setSortOrder(index);
        return request.activityIds().stream().map(byId::get).map(this::activityResponse).toList();
    }
    public List<TripMemberResponse> members(String email,Long tripId){accessible(email,tripId);return members.findByTripId(tripId).stream().map(this::memberResponse).toList();}
    public TripMemberResponse addMember(String email,Long tripId,TripMemberRequest r){Trip t=editor(email,tripId);User u=user(r.email());if(u.getEmail().equals(email))throw new RuntimeException("You are already a trip collaborator");if(members.findByTripIdAndUserEmail(tripId,u.getEmail()).isPresent())throw new RuntimeException("Traveler already added");return memberResponse(members.save(new TripMember(null,t,u,r.memberRole()==null||r.memberRole().isBlank()?"Traveler":r.memberRole())));}
    public void removeMember(String email,Long tripId,Long memberId){editor(email,tripId);TripMember m=members.findById(memberId).orElseThrow(()->new RuntimeException("Traveler not found"));if(!m.getTrip().getId().equals(tripId))throw new RuntimeException("Traveler not found");members.delete(m);}

    private User user(String email) { return users.findByEmail(email).orElseThrow(()->new RuntimeException("User not found")); }
    private Trip accessible(String email, Long id) { return trips.findById(id).filter(t->t.getUser().getEmail().equals(email) || members.findByTripIdAndUserEmail(t.getId(), email).isPresent()).orElseThrow(()->new RuntimeException("Trip not found")); }
    private Trip owner(String email, Long id) { return trips.findById(id).filter(t->t.getUser().getEmail().equals(email)).orElseThrow(()->new RuntimeException("Trip not found")); }
    private Trip editor(String email, Long id) { return accessible(email, id); }
    private void apply(Trip t, TripRequest r) { if(r.endDate().isBefore(r.startDate())) throw new RuntimeException("End date must be after the start date"); String tripStatus = r.status()==null||r.status().isBlank()?"PLANNING":r.status().trim().toUpperCase(); if(!List.of("PLANNING","UPCOMING","COMPLETED","CANCELLED").contains(tripStatus)) throw new RuntimeException("Unsupported trip status"); t.setTripName(r.tripName().trim()); t.setDestination(r.destination().trim()); t.setStartDate(r.startDate()); t.setEndDate(r.endDate()); t.setBudget(r.budget()); t.setStatus(tripStatus); t.setDestinationDetails(r.destinationId()==null?null:destinations.findById(r.destinationId()).orElseThrow(()->new RuntimeException("Destination not found"))); }
    private TripResponse tripResponse(Trip t) { return new TripResponse(t.getId(),t.getTripName(),t.getDestination(),t.getStartDate(),t.getEndDate(),t.getBudget(),t.getStatus(),t.getDestinationDetails()==null?null:t.getDestinationDetails().getId()); }
    private ItineraryResponse itineraryResponse(Itinerary i) { List<ActivityResponse> list=i.getActivities()==null?List.of():i.getActivities().stream().sorted(Comparator.comparing(Activity::getSortOrder, Comparator.nullsLast(Integer::compareTo)).thenComparing(Activity::getStartTime, Comparator.nullsLast(String::compareTo))).map(this::activityResponse).toList(); return new ItineraryResponse(i.getId(),i.getDayNumber(),i.getItineraryDate(),i.getDescription(),list); }
    private void applyActivity(Activity a, ActivityRequest r) { if (!List.of("Sightseeing", "Transportation", "Accommodation", "Dining", "Adventure", "Shopping", "Others").contains(r.activityType())) throw new RuntimeException("Unsupported activity type"); a.setActivityName(r.activityName().trim()); a.setActivityType(r.activityType()); a.setLocation(r.location().trim()); a.setStartTime(r.startTime()); a.setEndTime(r.endTime()); a.setDurationMinutes(r.durationMinutes()); a.setNotes(r.notes()); a.setStatus(r.status() == null || r.status().isBlank() ? "PLANNED" : r.status()); if (r.sortOrder() != null) a.setSortOrder(r.sortOrder()); a.setReminderAt(r.reminderAt()); if (r.reminderAt() == null) a.setReminderSentAt(null); }
    private ActivityResponse activityResponse(Activity a) { return new ActivityResponse(a.getId(),a.getActivityName(),a.getActivityType(),a.getLocation(),a.getStartTime(),a.getEndTime(),a.getDurationMinutes(),a.getNotes(),a.getStatus(),a.getSortOrder(),a.getReminderAt()); }
    private TripMemberResponse memberResponse(TripMember m){return new TripMemberResponse(m.getId(),m.getUser().getFullName(),m.getUser().getEmail(),m.getMemberRole());}
}
