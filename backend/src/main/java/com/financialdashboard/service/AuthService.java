package com.financialdashboard.service;

import com.financialdashboard.model.User;
import com.financialdashboard.repository.UserRepository;
import com.financialdashboard.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public String login(String username, String password) {
        logger.debug("Attempting login for user: {}", username);
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String token = jwtTokenProvider.generateToken(authentication);
            logger.info("Successfully logged in user: {}", username);
            return token;
        } catch (Exception e) {
            logger.error("Login failed for user: {}", username, e);
            throw new RuntimeException("Invalid username or password");
        }
    }

    @Transactional
    public User register(User user) {
        logger.debug("Attempting to register new user: {}", user.getUsername());
        if (userRepository.existsByUsername(user.getUsername())) {
            logger.error("Registration failed - username already exists: {}", user.getUsername());
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            logger.error("Registration failed - email already exists: {}", user.getEmail());
            throw new RuntimeException("Email is already taken");
        }

        try {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            User savedUser = userRepository.save(user);
            logger.info("Successfully registered new user: {}", user.getUsername());
            return savedUser;
        } catch (Exception e) {
            logger.error("Registration failed for user: {}", user.getUsername(), e);
            throw new RuntimeException("Failed to register user", e);
        }
    }

    public User getCurrentUser() {
        logger.debug("Fetching current user");
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            logger.error("No authentication found in security context");
            throw new RuntimeException("User not authenticated");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> {
                logger.error("Current user not found in database: {}", username);
                return new RuntimeException("User not found");
            });
    }

    public void logout() {
        logger.debug("Logging out current user");
        SecurityContextHolder.clearContext();
        logger.info("Successfully logged out user");
    }

    public boolean validateToken(String token) {
        logger.debug("Validating JWT token");
        try {
            return jwtTokenProvider.validateToken(token);
        } catch (Exception e) {
            logger.error("Token validation failed", e);
            return false;
        }
    }
} 