package com.example.myapp.model;

public enum ThreatLevel {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    public static ThreatLevel fromScore(int score) {
        if (score <= 10) {
            return LOW;
        } else if (score <= 40) {
            return MEDIUM;
        } else if (score <= 75) {
            return HIGH;
        } else {
            return CRITICAL;
        }
    }
}
