package com.tripnest.service;

import com.tripnest.dto.BudgetShareRequest;
import com.tripnest.dto.BudgetShareResponse;
import com.tripnest.entity.*;
import com.tripnest.repository.BudgetShareRepository;
import com.tripnest.repository.TravelGroupRepository;
import com.tripnest.repository.TripRepository;
import com.tripnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BudgetShareService {

    private final BudgetShareRepository budgetShareRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TravelGroupRepository travelGroupRepository;

    public BudgetShareResponse createBudgetShare(BudgetShareRequest request) {
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        TravelGroup travelGroup = null;
        if (request.getGroupId() != null) {
            travelGroup = travelGroupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new RuntimeException("Group not found"));
        }

        BudgetShare budgetShare = new BudgetShare();
        budgetShare.setTrip(trip);
        budgetShare.setUser(user);
        budgetShare.setTravelGroup(travelGroup);
        budgetShare.setAmount(request.getAmount());
        
        if (request.getShareType() != null) {
            budgetShare.setShareType(BudgetShare.ShareType.valueOf(request.getShareType()));
        }
        
        if (request.getStatus() != null) {
            budgetShare.setStatus(BudgetShare.ShareStatus.valueOf(request.getStatus()));
        }

        BudgetShare savedShare = budgetShareRepository.save(budgetShare);
        return mapToResponse(savedShare);
    }

    public BudgetShareResponse updateBudgetShare(Long shareId, BudgetShareRequest request) {
        BudgetShare budgetShare = budgetShareRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Budget share not found"));

        if (request.getAmount() != null) {
            budgetShare.setAmount(request.getAmount());
        }
        
        if (request.getShareType() != null) {
            budgetShare.setShareType(BudgetShare.ShareType.valueOf(request.getShareType()));
        }
        
        if (request.getStatus() != null) {
            budgetShare.setStatus(BudgetShare.ShareStatus.valueOf(request.getStatus()));
        }

        BudgetShare updatedShare = budgetShareRepository.save(budgetShare);
        return mapToResponse(updatedShare);
    }

    public void deleteBudgetShare(Long shareId) {
        budgetShareRepository.deleteById(shareId);
    }

    public BudgetShareResponse getBudgetShare(Long shareId) {
        BudgetShare budgetShare = budgetShareRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Budget share not found"));
        return mapToResponse(budgetShare);
    }

    public List<BudgetShareResponse> getBudgetSharesByTrip(Long tripId) {
        List<BudgetShare> shares = budgetShareRepository.findByTripId(tripId);
        return shares.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BudgetShareResponse> getBudgetSharesByUser(Long userId) {
        List<BudgetShare> shares = budgetShareRepository.findByUserId(userId);
        return shares.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BudgetShareResponse> getBudgetSharesByGroup(Long groupId) {
        List<BudgetShare> shares = budgetShareRepository.findByTravelGroupId(groupId);
        return shares.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<BudgetShareResponse> createEqualSharesForGroup(Long tripId, Long groupId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        TravelGroup travelGroup = travelGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (trip.getBudget() == null || trip.getBudget().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Trip must have a valid budget to create shares");
        }

        // Remove existing shares for this trip
        budgetShareRepository.deleteByTripId(tripId);

        // Calculate equal share amount
        int memberCount = travelGroup.getMembers().size();
        if (memberCount == 0) {
            throw new RuntimeException("Group must have members to create shares");
        }

        BigDecimal shareAmount = trip.getBudget()
                .divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);

        // Create shares for each member
        List<BudgetShare> shares = travelGroup.getMembers().stream()
                .map(member -> {
                    BudgetShare budgetShare = new BudgetShare();
                    budgetShare.setTrip(trip);
                    budgetShare.setUser(member.getUser());
                    budgetShare.setTravelGroup(travelGroup);
                    budgetShare.setAmount(shareAmount);
                    budgetShare.setShareType(BudgetShare.ShareType.EQUAL);
                    budgetShare.setStatus(BudgetShare.ShareStatus.PENDING);
                    return budgetShareRepository.save(budgetShare);
                })
                .collect(Collectors.toList());

        return shares.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public BudgetShareResponse confirmShare(Long shareId) {
        BudgetShare budgetShare = budgetShareRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Budget share not found"));
        
        budgetShare.setStatus(BudgetShare.ShareStatus.CONFIRMED);
        BudgetShare updatedShare = budgetShareRepository.save(budgetShare);
        return mapToResponse(updatedShare);
    }

    public BudgetShareResponse markAsPaid(Long shareId) {
        BudgetShare budgetShare = budgetShareRepository.findById(shareId)
                .orElseThrow(() -> new RuntimeException("Budget share not found"));
        
        budgetShare.setStatus(BudgetShare.ShareStatus.PAID);
        BudgetShare updatedShare = budgetShareRepository.save(budgetShare);
        return mapToResponse(updatedShare);
    }

    public BigDecimal getTotalPaidAmount(Long tripId) {
        BigDecimal total = budgetShareRepository.sumPaidAmountByTripId(tripId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getTotalBudgetAmount(Long tripId) {
        BigDecimal total = budgetShareRepository.sumTotalAmountByTripId(tripId);
        return total != null ? total : BigDecimal.ZERO;
    }

    private BudgetShareResponse mapToResponse(BudgetShare budgetShare) {
        String userName = budgetShare.getUser().getUsername();
        String userFirstName = budgetShare.getUser().getFirstName() != null ? budgetShare.getUser().getFirstName() : "";
        String userLastName = budgetShare.getUser().getLastName() != null ? budgetShare.getUser().getLastName() : "";
        
        String groupName = null;
        if (budgetShare.getTravelGroup() != null) {
            groupName = budgetShare.getTravelGroup().getName();
        }

        String tripTitle = null;
        if (budgetShare.getTrip() != null) {
            tripTitle = budgetShare.getTrip().getTitle();
        }

        return new BudgetShareResponse(
                budgetShare.getId(),
                budgetShare.getTrip().getId(),
                tripTitle,
                budgetShare.getUser().getId(),
                userName,
                userFirstName,
                userLastName,
                budgetShare.getTravelGroup() != null ? budgetShare.getTravelGroup().getId() : null,
                groupName,
                budgetShare.getAmount(),
                budgetShare.getShareType().name(),
                budgetShare.getStatus().name(),
                budgetShare.getCreatedAt(),
                budgetShare.getUpdatedAt()
        );
    }
}
