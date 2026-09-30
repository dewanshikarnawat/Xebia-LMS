package com.company.learningmanagement.exception.assignment;

public class ConflictException extends CustomException {
    public ConflictException(String message) {
        super(message, 409);
    }
}
