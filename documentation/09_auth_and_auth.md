# 9. Authentication & Authorization

This section describes the authentication and authorization design in XAMS, showing how JWT, Spring Security filters, and HTTP-Only cookies secure user data.

---

## 9.1 Authentication & Authorization Flow

Below is a detailed sequence diagram showing the token validation and role check workflow:

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Browser as Web Browser
    participant Filter as JwtAuthenticationFilter
    participant Provider as AuthenticationProvider
    participant DB as PostgreSQL Database
    participant API as Protected Controller

    User->>Browser: Enter Credentials & Submit
    Browser->>Filter: POST /api/auth/login (email/password)
    Note over Filter: Skip JWT filter for public /auth/* endpoints
    Filter->>Provider: Validate Credentials
    Provider->>DB: Fetch User details by Email
    DB-->>Provider: User Entity (hashed password + Role)
    Provider->>Provider: Verify Password via BCrypt
    
    alt Credentials Valid
        Provider-->>Filter: Return Authentication Object
        Note over Filter: Generate JWT (Claims: sub, role, exp)
        Note over Filter: Set JWT in HTTP-Only Cookie
        Filter-->>Browser: 200 OK (AuthResponse DTO)
    else Credentials Invalid
        Provider-->>Filter: Throw BadCredentialsException
        Filter-->>Browser: 401 Unauthorized (Error JSON)
    end

    Note over Browser: Subsequent request to secure endpoint
    Browser->>Filter: GET /api/teacher/assignments
    Note over Filter: Extract Cookie "JWT_TOKEN"
    Filter->>Filter: Parse Signature & Expiry
    
    alt Token Valid & Role matches "ROLE_TEACHER"
        Filter->>API: Forward Request
        API-->>Browser: 200 OK (Assignments JSON)
    else Token Expired or Invalid Role
        Filter-->>Browser: 403 Forbidden / 401 Unauthorized
    end
```

---

## 9.2 Key Security Features

### 1. Password Hashing (BCrypt)
* Core security is managed using the `BCryptPasswordEncoder` bean.
* BCrypt implements salt generation dynamically. The salt is embedded within the generated hash string, protecting stored user records against lookup table attacks (rainbow tables).

### 2. Stateless JSON Web Tokens (JWT)
The JWT token structure includes:
* **Header**: Defines the HMAC-SHA256 signature algorithm.
* **Payload (Claims)**: Stores user details:
  * `sub` (Subject): The user's registered email address.
  * `role`: User role (`TEACHER` or `STUDENT`).
  * `iat` (Issued At): UNIX timestamp.
  * `exp` (Expiration): Set to 24 hours.
* **Signature**: Securely signed using a 256-bit secret key.

### 3. Stateless HTTP-Only Cookie Storage
XAMS stores the JWT token in an **HTTP-Only Cookie**:
* **XSS Protection**: By configuring the cookie as `httpOnly = true`, browser-side JavaScript scripts (like `document.cookie`) cannot read the token, protecting the system against Cross-Site Scripting (XSS) token theft.
* **CSRF Mitigation**: To support cross-origin browser requests, the system configures CORS credentials permissions and uses stateless Bearer authentication headers as a secondary option for REST consumers.

### 4. Role-Based Access Control (RBAC)
Authorizations are configured in the `SecurityConfig` filter chain:
* Paths starting with `/api/auth/**` are set to `permitAll()`.
* Paths starting with `/api/teacher/**` require authority rules checking for `ROLE_TEACHER`.
* Paths starting with `/api/student/**` require authority rules checking for `ROLE_STUDENT`.
* Any other route requests require generic authentication.
