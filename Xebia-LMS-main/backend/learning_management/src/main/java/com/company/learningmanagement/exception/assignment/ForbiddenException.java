package com.company.learningmanagement.exception.assignment;

public class ForbiddenException extends CustomException {
    public ForbiddenException(String message) {
        super(message, 403);
    }
}
