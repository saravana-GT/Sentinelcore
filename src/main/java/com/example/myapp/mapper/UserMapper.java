package com.example.myapp.mapper;

import com.example.myapp.dto.request.CreateUserRequest;
import com.example.myapp.dto.response.UserResponse;
import com.example.myapp.model.User;

public class UserMapper {
    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole()
        );
    }

    public static User toEntity(CreateUserRequest request) {
        if (request == null) {
            return null;
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole() != null ? request.getRole() : "ANALYST");
        return user;
    }
}
