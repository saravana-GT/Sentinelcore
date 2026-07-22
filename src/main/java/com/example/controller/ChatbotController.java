package com.example.controller;

import com.example.Main;
import com.example.service.ChatbotService;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import com.fasterxml.jackson.core.type.TypeReference;

import java.io.IOException;
import java.util.Map;

public class ChatbotController implements HttpHandler {

    private final ChatbotService chatbotService = new ChatbotService();


    @Override
    public void handle(HttpExchange exchange) throws IOException {

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            Main.sendResponse(exchange, 204, "");
            return;
        }


        try {

            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {

                Map<String, String> request =
                        Main.objectMapper.readValue(
                                exchange.getRequestBody(),
                                new TypeReference<Map<String, String>>() {}
                        );


                String message = request.get("message");


                String reply =
                        chatbotService.processQuery(message);


                Main.sendResponse(exchange,
                        200,
                        Map.of("reply", reply));

                return;
            }


            Main.sendResponse(exchange,
                    405,
                    Map.of("error", "Method Not Allowed"));


        } catch (Exception e) {

            Main.sendResponse(exchange,
                    500,
                    Map.of("error", e.getMessage()));
        }
    }
}