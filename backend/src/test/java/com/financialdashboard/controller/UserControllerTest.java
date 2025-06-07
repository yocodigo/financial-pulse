package com.financialdashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialdashboard.model.User;
import com.financialdashboard.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    void getAllUsers_Success() throws Exception {
        // Arrange
        User user1 = createUser(1L, "john@example.com", "John Doe");
        User user2 = createUser(2L, "jane@example.com", "Jane Doe");
        when(userService.getAllUsers()).thenReturn(Arrays.asList(user1, user2));

        // Act & Assert
        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].email", is("john@example.com")))
            .andExpect(jsonPath("$[1].email", is("jane@example.com")));
    }

    @Test
    void getUserById_Success() throws Exception {
        // Arrange
        User user = createUser(1L, "john@example.com", "John Doe");
        when(userService.getUserById(1L)).thenReturn(user);

        // Act & Assert
        mockMvc.perform(get("/api/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email", is("john@example.com")))
            .andExpect(jsonPath("$.name", is("John Doe")));
    }

    @Test
    void getUserById_NotFound() throws Exception {
        // Arrange
        when(userService.getUserById(999L)).thenReturn(null);

        // Act & Assert
        mockMvc.perform(get("/api/users/999"))
            .andExpect(status().isNotFound());
    }

    @Test
    void createUser_Success() throws Exception {
        // Arrange
        User newUser = createUser(null, "new@example.com", "New User");
        User savedUser = createUser(1L, "new@example.com", "New User");
        when(userService.createUser(any(User.class))).thenReturn(savedUser);

        // Act & Assert
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newUser)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.email", is("new@example.com")))
            .andExpect(jsonPath("$.name", is("New User")));
    }

    @Test
    void updateUser_Success() throws Exception {
        // Arrange
        User updatedUser = createUser(1L, "updated@example.com", "Updated User");
        when(userService.updateUser(eq(1L), any(User.class))).thenReturn(updatedUser);

        // Act & Assert
        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedUser)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email", is("updated@example.com")))
            .andExpect(jsonPath("$.name", is("Updated User")));
    }

    @Test
    void deleteUser_Success() throws Exception {
        // Arrange
        doNothing().when(userService).deleteUser(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/users/1"))
            .andExpect(status().isNoContent());
        verify(userService).deleteUser(1L);
    }

    private User createUser(Long id, String email, String name) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setName(name);
        return user;
    }
} 