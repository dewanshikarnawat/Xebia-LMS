# 14. System Error Handling

This section details how XAMS handles errors across the stack, ensuring that user errors are caught, validated, and resolved gracefully without exposing sensitive server-side traces.

---

## 14.1 Backend Exception Hierarchy

The backend implements a structured exception hierarchy extending a core runtime exception wrapper:

```text
                  [ RuntimeException ]
                           │
                           ▼
                  [ CustomException ] (status, message)
                           │
         ┌─────────────────┼──────────────────┐
         ▼                 ▼                  ▼
[ BadRequestException ]  [ ResourceNotFoundException ]  [ UnauthorizedException ]
  (Status: 400)             (Status: 404)                  (Status: 401)
```

### Custom Exception Classes:
1. **`CustomException`**: Abstract parent holding the HTTP status code variable alongside the detail message string.
2. **`BadRequestException`**: Thrown for invalid client payloads, business validation failures, or file limit violations.
3. **`ResourceNotFoundException`**: Thrown when database queries fail to find requested records (e.g. invalid `batchId`, incorrect `assignmentId`).
4. **`UnauthorizedException`**: Thrown when authentication credentials fail or JWT tokens expire.

---

## 14.2 Global Controller Exception Advice

All exceptions thrown during request execution are caught by the `GlobalExceptionHandler` annotated with `@RestControllerAdvice`. It maps different exception classes to clean JSON responses:

### 1. Handling Custom Domain Exceptions
```java
@ExceptionHandler(CustomException.class)
public ResponseEntity<ApiResponse<Void>> handleCustomException(CustomException ex) {
    ApiResponse<Void> response = ApiResponse.error(ex.getMessage(), ex.getStatus());
    return ResponseEntity.status(ex.getStatus()).body(response);
}
```
* **Result**: Translates the exception's custom HTTP status code and message into a unified error payload.

### 2. Handling Validation Errors (JSR-380 Validation)
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
    
    ApiResponse<Void> response = ApiResponse.error("Validation failed: " + message, 400);
    return ResponseEntity.status(400).body(response);
}
```
* **Result**: Extracts all validation failure messages (e.g. "Email cannot be blank") and combines them into a semicolon-separated string with a `400 Bad Request` status code.

### 3. Handling Spring Security Access Denied Exceptions
* Catches access violations (e.g. a Student attempting to view `/api/teacher/*` endpoints) and returns a `403 Forbidden` response.

### 4. General Server Failures
* Catches all unhandled exceptions, prints the stack trace to standard error for debugging, and returns a sanitized `500 Internal Server Error` message to the client.

---

## 14.3 Client-Side Error Interception

On the client side, errors are caught at two levels:

1. **Form Validation (Zod Schema)**: If input constraints are violated (e.g. typing a short password), Zod prevents the form submission and displays helper messages directly below the input fields.
2. **Axios Response Interceptor**: Intercepts error responses globally. If the server returns a `401 Unauthorized` status (indicating token expiration or session timeout), Axios clears the user data from `localStorage` and redirects the user to the landing page.
