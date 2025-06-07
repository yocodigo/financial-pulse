package com.financialdashboard.service.impl;

import com.financialdashboard.exception.ResourceNotFoundException;
import com.financialdashboard.exception.ValidationException;
import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.PortfolioHolding;
import com.financialdashboard.repository.PortfolioHoldingRepository;
import com.financialdashboard.service.MarketDataService;
import com.financialdashboard.service.PortfolioService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioHoldingRepository portfolioHoldingRepository;
    private final MarketDataService marketDataService;

    public PortfolioServiceImpl(PortfolioHoldingRepository portfolioHoldingRepository,
                              MarketDataService marketDataService) {
        this.portfolioHoldingRepository = portfolioHoldingRepository;
        this.marketDataService = marketDataService;
    }

    @Override
    @Cacheable(value = "portfolioHoldings", key = "#account.id")
    public List<PortfolioHolding> getHoldingsByAccount(FinancialAccount account) {
        return portfolioHoldingRepository.findByAccount(account);
    }

    @Override
    @Cacheable(value = "portfolioHolding", key = "#account.id + '-' + #symbol")
    public PortfolioHolding getHoldingBySymbol(FinancialAccount account, String symbol) {
        return portfolioHoldingRepository.findByAccountAndSymbol(account, symbol)
            .orElseThrow(() -> new ResourceNotFoundException("PortfolioHolding", "symbol", symbol));
    }

    @Override
    @CacheEvict(value = {"portfolioHoldings", "portfolioHolding"}, allEntries = true)
    public PortfolioHolding addHolding(FinancialAccount account, String symbol, 
                                     BigDecimal quantity, BigDecimal price) {
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("quantity", "Quantity must be greater than zero");
        }
        if (price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("price", "Price must be greater than zero");
        }

        PortfolioHolding holding = portfolioHoldingRepository.findByAccountAndSymbol(account, symbol)
            .orElse(new PortfolioHolding());

        if (holding.getId() == null) {
            holding.setAccount(account);
            holding.setSymbol(symbol);
            holding.setQuantity(quantity);
            holding.setAveragePrice(price);
        } else {
            BigDecimal totalCost = holding.getAveragePrice().multiply(holding.getQuantity())
                .add(price.multiply(quantity));
            BigDecimal totalQuantity = holding.getQuantity().add(quantity);
            holding.setAveragePrice(totalCost.divide(totalQuantity, 4, RoundingMode.HALF_UP));
            holding.setQuantity(totalQuantity);
        }

        holding.setCurrentPrice(marketDataService.getLatestPrice(symbol));
        return portfolioHoldingRepository.save(holding);
    }

    @Override
    @CacheEvict(value = {"portfolioHoldings", "portfolioHolding"}, allEntries = true)
    public PortfolioHolding updateHolding(Long id, BigDecimal quantity, BigDecimal price) {
        PortfolioHolding holding = portfolioHoldingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("PortfolioHolding", "id", id));

        if (quantity != null) {
            if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ValidationException("quantity", "Quantity must be greater than zero");
            }
            holding.setQuantity(quantity);
        }

        if (price != null) {
            if (price.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ValidationException("price", "Price must be greater than zero");
            }
            holding.setAveragePrice(price);
        }

        holding.setCurrentPrice(marketDataService.getLatestPrice(holding.getSymbol()));
        return portfolioHoldingRepository.save(holding);
    }

    @Override
    @CacheEvict(value = {"portfolioHoldings", "portfolioHolding"}, allEntries = true)
    public void removeHolding(Long id) {
        if (!portfolioHoldingRepository.existsById(id)) {
            throw new ResourceNotFoundException("PortfolioHolding", "id", id);
        }
        portfolioHoldingRepository.deleteById(id);
    }

    @Override
    @Cacheable(value = "portfolioSummary", key = "#account.id")
    public Map<String, BigDecimal> getPortfolioSummary(FinancialAccount account) {
        List<PortfolioHolding> holdings = getHoldingsByAccount(account);
        Map<String, BigDecimal> summary = new HashMap<>();
        
        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;
        BigDecimal totalGainLoss = BigDecimal.ZERO;

        for (PortfolioHolding holding : holdings) {
            BigDecimal marketValue = holding.getMarketValue();
            BigDecimal costBasis = holding.getAveragePrice().multiply(holding.getQuantity());
            BigDecimal gainLoss = holding.getUnrealizedGainLoss();

            totalValue = totalValue.add(marketValue);
            totalCost = totalCost.add(costBasis);
            totalGainLoss = totalGainLoss.add(gainLoss);
        }

        summary.put("totalValue", totalValue);
        summary.put("totalCost", totalCost);
        summary.put("totalGainLoss", totalGainLoss);
        summary.put("returnPercentage", 
            totalCost.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO :
            totalGainLoss.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")));

        return summary;
    }

    @Override
    @CacheEvict(value = {"portfolioHoldings", "portfolioHolding", "portfolioSummary"}, allEntries = true)
    public void updateCurrentPrices(FinancialAccount account) {
        List<PortfolioHolding> holdings = getHoldingsByAccount(account);
        for (PortfolioHolding holding : holdings) {
            holding.setCurrentPrice(marketDataService.getLatestPrice(holding.getSymbol()));
            portfolioHoldingRepository.save(holding);
        }
    }
} 