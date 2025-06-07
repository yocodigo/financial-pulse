package com.financialdashboard.service;

import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.PortfolioHolding;
import com.financialdashboard.model.PortfolioTransaction;
import com.financialdashboard.model.PortfolioSummary;
import com.financialdashboard.repository.PortfolioHoldingRepository;
import com.financialdashboard.repository.PortfolioTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PortfolioService {
    private static final Logger logger = LoggerFactory.getLogger(PortfolioService.class);

    private final PortfolioHoldingRepository holdingRepository;
    private final PortfolioTransactionRepository transactionRepository;

    public PortfolioService(
            PortfolioHoldingRepository holdingRepository,
            PortfolioTransactionRepository transactionRepository) {
        this.holdingRepository = holdingRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<PortfolioHolding> getAllHoldings() {
        logger.debug("Fetching all portfolio holdings");
        List<PortfolioHolding> holdings = holdingRepository.findAll();
        logger.info("Retrieved {} portfolio holdings", holdings.size());
        return holdings;
    }

    public PortfolioHolding getHoldingById(Long id) {
        logger.debug("Fetching portfolio holding with id: {}", id);
        return holdingRepository.findById(id)
            .orElseThrow(() -> {
                logger.error("Portfolio holding not found with id: {}", id);
                return new RuntimeException("Portfolio holding not found");
            });
    }

    @Transactional
    public PortfolioHolding createHolding(PortfolioHolding holding) {
        logger.debug("Creating new portfolio holding: {}", holding.getSymbol());
        try {
            PortfolioHolding savedHolding = holdingRepository.save(holding);
            logger.info("Successfully created portfolio holding: {} with id: {}", 
                holding.getSymbol(), savedHolding.getId());
            return savedHolding;
        } catch (Exception e) {
            logger.error("Failed to create portfolio holding: {}", holding.getSymbol(), e);
            throw new RuntimeException("Failed to create portfolio holding", e);
        }
    }

    @Transactional
    public PortfolioHolding updateHolding(Long id, PortfolioHolding holdingDetails) {
        logger.debug("Updating portfolio holding with id: {}", id);
        PortfolioHolding holding = getHoldingById(id);
        
        try {
            holding.setSymbol(holdingDetails.getSymbol());
            holding.setQuantity(holdingDetails.getQuantity());
            holding.setAveragePrice(holdingDetails.getAveragePrice());
            holding.setCurrentPrice(holdingDetails.getCurrentPrice());
            
            PortfolioHolding updatedHolding = holdingRepository.save(holding);
            logger.info("Successfully updated portfolio holding: {} with id: {}", 
                holding.getSymbol(), id);
            return updatedHolding;
        } catch (Exception e) {
            logger.error("Failed to update portfolio holding with id: {}", id, e);
            throw new RuntimeException("Failed to update portfolio holding", e);
        }
    }

    @Transactional
    public void deleteHolding(Long id) {
        logger.debug("Deleting portfolio holding with id: {}", id);
        try {
            holdingRepository.deleteById(id);
            logger.info("Successfully deleted portfolio holding with id: {}", id);
        } catch (Exception e) {
            logger.error("Failed to delete portfolio holding with id: {}", id, e);
            throw new RuntimeException("Failed to delete portfolio holding", e);
        }
    }

    @Transactional
    public PortfolioTransaction createTransaction(PortfolioTransaction transaction) {
        logger.debug("Creating portfolio transaction for symbol: {}", transaction.getSymbol());
        try {
            transaction.setTimestamp(LocalDateTime.now());
            PortfolioTransaction savedTransaction = transactionRepository.save(transaction);
            logger.info("Successfully created transaction: {} for symbol: {}", 
                transaction.getType(), transaction.getSymbol());
            return savedTransaction;
        } catch (Exception e) {
            logger.error("Failed to create transaction for symbol: {}", transaction.getSymbol(), e);
            throw new RuntimeException("Failed to create transaction", e);
        }
    }

    public List<PortfolioTransaction> getTransactions() {
        logger.debug("Fetching all portfolio transactions");
        try {
            List<PortfolioTransaction> transactions = transactionRepository.findAll();
            logger.info("Retrieved {} portfolio transactions", transactions.size());
            return transactions;
        } catch (Exception e) {
            logger.error("Failed to fetch portfolio transactions", e);
            throw new RuntimeException("Failed to fetch transactions", e);
        }
    }

    public PortfolioSummary getPortfolioSummary() {
        logger.debug("Generating portfolio summary");
        try {
            List<PortfolioHolding> holdings = getAllHoldings();
            
            PortfolioSummary summary = new PortfolioSummary();
            summary.setTotalHoldings(holdings.size());
            summary.setTotalValue(holdings.stream()
                .map(holding -> holding.getCurrentPrice().multiply(holding.getQuantity()))
                .reduce(BigDecimal.ZERO, BigDecimal::add));
            
            // Calculate value by asset type
            Map<String, BigDecimal> valueByType = holdings.stream()
                .collect(Collectors.groupingBy(
                    PortfolioHolding::getType,
                    Collectors.reducing(
                        BigDecimal.ZERO,
                        holding -> holding.getCurrentPrice().multiply(holding.getQuantity()),
                        BigDecimal::add
                    )
                ));
            summary.setValueByType(valueByType);
            
            logger.info("Generated portfolio summary with {} holdings and total value: {}", 
                summary.getTotalHoldings(), summary.getTotalValue());
            return summary;
        } catch (Exception e) {
            logger.error("Failed to generate portfolio summary", e);
            throw new RuntimeException("Failed to generate portfolio summary", e);
        }
    }
} 