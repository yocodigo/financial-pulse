package com.financialdashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.PortfolioHolding;
import com.financialdashboard.service.FinancialAccountService;
import com.financialdashboard.service.PortfolioService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortfolioController.class)
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PortfolioService portfolioService;

    @MockBean
    private FinancialAccountService accountService;

    @Test
    void getHoldingsByAccount_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        List<PortfolioHolding> holdings = Arrays.asList(
            createHolding("AAPL", new BigDecimal("10"), new BigDecimal("150")),
            createHolding("MSFT", new BigDecimal("5"), new BigDecimal("250"))
        );
        when(portfolioService.getHoldingsByAccount(any(FinancialAccount.class)))
            .thenReturn(holdings);

        // Act & Assert
        mockMvc.perform(get("/api/accounts/{accountId}/holdings", accountId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].symbol", is("AAPL")))
            .andExpect(jsonPath("$[1].symbol", is("MSFT")));
    }

    @Test
    void getHoldingBySymbol_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        String symbol = "AAPL";
        PortfolioHolding holding = createHolding(symbol, new BigDecimal("10"), new BigDecimal("150"));
        when(portfolioService.getHoldingBySymbol(any(FinancialAccount.class), eq(symbol)))
            .thenReturn(holding);

        // Act & Assert
        mockMvc.perform(get("/api/accounts/{accountId}/holdings/{symbol}", accountId, symbol))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.symbol", is(symbol)))
            .andExpect(jsonPath("$.quantity", is(10)))
            .andExpect(jsonPath("$.averagePrice", is(150)));
    }

    @Test
    void addHolding_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        PortfolioHolding newHolding = createHolding("AAPL", new BigDecimal("10"), new BigDecimal("150"));
        when(portfolioService.addHolding(any(FinancialAccount.class), anyString(), any(), any()))
            .thenReturn(newHolding);

        // Act & Assert
        mockMvc.perform(post("/api/accounts/{accountId}/holdings", accountId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newHolding)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.symbol", is("AAPL")))
            .andExpect(jsonPath("$.quantity", is(10)))
            .andExpect(jsonPath("$.averagePrice", is(150)));
    }

    @Test
    void updateHolding_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        String symbol = "AAPL";
        PortfolioHolding updatedHolding = createHolding(symbol, new BigDecimal("15"), new BigDecimal("160"));
        when(portfolioService.updateHolding(any(FinancialAccount.class), eq(symbol), any(), any()))
            .thenReturn(updatedHolding);

        // Act & Assert
        mockMvc.perform(put("/api/accounts/{accountId}/holdings/{symbol}", accountId, symbol)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedHolding)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.quantity", is(15)))
            .andExpect(jsonPath("$.averagePrice", is(160)));
    }

    @Test
    void removeHolding_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        String symbol = "AAPL";
        doNothing().when(portfolioService).removeHolding(any(FinancialAccount.class), eq(symbol));

        // Act & Assert
        mockMvc.perform(delete("/api/accounts/{accountId}/holdings/{symbol}", accountId, symbol))
            .andExpect(status().isNoContent());
        verify(portfolioService).removeHolding(any(FinancialAccount.class), eq(symbol));
    }

    @Test
    void getPortfolioSummary_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        Map<String, BigDecimal> summary = new HashMap<>();
        summary.put("totalValue", new BigDecimal("10000"));
        summary.put("totalCost", new BigDecimal("9000"));
        summary.put("totalGainLoss", new BigDecimal("1000"));
        when(portfolioService.getPortfolioSummary(any(FinancialAccount.class)))
            .thenReturn(summary);

        // Act & Assert
        mockMvc.perform(get("/api/accounts/{accountId}/portfolio/summary", accountId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalValue", is(10000)))
            .andExpect(jsonPath("$.totalCost", is(9000)))
            .andExpect(jsonPath("$.totalGainLoss", is(1000)));
    }

    @Test
    void refreshPortfolio_Success() throws Exception {
        // Arrange
        Long accountId = 1L;
        List<PortfolioHolding> updatedHoldings = Arrays.asList(
            createHolding("AAPL", new BigDecimal("10"), new BigDecimal("160")),
            createHolding("MSFT", new BigDecimal("5"), new BigDecimal("260"))
        );
        when(portfolioService.refreshPortfolio(any(FinancialAccount.class)))
            .thenReturn(updatedHoldings);

        // Act & Assert
        mockMvc.perform(post("/api/accounts/{accountId}/portfolio/refresh", accountId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].currentPrice", is(160)))
            .andExpect(jsonPath("$[1].currentPrice", is(260)));
    }

    private PortfolioHolding createHolding(String symbol, BigDecimal quantity, BigDecimal avgPrice) {
        PortfolioHolding holding = new PortfolioHolding();
        holding.setSymbol(symbol);
        holding.setQuantity(quantity);
        holding.setAveragePrice(avgPrice);
        holding.setCurrentPrice(avgPrice);
        return holding;
    }
} 