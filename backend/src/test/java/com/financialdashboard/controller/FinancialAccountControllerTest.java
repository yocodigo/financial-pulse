package com.financialdashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.User;
import com.financialdashboard.service.FinancialAccountService;
import com.financialdashboard.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FinancialAccountController.class)
class FinancialAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FinancialAccountService accountService;

    @MockBean
    private UserService userService;

    @Test
    void getAllAccounts_Success() throws Exception {
        // Arrange
        List<FinancialAccount> accounts = Arrays.asList(
            createAccount(1L, "Schwab", "BROKERAGE", new BigDecimal("10000")),
            createAccount(2L, "Fidelity", "IRA", new BigDecimal("50000"))
        );
        when(accountService.getAllAccounts()).thenReturn(accounts);

        // Act & Assert
        mockMvc.perform(get("/api/accounts"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].name", is("Schwab")))
            .andExpect(jsonPath("$[1].name", is("Fidelity")));
    }

    @Test
    void getAccountsByUserId_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        List<FinancialAccount> accounts = Arrays.asList(
            createAccount(1L, "Schwab", "BROKERAGE", new BigDecimal("10000")),
            createAccount(2L, "Fidelity", "IRA", new BigDecimal("50000"))
        );
        when(accountService.getAccountsByUserId(userId)).thenReturn(accounts);

        // Act & Assert
        mockMvc.perform(get("/api/users/{userId}/accounts", userId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].name", is("Schwab")))
            .andExpect(jsonPath("$[1].name", is("Fidelity")));
    }

    @Test
    void createAccount_Success() throws Exception {
        // Arrange
        Long userId = 1L;
        User user = createUser(userId, "john@example.com", "John Doe");
        FinancialAccount newAccount = createAccount(null, "New Account", "BROKERAGE", new BigDecimal("0"));
        FinancialAccount savedAccount = createAccount(1L, "New Account", "BROKERAGE", new BigDecimal("0"));

        when(userService.getUserById(userId)).thenReturn(user);
        when(accountService.createAccount(any(FinancialAccount.class))).thenReturn(savedAccount);

        // Act & Assert
        mockMvc.perform(post("/api/users/{userId}/accounts", userId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newAccount)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.name", is("New Account")))
            .andExpect(jsonPath("$.type", is("BROKERAGE")));
    }

    @Test
    void updateAccount_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        FinancialAccount updatedAccount = createAccount(accountId, "Updated Account", "IRA", new BigDecimal("20000"));
        when(accountService.updateAccount(eq(accountId), any(FinancialAccount.class)))
            .thenReturn(updatedAccount);

        // Act & Assert
        mockMvc.perform(put("/api/accounts/{id}", accountId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedAccount)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name", is("Updated Account")))
            .andExpect(jsonPath("$.type", is("IRA")))
            .andExpect(jsonPath("$.balance", is(20000)));
    }

    @Test
    void updateBalance_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        BigDecimal newBalance = new BigDecimal("25000");
        FinancialAccount updatedAccount = createAccount(accountId, "Account", "BROKERAGE", newBalance);
        when(accountService.updateBalance(eq(accountId), eq(newBalance)))
            .thenReturn(updatedAccount);

        // Act & Assert
        mockMvc.perform(put("/api/accounts/{id}/balance", accountId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newBalance)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.balance", is(25000)));
    }

    @Test
    void deleteAccount_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        doNothing().when(accountService).deleteAccount(accountId);

        // Act & Assert
        mockMvc.perform(delete("/api/accounts/{id}", accountId))
            .andExpect(status().isNoContent());
        verify(accountService).deleteAccount(accountId);
    }

    private FinancialAccount createAccount(Long id, String name, String type, BigDecimal balance) {
        FinancialAccount account = new FinancialAccount();
        account.setId(id);
        account.setName(name);
        account.setType(type);
        account.setBalance(balance);
        return account;
    }

    private User createUser(Long id, String email, String name) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setName(name);
        return user;
    }
} 