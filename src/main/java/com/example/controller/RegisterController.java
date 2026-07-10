package com.example.controller;

import com.example.Main;
import com.example.model.User;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.util.Map;

public class RegisterController implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            Main.sendResponse(exchange, 204, "");
            return;
        }
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            Main.sendResponse(exchange, 405, Map.of("error", "Method Not Allowed"));
            return;
        }
        try {
            User user = Main.objectMapper.readValue(exchange.getRequestBody(), User.class);
            if (user.getEmail() == null || user.getEmail().isBlank()) {
                Main.sendResponse(exchange, 400, Map.of("error", "Email is required."));
                return;
            }
            if (Main.dataService.findUserByEmail(user.getEmail()) != null) {
                Main.sendResponse(exchange, 400, Map.of("error", "Target email account profile registration conflict."));
                return;
            }
            Main.dataService.saveUser(user);
            Main.sendResponse(exchange, 201, Map.of("message", "User account generated successfully."));
        } catch (Exception e) {
            Main.sendResponse(exchange, 500, Map.of("error", e.getMessage()));
        }
    }
}
