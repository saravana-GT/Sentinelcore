package com.example.myapp.playbook.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a fatal error occurs during playbook execution that cannot be recovered from.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ExecutionException extends RuntimeException {

    public ExecutionException(String message) {
        super(message);
    }

    public ExecutionException(String message, Throwable cause) {
        super(message, cause);
    }
}
