package com.tripnest.backend.validation;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripnest.backend.dto.CreateExpenseRequest;
import com.tripnest.backend.dto.CreateTripRequest;
import com.tripnest.backend.entity.Budget;
import com.tripnest.backend.entity.Trip;
import com.tripnest.backend.entity.TripMember;
import com.tripnest.backend.entity.User;
import com.tripnest.backend.entity.enums.ExpenseCategory;
import com.tripnest.backend.exception.BadRequestException;
import com.tripnest.backend.repository.BudgetRepository;
import com.tripnest.backend.repository.DocumentRepository;
import com.tripnest.backend.repository.TripMemberRepository;
import com.tripnest.backend.repository.TripRepository;
import com.tripnest.backend.repository.UserRepository;
import com.tripnest.backend.service.impl.BudgetServiceImpl;
import com.tripnest.backend.service.impl.DocumentServiceImpl;
import com.tripnest.backend.service.impl.TripMemberServiceImpl;

@SpringBootTest
@AutoConfigureMockMvc
public class ValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private TripRepository tripRepository;

    @MockBean
    private BudgetRepository budgetRepository;

    @MockBean
    private TripMemberRepository tripMemberRepository;

    @MockBean
    private DocumentRepository documentRepository;

    @Autowired
    private BudgetServiceImpl budgetService;

    @Autowired
    private TripMemberServiceImpl tripMemberService;

    @Autowired
    private DocumentServiceImpl documentService;

    @Test
    @WithMockUser(username = "test@tripnest.com")
    void testInvalidDates_StartAfterEnd() throws Exception {
        CreateTripRequest request = new CreateTripRequest();
        request.setTripName("Paris");
        request.setDestinationName("Paris");
        request.setCity("Paris");
        request.setState("IDF");
        request.setCountry("France");
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setEndDate(LocalDate.now().plusDays(2)); // Invalid: end before start
        request.setBudget(new BigDecimal("1000"));
        request.setTotalMembers(2);

        mockMvc.perform(post("/api/trips")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@tripnest.com")
    void testNegativeBudget_ThrowsException() {
        User user = User.builder().id(1L).email("test@tripnest.com").fullName("Test User").build();
        Trip trip = Trip.builder().id(1L).tripName("Test").user(user).build();
        Budget budget = Budget.builder().id(1L).trip(trip).totalSpent(BigDecimal.ZERO).build();

        Mockito.when(userRepository.findByEmail("test@tripnest.com")).thenReturn(Optional.of(user));
        Mockito.when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
        Mockito.when(budgetRepository.findById(1L)).thenReturn(Optional.of(budget));

        assertThrows(BadRequestException.class, () -> {
            budgetService.createBudget(1L, new BigDecimal("-100.00"));
        });

        assertThrows(BadRequestException.class, () -> {
            budgetService.updateBudget(1L, new BigDecimal("-50.00"));
        });
    }

    @Test
    @WithMockUser(username = "test@tripnest.com")
    void testNegativeExpense_ValidationFails() throws Exception {
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setAmount(new BigDecimal("-15.00")); // Invalid negative expense
        request.setCategory(ExpenseCategory.FOOD);
        request.setExpenseDate(LocalDate.now());

        mockMvc.perform(post("/api/budgets/1/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "test@tripnest.com")
    void testOversizedDocument_ThrowsException() {
        User user = User.builder().id(1L).email("test@tripnest.com").fullName("Test User").build();
        Trip trip = Trip.builder().id(1L).tripName("Test").user(user).build();

        Mockito.when(userRepository.findByEmail("test@tripnest.com")).thenReturn(Optional.of(user));
        Mockito.when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));

        // Mock a 11MB file (11 * 1024 * 1024 bytes)
        byte[] largeContent = new byte[11 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", largeContent);

        assertThrows(BadRequestException.class, () -> {
            documentService.uploadDocument(1L, file, "Test Document");
        });
    }

    @Test
    @WithMockUser(username = "creator@tripnest.com")
    void testDuplicateInvitation_ThrowsException() {
        User creator = User.builder().id(1L).email("creator@tripnest.com").fullName("Creator").build();
        User invitee = User.builder().id(2L).email("invitee@tripnest.com").fullName("Invitee").build();
        Trip trip = Trip.builder().id(1L).tripName("Trip").user(creator).build();

        Mockito.when(userRepository.findByEmail("creator@tripnest.com")).thenReturn(Optional.of(creator));
        Mockito.when(tripRepository.findById(1L)).thenReturn(Optional.of(trip));
        Mockito.when(userRepository.findByEmail("invitee@tripnest.com")).thenReturn(Optional.of(invitee));
        
        // Mock that member already exists
        TripMember existingMember = TripMember.builder().trip(trip).user(invitee).status("PENDING").build();
        Mockito.when(tripMemberRepository.findByTripAndEmail(trip, "invitee@tripnest.com")).thenReturn(Optional.of(existingMember));

        com.tripnest.backend.dto.InviteMemberRequest request = new com.tripnest.backend.dto.InviteMemberRequest();
        request.setName("Invitee");
        request.setEmail("invitee@tripnest.com");
        request.setRole("MEMBER");

        assertThrows(BadRequestException.class, () -> {
            tripMemberService.inviteMember(1L, request);
        });
    }

    @Test
    void testUnauthorizedAccess_Blocked() throws Exception {
        mockMvc.perform(get("/api/trips"))
                .andExpect(status().isForbidden());
    }
}
