package com.financialdashboard.service.impl;

import com.financialdashboard.exception.ResourceNotFoundException;
import com.financialdashboard.exception.ValidationException;
import com.financialdashboard.model.User;
import com.financialdashboard.repository.UserRepository;
import com.financialdashboard.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl extends BaseServiceImpl<User, Long, UserRepository> implements UserService {

    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository repository, PasswordEncoder passwordEncoder) {
        super(repository);
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email);
    }

    @Override
    public User createUser(User user) {
        if (existsByEmail(user.getEmail())) {
            throw new ValidationException("email", "Email already exists");
        }
        
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        User existingUser = findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (!existingUser.getEmail().equals(user.getEmail()) && existsByEmail(user.getEmail())) {
            throw new ValidationException("email", "Email already exists");
        }

        existingUser.setFirstName(user.getFirstName());
        existingUser.setLastName(user.getLastName());
        existingUser.setEmail(user.getEmail());
        
        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            existingUser.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        }

        return save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        if (!existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }
} 