# 16. Security Configurations & Measures

This section documents the security measures implemented in **XAMS** to protect backend APIs and user data.

---

## 16.1 Spring Security Filter Chain

Security rules are managed by the `securityFilterChain` bean in `SecurityConfig.java`:

```text
HTTP Request Packet
       │
       ▼
 [ CORS Validation ]  ──> Rejects non-allowed origin headers
       │
       ▼
 [ CSRF Check ]       ──> Skipped (disabled because system is stateless)
       │
       ▼
 [ JwtAuthenticationFilter ] ──> Parses cookies/headers; loads Principal into SecurityContext
       │
       ▼
 [ Authorization Filters ]  ──> Evaluates role authorities:
                                * /api/auth/**     -> permitAll()
                                * /api/teacher/**  -> hasRole("TEACHER")
                                * /api/student/**  -> hasRole("STUDENT")
       │
       ▼
 [ Controller Method ]
```

---

## 16.2 Core Security Implementations

### 1. Cross-Origin Resource Sharing (CORS) Configuration
To allow the frontend (running on Vite ports) to communicate with the Spring Boot server (running on port 8080), CORS rules are configured as follows:
* **Origin Patterns**: Allows requests from `http://localhost:[*]` and `http://127.0.0.1:[*]`.
* **Allowed HTTP Methods**: Permits `GET`, `POST`, `PUT`, `DELETE`, and `OPTIONS`.
* **Allowed Headers**: Restricts custom headers to `Authorization` and `Content-Type`.
* **Allow Credentials**: Set to `true` to allow the browser to include cookie payloads (`JWT_TOKEN`) in API calls.

### 2. Disabling Cross-Site Request Forgery (CSRF)
* **Why it is disabled**: CSRF is disabled (`http.csrf(csrf -> csrf.disable())`) because the backend APIs are designed to be stateless. The application does not store sessions in memory (`SessionCreationPolicy.STATELESS`), and API endpoints require token signatures (either from headers or verified cookie claims) for auth.

### 3. Password Encoding (BCrypt Hashing)
* **BCrypt Strength**: BCrypt hashes passwords using a default work factor (log rounds) of 10.
* **Salt Generation**: BCrypt automatically generates a unique salt for each password, protecting stored passwords against precomputed rainbow table attacks.

### 4. JWT Token Parsing & Validation
* **Signature Verification**: The `JwtService` parses tokens using a cryptographic secret key (`app.jwt.secret`) and the HMAC-SHA256 algorithm.
* **Expiration Enforcement**: Tokens are validated against the current timestamp to ensure they have not expired.
* **Principal Match**: The filter verifies that the username extracted from the token claims matches the email of the database user record.
