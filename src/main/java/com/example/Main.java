package com.example;

import com.example.Config.JwtUtil;
import com.example.model.Alert;
import com.example.model.Metric;
import com.example.model.User;
import com.example.service.DataService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import io.jsonwebtoken.Claims;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.HashMap;
import java.util.Map;

public class Main {
    private static final DataService dataService = new DataService();
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "5000"));
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        
        // Expose API Context Nodes
        server.createContext("/api/auth/register", new RegisterHandler());
        server.createContext("/api/auth/login", new LoginHandler());
        server.createContext("/api/alerts", new AlertsHandler());
        server.createContext("/api/metrics", new ProtectedMetricsHandler());

        server.setExecutor(null); // Defaults configuration to default server pooling thread execution executor
        System.out.println("SentinelCore Backend running on port " + port);        server.start();
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, Object responseObj) throws IOException {
        byte[] responseBytes = objectMapper.writeValueAsBytes(responseObj);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(responseBytes);
        }
    }

    private static Claims authenticate(HttpExchange exchange) throws IOException {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendResponse(exchange, 401, Map.of("error", "Access Denied: Bearer Authorization token missing."));
            return null;
        }
        String token = authHeader.substring(7);
        Claims claims = JwtUtil.validateToken(token);
        if (claims == null) {
            sendResponse(exchange, 401, Map.of("error", "Authentication error: Session is invalid or has expired."));
        }
        return claims;
    }

    // --- Endpoint Core Handlers ---

    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { sendResponse(exchange, 204, ""); return; }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) { exchange.sendResponseHeaders(405, -1); return; }
            try {
                User user = objectMapper.readValue(exchange.getRequestBody(), User.class);
                if (dataService.findUserByEmail(user.getEmail()) != null) {
                    sendResponse(exchange, 400, Map.of("error", "Target email account profile registration conflict."));
                    return;
                }
                dataService.saveUser(user);
                sendResponse(exchange, 201, Map.of("message", "User account generated successfully."));
            } catch (Exception e) {
                sendResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { sendResponse(exchange, 204, ""); return; }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) { exchange.sendResponseHeaders(405, -1); return; }
            try {
                Map<String, String> creds = objectMapper.readValue(exchange.getRequestBody(), Map.class);
                User user = dataService.findUserByEmail(creds.get("email"));
                
                if (user == null || !BCrypt.checkpw(creds.get("password"), user.getPassword())) {
                    sendResponse(exchange, 401, Map.of("error", "Invalid sign-in credential matches."));
                    return;
                }

                String token = JwtUtil.generateToken(user.getEmail(), user.getRole());
                sendResponse(exchange, 200, Map.of("token", token, "username", user.getUsername(), "role", user.getRole()));
            } catch (Exception e) {
                sendResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    static class AlertsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { sendResponse(exchange, 204, ""); return; }
            Claims claims = authenticate(exchange);
            if (claims == null) return;

            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    sendResponse(exchange, 200, dataService.getAllAlerts());
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    Alert alert = objectMapper.readValue(exchange.getRequestBody(), Alert.class);
                    dataService.saveAlert(alert);
                    sendResponse(exchange, 201, alert);
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }

    static class ProtectedMetricsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { sendResponse(exchange, 204, ""); return; }
            Claims claims = authenticate(exchange);
            if (claims == null) return;

            try {
                if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                    sendResponse(exchange, 200, dataService.getLatestMetrics());
                } else if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                    Metric metric = objectMapper.readValue(exchange.getRequestBody(), Metric.class);
                    dataService.saveMetric(metric);
                    sendResponse(exchange, 201, metric);
                } else {
                    exchange.sendResponseHeaders(405, -1);
                }
            } catch (Exception e) {
                sendResponse(exchange, 500, Map.of("error", e.getMessage()));
            }
        }
    }
}
