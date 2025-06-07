package com.financialdashboard.service.impl;

import com.financialdashboard.model.MarketData;
import com.financialdashboard.repository.MarketDataRepository;
import com.financialdashboard.service.MarketDataService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Transactional
public class MarketDataServiceImpl implements MarketDataService {

    private final MarketDataRepository marketDataRepository;
    private final AlphaVantageService alphaVantageService;
    private final Set<String> trackedSymbols;

    public MarketDataServiceImpl(MarketDataRepository marketDataRepository,
                               AlphaVantageService alphaVantageService) {
        this.marketDataRepository = marketDataRepository;
        this.alphaVantageService = alphaVantageService;
        this.trackedSymbols = new HashSet<>();
    }

    @Override
    @Cacheable(value = "latestPrice", key = "#symbol", unless = "#result == null")
    public BigDecimal getLatestPrice(String symbol) {
        return marketDataRepository.findLatestBySymbol(symbol)
            .map(MarketData::getPrice)
            .orElseGet(() -> fetchLatestPrice(symbol));
    }

    @Override
    public List<MarketData> getHistoricalData(String symbol, ZonedDateTime startDate, ZonedDateTime endDate) {
        return marketDataRepository.findBySymbolAndTimestampBetween(symbol, startDate, endDate);
    }

    @Override
    @Cacheable(value = "batchPrices", key = "#symbols.hashCode()")
    public Map<String, BigDecimal> getBatchPrices(List<String> symbols) {
        return symbols.stream()
            .collect(Collectors.toMap(
                symbol -> symbol,
                this::getLatestPrice
            ));
    }

    @Override
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @CacheEvict(value = {"latestPrice", "batchPrices", "stockQuote", "cryptoQuote"}, allEntries = true)
    public void refreshMarketData() {
        trackedSymbols.forEach(this::fetchLatestPrice);
    }

    @Override
    public List<MarketData> getLatestMarketData(List<String> symbols) {
        return symbols.stream()
            .map(symbol -> {
                BigDecimal price = getLatestPrice(symbol);
                return new MarketData(null, symbol, price, null, ZonedDateTime.now(), 
                    MarketData.DataSource.ALPHA_VANTAGE);
            })
            .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "stockQuote", key = "#symbol", unless = "#result == null")
    public Map<String, Object> getStockQuote(String symbol) {
        return alphaVantageService.getStockQuote(symbol);
    }

    @Override
    @Cacheable(value = "cryptoQuote", key = "#symbol", unless = "#result == null")
    public Map<String, Object> getCryptoQuote(String symbol) {
        return alphaVantageService.getCryptoQuote(symbol);
    }

    private BigDecimal fetchLatestPrice(String symbol) {
        Map<String, Object> quote = alphaVantageService.getStockQuote(symbol);
        if (quote != null && quote.containsKey("price")) {
            BigDecimal price = (BigDecimal) quote.get("price");
            MarketData marketData = new MarketData(null, symbol, price, 
                (Long) quote.get("volume"), ZonedDateTime.now(), MarketData.DataSource.ALPHA_VANTAGE);
            marketDataRepository.save(marketData);
            trackedSymbols.add(symbol);
            return price;
        }
        return null;
    }

    public void trackSymbol(String symbol) {
        trackedSymbols.add(symbol);
    }

    public void untrackSymbol(String symbol) {
        trackedSymbols.remove(symbol);
    }
} 