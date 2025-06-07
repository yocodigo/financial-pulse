package com.financialdashboard.service;

import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.User;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinancialAccountService extends BaseService<FinancialAccount, Long> {
    private static final Logger logger = LoggerFactory.getLogger(FinancialAccountService.class);
    
    public List<FinancialAccount> findByUser(User user) {
        logger.debug("Fetching accounts for user: {}", user.getUsername());
        List<FinancialAccount> accounts = repository.findByUser(user);
        logger.info("Retrieved {} accounts for user: {}", accounts.size(), user.getUsername());
        return accounts;
    }

    public List<FinancialAccount> findByUserAndProvider(User user, FinancialAccount.Provider provider) {
        logger.debug("Fetching accounts for user: {} and provider: {}", user.getUsername(), provider);
        List<FinancialAccount> accounts = repository.findByUserAndProvider(user, provider);
        logger.info("Retrieved {} accounts for user: {} and provider: {}", accounts.size(), user.getUsername(), provider);
        return accounts;
    }

    @Transactional
    public FinancialAccount createAccount(User user, FinancialAccount account) {
        logger.debug("Creating new account: {} for user: {}", account.getName(), user.getUsername());
        try {
            account.setUser(user);
            FinancialAccount savedAccount = repository.save(account);
            logger.info("Successfully created account: {} for user: {}", savedAccount.getName(), user.getUsername());
            return savedAccount;
        } catch (Exception e) {
            logger.error("Failed to create account: {} for user: {}", account.getName(), user.getUsername(), e);
            throw new RuntimeException("Failed to create account", e);
        }
    }

    @Transactional
    public FinancialAccount updateAccount(Long id, FinancialAccount account) {
        logger.debug("Updating account with id: {}", id);
        FinancialAccount existingAccount = repository.findById(id)
            .orElseThrow(() -> {
                logger.error("Account not found with id: {}", id);
                return new RuntimeException("Account not found");
            });
        
        try {
            existingAccount.setName(account.getName());
            existingAccount.setType(account.getType());
            existingAccount.setBalance(account.getBalance());
            existingAccount.setCurrency(account.getCurrency());
            existingAccount.setDescription(account.getDescription());
            
            FinancialAccount updatedAccount = repository.save(existingAccount);
            logger.info("Successfully updated account: {} with id: {}", updatedAccount.getName(), id);
            return updatedAccount;
        } catch (Exception e) {
            logger.error("Failed to update account with id: {}", id, e);
            throw new RuntimeException("Failed to update account", e);
        }
    }

    @Transactional
    public void deleteAccount(Long id) {
        logger.debug("Deleting account with id: {}", id);
        try {
            repository.deleteById(id);
            logger.info("Successfully deleted account with id: {}", id);
        } catch (Exception e) {
            logger.error("Failed to delete account with id: {}", id, e);
            throw new RuntimeException("Failed to delete account", e);
        }
    }

    @Transactional
    public void updateBalance(Long id, double amount) {
        logger.debug("Updating balance for account with id: {}", id);
        FinancialAccount account = repository.findById(id)
            .orElseThrow(() -> {
                logger.error("Account not found with id: {}", id);
                return new RuntimeException("Account not found");
            });
        
        try {
            double newBalance = account.getBalance() + amount;
            account.setBalance(newBalance);
            repository.save(account);
            logger.info("Successfully updated balance for account: {} with id: {}", account.getName(), id);
        } catch (Exception e) {
            logger.error("Failed to update balance for account with id: {}", id, e);
            throw new RuntimeException("Failed to update balance", e);
        }
    }
} 