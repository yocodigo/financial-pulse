package com.financialdashboard.repository;

import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialAccountRepository extends JpaRepository<FinancialAccount, Long> {
    List<FinancialAccount> findByUser(User user);
    List<FinancialAccount> findByUserAndProvider(User user, FinancialAccount.Provider provider);
} 