package com.financialdashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialdashboard.model.MarketData;
import com.financialdashboard.service.MarketDataService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MarketDataController.class)
class MarketDataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MarketDataService marketDataService;

    @Test
    void getLatestPrice_Success() throws Exception {
        // Arrange
        String symbol = "AAPL";
        BigDecimal price = new BigDecimal("150.50");
        when(marketDataService.getLatestPrice(symbol)).thenReturn(price);

        // Act & Assert
        mockMvc.perform(get("/api/market-data/{symbol}/price", symbol))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", is(150.50)));
    }

    @Test
    void getHistoricalData_Success() throws Exception {
        // Arrange
        String symbol = "AAPL";
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        List<MarketData> historicalData = Arrays.asList(
            createMarketData(symbol, new BigDecimal("150.50"), startDate),
            createMarketData(symbol, new BigDecimal("151.25"), endDate)
        );
        when(marketDataService.getHistoricalData(eq(symbol), any(), any()))
            .thenReturn(historicalData);

        // Act & Assert
        mockMvc.perform(get("/api/market-data/{symbol}/historical", symbol)
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].currentPrice", is(150.50)))
            .andExpect(jsonPath("$[1].currentPrice", is(151.25)));
    }

    @Test
    void getBatchPrices_Success() throws Exception {
        // Arrange
        List<String> symbols = Arrays.asList("AAPL", "MSFT", "GOOGL");
        List<MarketData> marketData = Arrays.asList(
            createMarketData("AAPL", new BigDecimal("150.50")),
            createMarketData("MSFT", new BigDecimal("250.75")),
            createMarketData("GOOGL", new BigDecimal("2800.25"))
        );
        when(marketDataService.getBatchPrices(symbols)).thenReturn(marketData);

        // Act & Assert
        mockMvc.perform(get("/api/market-data/batch")
                .param("symbols", String.join(",", symbols)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)))
            .andExpect(jsonPath("$[0].symbol", is("AAPL")))
            .andExpect(jsonPath("$[1].symbol", is("MSFT")))
            .andExpect(jsonPath("$[2].symbol", is("GOOGL")));
    }

    @Test
    void getStockQuote_Success() throws Exception {
        // Arrange
        String symbol = "AAPL";
        Map<String, Object> quote = Map.of(
            "symbol", symbol,
            "price", new BigDecimal("150.50"),
            "change", new BigDecimal("2.50"),
            "changePercent", new BigDecimal("1.68")
        );
        when(marketDataService.getStockQuote(symbol)).thenReturn(quote);

        // Act & Assert
        mockMvc.perform(get("/api/market-data/stocks/{symbol}/quote", symbol))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.symbol", is(symbol)))
            .andExpect(jsonPath("$.price", is(150.50)))
            .andExpect(jsonPath("$.change", is(2.50)))
            .andExpect(jsonPath("$.changePercent", is(1.68)));
    }

    @Test
    void getCryptoQuote_Success() throws Exception {
        // Arrange
        String symbol = "BTC";
        Map<String, Object> quote = Map.of(
            "symbol", symbol,
            "price", new BigDecimal("50000.00"),
            "change", new BigDecimal("1000.00"),
            "changePercent", new BigDecimal("2.04")
        );
        when(marketDataService.getCryptoQuote(symbol)).thenReturn(quote);

        // Act & Assert
        mockMvc.perform(get("/api/market-data/crypto/{symbol}/quote", symbol))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.symbol", is(symbol)))
            .andExpect(jsonPath("$.price", is(50000.00)))
            .andExpect(jsonPath("$.change", is(1000.00)))
            .andExpect(jsonPath("$.changePercent", is(2.04)));
    }

    @Test
    void refreshMarketData_Success() throws Exception {
        // Arrange
        String symbol = "AAPL";
        MarketData updatedData = createMarketData(symbol, new BigDecimal("160.25"));
        when(marketDataService.refreshMarketData(symbol)).thenReturn(updatedData);

        // Act & Assert
        mockMvc.perform(post("/api/market-data/{symbol}/refresh", symbol))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.symbol", is(symbol)))
            .andExpect(jsonPath("$.currentPrice", is(160.25)));
    }

    @Test
    void trackSymbol_Success() throws Exception {
        // Arrange
        String symbol = "AAPL";
        doNothing().when(marketDataService).trackSymbol(symbol);

        // Act & Assert
        mockMvc.perform(post("/api/market-data/{symbol}/track", symbol))
            .andExpect(status().isOk());
        verify(marketDataService).trackSymbol(symbol);
    }

    @Test
    void untrackSymbol_Success() throws Exception {
        // Arrange
        String symbol = "AAPL";
        doNothing().when(marketDataService).untrackSymbol(symbol);

        // Act & Assert
        mockMvc.perform(delete("/api/market-data/{symbol}/track", symbol))
            .andExpect(status().isNoContent());
        verify(marketDataService).untrackSymbol(symbol);
    }

    private MarketData createMarketData(String symbol, BigDecimal price) {
        return createMarketData(symbol, price, LocalDate.now());
    }

    private MarketData createMarketData(String symbol, BigDecimal price, LocalDate date) {
        MarketData marketData = new MarketData();
        marketData.setSymbol(symbol);
        marketData.setCurrentPrice(price);
        marketData.setLastUpdated(date.atStartOfDay());
        return marketData;
    }
} 