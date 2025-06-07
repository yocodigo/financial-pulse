package com.financialdashboard.service;

import com.financialdashboard.exception.ResourceNotFoundException;
import com.financialdashboard.exception.ValidationException;
import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.PortfolioHolding;
import com.financialdashboard.repository.PortfolioHoldingRepository;
import com.financialdashboard.service.impl.PortfolioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private PortfolioHoldingRepository portfolioHoldingRepository;

    @Mock
    private MarketDataService marketDataService;

    private PortfolioService portfolioService;
    private FinancialAccount testAccount;

    @BeforeEach
    void setUp() {
        portfolioService = new PortfolioServiceImpl(portfolioHoldingRepository, marketDataService);
        testAccount = new FinancialAccount();
        testAccount.setId(1L);
    }

    @Test
    void getHoldingsByAccount_Success() {
        // Arrange
        List<PortfolioHolding> expectedHoldings = Arrays.asList(
            createHolding("AAPL", new BigDecimal("10"), new BigDecimal("150")),
            createHolding("MSFT", new BigDecimal("5"), new BigDecimal("250"))
        );
        when(portfolioHoldingRepository.findByAccount(any(FinancialAccount.class)))
            .thenReturn(expectedHoldings);

        // Act
        List<PortfolioHolding> result = portfolioService.getHoldingsByAccount(testAccount);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(portfolioHoldingRepository).findByAccount(testAccount);
    }

    @Test
    void addHolding_NewHolding_Success() {
        // Arrange
        String symbol = "AAPL";
        BigDecimal quantity = new BigDecimal("10");
        BigDecimal price = new BigDecimal("150");
        BigDecimal currentPrice = new BigDecimal("160");

        when(portfolioHoldingRepository.findByAccountAndSymbol(any(), anyString()))
            .thenReturn(Optional.empty());
        when(marketDataService.getLatestPrice(anyString())).thenReturn(currentPrice);
        when(portfolioHoldingRepository.save(any(PortfolioHolding.class)))
            .thenAnswer(i -> i.getArgument(0));

        // Act
        PortfolioHolding result = portfolioService.addHolding(testAccount, symbol, quantity, price);

        // Assert
        assertNotNull(result);
        assertEquals(symbol, result.getSymbol());
        assertEquals(quantity, result.getQuantity());
        assertEquals(price, result.getAveragePrice());
        assertEquals(currentPrice, result.getCurrentPrice());
        verify(portfolioHoldingRepository).save(any(PortfolioHolding.class));
    }

    @Test
    void addHolding_InvalidQuantity_ThrowsException() {
        // Arrange
        String symbol = "AAPL";
        BigDecimal invalidQuantity = new BigDecimal("-10");
        BigDecimal price = new BigDecimal("150");

        // Act & Assert
        assertThrows(ValidationException.class, 
            () -> portfolioService.addHolding(testAccount, symbol, invalidQuantity, price));
        verify(portfolioHoldingRepository, never()).save(any(PortfolioHolding.class));
    }

    @Test
    void getPortfolioSummary_Success() {
        // Arrange
        List<PortfolioHolding> holdings = Arrays.asList(
            createHolding("AAPL", new BigDecimal("10"), new BigDecimal("150"), new BigDecimal("160")),
            createHolding("MSFT", new BigDecimal("5"), new BigDecimal("250"), new BigDecimal("270"))
        );
        when(portfolioHoldingRepository.findByAccount(any(FinancialAccount.class)))
            .thenReturn(holdings);

        // Act
        Map<String, BigDecimal> summary = portfolioService.getPortfolioSummary(testAccount);

        // Assert
        assertNotNull(summary);
        assertEquals(new BigDecimal("2300"), summary.get("totalValue")); // 10*160 + 5*270
        assertEquals(new BigDecimal("2750"), summary.get("totalCost")); // 10*150 + 5*250
        assertEquals(new BigDecimal("450"), summary.get("totalGainLoss")); // 2300 - 2750
    }

    private PortfolioHolding createHolding(String symbol, BigDecimal quantity, BigDecimal avgPrice) {
        return createHolding(symbol, quantity, avgPrice, avgPrice);
    }

    private PortfolioHolding createHolding(String symbol, BigDecimal quantity, 
                                         BigDecimal avgPrice, BigDecimal currentPrice) {
        PortfolioHolding holding = new PortfolioHolding();
        holding.setSymbol(symbol);
        holding.setQuantity(quantity);
        holding.setAveragePrice(avgPrice);
        holding.setCurrentPrice(currentPrice);
        return holding;
    }
} 