package com.example.myapp.exception;

public class ThreatIntelligenceException extends RuntimeException {
    public ThreatIntelligenceException(String message) {
        super(message);
    }

    public ThreatIntelligenceException(String message, Throwable cause) {
        super(message, cause);
    }
}
