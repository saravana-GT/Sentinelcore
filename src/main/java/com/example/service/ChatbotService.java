package com.example.service;

import org.springframework.stereotype.Service;

@Service
public class ChatbotService {


    public String processQuery(String message) {

        if (message == null || message.trim().isEmpty()) {
            return "Please enter a security query.";
        }


        message = message.toLowerCase();


        // Alert related questions
        if (message.contains("alert")) {
            return "I found the alert module. Currently I can help you analyze security alerts.";
        }


        // User related questions
        if (message.contains("user")) {
            return "I can provide user related security information.";
        }


        // Knowledge Base questions
        if (message.contains("phishing")) {
            return "Phishing is a cyber attack where attackers trick users into revealing sensitive information through fake emails or websites.";
        }


        // Malware questions
        if (message.contains("malware")) {
            return "Malware is malicious software designed to damage systems, steal data, or gain unauthorized access.";
        }


        // Help command
        if (message.contains("help")) {
            return """
                    You can ask me:
                    - Show alerts
                    - Count users
                    - Explain phishing
                    - Explain malware
                    - Security tips
                    """;
        }


        return "Sorry, I could not understand your query. Try asking about alerts, users, phishing, or malware.";
    }
}