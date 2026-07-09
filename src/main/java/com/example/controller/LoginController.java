package com.example.controller;

import com.example.Main;
import com.example.Config.JwtUtil;
import com.example.model.User;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.mindrot.jbcrypt.BCrypt;
import java.io.IOException;
import java.util.Map;

public class LoginController implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            Main.sendResponse(exchange, 204, "");
            return;
        }
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }
        try {
            Map<String, String> creds = Main.objectMapper.readValue(exchange.getRequestBody(), Map.class);
            String email = creds.get("email");
            String password = creds.get("password");

            if (email == null || password == null) {
                Main.sendResponse(exchange, 400, Map.of("error", "Email and password are required."));
                return;
            }

            User user = Main.dataService.findUserByEmail(email);
            if (user == null || !BCrypt.checkpw(password, user.getPassword())) {
                Main.sendResponse(exchange, 401, Map.of("error", "Invalid sign-in credential matches."));
                return;
            }

            String token = JwtUtil.generateToken(user.getEmail(), user.getRole());
            Main.sendResponse(exchange, 200, Map.of(
                "token", token,
                "username", user.getUsername(),
                "role", user.getRole()
            ));
        } catch (Exception e) {
            Main.sendResponse(exchange, 500, Map.of("error", e.getMessage()));
        }
    }
}
