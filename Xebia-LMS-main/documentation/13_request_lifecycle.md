# 13. Request Lifecycle

This section details the end-to-end trace of an HTTP request through the full-stack architecture of **XAMS**. We trace the specific workflow of a **Student submitting an assignment file**.

---

## 13.1 Step-by-Step Flow Chart

```text
[ Browser / UI Click ]
        │
        ▼ (Zod Validation)
[ React Form State ]
        │
        ▼ (API service maps fields)
[ Axios Client ]
        │
        ▼ (Serialize to Form Data; Attach Cookies)
[ HTTP Request Packet ]
        │
        ▼ (Port 8080 - Tomcat Web Engine)
[ JwtAuthenticationFilter ] (Verify Cookie, set Security Context)
        │
        ▼ (Check role permission)
[ Spring Security Filter Chain ]
        │
        ▼ (Find matching route mapping)
[ DispatcherServlet ]
        │
        ▼ (JSR-380 validation checks)
[ SubmissionController ]
        │
        ▼ (Execute business constraints)
[ SubmissionServiceImpl ]
        │
        ▼ (Binary file upload)
[ Cloudinary API Service ] ───> [ Cloudinary Storage Service ]
        │
        ▼ (Perform transactional inserts)
[ SubmissionRepository ]
        │
        ▼ (Generate INSERT statement)
[ Hibernate Engine ]
        │
        ▼ (Commit transaction)
[ PostgreSQL Database ]
```

---

## 13.2 Detailed Phase Descriptions

### Phase 1: Client-Side Interaction & Preparation
1. **User Action**: The student drags a PDF file into the upload zone on the `AssignmentDetail.tsx` page and writes a text comment.
2. **Form Validation**: React Hook Form processes the inputs. The Zod schema checks that a file is selected and that the text comment does not exceed size parameters.
3. **API Service call**: The component triggers `studentService.submitAssignment()`. This method instantiates a JavaScript `FormData` object, appending the file payload and comments.
4. **Axios Dispatch**: The Axios instance creates an HTTP POST request to `/api/student/assignments/{id}/submit`. Since `withCredentials` is enabled, the browser automatically attaches the `JWT_TOKEN` cookie.

### Phase 2: Gateway Interception & Security Check
5. **Tomcat Listener**: The Spring Boot embedded Tomcat server intercepts the request and creates `HttpServletRequest` and `HttpServletResponse` objects.
6. **JWT Extraction**: The `JwtAuthenticationFilter` intercepts the request:
   * It scans the request cookies for `JWT_TOKEN`.
   * It parses the token using the signing key in `JwtService`.
   * It extracts the subject (email) and role claims.
7. **Security Context Creation**: The filter loads user authorities from `CustomUserDetailsService` and updates the `SecurityContextHolder` with a `UsernamePasswordAuthenticationToken`.
8. **Security Authorization**: Spring Security's filter chain verifies that the authenticated user possesses the `ROLE_STUDENT` authority.

### Phase 3: Controller Routing & Validation
9. **Dispatcher Dispatch**: The `DispatcherServlet` identifies the route handler in `SubmissionController.submitAssignment()`.
10. **Validation Check**: Spring MVC runs JSR-380 validation checks. If the parameters are valid, the controller forwards the parameters and authentication details (`Principal`) to the service layer.

### Phase 4: Business Processing & Storage
11. **Business Execution**: `SubmissionServiceImpl.submitAssignment()` processes the request:
   * It verifies that the assignment exists.
   * It checks that the current time has not passed the deadline (or checks if late submissions are allowed).
   * It calls the `CloudinaryService` to upload the file.
12. **Cloud Storage Integration**: The Cloudinary SDK uploads the file binary and returns a secure HTTPS URL.
13. **ORM Write**: The service builds a `Submission` entity and calls `SubmissionRepository.save()`.
14. **Database Transaction**: Hibernate generates SQL INSERT queries. The PostgreSQL database writes the row and returns the auto-generated primary key ID.
15. **Cache Eviction**: The service evicts the student's dashboard cache in Redis.

### Phase 5: Response Serialization & UI Render
16. **DTO Conversion**: MapStruct converts the saved entity into a `SubmissionResponse` DTO.
17. **Controller Wrap**: The controller wraps the DTO inside an `ApiResponse.success` object with a `201 Created` status code.
18. **JSON Serialization**: Jackson serializes the `ApiResponse` object into JSON and writes it to the HTTP response stream.
19. **Client Interception**: Axios resolves the response promise. The React component displays a success toast using `react-hot-toast` and updates the UI state to show the submitted file details.
