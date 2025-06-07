package com.financialdashboard.repository;

import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByAccount(FinancialAccount account, Pageable pageable);
    List<Transaction> findByAccountAndTransactionDateBetween(
        FinancialAccount account, 
        ZonedDateTime startDate, 
        ZonedDateTime endDate
    );
} 