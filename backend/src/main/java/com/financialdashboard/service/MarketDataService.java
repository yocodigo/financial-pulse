package com.financialdashboard.service;

import com.financialdashboard.model.MarketData;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

public interface MarketDataService {
    BigDecimal getLatestPrice(String symbol);
    List<MarketData> getHistoricalData(String symbol, ZonedDateTime startDate, ZonedDateTime endDate);
    Map<String, BigDecimal> getBatchPrices(List<String> symbols);
    void refreshMarketData();
    List<MarketData> getLatestMarketData(List<String> symbols);
    Map<String, Object> getStockQuote(String symbol);
    Map<String, Object> getCryptoQuote(String symbol);
} 