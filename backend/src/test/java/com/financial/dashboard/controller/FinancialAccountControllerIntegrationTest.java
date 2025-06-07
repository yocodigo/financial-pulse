package com.financial.dashboard.controller;

import com.financial.dashboard.dto.AccountDTO;
import com.financial.dashboard.dto.TransactionDTO;
import com.financial.dashboard.entity.Account;
import com.financial.dashboard.entity.Transaction;
import com.financial.dashboard.repository.AccountRepository;
import com.financial.dashboard.repository.TransactionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FinancialAccountControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private Account testAccount;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        // Clear repositories
        transactionRepository.deleteAll();
        accountRepository.deleteAll();

        // Create test account
        testAccount = new Account();
        testAccount.setName("Test Account");
        testAccount.setType(Account.AccountType.CHECKING);
        testAccount.setBalance(new BigDecimal("1000.00"));
        testAccount.setCurrency("USD");
        testAccount.setInstitution("Test Bank");
        testAccount.setAccountNumber("1234567890");
        testAccount = accountRepository.save(testAccount);

        // Create test transaction
        testTransaction = new Transaction();
        testTransaction.setAccount(testAccount);
        testTransaction.setType(Transaction.TransactionType.DEPOSIT);
        testTransaction.setAmount(new BigDecimal("100.00"));
        testTransaction.setDescription("Test deposit");
        testTransaction.setCategory("Test category");
        testTransaction.setDate(LocalDateTime.now());
        testTransaction.setStatus(Transaction.TransactionStatus.COMPLETED);
        testTransaction = transactionRepository.save(testTransaction);
    }

    @Test
    void getAllAccounts_ShouldReturnAccounts() throws Exception {
        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value(testAccount.getName()))
                .andExpect(jsonPath("$[0].type").value(testAccount.getType().toString()))
                .andExpect(jsonPath("$[0].balance").value(testAccount.getBalance().doubleValue()));
    }

    @Test
    void getAccount_ShouldReturnAccount() throws Exception {
        mockMvc.perform(get("/api/accounts/{id}", testAccount.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(testAccount.getName()))
                .andExpect(jsonPath("$.type").value(testAccount.getType().toString()))
                .andExpect(jsonPath("$.balance").value(testAccount.getBalance().doubleValue()));
    }

    @Test
    void createAccount_ShouldCreateNewAccount() throws Exception {
        AccountDTO newAccount = new AccountDTO();
        newAccount.setName("New Account");
        newAccount.setType(Account.AccountType.SAVINGS);
        newAccount.setCurrency("USD");
        newAccount.setInstitution("New Bank");
        newAccount.setAccountNumber("9876543210");

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newAccount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(newAccount.getName()))
                .andExpect(jsonPath("$.type").value(newAccount.getType().toString()));
    }

    @Test
    void updateAccount_ShouldUpdateAccount() throws Exception {
        AccountDTO updatedAccount = new AccountDTO();
        updatedAccount.setName("Updated Account");
        updatedAccount.setType(Account.AccountType.SAVINGS);

        mockMvc.perform(put("/api/accounts/{id}", testAccount.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedAccount)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(updatedAccount.getName()))
                .andExpect(jsonPath("$.type").value(updatedAccount.getType().toString()));
    }

    @Test
    void deleteAccount_ShouldDeleteAccount() throws Exception {
        mockMvc.perform(delete("/api/accounts/{id}", testAccount.getId()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/accounts/{id}", testAccount.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAccountTransactions_ShouldReturnTransactions() throws Exception {
        mockMvc.perform(get("/api/accounts/{id}/transactions", testAccount.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].description").value(testTransaction.getDescription()))
                .andExpect(jsonPath("$[0].amount").value(testTransaction.getAmount().doubleValue()));
    }

    @Test
    void createTransaction_ShouldCreateNewTransaction() throws Exception {
        TransactionDTO newTransaction = new TransactionDTO();
        newTransaction.setType(Transaction.TransactionType.DEPOSIT);
        newTransaction.setAmount(new BigDecimal("200.00"));
        newTransaction.setDescription("New transaction");
        newTransaction.setCategory("New category");

        mockMvc.perform(post("/api/accounts/{id}/transactions", testAccount.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newTransaction)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value(newTransaction.getDescription()))
                .andExpect(jsonPath("$.amount").value(newTransaction.getAmount().doubleValue()));
    }

    @Test
    void transferFunds_ShouldTransferBetweenAccounts() throws Exception {
        // Create second account
        Account secondAccount = new Account();
        secondAccount.setName("Second Account");
        secondAccount.setType(Account.AccountType.SAVINGS);
        secondAccount.setBalance(new BigDecimal("500.00"));
        secondAccount.setCurrency("USD");
        secondAccount.setInstitution("Test Bank");
        secondAccount.setAccountNumber("0987654321");
        secondAccount = accountRepository.save(secondAccount);

        mockMvc.perform(post("/api/accounts/transfer")
                .param("fromAccountId", testAccount.getId().toString())
                .param("toAccountId", secondAccount.getId().toString())
                .param("amount", "100.00")
                .param("description", "Test transfer"))
                .andExpect(status().isOk());

        // Verify balances were updated
        mockMvc.perform(get("/api/accounts/{id}", testAccount.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(900.00));

        mockMvc.perform(get("/api/accounts/{id}", secondAccount.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(600.00));
    }

    @Test
    void getAccountSummary_ShouldReturnSummary() throws Exception {
        mockMvc.perform(get("/api/accounts/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBalance").exists())
                .andExpect(jsonPath("$.accountCount").exists());
    }
} 