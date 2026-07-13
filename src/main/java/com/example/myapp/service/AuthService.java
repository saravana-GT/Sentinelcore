package com.example.myapp.service;

import com.example.myapp.dto.request.CreateUserRequest;
import com.example.myapp.dto.request.LoginRequest;
import com.example.myapp.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    void register(CreateUserRequest request);
}
