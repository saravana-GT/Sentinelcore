package com.example.myapp.controller;

import com.example.myapp.service.ChatbotService;
import com.example.myapp.service.ChatbotService.ChatbotResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        ChatbotResponse response = chatbotService.processQuery(message);
        return ResponseEntity.ok(Map.of(
            "reply", response.getReply(),
            "severity", response.getSeverity()
        ));
    }
}
