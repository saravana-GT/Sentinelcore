package com.example.controller;

import com.example.Main;
import com.example.Config.JwtUtil;
import com.example.model.User;
import com.fasterxml.jackson.core.type.TypeReference;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.util.Map;

public class LoginController implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // Handle CORS Preflight Request
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            Main.sendResponse(exchange, 204, "");
            return;
        }

        // Allow only POST
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            Main.sendResponse(exchange, 405, Map.of(
                    "error", "Method Not Allowed"
            ));
            return;
        }

        try {

            // Read Login Request
            Map<String, String> creds = Main.objectMapper.readValue(
                    exchange.getRequestBody(),
                    new TypeReference<Map<String, String>>() {}
            );

            String email = creds.get("email");
            String password = creds.get("password");

            // Validate Input
            if (email == null || email.isBlank()
                    || password == null || password.isBlank()) {

                Main.sendResponse(exchange, 400, Map.of(
                        "error", "Email and Password are required."
                ));
                return;
            }

            // Find User
            User user = Main.dataService.findUserByEmail(email);

            if (user == null) {
                Main.sendResponse(exchange, 401, Map.of(
                        "error", "User not found."
                ));
                return;
            }

            // Verify Password
            if (!BCrypt.checkpw(password, user.getPassword())) {
                Main.sendResponse(exchange, 401, Map.of(
                        "error", "Invalid Password."
                ));
                return;
            }

            // Generate JWT
            String token = JwtUtil.generateToken(
                    user.getEmail(),
                    user.getRole()
            );

            // Success Response
            Main.sendResponse(exchange, 200, Map.of(
                    "message", "Login Successful",
                    "token", token,
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "role", user.getRole()
            ));

        } catch (Exception e) {

            e.printStackTrace();

            Main.sendResponse(exchange, 500, Map.of(
                    "error", "Internal Server Error",
                    "details", e.getMessage()
            ));
        }
    }
}