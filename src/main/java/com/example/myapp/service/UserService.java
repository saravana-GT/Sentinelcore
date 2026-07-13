package com.example.myapp.service;

import com.example.myapp.dto.request.CreateUserRequest;
import com.example.myapp.dto.response.UserResponse;
import java.util.List;
import java.util.UUID;

public interface UserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getUserById(UUID id);
    List<UserResponse> getAllUsers();
    void deleteUser(UUID id);
}
