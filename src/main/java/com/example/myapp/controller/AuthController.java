package com.example.myapp.controller;

import com.example.myapp.dto.request.CreateUserRequest;
import com.example.myapp.dto.request.LoginRequest;
import com.example.myapp.dto.response.LoginResponse;
import com.example.myapp.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody @Valid CreateUserRequest request) {
        authService.register(request);
        return new ResponseEntity<>(Map.of("message", "User account generated successfully."), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
