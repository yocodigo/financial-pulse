package com.financialdashboard.controller;

import com.financialdashboard.model.MarketData;
import com.financialdashboard.service.MarketDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class MarketDataController extends BaseController<MarketData, Long> {

    private final MarketDataService marketDataService;

    public MarketDataController(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    @GetMapping("/price/{symbol}")
    public ResponseEntity<BigDecimal> getLatestPrice(@PathVariable String symbol) {
        BigDecimal price = marketDataService.getLatestPrice(symbol);
        return price != null ? ok(price) : notFound();
    }

    @GetMapping("/historical/{symbol}")
    public ResponseEntity<List<MarketData>> getHistoricalData(
            @PathVariable String symbol,
            @RequestParam ZonedDateTime startDate,
            @RequestParam ZonedDateTime endDate) {
        return ok(marketDataService.getHistoricalData(symbol, startDate, endDate));
    }

    @PostMapping("/prices/batch")
    public ResponseEntity<Map<String, BigDecimal>> getBatchPrices(@RequestBody List<String> symbols) {
        return ok(marketDataService.getBatchPrices(symbols));
    }

    @GetMapping("/quote/stock/{symbol}")
    public ResponseEntity<Map<String, Object>> getStockQuote(@PathVariable String symbol) {
        Map<String, Object> quote = marketDataService.getStockQuote(symbol);
        return quote != null ? ok(quote) : notFound();
    }

    @GetMapping("/quote/crypto/{symbol}")
    public ResponseEntity<Map<String, Object>> getCryptoQuote(@PathVariable String symbol) {
        Map<String, Object> quote = marketDataService.getCryptoQuote(symbol);
        return quote != null ? ok(quote) : notFound();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refreshMarketData() {
        marketDataService.refreshMarketData();
        return noContent();
    }

    @PostMapping("/track/{symbol}")
    public ResponseEntity<Void> trackSymbol(@PathVariable String symbol) {
        marketDataService.trackSymbol(symbol);
        return noContent();
    }

    @DeleteMapping("/track/{symbol}")
    public ResponseEntity<Void> untrackSymbol(@PathVariable String symbol) {
        marketDataService.untrackSymbol(symbol);
        return noContent();
    }
} 