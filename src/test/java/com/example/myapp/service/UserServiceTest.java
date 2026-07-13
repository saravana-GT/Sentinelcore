package com.example.myapp.service;

import com.example.myapp.dto.response.UserResponse;
import com.example.myapp.model.User;
import com.example.myapp.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@SpringBootTest
class UserServiceTest {

    @Autowired
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @Test
    void testGetAllUsers() {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setUsername("serviceuser");
        user.setEmail("service@example.com");
        user.setRole("ANALYST");

        Mockito.when(userRepository.findAll()).thenReturn(Collections.singletonList(user));

        List<UserResponse> result = userService.getAllUsers();
        Assertions.assertEquals(1, result.size());
        Assertions.assertEquals("serviceuser", result.get(0).getUsername());
    }
}
