# 19. Testing Strategy

This section outlines the testing protocols used to verify the reliability, security, and performance of **XAMS**.

---

## 19.1 Testing Hierarchy

1. **Unit Testing**: Verifies individual helper functions (e.g. date conversions in the frontend, password hash matches in the backend) in isolation.
2. **Integration Testing**: Verifies that components work together correctly. For example, testing the Spring configuration to ensure the application context loads successfully:
   ```java
   @SpringBootTest
   @ActiveProfiles("test")
   public class AssignmentManagementApplicationTests {
       @Test
       void contextLoads() {
           // Verifies that the database connections, filters, and controllers load without errors.
       }
   }
   ```
3. **API & End-to-End Testing**: Evaluates REST endpoints (e.g., using Postman or unit tests with MockMvc) to verify response bodies, schemas, and status codes.
4. **Manual & User Acceptance Testing (UAT)**: Evaluates user flows (e.g. creating batches, submitting files, grading) in browser staging environments.

---

## 19.2 Test Cases & Boundary Validation Matrix

Below is a matrix of test cases, inputs, expected results, and validation scopes:

| Component | Target Scenario | Input | Expected Output / Status | Validation Type |
|---|---|---|---|---|
| **Auth** | Password Hashing | "Password@123" | Encrypted BCrypt string; never plain-text | Hashing |
| **Auth** | Signup Duplicate | Existing user email | `400 Bad Request` ("Email already registered") | Integrity |
| **Validation** | Invalid Email | "student_invalid_mail" | `400 Bad Request` ("Must be a valid email") | Schema |
| **Assignment** | Creation Limit | `passingMarks` > `totalMarks` | `400 Bad Request` ("Passing marks cannot exceed total") | Logic |
| **Assignment** | File Size Limit | Uploading 60MB file | `400 Bad Request` ("File size exceeds limit") | Boundary |
| **Submission** | Deadline Enforce | Submit late (Late allowed: false) | `400 Bad Request` ("Submission deadline passed") | Date |
| **Grading** | Marks Limit | `marks` > `totalMarks` | `400 Bad Request` ("Marks cannot exceed total marks") | Numeric |

---

## 19.3 Security Testing Scenarios

1. **Role Access Control (RBAC)**:
   * *Test*: A user authenticated with `ROLE_STUDENT` attempts a GET request to `/api/teacher/dashboard`.
   * *Expected Result*: Spring Security blocks the request, returning a `403 Forbidden` status code.
2. **Stateless Session Termination**:
   * *Test*: A request is sent with an expired JWT cookie or token.
   * *Expected Result*: The JWT filter catches the expiration and returns a `401 Unauthorized` response.
3. **HTTP-Only Enforcement**:
   * *Test*: Running JavaScript scripts in the console (`document.cookie`) to read the `JWT_TOKEN`.
   * *Expected Result*: Browser security blocks access, returning an empty string.
