package com.financialdashboard.repository;

import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.PortfolioHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, Long> {
    List<PortfolioHolding> findByAccount(FinancialAccount account);
    Optional<PortfolioHolding> findByAccountAndSymbol(FinancialAccount account, String symbol);
    List<PortfolioHolding> findBySymbol(String symbol);
} 