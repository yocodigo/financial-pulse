package com.financialdashboard.service.impl;

import com.financialdashboard.model.MarketData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AlphaVantageService {
    private static final String BASE_URL = "https://www.alphavantage.co/query";
    private final RestTemplate restTemplate;
    private final String apiKey;

    public AlphaVantageService(RestTemplate marketDataRestTemplate, 
                             @Value("${market.alpha.vantage.api.key}") String apiKey) {
        this.restTemplate = marketDataRestTemplate;
        this.apiKey = apiKey;
    }

    @Cacheable(value = "stockQuote", key = "#symbol", unless = "#result == null")
    public Map<String, Object> getStockQuote(String symbol) {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
            .queryParam("function", "GLOBAL_QUOTE")
            .queryParam("symbol", symbol)
            .queryParam("apikey", apiKey)
            .build()
            .toString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        return processStockQuoteResponse(response);
    }

    @Cacheable(value = "cryptoQuote", key = "#symbol", unless = "#result == null")
    public Map<String, Object> getCryptoQuote(String symbol) {
        String url = UriComponentsBuilder.fromHttpUrl(BASE_URL)
            .queryParam("function", "CURRENCY_EXCHANGE_RATE")
            .queryParam("from_currency", symbol)
            .queryParam("to_currency", "USD")
            .queryParam("apikey", apiKey)
            .build()
            .toString();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        return processCryptoQuoteResponse(response);
    }

    private Map<String, Object> processStockQuoteResponse(Map<String, Object> response) {
        if (response == null || response.get("Global Quote") == null) {
            return null;
        }

        Map<String, String> quote = (Map<String, String>) response.get("Global Quote");
        Map<String, Object> result = new HashMap<>();
        
        result.put("price", new BigDecimal(quote.get("05. price")));
        result.put("change", new BigDecimal(quote.get("09. change")));
        result.put("changePercent", quote.get("10. change percent").replace("%", ""));
        result.put("volume", Long.parseLong(quote.get("06. volume")));
        result.put("latestTradingDay", quote.get("07. latest trading day"));
        
        return result;
    }

    private Map<String, Object> processCryptoQuoteResponse(Map<String, Object> response) {
        if (response == null || response.get("Realtime Currency Exchange Rate") == null) {
            return null;
        }

        Map<String, String> quote = (Map<String, String>) response.get("Realtime Currency Exchange Rate");
        Map<String, Object> result = new HashMap<>();
        
        result.put("price", new BigDecimal(quote.get("5. Exchange Rate")));
        result.put("lastRefreshed", quote.get("6. Last Refreshed"));
        result.put("timeZone", quote.get("7. Time Zone"));
        
        return result;
    }
} 