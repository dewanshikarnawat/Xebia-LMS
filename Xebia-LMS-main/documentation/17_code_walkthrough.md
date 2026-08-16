# 17. Code Implementation Walkthrough

This section provides line-by-line and block-by-block code walkthroughs of the most critical code algorithms in the **XAMS** system.

---

## 17.1 JWT Interceptor: `JwtAuthenticationFilter.doFilterInternal()`

This method runs on every incoming HTTP request, managing authentication context updates:

```java
String jwt = null;

// 1. Try to get JWT from Cookie
if (request.getCookies() != null) {
    for (Cookie cookie : request.getCookies()) {
        if ("JWT_TOKEN".equals(cookie.getName())) {
            jwt = cookie.getValue();
            break;
        }
    }
}
```
* **Explanation**: First, it checks if any HTTP cookies are attached to the request. If present, it loops through them to find the cookie named `JWT_TOKEN`. This secures browser requests statelessly since browsers attach matching cookies automatically.

```java
// 2. If not found in Cookie, try Authorization Header
if (jwt == null) {
    final String authHeader = request.getHeader("Authorization");

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        jwt = authHeader.substring(7);
    }
}
```
* **Explanation**: If no cookie exists, it looks for the `Authorization` header. If it starts with `Bearer `, it extracts the token by slicing off the first 7 characters.

```java
if (jwt == null) {
    filterChain.doFilter(request, response);
    return;
}
```
* **Explanation**: If no token is found in the cookies or header, the filter chain continues. The request will proceed to security configuration matching, which might allow it (like `/api/auth/*`) or reject it with a 401 error.

```java
try {
    String userEmail = jwtService.extractUsername(jwt);

    if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (jwtService.isTokenValid(jwt, userDetails)) {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }
} catch (Exception e) {
    logger.warn("JWT Authentication failed: " + e.getMessage());
}
```
* **Explanation**: If a token is found, it extracts the user's email. If the email is valid and the user is not yet authenticated in this request thread, it loads the user profile from the database. It validates the token's signature and expiry, then builds an `authToken` and registers it in Spring's thread-local `SecurityContextHolder`.

---

## 17.2 Caching Strategy: `RedisServiceImpl.java`

Manages assignment status summaries to reduce database overhead:

```java
@Override
public void saveAssignmentStatus(Long assignmentId, AssignmentStatusResponse status) {
    try {
        String key = buildKey(assignmentId);
        redisTemplate.opsForValue().set(key, status, 7, TimeUnit.DAYS);
    } catch (Exception e) {
        log.error("Failed to save assignment status to Redis: {}", e.getMessage());
    }
}
```
* **Explanation**: Computes a Redis key `assignment:status:{id}`. It saves the `AssignmentStatusResponse` object into Redis using the standard serializer, setting a Time-to-Live (TTL) of 7 days (`7, TimeUnit.DAYS`). If Redis is offline, it logs the error but does not crash the request, ensuring the application remains resilient.

---

## 17.3 Global Exception: `GlobalExceptionHandler.handleValidationException()`

Extracts form field errors and formats them into a single string:

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
* **Explanation**: When a controller's `@Valid` check fails, Spring throws a `MethodArgumentNotValidException`. This handler catches the exception, extracts all field-level validation errors (e.g. from `@NotBlank` or `@Min` annotations), maps them to their default messages, joins them with a semicolon, and returns the result with a `400 Bad Request` status code.
