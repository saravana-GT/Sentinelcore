package com.example.myapp.playbook.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a playbook is in an invalid state for the requested operation
 * (e.g., disabled, duplicate step order, missing required fields).
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class InvalidPlaybookException extends RuntimeException {

    public InvalidPlaybookException(String message) {
        super(message);
    }
}
