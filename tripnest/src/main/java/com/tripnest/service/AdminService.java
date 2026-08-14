package com.tripnest.service;

import com.tripnest.dto.AdminOverviewResponse;
import com.tripnest.dto.AdminUserResponse;
import com.tripnest.entity.ERole;
import com.tripnest.entity.Expense;
import com.tripnest.entity.Role;
import com.tripnest.entity.Trip;
import com.tripnest.entity.TripStatus;
import com.tripnest.entity.User;
import com.tripnest.repository.DestinationRepository;
import com.tripnest.repository.ExpenseRepository;
import com.tripnest.repository.RoleRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final ExpenseRepository expenseRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public AdminOverviewResponse getPlatformOverview() {
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();
        long totalDestinations = destinationRepository.count();
        long totalExpenses = expenseRepository.count();

        List<Trip> allTrips = tripRepository.findAll();
        long planned = 0, ongoing = 0, completed = 0;
        Map<String, Long> destinationCounts = new HashMap<>();

        for (Trip t : allTrips) {
            if (t.getStatus() == TripStatus.PLANNED) planned++;
            else if (t.getStatus() == TripStatus.ONGOING) ongoing++;
            else if (t.getStatus() == TripStatus.COMPLETED) completed++;

            if (t.getDestination() != null) {
                destinationCounts.put(t.getDestination(),
                        destinationCounts.getOrDefault(t.getDestination(), 0L) + 1);
            }
        }

        List<Expense> allExpenses = expenseRepository.findAll();
        BigDecimal totalVolume = BigDecimal.ZERO;
        for (Expense e : allExpenses) {
            if (e.getAmount() != null) {
                totalVolume = totalVolume.add(e.getAmount());
            }
        }

        Map<String, Long> roleDist = new HashMap<>();
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            for (Role r : u.getRoles()) {
                String roleName = r.getName().name().replace("ROLE_", "");
                roleDist.put(roleName, roleDist.getOrDefault(roleName, 0L) + 1);
            }
        }

        return AdminOverviewResponse.builder()
                .totalUsers(totalUsers)
                .totalTrips(totalTrips)
                .totalPlannedTrips(planned)
                .totalOngoingTrips(ongoing)
                .totalCompletedTrips(completed)
                .totalDestinations(totalDestinations)
                .totalExpensesCount(totalExpenses)
                .totalPlatformExpenseVolume(totalVolume)
                .destinationPopularity(destinationCounts)
                .userRoleDistribution(roleDist)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            String fullName = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                    (u.getLastName() != null ? u.getLastName() : "")).trim();
            if (fullName.isEmpty()) fullName = u.getUsername();

            return AdminUserResponse.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .fullName(fullName)
                    .phone(u.getPhone())
                    .enabled(u.isEnabled())
                    .roles(u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                    .tripsCount(tripRepository.countByUserId(u.getId()))
                    .build();
        }).collect(Collectors.toList());
    }

    public AdminUserResponse updateUserRole(Long targetUserId, String roleName) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ERole eRole;
        try {
            eRole = ERole.valueOf(roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role name: " + roleName);
        }

        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not configured: " + eRole));

        Set<Role> roles = new HashSet<>(user.getRoles());
        roles.add(role);
        user.setRoles(roles);
        User saved = userRepository.save(user);

        String fullName = ((saved.getFirstName() != null ? saved.getFirstName() : "") + " " +
                (saved.getLastName() != null ? saved.getLastName() : "")).trim();
        if (fullName.isEmpty()) fullName = saved.getUsername();

        return AdminUserResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .fullName(fullName)
                .phone(saved.getPhone())
                .enabled(saved.isEnabled())
                .roles(saved.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList()))
                .tripsCount(tripRepository.countByUserId(saved.getId()))
                .build();
    }
}
