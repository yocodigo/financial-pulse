package com.financial.dashboard.service;

import com.financial.dashboard.dto.AccountDTO;
import com.financial.dashboard.dto.AccountSummaryDTO;
import com.financial.dashboard.dto.TransactionDTO;
import com.financial.dashboard.entity.Account;
import com.financial.dashboard.entity.Transaction;
import com.financial.dashboard.repository.AccountRepository;
import com.financial.dashboard.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FinancialAccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private FinancialAccountService accountService;

    private Account testAccount;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Setup test account
        testAccount = new Account();
        testAccount.setId(1L);
        testAccount.setName("Test Account");
        testAccount.setType(Account.AccountType.CHECKING);
        testAccount.setBalance(new BigDecimal("1000.00"));
        testAccount.setCurrency("USD");
        testAccount.setInstitution("Test Bank");
        testAccount.setAccountNumber("1234567890");

        // Setup test transaction
        testTransaction = new Transaction();
        testTransaction.setId(1L);
        testTransaction.setAccount(testAccount);
        testTransaction.setType(Transaction.TransactionType.DEPOSIT);
        testTransaction.setAmount(new BigDecimal("100.00"));
        testTransaction.setDescription("Test deposit");
        testTransaction.setCategory("Test category");
        testTransaction.setDate(LocalDateTime.now());
        testTransaction.setStatus(Transaction.TransactionStatus.COMPLETED);
    }

    @Test
    void getAllAccounts_ShouldReturnAllAccounts() {
        when(accountRepository.findAll()).thenReturn(Arrays.asList(testAccount));

        List<AccountDTO> result = accountService.getAllAccounts();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testAccount.getName(), result.get(0).getName());
        verify(accountRepository).findAll();
    }

    @Test
    void getAccount_ShouldReturnAccount() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        AccountDTO result = accountService.getAccount(1L);

        assertNotNull(result);
        assertEquals(testAccount.getName(), result.getName());
        verify(accountRepository).findById(1L);
    }

    @Test
    void createAccount_ShouldCreateNewAccount() {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("New Account");
        accountDTO.setType(Account.AccountType.SAVINGS);
        accountDTO.setCurrency("USD");
        accountDTO.setInstitution("New Bank");
        accountDTO.setAccountNumber("9876543210");

        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        AccountDTO result = accountService.createAccount(accountDTO);

        assertNotNull(result);
        assertEquals(testAccount.getName(), result.getName());
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void updateAccount_ShouldUpdateExistingAccount() {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("Updated Account");
        accountDTO.setType(Account.AccountType.SAVINGS);

        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        AccountDTO result = accountService.updateAccount(1L, accountDTO);

        assertNotNull(result);
        assertEquals(testAccount.getName(), result.getName());
        verify(accountRepository).findById(1L);
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void deleteAccount_ShouldDeleteAccount() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        doNothing().when(accountRepository).delete(testAccount);

        accountService.deleteAccount(1L);

        verify(accountRepository).findById(1L);
        verify(accountRepository).delete(testAccount);
    }

    @Test
    void getAccountTransactions_ShouldReturnTransactions() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(transactionRepository.findByAccountOrderByDateDesc(testAccount))
                .thenReturn(Arrays.asList(testTransaction));

        List<TransactionDTO> result = accountService.getAccountTransactions(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testTransaction.getDescription(), result.get(0).getDescription());
        verify(transactionRepository).findByAccountOrderByDateDesc(testAccount);
    }

    @Test
    void createTransaction_ShouldCreateNewTransaction() {
        TransactionDTO transactionDTO = new TransactionDTO();
        transactionDTO.setType(Transaction.TransactionType.DEPOSIT);
        transactionDTO.setAmount(new BigDecimal("100.00"));
        transactionDTO.setDescription("New transaction");
        transactionDTO.setCategory("New category");

        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(testTransaction);

        TransactionDTO result = accountService.createTransaction(1L, transactionDTO);

        assertNotNull(result);
        assertEquals(testTransaction.getDescription(), result.getDescription());
        verify(transactionRepository).save(any(Transaction.class));
    }

    @Test
    void transferFunds_ShouldTransferBetweenAccounts() {
        Account sourceAccount = new Account();
        sourceAccount.setId(1L);
        sourceAccount.setBalance(new BigDecimal("1000.00"));

        Account targetAccount = new Account();
        targetAccount.setId(2L);
        targetAccount.setBalance(new BigDecimal("500.00"));

        when(accountRepository.findById(1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(targetAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(sourceAccount, targetAccount);

        accountService.transferFunds(1L, 2L, 100.00, "Test transfer");

        verify(accountRepository, times(2)).save(any(Account.class));
    }

    @Test
    void getAccountSummary_ShouldReturnSummary() {
        when(accountRepository.findAll()).thenReturn(Arrays.asList(testAccount));
        when(transactionRepository.findByAccountAndTypeAndDateBetween(
                any(Account.class),
                any(Transaction.TransactionType.class),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(Arrays.asList(testTransaction));

        AccountSummaryDTO result = accountService.getAccountSummary();

        assertNotNull(result);
        assertTrue(result.getTotalBalance().compareTo(BigDecimal.ZERO) > 0);
        verify(accountRepository).findAll();
    }
} 