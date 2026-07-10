package com.example.controller;

import com.example.Main;
import com.example.model.Alert;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import io.jsonwebtoken.Claims;
import java.io.IOException;
import java.util.Map;

public class AlertController implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            Main.sendResponse(exchange, 204, "");
            return;
        }
        Claims claims = Main.authenticate(exchange);
        if (claims == null) {
            return;
        }

        try {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                Main.sendResponse(exchange, 200, Main.dataService.getAllAlerts());
            } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                Alert alert = Main.objectMapper.readValue(exchange.getRequestBody(), Alert.class);
                Main.dataService.saveAlert(alert);
                Main.sendResponse(exchange, 201, alert);
            } else {
                Main.sendResponse(exchange, 405, Map.of("error", "Method Not Allowed"));
            }
        } catch (Exception e) {
            Main.sendResponse(exchange, 500, Map.of("error", e.getMessage()));
        }
    }
}
