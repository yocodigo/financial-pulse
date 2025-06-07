package com.financialdashboard.service.impl;

import com.financialdashboard.exception.ResourceNotFoundException;
import com.financialdashboard.exception.ValidationException;
import com.financialdashboard.model.FinancialAccount;
import com.financialdashboard.model.User;
import com.financialdashboard.repository.FinancialAccountRepository;
import com.financialdashboard.service.FinancialAccountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class FinancialAccountServiceImpl extends BaseServiceImpl<FinancialAccount, Long, FinancialAccountRepository> 
    implements FinancialAccountService {

    public FinancialAccountServiceImpl(FinancialAccountRepository repository) {
        super(repository);
    }

    @Override
    public List<FinancialAccount> findByUser(User user) {
        return repository.findByUser(user);
    }

    @Override
    public List<FinancialAccount> findByUserAndProvider(User user, FinancialAccount.Provider provider) {
        return repository.findByUserAndProvider(user, provider);
    }

    @Override
    public FinancialAccount createAccount(User user, FinancialAccount account) {
        validateAccount(account);
        account.setUser(user);
        return save(account);
    }

    @Override
    public FinancialAccount updateAccount(Long id, FinancialAccount account) {
        FinancialAccount existingAccount = findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FinancialAccount", "id", id));

        validateAccount(account);
        
        existingAccount.setAccountType(account.getAccountType());
        existingAccount.setProvider(account.getProvider());
        existingAccount.setAccountNumber(account.getAccountNumber());
        existingAccount.setCurrency(account.getCurrency());

        return save(existingAccount);
    }

    @Override
    public void deleteAccount(Long id) {
        if (!existsById(id)) {
            throw new ResourceNotFoundException("FinancialAccount", "id", id);
        }
        deleteById(id);
    }

    @Override
    public void updateBalance(Long id, double amount) {
        FinancialAccount account = findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FinancialAccount", "id", id));

        BigDecimal newBalance = account.getBalance().add(BigDecimal.valueOf(amount));
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new ValidationException("balance", "Insufficient funds");
        }

        account.setBalance(newBalance);
        save(account);
    }

    private void validateAccount(FinancialAccount account) {
        if (account.getAccountType() == null) {
            throw new ValidationException("accountType", "Account type is required");
        }
        if (account.getProvider() == null) {
            throw new ValidationException("provider", "Provider is required");
        }
        if (account.getCurrency() == null || account.getCurrency().length() != 3) {
            throw new ValidationException("currency", "Valid currency code is required");
        }
    }
} 