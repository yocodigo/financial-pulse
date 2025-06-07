package com.financialdashboard.service;

import com.financialdashboard.model.User;
import java.util.Optional;

public interface UserService extends BaseService<User, Long> {
    Optional<User> findByEmail(String email);
    User createUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
    boolean existsByEmail(String email);
} 