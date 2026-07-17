package com.example.controller;

import com.example.Main;
import com.example.model.KnowledgeBase;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class KnowledgeBaseController implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // CORS Preflight
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            Main.sendResponse(exchange, 204, "");
            return;
        }

        // ===========================
        // GET - Get All Articles
        // ===========================
        if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {

            List<KnowledgeBase> articles =
                    Main.dataService.getAllKnowledgeBase();

            Main.sendResponse(exchange, 200, articles);
            return;
        }

        // ===========================
        // POST - Add Article
        // ===========================
        if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {

            KnowledgeBase article = Main.objectMapper.readValue(
                    exchange.getRequestBody(),
                    KnowledgeBase.class
            );

            article.setCreatedAt(LocalDateTime.now());

            Main.dataService.saveKnowledgeBase(article);

            Main.sendResponse(exchange, 201,
                    Map.of("message", "Knowledge Base article created successfully."));
            return;
        }

        // ===========================
// PUT - Update Article
// URL: /api/knowledgebase/{id}
// ===========================
if ("PUT".equalsIgnoreCase(exchange.getRequestMethod())) {

    String path = exchange.getRequestURI().getPath();
    String[] parts = path.split("/");

    if (parts.length < 4) {
        Main.sendResponse(exchange, 400,
                Map.of("error", "Article ID is required."));
        return;
    }

    Long id = Long.parseLong(parts[3]);

    KnowledgeBase article = Main.objectMapper.readValue(
            exchange.getRequestBody(),
            KnowledgeBase.class
    );

    article.setId(id);

    Main.dataService.updateKnowledgeArticle(article);

    Main.sendResponse(exchange, 200,
            Map.of("message", "Knowledge Base article updated successfully."));
    return;
}

        // ===========================
        // DELETE - Delete Article
        // URL:
        // /api/knowledgebase/{id}
        // ===========================
        if ("DELETE".equalsIgnoreCase(exchange.getRequestMethod())) {

            String path = exchange.getRequestURI().getPath();
            String[] parts = path.split("/");

            if (parts.length < 4) {
                Main.sendResponse(exchange, 400,
                        Map.of("error", "Article ID is required."));
                return;
            }

            Long id = Long.parseLong(parts[3]);

            Main.dataService.deleteKnowledgeArticle(id);

            Main.sendResponse(exchange, 200,
                    Map.of("message",
                            "Knowledge Base article deleted successfully."));
            return;
        }

        // Unsupported Method
        Main.sendResponse(exchange, 405,
                Map.of("error", "Method Not Allowed"));
    }
}