package com.example;

import com.example.Config.JwtUtil;
import com.example.service.DataService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import io.jsonwebtoken.Claims;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.Map;

public class Main {
    public static final DataService dataService = new DataService();
    public static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "5000"));
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        
        // Expose API Context Nodes
        server.createContext("/api/auth/register", new com.example.controller.RegisterController());
        server.createContext("/api/auth/login", new com.example.controller.LoginController());
        server.createContext("/api/alerts", new com.example.controller.AlertController());
        server.createContext("/api/metrics", new com.example.controller.MetricController());
        server.createContext("/api/knowledgebase", new com.example.controller.KnowledgeBaseController());
        server.setExecutor(null); // Defaults configuration to default server pooling thread execution executor
        System.out.println("SentinelCore Enterprise Backend running successfully on port " + port);
        server.start();
    }

    public static void sendResponse(HttpExchange exchange, int statusCode, Object responseObj) throws IOException {
        try {
            byte[] responseBytes = objectMapper.writeValueAsBytes(responseObj);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT,DELETE ,OPTIONS");
            exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
            
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(204, -1);
                return;
            }

            exchange.sendResponseHeaders(statusCode, responseBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(responseBytes);
            }
        } finally {
            exchange.close();
        }
    }

    public static Claims authenticate(HttpExchange exchange) throws IOException {
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
}
