package com.financialdashboard.service;

import com.financialdashboard.config.MarketDataConfig;
import com.financialdashboard.exception.ResourceNotFoundException;
import com.financialdashboard.model.MarketData;
import com.financialdashboard.repository.MarketDataRepository;
import com.financialdashboard.service.impl.MarketDataServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarketDataServiceTest {

    @Mock
    private MarketDataRepository marketDataRepository;

    @Mock
    private AlphaVantageService alphaVantageService;

    private MarketDataService marketDataService;
    private CacheManager cacheManager;

    @BeforeEach
    void setUp() {
        cacheManager = new ConcurrentMapCacheManager("marketData");
        marketDataService = new MarketDataServiceImpl(marketDataRepository, alphaVantageService, cacheManager);
    }

    @Test
    void getLatestPrice_Success() {
        // Arrange
        String symbol = "AAPL";
        BigDecimal expectedPrice = new BigDecimal("150.50");
        MarketData marketData = createMarketData(symbol, expectedPrice);
        
        when(marketDataRepository.findBySymbol(symbol))
            .thenReturn(Optional.of(marketData));

        // Act
        BigDecimal result = marketDataService.getLatestPrice(symbol);

        // Assert
        assertNotNull(result);
        assertEquals(expectedPrice, result);
        verify(marketDataRepository).findBySymbol(symbol);
    }

    @Test
    void getLatestPrice_NotFound_ThrowsException() {
        // Arrange
        String symbol = "INVALID";
        when(marketDataRepository.findBySymbol(symbol))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
            () -> marketDataService.getLatestPrice(symbol));
    }

    @Test
    void getBatchPrices_Success() {
        // Arrange
        List<String> symbols = Arrays.asList("AAPL", "MSFT", "GOOGL");
        List<MarketData> marketDataList = Arrays.asList(
            createMarketData("AAPL", new BigDecimal("150.50")),
            createMarketData("MSFT", new BigDecimal("250.75")),
            createMarketData("GOOGL", new BigDecimal("2800.25"))
        );

        when(marketDataRepository.findBySymbolIn(symbols))
            .thenReturn(marketDataList);

        // Act
        List<MarketData> result = marketDataService.getBatchPrices(symbols);

        // Assert
        assertNotNull(result);
        assertEquals(3, result.size());
        verify(marketDataRepository).findBySymbolIn(symbols);
    }

    @Test
    void refreshMarketData_Success() {
        // Arrange
        String symbol = "AAPL";
        BigDecimal newPrice = new BigDecimal("160.25");
        MarketData existingData = createMarketData(symbol, new BigDecimal("150.50"));
        
        when(marketDataRepository.findBySymbol(symbol))
            .thenReturn(Optional.of(existingData));
        when(alphaVantageService.getLatestPrice(symbol))
            .thenReturn(newPrice);
        when(marketDataRepository.save(any(MarketData.class)))
            .thenAnswer(i -> i.getArgument(0));

        // Act
        MarketData result = marketDataService.refreshMarketData(symbol);

        // Assert
        assertNotNull(result);
        assertEquals(newPrice, result.getCurrentPrice());
        verify(alphaVantageService).getLatestPrice(symbol);
        verify(marketDataRepository).save(any(MarketData.class));
    }

    private MarketData createMarketData(String symbol, BigDecimal price) {
        MarketData marketData = new MarketData();
        marketData.setSymbol(symbol);
        marketData.setCurrentPrice(price);
        marketData.setLastUpdated(LocalDateTime.now());
        return marketData;
    }
} 