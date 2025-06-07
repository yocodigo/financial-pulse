package com.financial.dashboard.controller;

import com.financial.dashboard.dto.AccountDTO;
import com.financial.dashboard.dto.AccountSummaryDTO;
import com.financial.dashboard.dto.TransactionDTO;
import com.financial.dashboard.service.FinancialAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class FinancialAccountController {

    private final FinancialAccountService accountService;

    @Autowired
    public FinancialAccountController(FinancialAccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDTO> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccount(id));
    }

    @PostMapping
    public ResponseEntity<AccountDTO> createAccount(@RequestBody AccountDTO accountDTO) {
        return ResponseEntity.ok(accountService.createAccount(accountDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountDTO> updateAccount(@PathVariable Long id, @RequestBody AccountDTO accountDTO) {
        return ResponseEntity.ok(accountService.updateAccount(id, accountDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<AccountSummaryDTO> getAccountSummary() {
        return ResponseEntity.ok(accountService.getAccountSummary());
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<TransactionDTO>> getAccountTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccountTransactions(id));
    }

    @PostMapping("/{id}/transactions")
    public ResponseEntity<TransactionDTO> createTransaction(
            @PathVariable Long id,
            @RequestBody TransactionDTO transactionDTO) {
        return ResponseEntity.ok(accountService.createTransaction(id, transactionDTO));
    }

    @PostMapping("/transfer")
    public ResponseEntity<Void> transferFunds(
            @RequestParam Long fromAccountId,
            @RequestParam Long toAccountId,
            @RequestParam Double amount,
            @RequestParam(required = false) String description) {
        accountService.transferFunds(fromAccountId, toAccountId, amount, description);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/balance-history")
    public ResponseEntity<List<AccountDTO.BalanceHistoryDTO>> getBalanceHistory(
            @PathVariable Long id,
            @RequestParam(required = false) String period) {
        return ResponseEntity.ok(accountService.getBalanceHistory(id, period));
    }
} 