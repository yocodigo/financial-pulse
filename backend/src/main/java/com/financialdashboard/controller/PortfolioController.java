package com.financialdashboard.controller;

import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.PortfolioHolding;
import com.financialdashboard.service.FinancialAccountService;
import com.financialdashboard.service.PortfolioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController extends BaseController<PortfolioHolding, Long> {

    private final PortfolioService portfolioService;
    private final FinancialAccountService accountService;

    public PortfolioController(PortfolioService portfolioService, FinancialAccountService accountService) {
        this.portfolioService = portfolioService;
        this.accountService = accountService;
    }

    @GetMapping("/account/{accountId}/holdings")
    public ResponseEntity<List<PortfolioHolding>> getHoldingsByAccount(@PathVariable Long accountId) {
        return accountService.findById(accountId)
            .map(account -> ok(portfolioService.getHoldingsByAccount(account)))
            .orElse(notFound());
    }

    @GetMapping("/account/{accountId}/holding/{symbol}")
    public ResponseEntity<PortfolioHolding> getHoldingBySymbol(
            @PathVariable Long accountId,
            @PathVariable String symbol) {
        return accountService.findById(accountId)
            .map(account -> ok(portfolioService.getHoldingBySymbol(account, symbol)))
            .orElse(notFound());
    }

    @PostMapping("/account/{accountId}/holding")
    public ResponseEntity<PortfolioHolding> addHolding(
            @PathVariable Long accountId,
            @RequestParam String symbol,
            @RequestParam BigDecimal quantity,
            @RequestParam BigDecimal price) {
        return accountService.findById(accountId)
            .map(account -> created(portfolioService.addHolding(account, symbol, quantity, price)))
            .orElse(notFound());
    }

    @PutMapping("/holding/{id}")
    public ResponseEntity<PortfolioHolding> updateHolding(
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal quantity,
            @RequestParam(required = false) BigDecimal price) {
        return ok(portfolioService.updateHolding(id, quantity, price));
    }

    @DeleteMapping("/holding/{id}")
    public ResponseEntity<Void> removeHolding(@PathVariable Long id) {
        portfolioService.removeHolding(id);
        return noContent();
    }

    @GetMapping("/account/{accountId}/summary")
    public ResponseEntity<Map<String, BigDecimal>> getPortfolioSummary(@PathVariable Long accountId) {
        return accountService.findById(accountId)
            .map(account -> ok(portfolioService.getPortfolioSummary(account)))
            .orElse(notFound());
    }

    @PostMapping("/account/{accountId}/refresh")
    public ResponseEntity<Void> refreshPortfolio(@PathVariable Long accountId) {
        return accountService.findById(accountId)
            .map(account -> {
                portfolioService.updateCurrentPrices(account);
                return noContent();
            })
            .orElse(notFound());
    }
} 